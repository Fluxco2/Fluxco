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
      specMode,
      ratedPowerKva,
      primaryVoltage,
      secondaryVoltage,
      frequency,
      phases,
      designRequirements,
      proSpec,
      designResult,
      estimatedCost,
    } = body;

    if (!customerId) {
      return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("customer_projects")
      .insert({
        customer_id: customerId,
        name: name || `${ratedPowerKva || ''} kVA Transformer`.trim(),
        spec_mode: specMode || "lite",
        rated_power_kva: ratedPowerKva || null,
        primary_voltage: primaryVoltage || null,
        secondary_voltage: secondaryVoltage || null,
        frequency: frequency || 60,
        phases: phases || 3,
        design_requirements: designRequirements || null,
        pro_spec: proSpec || null,
        design_result: designResult || null,
        estimated_cost: estimatedCost || null,
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
