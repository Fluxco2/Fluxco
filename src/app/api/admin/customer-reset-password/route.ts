import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, customerUserId, customerEmail } = body;

    // Validate admin password
    if (password !== "fluxco2026") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!customerUserId || !customerEmail) {
      return NextResponse.json(
        { error: "Missing customer user ID or email" },
        { status: 400 }
      );
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Generate a temporary password
    const tempPassword = `FluxCo-${Math.random().toString(36).slice(2, 10)}`;

    // Reset the user's password using admin API
    const { error: resetError } = await supabase.auth.admin.updateUserById(
      customerUserId,
      { password: tempPassword }
    );

    if (resetError) {
      console.error("Password reset error:", resetError);
      return NextResponse.json(
        { error: resetError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tempPassword,
      message: `Password reset for ${customerEmail}. Temporary password generated.`,
    });
  } catch (error: any) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
