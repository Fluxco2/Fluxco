import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getProjectsByCustomerId } from "@/lib/notion-customer";

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const notionCustomerId = request.nextUrl.searchParams.get("notionCustomerId");

    if (!notionCustomerId) {
      return NextResponse.json(
        { error: "Missing notionCustomerId parameter" },
        { status: 400 }
      );
    }

    // Verify the requesting user owns this customer record
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Confirm this user owns the customer record with the given notion_customer_id
    const { data: customerRecord, error: customerError } = await supabase
      .from("customers")
      .select("id")
      .eq("user_id", user.id)
      .eq("notion_customer_id", notionCustomerId)
      .single();

    if (customerError || !customerRecord) {
      return NextResponse.json(
        { error: "Unauthorized: customer record mismatch" },
        { status: 403 }
      );
    }

    // Fetch projects from Notion
    const projects = await getProjectsByCustomerId(notionCustomerId);

    return NextResponse.json({ projects });
  } catch (error: any) {
    console.error("Error fetching customer projects:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
