import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const body = await request.json();
    const { userId, email } = body;

    if (!userId || !email) {
      return NextResponse.json(
        { error: "Missing userId or email" },
        { status: 400 }
      );
    }

    // Check if profile already exists
    const { data: existing } = await supabase
      .from("customers")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (existing) {
      return NextResponse.json({ customer: existing });
    }

    // Auto-create a profile from auth data
    const { data: newProfile, error } = await supabase
      .from("customers")
      .insert({
        user_id: userId,
        email,
        company_name: email.split("@")[1]?.split(".")[0] || "My Company",
        contact_name: email.split("@")[0] || "Customer",
        country: "USA",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating customer profile:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ customer: newProfile, created: true });
  } catch (error: any) {
    console.error("Ensure profile error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
