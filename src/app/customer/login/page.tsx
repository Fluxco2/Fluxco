import { Metadata } from "next";
import Link from "next/link";
import { Zap } from "lucide-react";
import { LoginForm } from "@/components/customer/LoginForm";

export const metadata: Metadata = {
  title: "Customer Login | FluxCo",
  description: "Sign in to your FluxCo customer account to view your projects and proposals.",
};

export default function CustomerLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <Link href="/" className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="font-display text-3xl tracking-wide text-foreground">
              FLUXCO
            </span>
          </Link>
          <h1 className="text-2xl font-semibold text-center">Customer Portal</h1>
          <p className="text-muted-foreground text-center mt-2">
            Sign in to view your projects and proposals
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
