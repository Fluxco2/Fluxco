import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET — fetch all public questions for a listing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabase();
  const { id } = await params;

  try {
    const { data: questions, error } = await supabase
      .from("listing_questions")
      .select("*")
      .eq("listing_id", id)
      .eq("is_public", true)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ questions: questions || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST — ask a question (supplier auth required)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabase();
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

    // Get supplier profile
    const { data: supplier } = await supabase
      .from("suppliers")
      .select("id, contact_name, company_name, email")
      .eq("user_id", user.id)
      .single();

    // Also check if this is a customer (they can ask questions too)
    const { data: customer } = await supabase
      .from("customers")
      .select("id, contact_name, company_name, email")
      .eq("user_id", user.id)
      .single();

    if (!supplier && !customer) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = await request.json();
    if (!body.question?.trim()) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    // Verify listing exists
    const { data: listing } = await supabase
      .from("marketplace_listings")
      .select("id, rated_power_kva, serial_number, customer_project_id, contact_email")
      .eq("id", id)
      .single();
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const questionData = {
      listing_id: id,
      asked_by_supplier_id: supplier?.id || null,
      asked_by_name: supplier?.contact_name || customer?.contact_name || "Unknown",
      asked_by_company: supplier?.company_name || customer?.company_name || null,
      question: body.question.trim(),
      is_public: true,
    };

    const { data: newQuestion, error: insertError } = await supabase
      .from("listing_questions")
      .insert(questionData)
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Notify FluxCo team + listing owner
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const resend = new Resend(apiKey);
      const recipients = new Set(["brian@fluxco.com"]);

      // If linked to customer project, notify the customer
      if (listing.customer_project_id) {
        const { data: proj } = await supabase
          .from("customer_projects")
          .select("customer_id")
          .eq("id", listing.customer_project_id)
          .single();
        if (proj) {
          const { data: projCustomer } = await supabase
            .from("customers")
            .select("email")
            .eq("id", proj.customer_id)
            .single();
          if (projCustomer?.email) {
            recipients.add(projCustomer.email);
          }
        }
      }

      // Also notify the listing contact email (whoever submitted the spec)
      if (listing.contact_email) {
        recipients.add(listing.contact_email);
      }

      const listingLabel = listing.serial_number
        ? `${listing.serial_number} (${listing.rated_power_kva?.toLocaleString() || ""} kVA)`
        : `${listing.rated_power_kva?.toLocaleString() || ""} kVA Listing`;

      try {
        await resend.emails.send({
          from: "FluxCo <noreply@fluxco.com>",
          to: Array.from(recipients),
          subject: `New Question on ${listingLabel}`,
          html: `
            <h2>New Question on ${listingLabel}</h2>
            <p><strong>From:</strong> ${questionData.asked_by_name} (${questionData.asked_by_company || "N/A"})</p>
            <blockquote style="border-left: 3px solid #ccc; padding-left: 12px; color: #333;">
              ${body.question.trim()}
            </blockquote>
            <p>Log in to reply: <a href="https://fluxco.com/customer">Customer Portal</a></p>
          `,
        });
      } catch (emailErr) {
        console.error("Failed to send question notification:", emailErr);
      }
    }

    return NextResponse.json({ question: newQuestion });
  } catch (error: any) {
    console.error("Ask question error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
