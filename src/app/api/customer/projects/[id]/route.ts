import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function verifyOwnership(supabase: any, request: NextRequest, projectId: string) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return null;

  // Get the customer record for this user
  const { data: customer } = await supabase
    .from("customers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!customer) return null;

  // Verify the project belongs to this customer
  const { data: project } = await supabase
    .from("customer_projects")
    .select("*")
    .eq("id", projectId)
    .eq("customer_id", customer.id)
    .single();

  return project;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabase();
  const { id } = await params;

  try {
    const project = await verifyOwnership(supabase, request, id);
    if (!project) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error: any) {
    console.error("Get project error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabase();
  const { id } = await params;

  try {
    const project = await verifyOwnership(supabase, request, id);
    if (!project) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    const body = await request.json();

    const updateData: Record<string, any> = {};
    const allowedFields = [
      "name", "spec_mode", "rated_power_kva", "primary_voltage",
      "secondary_voltage", "frequency", "phases", "design_requirements",
      "pro_spec", "design_result", "estimated_cost", "status",
    ];

    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    // Check if spec fields are changing (not just status updates)
    const specFields = [
      "name", "spec_mode", "rated_power_kva", "primary_voltage",
      "secondary_voltage", "frequency", "phases", "design_requirements",
      "pro_spec", "estimated_cost",
    ];
    const hasSpecChanges = specFields.some((f) => f in updateData);

    // Snapshot current state as a version before applying changes
    if (hasSpecChanges) {
      const currentVersion = project.version || 1;

      // Build change summary
      const changes: string[] = [];
      for (const field of specFields) {
        if (field in updateData) {
          const oldVal = project[field];
          const newVal = updateData[field];
          if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
            changes.push(field.replace(/_/g, " "));
          }
        }
      }

      if (changes.length > 0) {
        // Save snapshot of current state
        await supabase.from("customer_project_versions").insert({
          project_id: id,
          version: currentVersion,
          name: project.name,
          spec_mode: project.spec_mode,
          rated_power_kva: project.rated_power_kva,
          primary_voltage: project.primary_voltage,
          secondary_voltage: project.secondary_voltage,
          frequency: project.frequency,
          phases: project.phases,
          design_requirements: project.design_requirements,
          pro_spec: project.pro_spec,
          estimated_cost: project.estimated_cost,
          status: project.status,
          change_summary: `Updated: ${changes.join(", ")}`,
          changed_by: "customer",
        });

        // Bump version on the project
        updateData.version = currentVersion + 1;
      }
    }

    const { data, error } = await supabase
      .from("customer_projects")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Update project error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ project: data });
  } catch (error: any) {
    console.error("Update project error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
