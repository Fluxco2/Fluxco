import { Metadata } from "next";
import Link from "next/link";
import { Zap } from "lucide-react";
import { RegisterForm } from "@/components/customer/RegisterForm";

export const metadata: Metadata = {
  title: "Customer Registration | FluxCo",
  description: "Create a FluxCo customer account to track your projects and view proposals.",
};

export default function CustomerRegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-2xl space-y-8">
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
          <h1 className="text-2xl font-semibold text-center">Create Customer Account</h1>
          <p className="text-muted-foreground text-center mt-2">
            Register to track your projects and view proposals
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
