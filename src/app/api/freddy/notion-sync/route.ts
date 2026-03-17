import { NextRequest, NextResponse } from "next/server";
import {
  updateOEMStatus,
  updateOEMNotes,
  updateOEMContact,
  createOEMRecord,
  findOEMByEmail,
} from "@/lib/freddy";

/**
 * POST /api/freddy/notion-sync
 *
 * Syncs OEM data to Notion. Supports:
 * - Updating OEM status (e.g., after email reply detected)
 * - Updating OEM notes (e.g., appending interaction notes)
 * - Updating OEM contact info
 * - Creating new OEM records from email data
 * - Finding OEM by email address
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.FREDDY_API_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "update-status": {
        const { oemPageId, field, status } = body;
        if (!oemPageId || !field || !status) {
          return NextResponse.json(
            { error: "oemPageId, field, and status are required" },
            { status: 400 }
          );
        }
        await updateOEMStatus(oemPageId, field, status);
        return NextResponse.json({ success: true, action: "update-status", oemPageId, field, status });
      }

      case "update-notes": {
        const { oemPageId, notes } = body;
        if (!oemPageId || !notes) {
          return NextResponse.json(
            { error: "oemPageId and notes are required" },
            { status: 400 }
          );
        }
        await updateOEMNotes(oemPageId, notes);
        return NextResponse.json({ success: true, action: "update-notes", oemPageId });
      }

      case "update-contact": {
        const { oemPageId, contact, email, additionalEmail, phone } = body;
        if (!oemPageId) {
          return NextResponse.json(
            { error: "oemPageId is required" },
            { status: 400 }
          );
        }
        await updateOEMContact(oemPageId, { contact, email, additionalEmail, phone });
        return NextResponse.json({ success: true, action: "update-contact", oemPageId });
      }

      case "create-oem": {
        const { name, supplierType, country, contact, email, additionalEmail, phone, website, notes } = body;
        if (!name) {
          return NextResponse.json(
            { error: "name is required" },
            { status: 400 }
          );
        }
        const pageId = await createOEMRecord({
          name, supplierType, country, contact, email, additionalEmail, phone, website, notes,
        });
        return NextResponse.json({ success: true, action: "create-oem", pageId, name });
      }

      case "find-by-email": {
        const { email } = body;
        if (!email) {
          return NextResponse.json(
            { error: "email is required" },
            { status: 400 }
          );
        }
        const result = await findOEMByEmail(email);
        return NextResponse.json({
          success: true,
          action: "find-by-email",
          found: !!result,
          ...(result || {}),
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}. Supported: update-status, update-notes, update-contact, create-oem, find-by-email` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("Notion sync error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
