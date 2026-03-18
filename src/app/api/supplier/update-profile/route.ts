import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const body = await request.json();
    const { supplierId, ...profileData } = body;

    if (!supplierId) {
      return NextResponse.json(
        { error: "Missing supplier ID" },
        { status: 400 }
      );
    }

    // Only update allowed fields
    const updateData: Record<string, any> = {};
    const allowedFields = [
      "company_name",
      "contact_name",
      "phone",
      "address",
      "city",
      "state",
      "country",
      "certifications",
      "specialties",
      "website",
      "kva_range_min",
      "kva_range_max",
      "voltage_min",
      "voltage_max",
      "cooling_types",
      "transformer_types",
    ];

    for (const field of allowedFields) {
      if (field in profileData) {
        updateData[field] = profileData[field];
      }
    }

    const { error } = await supabase
      .from("suppliers")
      .update(updateData)
      .eq("id", supplierId);

    if (error) {
      console.error("Profile update error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
