import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getProjectBySlug } from "@/lib/notion";
import { getProjectsByCustomerId } from "@/lib/notion-customer";

/**
 * Authenticates a logged-in customer to view a proposal without a password.
 * Verifies the customer is linked to the project's customer in Notion,
 * then sets the proposal auth cookie.
 */
export async function POST(request: NextRequest) {
  try {
    const { slug, token } = await request.json();

    if (!slug || !token) {
      return NextResponse.json(
        { error: "Missing slug or token" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify the user's auth token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Check if this user is a customer with a linked notion_customer_id
    const { data: customerRecords, error: customerError } = await supabase
      .from("customers")
      .select("notion_customer_id")
      .eq("user_id", user.id)
      .not("notion_customer_id", "is", null);

    if (customerError || !customerRecords || customerRecords.length === 0) {
      return NextResponse.json(
        { error: "No linked customer account found" },
        { status: 403 }
      );
    }

    const notionCustomerId = customerRecords[0].notion_customer_id;

    // Fetch the customer's projects from Notion and check if the slug matches
    const projects = await getProjectsByCustomerId(notionCustomerId);
    const matchingProject = projects.find((p) => p.slug === slug);

    if (!matchingProject) {
      return NextResponse.json(
        { error: "This proposal is not associated with your account" },
        { status: 403 }
      );
    }

    // Set the proposal auth cookie
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
    console.error("Customer proposal auth error:", message);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
