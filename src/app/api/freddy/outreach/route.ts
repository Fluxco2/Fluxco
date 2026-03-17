import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import {
  getFreddyProjectSpec,
  findMatchingOEMs,
  buildOutreachEmail,
  updateOEMStatus,
} from "@/lib/freddy";

export async function POST(request: NextRequest) {
  // Auth check
  const authHeader = request.headers.get("authorization");
  const secret = process.env.FREDDY_API_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { projectId, dryRun, countryFilter, testEmail, testLimit, requireApproval } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }

    // 1. Fetch project spec from Notion
    const spec = await getFreddyProjectSpec(projectId);

    // 2. Find matching OEMs
    const oems = await findMatchingOEMs(spec, countryFilter);

    if (oems.length === 0) {
      return NextResponse.json({
        message: "No matching OEMs found",
        spec: {
          mvaSize: spec.mvaSize,
          location: spec.location,
          productDescription: spec.productDescription,
        },
      });
    }

    // 3. Dry run — return what would be sent
    if (dryRun) {
      const preview = oems.map((oem) => {
        const email = buildOutreachEmail(spec, oem);
        return {
          oem: oem.companyName,
          contactName: oem.contactName,
          emails: oem.emails,
          country: oem.country,
          subject: email.subject,
        };
      });

      // Also include a sample email body from the first OEM
      const sampleEmail = buildOutreachEmail(spec, oems[0]);

      return NextResponse.json({
        dryRun: true,
        projectId,
        spec: {
          mvaSize: spec.mvaSize,
          productDescription: spec.productDescription,
          location: spec.location,
          deliveryDate: spec.deliveryDate,
          customerName: spec.customerName,
        },
        matchingOEMs: preview.length,
        oems: preview,
        sampleEmailHtml: sampleEmail.html,
      });
    }

    // 4. Stage or send emails
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "RESEND_API_KEY not configured" },
        { status: 500 }
      );
    }

    const oemsToSend = testLimit ? oems.slice(0, testLimit) : oems;
    const batchId = requireApproval ? crypto.randomUUID() : null;

    const results: {
      oem: string;
      email: string;
      status: string;
      messageId?: string;
      error?: string;
    }[] = [];

    const projectSummary = {
      mvaSize: spec.mvaSize,
      productDescription: spec.productDescription,
      location: spec.location,
      zipCode: spec.zipCode,
      deliveryDate: spec.deliveryDate,
      customerName: spec.customerName,
    };

    for (const oem of oemsToSend) {
      const emailsToSend = testEmail ? [testEmail] : oem.emails;

      for (const emailAddr of emailsToSend) {
        // Check for existing outreach (prevent duplicates)
        const { data: existing } = await supabase
          .from("freddy_outreach")
          .select("id")
          .eq("notion_project_id", projectId)
          .eq("notion_oem_id", oem.id)
          .eq("email_to", emailAddr)
          .maybeSingle();

        if (existing) {
          results.push({ oem: oem.companyName, email: emailAddr, status: "skipped_duplicate" });
          continue;
        }

        const { subject, html } = buildOutreachEmail(spec, oem);

        if (requireApproval) {
          // Stage as pending — don't send yet
          await supabase.from("freddy_outreach").insert({
            notion_project_id: projectId,
            notion_oem_id: oem.id,
            oem_name: oem.companyName,
            contact_name: oem.contactName || null,
            email_to: emailAddr,
            project_summary: projectSummary,
            email_subject: subject,
            email_html: html,
            batch_id: batchId,
            status: "pending",
          });
          results.push({ oem: oem.companyName, email: emailAddr, status: "pending" });
        } else {
          // Send immediately
          const resend = new Resend(apiKey);
          try {
            const sendResult = await resend.emails.send({
              from: "Freddy Wilson <freddy@fluxco.com>",
              to: emailAddr,
              subject,
              html,
              replyTo: "freddy@fluxco.com",
            });
            const messageId = sendResult.data?.id || null;

            await supabase.from("freddy_outreach").insert({
              notion_project_id: projectId,
              notion_oem_id: oem.id,
              oem_name: oem.companyName,
              contact_name: oem.contactName || null,
              email_to: emailAddr,
              project_summary: projectSummary,
              email_subject: subject,
              email_html: html,
              resend_message_id: messageId,
              status: "sent",
            });
            results.push({ oem: oem.companyName, email: emailAddr, status: "sent", messageId: messageId || undefined });

            // Update OEM status in Notion to "Sent email"
            try {
              await updateOEMStatus(oem.id, "Status for 20MVA", "Sent email");
            } catch (notionErr) {
              console.error(`Failed to update Notion status for ${oem.companyName}:`, notionErr);
            }
          } catch (err: any) {
            await supabase.from("freddy_outreach").insert({
              notion_project_id: projectId,
              notion_oem_id: oem.id,
              oem_name: oem.companyName,
              contact_name: oem.contactName || null,
              email_to: emailAddr,
              project_summary: projectSummary,
              email_subject: subject,
              email_html: html,
              status: "failed",
            });
            results.push({ oem: oem.companyName, email: emailAddr, status: "failed", error: err.message || "Unknown error" });
          }
          await new Promise((r) => setTimeout(r, 500));
        }
      }
    }

    const sent = results.filter((r) => r.status === "sent").length;
    const pending = results.filter((r) => r.status === "pending").length;
    const skipped = results.filter((r) => r.status === "skipped_duplicate").length;
    const failed = results.filter((r) => r.status === "failed").length;

    // If staged for approval, send email notification to Brian
    if (requireApproval && pending > 0) {
      const approveUrl = `https://fluxco.com/freddy?batch=${batchId}`;
      const resend = new Resend(apiKey);
      const oemList = results
        .filter((r) => r.status === "pending")
        .map((r) => r.oem)
        .join(", ");

      try {
        await resend.emails.send({
          from: "Freddy Wilson <freddy@fluxco.com>",
          to: "brian@fluxco.com",
          subject: `Freddy: ${pending} emails ready for approval - ${projectSummary.productDescription}`,
          html: `
<div style="font-family: Arial, sans-serif; max-width: 500px; color: #333;">
  <h3>Batch Ready for Approval</h3>
  <p><strong>Project:</strong> ${projectSummary.productDescription}</p>
  <p><strong>Location:</strong> ${projectSummary.location}</p>
  <p><strong>Emails staged:</strong> ${pending}</p>
  <p><strong>OEMs:</strong> ${oemList}</p>
  <p style="margin-top: 20px;">
    <a href="${approveUrl}" style="display: inline-block; padding: 14px 28px; background: #22c55e; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
      Review & Approve →
    </a>
  </p>
  <p style="color: #999; font-size: 12px; margin-top: 16px;">
    Or open: ${approveUrl}
  </p>
</div>`,
        });
      } catch (notifyErr) {
        console.error("Failed to send approval notification:", notifyErr);
      }

      return NextResponse.json({
        success: true,
        requiresApproval: true,
        batchId,
        approveUrl,
        summary: { pending, skipped, failed, total: results.length },
        results,
      });
    }

    return NextResponse.json({
      success: true,
      summary: { sent, skipped, failed, total: results.length },
      results,
    });
  } catch (error: any) {
    console.error("Freddy outreach error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
