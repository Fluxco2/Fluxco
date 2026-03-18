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

    const { data: supplier } = await supabase
      .from("suppliers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!supplier) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    }

    const { data: bids, error } = await supabase
      .from("supplier_bids")
      .select("*")
      .eq("supplier_id", supplier.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Enrich with listing info
    const enriched = await Promise.all(
      (bids || []).map(async (bid) => {
        const { data: listing } = await supabase
          .from("marketplace_listings")
          .select("id, serial_number, rated_power_kva, primary_voltage, secondary_voltage")
          .eq("id", bid.listing_id)
          .single();
        return {
          ...bid,
          listing_serial: listing?.serial_number || null,
          listing_kva: listing?.rated_power_kva || null,
          listing_id: bid.listing_id,
        };
      })
    );

    return NextResponse.json({ bids: enriched });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
