"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupplierAuthContext } from "@/context/SupplierAuthContext";
import { useSupplierDashboard } from "@/hooks/useMarketplace";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle,
  FileText,
  Store,
  UserCircle,
  ArrowRight,
  Zap,
  MapPin,
} from "lucide-react";
import Link from "next/link";

const formatVoltage = (voltage: number): string => {
  if (voltage >= 1000) {
    return `${(voltage / 1000).toFixed(voltage % 1000 === 0 ? 0 : 1)} kV`;
  }
  return `${voltage} V`;
};

export default function PortalPage() {
  const router = useRouter();
  const { supplier, loading } = useSupplierAuthContext();
  const dashboard = useSupplierDashboard(supplier?.id);

  useEffect(() => {
    if (!loading && !supplier) {
      router.replace("/portal/login");
    }
  }, [loading, supplier, router]);

  if (loading || !supplier) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-[300px] rounded-lg" />
      </div>
    );
  }

  // Calculate profile completion
  const profileFields = [
    supplier.company_name,
    supplier.contact_name,
    supplier.phone,
    supplier.address,
    supplier.city,
    supplier.state,
    supplier.certifications?.length > 0,
    supplier.specialties?.length > 0,
  ];
  const filledFields = profileFields.filter(Boolean).length;
  const profileCompletion = Math.round((filledFields / profileFields.length) * 100);

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold mb-1">
          Welcome, {supplier.contact_name?.split(" ")[0] || supplier.company_name}
        </h1>
        <p className="text-muted-foreground">
          {supplier.company_name} &mdash; OEM Portal Dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/portal/marketplace"
          className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center gap-2 text-2xl font-bold text-primary">
            <Clock className="w-6 h-6" />
            {dashboard.activeOpportunities}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Active Opportunities</div>
        </Link>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <FileText className="w-6 h-6 text-primary" />
            {dashboard.myBids}
          </div>
          <div className="text-sm text-muted-foreground mt-1">My Bids</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-2xl font-bold text-green-500">
            <CheckCircle className="w-6 h-6" />
            {dashboard.wonBids}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Won Bids</div>
        </div>

        <Link
          href="/portal/profile"
          className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <UserCircle className="w-6 h-6 text-primary" />
            {profileCompletion}%
          </div>
          <div className="text-sm text-muted-foreground mt-1">Profile Complete</div>
        </Link>
      </div>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Opportunities */}
        <div className="bg-card border border-border rounded-lg">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-semibold flex items-center gap-2">
              <Store className="w-4 h-4 text-primary" />
              Recent Opportunities
            </h2>
            <Link
              href="/portal/marketplace"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {dashboard.isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : dashboard.recentListings.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No active opportunities right now. Check back soon.
              </div>
            ) : (
              dashboard.recentListings.map((listing) => (
                <Link
                  key={listing.id}
                  href="/portal/marketplace"
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-primary" />
                    <div>
                      <span className="font-semibold text-primary">
                        {listing.rated_power_kva.toLocaleString()} kVA
                      </span>
                      <span className="text-muted-foreground text-sm ml-2">
                        {formatVoltage(listing.primary_voltage)} / {formatVoltage(listing.secondary_voltage)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {listing.zipcode && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {listing.zipcode}
                      </span>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {listing.phases}-Ph
                    </Badge>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* My Recent Bids */}
        <div className="bg-card border border-border rounded-lg">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              My Recent Bids
            </h2>
          </div>
          <div className="divide-y divide-border">
            {dashboard.isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : dashboard.recentBids.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p className="mb-2">No bids yet.</p>
                <Link
                  href="/portal/marketplace"
                  className="text-primary hover:underline text-sm"
                >
                  Browse opportunities to place your first bid
                </Link>
              </div>
            ) : (
              dashboard.recentBids.map((bid) => (
                <div
                  key={bid.id}
                  className="flex items-center justify-between p-4"
                >
                  <div>
                    <span className="font-medium">
                      ${bid.bid_price.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground text-sm ml-2">
                      {bid.lead_time_weeks} weeks
                    </span>
                  </div>
                  <Badge
                    variant={
                      bid.status === "accepted"
                        ? "default"
                        : bid.status === "rejected"
                        ? "destructive"
                        : "secondary"
                    }
                    className={
                      bid.status === "accepted"
                        ? "bg-green-500/10 text-green-500 border-green-500/30"
                        : ""
                    }
                  >
                    {bid.status === "submitted"
                      ? "Pending"
                      : bid.status === "under_review"
                      ? "Under Review"
                      : bid.status === "accepted"
                      ? "Won"
                      : bid.status === "rejected"
                      ? "Not Selected"
                      : bid.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link
          href="/portal/marketplace"
          className="flex items-center gap-4 bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors group"
        >
          <Store className="w-8 h-8 text-primary" />
          <div>
            <h3 className="font-semibold group-hover:text-primary transition-colors">
              Browse Marketplace
            </h3>
            <p className="text-sm text-muted-foreground">
              View all active transformer opportunities and place bids
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
        </Link>

        <Link
          href="/portal/profile"
          className="flex items-center gap-4 bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors group"
        >
          <UserCircle className="w-8 h-8 text-primary" />
          <div>
            <h3 className="font-semibold group-hover:text-primary transition-colors">
              Complete Your Profile
            </h3>
            <p className="text-sm text-muted-foreground">
              Add factory capabilities, certifications, and specialties
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
        </Link>
      </div>
    </div>
  );
}
