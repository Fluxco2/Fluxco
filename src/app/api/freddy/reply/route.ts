import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import fs from "fs";
import path from "path";

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
    const { to, subject, body, html, attachmentPaths, outreachId } =
      await request.json();

    if (!to || !subject || (!body && !html)) {
      return NextResponse.json(
        { error: "to, subject, and body (or html) are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "RESEND_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Build attachments from local file paths
    const attachments: { filename: string; content: Buffer }[] = [];
    if (attachmentPaths && Array.isArray(attachmentPaths)) {
      for (const filePath of attachmentPaths) {
        if (!fs.existsSync(filePath)) {
          return NextResponse.json(
            { error: `Attachment not found: ${filePath}` },
            { status: 400 }
          );
        }
        attachments.push({
          filename: path.basename(filePath),
          content: fs.readFileSync(filePath),
        });
      }
    }

    const resend = new Resend(apiKey);
    const sendResult = await resend.emails.send({
      from: "Freddy Wilson <freddy@fluxco.com>",
      to: Array.isArray(to) ? to : [to],
      subject,
      ...(html ? { html } : { text: body }),
      replyTo: "freddy@fluxco.com",
      ...(attachments.length > 0 ? { attachments } : {}),
    });

    const messageId = sendResult.data?.id || null;

    // If linked to an outreach record, update its status
    if (outreachId) {
      await supabase
        .from("freddy_outreach")
        .update({ status: "replied" })
        .eq("id", outreachId);
    }

    return NextResponse.json({
      success: true,
      messageId,
      to,
      subject,
      attachmentCount: attachments.length,
    });
  } catch (error: any) {
    console.error("Freddy reply error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
