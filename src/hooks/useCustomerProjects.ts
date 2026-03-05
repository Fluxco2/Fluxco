"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { CustomerProject } from "@/types/notion";

async function fetchCustomerProjects(notionCustomerId: string): Promise<CustomerProject[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Not authenticated");

  const res = await fetch(`/api/customer/projects?notionCustomerId=${encodeURIComponent(notionCustomerId)}`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to fetch projects");
  }

  const data = await res.json();
  return data.projects;
}

export function useCustomerProjects(notionCustomerId: string | null | undefined) {
  const query = useQuery({
    queryKey: ["customer-projects", notionCustomerId],
    queryFn: () => fetchCustomerProjects(notionCustomerId!),
    enabled: !!notionCustomerId,
    staleTime: 60 * 1000, // 1 minute
  });

  const projects = query.data || [];
  const current = projects.filter((p) => p.status === "In Progress");
  const past = projects.filter((p) => p.status === "Done" || p.status === "Canceled");

  return {
    projects,
    current,
    past,
    isLoading: query.isLoading,
    error: query.error,
  };
}
