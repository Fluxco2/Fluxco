import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  // Create client inside function to avoid build-time env var issues
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  try {
    const body = await request.json();
    const {
      email,
      password,
      company_name,
      contact_name,
      phone,
      notify_new_listings,
    } = body;

    // Validate required fields
    if (!email || !password || !company_name || !contact_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    });

    if (authError) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // Create supplier profile using service role (bypasses RLS)
    const { error: profileError } = await supabase.from("suppliers").insert({
      user_id: authData.user.id,
      email,
      company_name,
      contact_name,
      phone: phone || null,
      notify_new_listings: notify_new_listings ?? false,
      country: "USA",
      certifications: [],
      specialties: [],
      is_verified: false,
    });

    if (profileError) {
      console.error("Profile error:", profileError);
      // Try to clean up the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: "Failed to create supplier profile: " + profileError.message },
        { status: 500 }
      );
    }

    // Notify Brian about new OEM/supplier signup
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      try {
        const resend = new Resend(apiKey);
        await resend.emails.send({
          from: "FluxCo <noreply@fluxco.com>",
          to: "brian@fluxco.com",
          subject: `New OEM Signup: ${company_name}`,
          html: `
            <h2>New OEM/Supplier Account Created</h2>
            <p><strong>Company:</strong> ${company_name}</p>
            <p><strong>Contact:</strong> ${contact_name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
            <p><strong>Marketplace notifications:</strong> ${notify_new_listings ? "Yes" : "No"}</p>
            <p style="color:#666;font-size:12px;">View all suppliers in the <a href="https://fluxco.com/admin">admin dashboard</a>.</p>
          `,
        });
      } catch (emailErr) {
        console.error("Failed to send new supplier alert email:", emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      userId: authData.user.id,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
