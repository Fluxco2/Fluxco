import { NextRequest, NextResponse } from "next/server";
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
 * POST /api/freddy/email-ingest
 *
 * Processes an OEM email and updates Notion accordingly.
 * Can be called by:
 * - Claude during sessions (after reading Gmail)
 * - Google Apps Script webhook (future)
 * - Resend inbound webhook (future)
 *
 * Accepts either:
 * 1. Pre-parsed email data: { from, subject, body }
 * 2. Batch of emails: { emails: [{ from, subject, body }] }
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.FREDDY_API_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Handle batch or single email
    const emails: { from: string; subject: string; body: string; messageId?: string }[] =
      body.emails || [body];

    const results: {
      from: string;
      subject: string;
      responseType: string;
      suggestedStatus: string;
      oemFound: boolean;
      oemName?: string;
      oemPageId?: string;
      notionUpdated: boolean;
      created: boolean;
      summary: string;
      error?: string;
    }[] = [];

    for (const email of emails) {
      if (!email.from || !email.subject) {
        results.push({
          from: email.from || "unknown",
          subject: email.subject || "unknown",
          responseType: "unknown",
          suggestedStatus: "",
          oemFound: false,
          notionUpdated: false,
          created: false,
          summary: "",
          error: "Missing from or subject",
        });
        continue;
      }

      // Parse the email
      const parsed = parseOEMEmail(email.from, email.subject, email.body || "");

      // Skip FluxCo internal emails
      if (
        parsed.senderDomain === "fluxco.com" ||
        parsed.senderDomain === "trustventures.com"
      ) {
        results.push({
          from: parsed.senderEmail,
          subject: email.subject,
          responseType: "unknown",
          suggestedStatus: "",
          oemFound: false,
          notionUpdated: false,
          created: false,
          summary: "Skipped: internal email",
        });
        continue;
      }

      // Try to find the OEM in Notion
      let oem = await findOEMByEmail(parsed.senderEmail);
      let created = false;

      const result: (typeof results)[0] = {
        from: parsed.senderEmail,
        subject: email.subject,
        responseType: parsed.responseType,
        suggestedStatus: parsed.suggestedStatus,
        oemFound: !!oem,
        oemName: oem?.name,
        oemPageId: oem?.id,
        notionUpdated: false,
        created: false,
        summary: parsed.summary,
      };

      if (oem) {
        // Update existing OEM
        try {
          // Update status
          await updateOEMStatus(oem.id, "Status for 20MVA", parsed.suggestedStatus);

          // Append notes with summary
          const noteText = `Email reply: ${parsed.summary}`;
          await updateOEMNotes(oem.id, noteText);

          // Update contact info if we learned something new
          if (parsed.contactInfo.phone) {
            await updateOEMContact(oem.id, {
              phone: parsed.contactInfo.phone,
            });
          }

          // Update capability/capacity data if found
          if (parsed.capacityData) {
            await updateOEMCapabilities(oem.id, parsed.capacityData);
          }

          result.notionUpdated = true;
        } catch (err: any) {
          result.error = `Notion update failed: ${err.message}`;
        }
      } else {
        // OEM not found — create a new record
        try {
          const companyName = guessCompanyFromDomain(parsed.senderDomain) || parsed.senderDomain;
          const pageId = await createOEMRecord({
            name: companyName,
            contact: parsed.contactInfo.name || undefined,
            email: parsed.senderEmail,
            phone: parsed.contactInfo.phone || undefined,
            notes: `Auto-created from email reply. ${parsed.summary}`,
          });
          result.oemPageId = pageId;
          result.oemName = companyName;
          result.created = true;
          result.oemFound = true;

          // Set initial status
          await updateOEMStatus(pageId, "Status for 20MVA", parsed.suggestedStatus);
          result.notionUpdated = true;
        } catch (err: any) {
          result.error = `Notion create failed: ${err.message}`;
        }
      }

      results.push(result);
    }

    const updated = results.filter((r) => r.notionUpdated).length;
    const created = results.filter((r) => r.created).length;
    const skipped = results.filter((r) => r.summary.includes("Skipped")).length;
    const errors = results.filter((r) => r.error).length;

    return NextResponse.json({
      success: true,
      summary: { processed: results.length, updated, created, skipped, errors },
      results,
    });
  } catch (error: any) {
    console.error("Email ingest error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Guess company name from email domain.
 * e.g., "se.com" → "Schneider Electric" (if known), otherwise capitalize domain
 */
function guessCompanyFromDomain(domain: string): string | null {
  const knownDomains: Record<string, string> = {
    "se.com": "Schneider Electric",
    "ayr.energy": "Ayr Energy",
    "hitachi-energy.com": "Hitachi Energy",
    "prolecge.com": "Prolec GE",
    "eaton.com": "Eaton",
    "ge.com": "GE",
    "siemens-energy.com": "Siemens Energy",
    "abb.com": "ABB",
    "weg.net": "WEG",
    "hyosung.com": "Hyosung",
    "hd-hyundai.com": "HD Hyundai",
    "tbea.com": "TBEA",
    "ermco.com": "ERMCO",
    "sgb-smit.com": "SGB-SMIT",
  };

  if (knownDomains[domain]) return knownDomains[domain];

  // Capitalize the domain name portion
  const name = domain.split(".")[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
}
