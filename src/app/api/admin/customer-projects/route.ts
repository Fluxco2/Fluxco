import { NextRequest, NextResponse } from "next/server";
import { getProjectsByCustomerId } from "@/lib/notion-customer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, notionCustomerId } = body;

    // Validate admin password
    if (password !== "fluxco2026") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!notionCustomerId) {
      return NextResponse.json(
        { error: "Missing notionCustomerId" },
        { status: 400 }
      );
    }

    const projects = await getProjectsByCustomerId(notionCustomerId);

    return NextResponse.json({ projects });
  } catch (error: any) {
    console.error("Admin customer projects error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
