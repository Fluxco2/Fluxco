import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const VECTOR_GROUP_NAMES: Record<string, string> = {
  dyn11: "Dyn11", dyn1: "Dyn1", ynd11: "YNd11", dd0: "Dd0", yy0: "Yy0",
};
function vectorGroupName(id?: string): string | null {
  if (!id) return null;
  return VECTOR_GROUP_NAMES[id] || id;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { id } = await params;

  try {
    // Auth
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get customer + project
    const { data: customer } = await supabase
      .from("customers")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const { data: project } = await supabase
      .from("customer_projects")
      .select("*")
      .eq("id", id)
      .eq("customer_id", customer.id)
      .single();
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    if (project.status !== "draft") {
      return NextResponse.json({ error: "Project already submitted" }, { status: 400 });
    }

    // 1. Create marketplace listing from the project
    const designReqs = project.design_requirements || {};
    const listingData: Record<string, any> = {
      customer_project_id: id,
      serial_number: project.project_number,
      rated_power_kva: project.rated_power_kva,
      primary_voltage: project.primary_voltage,
      secondary_voltage: project.secondary_voltage,
      frequency: project.frequency || 60,
      phases: project.phases || 3,
      impedance_percent: designReqs.targetImpedance || null,
      vector_group: vectorGroupName(designReqs.vectorGroupId),
      cooling_class: designReqs.coolingClassId?.toUpperCase() || null,
      conductor_type: designReqs.conductorTypeId || null,
      steel_grade: designReqs.steelGradeId || null,
      estimated_cost: project.estimated_cost,
      contact_name: customer.contact_name,
      contact_email: customer.email,
      contact_phone: customer.phone,
      spec_mode: project.spec_mode || "lite",
      design_specs: {
        requirements: designReqs,
        proSpec: project.pro_spec,
      },
      status: "listed",
    };

    const { data: listing, error: listingError } = await supabase
      .from("marketplace_listings")
      .insert(listingData)
      .select()
      .single();

    if (listingError) {
      console.error("Error creating marketplace listing:", listingError);
      return NextResponse.json({ error: "Failed to publish to marketplace" }, { status: 500 });
    }

    // 2. Update project status + link to listing
    await supabase
      .from("customer_projects")
      .update({
        status: "submitted",
        marketplace_listing_id: listing.id,
      })
      .eq("id", id);

    // 3. Email FluxCo team
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const resend = new Resend(apiKey);
      const formatV = (v: number) => (v >= 1000 ? `${(v / 1000).toLocaleString()} kV` : `${v} V`);

      // Notify FluxCo team
      try {
        await resend.emails.send({
          from: "FluxCo <noreply@fluxco.com>",
          to: ["brian@fluxco.com", "eric@fluxco.com", "casey@fluxco.com"],
          subject: `New Project Submitted: ${project.name} (${project.project_number})`,
          html: `
            <h2>New Customer Project Submitted for Quoting</h2>
            <p><strong>Customer:</strong> ${customer.company_name} (${customer.contact_name})</p>
            <p><strong>Project:</strong> ${project.name} — ${project.project_number}</p>

            <h3>Spec Summary</h3>
            <ul>
              <li><strong>Power Rating:</strong> ${project.rated_power_kva?.toLocaleString()} kVA</li>
              <li><strong>Primary:</strong> ${formatV(project.primary_voltage)}</li>
              <li><strong>Secondary:</strong> ${formatV(project.secondary_voltage)}</li>
              <li><strong>Phases:</strong> ${project.phases}-Phase</li>
              ${project.estimated_cost ? `<li><strong>Est. Cost:</strong> $${Number(project.estimated_cost).toLocaleString()}</li>` : ""}
              <li><strong>Spec Mode:</strong> ${project.spec_mode}</li>
            </ul>

            <p>This project has been published to the marketplace. OEMs can now view and bid.</p>
            <p><a href="https://fluxco.com/portal/marketplace">View on Marketplace</a></p>
          `,
        });
      } catch (emailErr) {
        console.error("Failed to send team notification:", emailErr);
      }

      // Confirmation to customer
      try {
        await resend.emails.send({
          from: "FluxCo <noreply@fluxco.com>",
          to: customer.email,
          subject: `Your Project "${project.name}" Has Been Submitted`,
          html: `
            <h2>Project Submitted for Quoting</h2>
            <p>Hi ${customer.contact_name?.split(" ")[0]},</p>
            <p>Your project <strong>${project.name}</strong> (${project.project_number}) has been submitted and published to our supplier network.</p>
            <p>You'll receive notifications as suppliers ask questions and submit bids.</p>

            <h3>What's Next</h3>
            <ul>
              <li>OEM suppliers will review your spec and may ask questions</li>
              <li>You'll see bids come in on your project dashboard</li>
              <li>FluxCo will help you evaluate and select the best option</li>
            </ul>

            <p><a href="https://fluxco.com/customer/projects/${id}">View Your Project</a></p>
          `,
        });
      } catch (emailErr) {
        console.error("Failed to send customer confirmation:", emailErr);
      }
    }

    // 4. Notify opted-in suppliers
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://fluxco.com'}/api/supplier/notify-new-listing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing: listingData }),
      });
    } catch (notifyErr) {
      console.error("Failed to notify suppliers:", notifyErr);
    }

    return NextResponse.json({
      success: true,
      project: { ...project, status: "submitted", marketplace_listing_id: listing.id },
      listing,
    });
  } catch (error: any) {
    console.error("Submit project error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
