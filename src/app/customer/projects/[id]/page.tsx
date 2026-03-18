"use client";

import { use } from "react";
import { useCustomerAuthContext } from "@/context/CustomerAuthContext";
import { CustomerSpecBuilder } from "@/components/customer/CustomerSpecBuilder";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { customer, loading } = useCustomerAuthContext();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px] rounded-lg" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Please complete your profile setup first.
      </div>
    );
  }

  return <CustomerSpecBuilder customerId={customer.id} projectId={id} />;
}
