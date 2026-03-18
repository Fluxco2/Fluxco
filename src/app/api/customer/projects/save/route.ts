import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const body = await request.json();
    const {
      customerId,
      name,
      spec_mode,
      rated_power_kva,
      primary_voltage,
      secondary_voltage,
      frequency,
      phases,
      design_requirements,
      pro_spec,
      estimated_cost,
    } = body;

    if (!customerId) {
      return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("customer_projects")
      .insert({
        customer_id: customerId,
        name: name || `${rated_power_kva || ''} kVA Transformer`.trim(),
        spec_mode: spec_mode || "lite",
        rated_power_kva: rated_power_kva || null,
        primary_voltage: primary_voltage || null,
        secondary_voltage: secondary_voltage || null,
        frequency: frequency || 60,
        phases: phases || 3,
        design_requirements: design_requirements || null,
        pro_spec: pro_spec || null,
        estimated_cost: estimated_cost || null,
        status: "draft",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating project:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ project: data });
  } catch (error: any) {
    console.error("Save project error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
