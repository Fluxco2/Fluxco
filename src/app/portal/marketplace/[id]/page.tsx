"use client";

import { use, useState, useEffect } from "react";
import { useSupplierAuthContext } from "@/context/SupplierAuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, Send, MapPin } from "lucide-react";
import Link from "next/link";
import { MarketplaceListing } from "@/lib/supabase";
import { QASection } from "@/components/marketplace/QASection";
import { BidDialog } from "@/components/supplier/BidDialog";
import { ProDesignForm } from "@/components/transformer/inputs/ProDesignForm";
import { STEEL_GRADES, CONDUCTOR_TYPES, COOLING_CLASSES, VECTOR_GROUPS } from "@/engine/constants/materials";
import { getDefaultProSpec } from "@/engine/constants/proDefaults";
import type { DesignRequirements } from "@/engine/types/transformer.types";
import type { ProSpecData } from "@/engine/types/proSpec.types";

function deserializeRequirements(data: any): DesignRequirements {
  return {
    ratedPower: data.ratedPower ?? 1500,
    primaryVoltage: data.primaryVoltage ?? 13800,
    secondaryVoltage: data.secondaryVoltage ?? 480,
    frequency: data.frequency ?? 60,
    phases: data.phases ?? 3,
    targetImpedance: data.targetImpedance ?? 5.75,
    steelGrade: STEEL_GRADES.find((s) => s.id === data.steelGradeId) ?? STEEL_GRADES.find((s) => s.id === "hi-b")!,
    conductorType: CONDUCTOR_TYPES.find((c) => c.id === data.conductorTypeId) ?? CONDUCTOR_TYPES.find((c) => c.id === "copper")!,
    coolingClass: COOLING_CLASSES.find((c) => c.id === data.coolingClassId) ?? COOLING_CLASSES.find((c) => c.id === "onan")!,
    vectorGroup: VECTOR_GROUPS.find((v) => v.id === data.vectorGroupId) ?? VECTOR_GROUPS.find((v) => v.id === "dyn11")!,
    tapChangerType: data.tapChangerType ?? "noLoad",
    oilType: data.oilType ?? "mineral",
    oilPreservation: data.oilPreservation ?? "conservator",
    includeTAC: data.includeTAC ?? false,
    manufacturingRegions: data.manufacturingRegions ?? ["usa"],
    requireFEOC: data.requireFEOC ?? true,
    altitude: data.altitude,
    ambientTemperature: data.ambientTemperature,
  };
}

export default function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { supplier, user, session, loading: authLoading } = useSupplierAuthContext();
  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidOpen, setBidOpen] = useState(false);
  const [requirements, setRequirements] = useState<DesignRequirements | null>(null);
  const [proSpec, setProSpec] = useState<ProSpecData>(getDefaultProSpec());

  useEffect(() => {
    const fetchListing = async () => {
      const res = await fetch(`/api/marketplace/${id}`);
      if (res.ok) {
        const { listing: l } = await res.json();
        setListing(l);
        const specs = l.design_specs as any;
        if (specs?.requirements) {
          setRequirements(deserializeRequirements(specs.requirements));
          if (specs.proSpec) setProSpec(specs.proSpec);
        }
      }
      setLoading(false);
    };
    fetchListing();
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!listing) return;
    // Use browser print to PDF — captures the exact on-screen layout
    window.print();
  };

  if (loading || authLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[600px] rounded-lg" />
      </div>
    );
  }

  if (!listing || !requirements) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Listing not found.</p>
        <Link href="/portal/marketplace" className="text-primary hover:underline text-sm mt-2 inline-block">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header — hidden in print */}
      <div className="flex items-center justify-between flex-wrap gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Link
            href="/portal/marketplace"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-primary">
                {listing.rated_power_kva.toLocaleString()} kVA
              </h1>
              <Badge variant="outline" className="font-mono">
                {listing.serial_number}
              </Badge>
              <Badge variant="secondary">{listing.phases}-Phase</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Posted {new Date(listing.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              {listing.zipcode && (
                <span className="ml-3">
                  <MapPin className="w-3 h-3 inline" /> {listing.zipcode}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          {supplier && (
            <Button onClick={() => setBidOpen(true)}>
              <Send className="w-4 h-4 mr-2" />
              Place Bid
            </Button>
          )}
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block mb-6">
        <h1 className="text-xl font-bold">
          FluxCo — {listing.serial_number} — {listing.rated_power_kva.toLocaleString()} kVA {listing.phases}-Phase Transformer Specification
        </h1>
        <p className="text-sm text-muted-foreground">
          Posted {new Date(listing.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {/* Spec Builder Form — read-only */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Design Requirements</CardTitle>
          <Badge variant="default" className="bg-blue-600">Pro</Badge>
        </CardHeader>
        <CardContent>
          <div className="pointer-events-none">
            <ProDesignForm
              requirements={requirements}
              proSpec={proSpec}
              onChange={() => {}}
              onProSpecChange={() => {}}
              onCalculate={() => {}}
            />
          </div>
        </CardContent>
      </Card>

      {/* Q&A — hidden in print */}
      <div className="print:hidden">
        <QASection
          listingId={listing.id}
          canAsk={!!supplier}
          accessToken={session?.access_token}
        />
      </div>

      {/* Bid Dialog */}
      <BidDialog
        listing={listing}
        open={bidOpen}
        onOpenChange={setBidOpen}
        supplier={supplier}
        userEmail={user?.email}
      />
    </div>
  );
}
