import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; bidId: string }> }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { id, bidId } = await params;

  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify customer owns this project
    const { data: customer } = await supabase
      .from("customers")
      .select("id, company_name")
      .eq("user_id", user.id)
      .single();
    if (!customer) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: project } = await supabase
      .from("customer_projects")
      .select("id, name, project_number, marketplace_listing_id")
      .eq("id", id)
      .eq("customer_id", customer.id)
      .single();
    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const { status } = body;

    if (!["accepted", "rejected", "under_review"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Update bid status
    const { data: bid, error } = await supabase
      .from("supplier_bids")
      .update({ status })
      .eq("id", bidId)
      .select("*, supplier_id")
      .single();

    if (error || !bid) {
      return NextResponse.json({ error: "Bid not found" }, { status: 404 });
    }

    // Notify the OEM
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const { data: supplier } = await supabase
        .from("suppliers")
        .select("email, contact_name, company_name")
        .eq("id", bid.supplier_id)
        .single();

      if (supplier?.email) {
        const resend = new Resend(apiKey);
        const statusText = status === "accepted" ? "Accepted" : status === "rejected" ? "Not Selected" : "Under Review";

        try {
          await resend.emails.send({
            from: "FluxCo <noreply@fluxco.com>",
            to: supplier.email,
            subject: `Bid ${statusText}: ${project.project_number} — ${project.name}`,
            html: `
              <h2>Your Bid Has Been ${statusText}</h2>
              <p>Hi ${supplier.contact_name?.split(" ")[0]},</p>
              <p>Your bid on project <strong>${project.project_number}</strong> (${project.name}) has been marked as <strong>${statusText}</strong>.</p>
              ${status === "accepted" ? "<p>Congratulations! The FluxCo team will be in touch with next steps.</p>" : ""}
              ${status === "rejected" ? "<p>Thank you for your interest. We encourage you to bid on other opportunities.</p>" : ""}
              <p><a href="https://fluxco.com/portal/marketplace">View Marketplace</a></p>
            `,
          });
        } catch (emailErr) {
          console.error("Failed to send bid status notification:", emailErr);
        }
      }
    }

    return NextResponse.json({ bid });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
