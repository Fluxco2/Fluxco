"use client";

import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { ProfileForm } from "@/components/customer/ProfileForm";
import { PasswordChangeForm } from "@/components/customer/PasswordChangeForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings } from "lucide-react";

export default function CustomerSettingsPage() {
  const { customer, loading } = useCustomerAuth();

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center max-w-3xl">
        <Settings className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-semibold text-lg mb-2">Account Setup In Progress</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Your customer profile hasn&apos;t been set up yet. Please contact your FluxCo representative.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8">
      {/* Profile Section */}
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your company profile and account security.
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <ProfileForm customer={customer} />
        </div>
      </div>

      {/* Security Section */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Security</h2>
          <p className="text-muted-foreground">
            Update your password to keep your account secure.
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <PasswordChangeForm />
        </div>
      </div>
    </div>
  );
}
