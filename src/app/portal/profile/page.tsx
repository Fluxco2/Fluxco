"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupplierAuthContext } from "@/context/SupplierAuthContext";
import { ProfileForm } from "@/components/supplier/ProfileForm";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const router = useRouter();
  const { supplier, loading } = useSupplierAuthContext();

  useEffect(() => {
    if (!loading && !supplier) {
      router.replace("/portal/login");
    }
  }, [loading, supplier, router]);

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-[600px] w-full rounded-lg" />
      </div>
    );
  }

  if (!supplier) {
    return null;
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Company Profile</h1>
        <p className="text-muted-foreground">
          Set up your factory capabilities, certifications, and specialties. This helps us match you with relevant opportunities.
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <ProfileForm supplier={supplier} />
      </div>
    </div>
  );
}
