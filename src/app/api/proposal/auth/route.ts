import { NextRequest, NextResponse } from "next/server";
import { getProjectBySlug } from "@/lib/notion";

export async function POST(request: NextRequest) {
  try {
    // Check that Notion env vars are available
    if (!process.env.NOTION_API_KEY) {
      console.error("NOTION_API_KEY is not set");
      return NextResponse.json(
        { error: "Server configuration error: missing Notion API key" },
        { status: 500 }
      );
    }
    if (!process.env.NOTION_PROJECTS_DB_ID) {
      console.error("NOTION_PROJECTS_DB_ID is not set");
      return NextResponse.json(
        { error: "Server configuration error: missing Projects DB ID" },
        { status: 500 }
      );
    }

    const { slug, password } = await request.json();

    if (!slug || !password) {
      return NextResponse.json(
        { error: "Slug and password are required" },
        { status: 400 }
      );
    }

    const project = await getProjectBySlug(slug);
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Default password: slug + zip code
    const expectedPassword = `${slug}${project.zipCode}`;

    if (password !== expectedPassword) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // Set an HttpOnly cookie valid for 7 days
    const response = NextResponse.json({ success: true });
    response.cookies.set(`proposal_auth_${slug}`, "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: `/proposal/${slug}`,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Proposal auth error:", message, error);
    return NextResponse.json(
      { error: "Authentication failed", detail: message },
      { status: 500 }
    );
  }
}
