import { NextRequest, NextResponse } from "next/server";
import { getProjectBySlug } from "@/lib/notion";

export async function POST(request: NextRequest) {
  try {
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
    console.error("Proposal auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
