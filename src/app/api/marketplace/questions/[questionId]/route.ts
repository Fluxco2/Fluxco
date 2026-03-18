import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

// PUT — answer a question (customer or fluxco employee)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { questionId } = await params;

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

    const body = await request.json();
    if (!body.answer?.trim()) {
      return NextResponse.json({ error: "Answer is required" }, { status: 400 });
    }

    // Determine who's answering
    const { data: customer } = await supabase
      .from("customers")
      .select("id, contact_name, company_name")
      .eq("user_id", user.id)
      .single();

    const { data: employee } = await supabase
      .from("employee_users")
      .select("id, name")
      .eq("user_id", user.id)
      .single();

    const answeredByType = employee ? "fluxco" : customer ? "customer" : null;
    const answeredByName = employee?.name || customer?.contact_name || user.email;

    if (!answeredByType) {
      return NextResponse.json({ error: "Not authorized to answer" }, { status: 403 });
    }

    // If customer, verify they own the project linked to this listing
    if (answeredByType === "customer") {
      const { data: question } = await supabase
        .from("listing_questions")
        .select("listing_id")
        .eq("id", questionId)
        .single();
      if (!question) {
        return NextResponse.json({ error: "Question not found" }, { status: 404 });
      }

      const { data: listing } = await supabase
        .from("marketplace_listings")
        .select("customer_project_id")
        .eq("id", question.listing_id)
        .single();

      if (listing?.customer_project_id) {
        const { data: project } = await supabase
          .from("customer_projects")
          .select("customer_id")
          .eq("id", listing.customer_project_id)
          .single();

        if (project?.customer_id !== customer!.id) {
          return NextResponse.json({ error: "Not your project" }, { status: 403 });
        }
      }
    }

    const { data: updated, error } = await supabase
      .from("listing_questions")
      .update({
        answer: body.answer.trim(),
        answered_by_type: answeredByType,
        answered_by_name: answeredByName,
        answered_at: new Date().toISOString(),
      })
      .eq("id", questionId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Notify the supplier who asked
    if (updated.asked_by_supplier_id) {
      const { data: asker } = await supabase
        .from("suppliers")
        .select("email, contact_name")
        .eq("id", updated.asked_by_supplier_id)
        .single();

      if (asker?.email && process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        try {
          await resend.emails.send({
            from: "FluxCo <noreply@fluxco.com>",
            to: asker.email,
            subject: "Your Question Has Been Answered",
            html: `
              <h2>Your Question Has Been Answered</h2>
              <p>Hi ${asker.contact_name?.split(" ")[0]},</p>
              <p><strong>Your question:</strong></p>
              <blockquote style="border-left: 3px solid #ccc; padding-left: 12px; color: #666;">
                ${updated.question}
              </blockquote>
              <p><strong>Answer from ${answeredByName}:</strong></p>
              <blockquote style="border-left: 3px solid #22c55e; padding-left: 12px; color: #333;">
                ${updated.answer}
              </blockquote>
              <p><a href="https://fluxco.com/portal/marketplace">View on Marketplace</a></p>
            `,
          });
        } catch (emailErr) {
          console.error("Failed to send answer notification:", emailErr);
        }
      }
    }

    return NextResponse.json({ question: updated });
  } catch (error: any) {
    console.error("Answer question error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
