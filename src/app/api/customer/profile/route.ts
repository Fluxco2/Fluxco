import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

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

    // Fetch customer profile using service role (bypasses RLS)
    const { data: customer, error } = await supabase
      .from("customers")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code === "PGRST116") {
      // No profile — auto-create
      const { data: newProfile, error: createError } = await supabase
        .from("customers")
        .insert({
          user_id: user.id,
          email: user.email,
          company_name: user.email?.split("@")[1]?.split(".")[0] || "My Company",
          contact_name: user.email?.split("@")[0] || "Customer",
          country: "USA",
        })
        .select()
        .single();

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 500 });
      }
      return NextResponse.json({ customer: newProfile });
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ customer });
  } catch (error: any) {
    console.error("Profile error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
