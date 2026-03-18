"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupplierAuthContext } from "@/context/SupplierAuthContext";
import { MarketplaceList } from "@/components/supplier/MarketplaceList";
import { Skeleton } from "@/components/ui/skeleton";

export default function MarketplacePage() {
  const router = useRouter();
  const { supplier, loading } = useSupplierAuthContext();

  useEffect(() => {
    if (!loading && !supplier) {
      router.replace("/portal/login");
    }
  }, [loading, supplier, router]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    );
  }

  if (!supplier) {
    return null;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">OEM Marketplace</h1>
        <p className="text-muted-foreground">
          Browse transformer opportunities and submit bids. Click &quot;Place Bid&quot; to express interest and submit your pricing.
        </p>
      </div>

      <MarketplaceList />
    </div>
  );
}
