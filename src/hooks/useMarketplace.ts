"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, MarketplaceListing, SupplierBid } from "@/lib/supabase";

export function useMarketplace() {
  return useQuery<{ active: MarketplaceListing[]; completed: MarketplaceListing[] }, Error>({
    queryKey: ["marketplace-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_listings")
        .select("*")
        .in("status", ["listed", "completed"])
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      const listings = data as MarketplaceListing[];
      return {
        active: listings.filter(l => l.status === "listed"),
        completed: listings.filter(l => l.status === "completed"),
      };
    },
  });
}

export function useSupplierBids(supplierId: string | undefined, accessToken?: string | null) {
  return useQuery<SupplierBid[], Error>({
    queryKey: ["supplier-bids", supplierId],
    queryFn: async () => {
      if (!accessToken) return [];

      const res = await fetch("/api/supplier/bids", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) return [];
      const { bids } = await res.json();
      return bids as SupplierBid[];
    },
    enabled: !!supplierId && !!accessToken,
  });
}

export function useSupplierDashboard(supplierId: string | undefined, accessToken?: string | null) {
  const marketplace = useMarketplace();
  const bids = useSupplierBids(supplierId, accessToken);

  const activeOpportunities = marketplace.data?.active?.length || 0;
  const myBids = bids.data?.length || 0;
  const wonBids = bids.data?.filter(b => b.status === "accepted").length || 0;
  const pendingBids = bids.data?.filter(b => b.status === "submitted" || b.status === "under_review").length || 0;

  return {
    activeOpportunities,
    myBids,
    wonBids,
    pendingBids,
    recentListings: marketplace.data?.active?.slice(0, 5) || [],
    recentBids: bids.data?.slice(0, 5) || [],
    isLoading: marketplace.isLoading || bids.isLoading,
  };
}

export function useSubmitBid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bid: {
      listing_id: string;
      supplier_id: string;
      bid_price: number;
      lead_time_weeks: number;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("supplier_bids")
        .upsert({
          ...bid,
          status: "submitted",
          interest_expressed_at: new Date().toISOString(),
        }, {
          onConflict: "listing_id,supplier_id",
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-bids"] });
    },
  });
}
