import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    // Hardcoded password
    if (password !== "fluxco2026") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check for required env vars
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Fetch all data using service role (bypasses RLS)
    const [bidsResult, listingsResult, suppliersResult, customersResult] = await Promise.all([
      supabase
        .from("supplier_bids")
        .select(`
          *,
          listing:marketplace_listings(serial_number, rated_power_kva, primary_voltage, secondary_voltage),
          supplier:suppliers(company_name, contact_name, email)
        `)
        .order("created_at", { ascending: false }),

      supabase
        .from("marketplace_listings")
        .select("*")
        .order("created_at", { ascending: false }),

      supabase
        .from("suppliers")
        .select("*")
        .order("created_at", { ascending: false }),

      supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    return NextResponse.json({
      bids: bidsResult.data || [],
      listings: listingsResult.data || [],
      suppliers: suppliersResult.data || [],
      customers: customersResult.data || [],
    });
  } catch (error: any) {
    console.error("Admin API error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
