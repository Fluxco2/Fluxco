import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { google } from "googleapis";
import { parseOEMEmail } from "@/lib/email-parser";
import {
  findOEMByEmail,
  updateOEMStatus,
  updateOEMNotes,
  updateOEMContact,
  updateOEMCapabilities,
  createOEMRecord,
} from "@/lib/freddy";

/**
 * GET /api/cron/freddy-scan
 *
 * Scans freddy@fluxco.com inbox for new emails and processes them.
 * Designed to be called by Vercel Cron or externally.
 *
 * Auth: CRON_SECRET header or Vercel's built-in cron auth.
 */
export async function GET(request: NextRequest) {
  // Verify cron auth
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Get Gmail client for freddy@fluxco.com
    const oauth2Client = new google.auth.OAuth2(
      process.env.FREDDY_GMAIL_CLIENT_ID,
      process.env.FREDDY_GMAIL_CLIENT_SECRET,
    );
    oauth2Client.setCredentials({
      refresh_token: process.env.FREDDY_GMAIL_REFRESH_TOKEN,
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Get last scan timestamp from Supabase
    const { data: scanState } = await supabase
      .from("freddy_scan_state")
      .select("last_scanned_at")
      .eq("id", "gmail_scan")
      .single();

    // Default to 24 hours ago if no previous scan
    const lastScanned = scanState?.last_scanned_at
      ? new Date(scanState.last_scanned_at)
      : new Date(Date.now() - 24 * 60 * 60 * 1000);

    const afterEpoch = Math.floor(lastScanned.getTime() / 1000);

    // Search for emails received after last scan (exclude sent)
    const listResponse = await gmail.users.messages.list({
      userId: "me",
      q: `after:${afterEpoch} in:inbox -from:fluxco.com`,
      maxResults: 50,
    });

    const messageIds = listResponse.data.messages || [];
    const results: { from: string; subject: string; status: string; capacity?: string }[] = [];

    for (const msg of messageIds) {
      if (!msg.id) continue;

      // Get full message
      const message = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
        format: "full",
      });

      const headers = message.data.payload?.headers || [];
      const from = headers.find((h) => h.name === "From")?.value || "";
      const subject = headers.find((h) => h.name === "Subject")?.value || "";

      // Extract body text
      let body = "";
      const payload = message.data.payload;
      if (payload?.body?.data) {
        body = Buffer.from(payload.body.data, "base64").toString("utf-8");
      } else if (payload?.parts) {
        for (const part of payload.parts) {
          if (part.mimeType === "text/plain" && part.body?.data) {
            body = Buffer.from(part.body.data, "base64").toString("utf-8");
            break;
          }
          if (part.mimeType === "text/html" && part.body?.data && !body) {
            body = Buffer.from(part.body.data, "base64").toString("utf-8")
              .replace(/<[^>]+>/g, " ")
              .replace(/\s+/g, " ");
          }
        }
      }

      // Parse the email
      const parsed = parseOEMEmail(from, subject, body);

      // Skip internal emails
      if (parsed.senderDomain === "fluxco.com" || parsed.senderDomain === "trustventures.com") {
        continue;
      }

      // Find or create OEM
      let oem = await findOEMByEmail(parsed.senderEmail);
      let resultStatus = "skipped";

      if (oem) {
        try {
          await updateOEMStatus(oem.id, "Status for 20MVA", parsed.suggestedStatus);
          await updateOEMNotes(oem.id, `Email: ${parsed.summary}`);

          if (parsed.contactInfo.phone) {
            await updateOEMContact(oem.id, { phone: parsed.contactInfo.phone });
          }

          // Update capabilities
          if (parsed.capacityData.kvaMax || parsed.capacityData.voltageMax || parsed.capacityData.transformerTypes?.length) {
            await updateOEMCapabilities(oem.id, parsed.capacityData);
          }

          resultStatus = "updated";
        } catch (err: any) {
          resultStatus = `error: ${err.message}`;
        }
      } else {
        // Create new OEM
        try {
          const companyName = guessCompanyFromDomain(parsed.senderDomain);
          const pageId = await createOEMRecord({
            name: companyName,
            contact: parsed.contactInfo.name || undefined,
            email: parsed.senderEmail,
            phone: parsed.contactInfo.phone || undefined,
            notes: `Auto-created from email. ${parsed.summary}`,
          });

          await updateOEMStatus(pageId, "Status for 20MVA", parsed.suggestedStatus);

          if (parsed.capacityData.kvaMax || parsed.capacityData.voltageMax) {
            await updateOEMCapabilities(pageId, parsed.capacityData);
          }

          resultStatus = "created";
        } catch (err: any) {
          resultStatus = `create-error: ${err.message}`;
        }
      }

      const capSummary = [
        parsed.capacityData.kvaMax ? `${parsed.capacityData.kvaMax >= 1000 ? `${parsed.capacityData.kvaMax / 1000}MVA` : `${parsed.capacityData.kvaMax}kVA`} max` : null,
        parsed.capacityData.voltageMax ? `${parsed.capacityData.voltageMax}kV` : null,
        parsed.capacityData.transformerTypes?.join(", "),
      ].filter(Boolean).join(", ");

      results.push({
        from: parsed.senderEmail,
        subject,
        status: resultStatus,
        capacity: capSummary || undefined,
      });
    }

    // Update last scan timestamp
    await supabase
      .from("freddy_scan_state")
      .upsert({ id: "gmail_scan", last_scanned_at: new Date().toISOString() });

    return NextResponse.json({
      success: true,
      scanned: messageIds.length,
      processed: results.length,
      results,
    });
  } catch (error: any) {
    console.error("Freddy scan error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function guessCompanyFromDomain(domain: string): string {
  const known: Record<string, string> = {
    "se.com": "Schneider Electric",
    "olsun.com": "Olsun Electrics",
    "ayr.energy": "Ayr Energy",
    "hitachi-energy.com": "Hitachi Energy",
    "prolecge.com": "Prolec GE",
    "eaton.com": "Eaton",
    "ge.com": "GE",
    "siemens-energy.com": "Siemens Energy",
    "abb.com": "ABB",
    "weg.net": "WEG",
    "ermco.com": "ERMCO",
    "alfatransformer.com": "Alfa Transformer",
    "jordantransformer.com": "Jordan Transformer",
  };
  return known[domain] || domain.split(".")[0].charAt(0).toUpperCase() + domain.split(".")[0].slice(1);
}

export const dynamic = "force-dynamic";
