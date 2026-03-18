import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { id } = await params;

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
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!customer) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: project } = await supabase
      .from("customer_projects")
      .select("id, marketplace_listing_id")
      .eq("id", id)
      .eq("customer_id", customer.id)
      .single();
    if (!project || !project.marketplace_listing_id) {
      return NextResponse.json({ bids: [] });
    }

    // Get bids with supplier info
    const { data: bids, error } = await supabase
      .from("supplier_bids")
      .select("id, bid_price, lead_time_weeks, notes, proposal_url, status, created_at, supplier_id")
      .eq("listing_id", project.marketplace_listing_id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Enrich with supplier company names
    const enriched = await Promise.all(
      (bids || []).map(async (bid) => {
        const { data: supplier } = await supabase
          .from("suppliers")
          .select("company_name, contact_name, city, state")
          .eq("id", bid.supplier_id)
          .single();
        return {
          ...bid,
          company_name: supplier?.company_name || "Unknown",
          contact_name: supplier?.contact_name || "Unknown",
          location: [supplier?.city, supplier?.state].filter(Boolean).join(", ") || null,
        };
      })
    );

    return NextResponse.json({ bids: enriched });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
