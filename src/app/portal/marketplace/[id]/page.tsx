"use client";

import { use, useState, useEffect } from "react";
import { useSupplierAuthContext } from "@/context/SupplierAuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Download,
  Send,
  MapPin,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { MarketplaceListing } from "@/lib/supabase";
import { QASection } from "@/components/marketplace/QASection";
import { ReadOnlySpecSheet } from "@/components/marketplace/ReadOnlySpecSheet";
import { BidDialog } from "@/components/supplier/BidDialog";

// For deserializing stored requirements
import { STEEL_GRADES, CONDUCTOR_TYPES, COOLING_CLASSES, VECTOR_GROUPS } from "@/engine/constants/materials";
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
  const [proSpec, setProSpec] = useState<ProSpecData | null>(null);

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
    if (!listing || !requirements) return;
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF("p", "mm", "a4");
    const pw = pdf.internal.pageSize.getWidth();
    let y = 15;

    const formatV = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)} kV` : `${v} V`);

    // Header
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text("FLUXCO — Transformer Specification Sheet", 15, y);
    y += 10;
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${listing.serial_number || ""} — ${listing.rated_power_kva.toLocaleString()} kVA, ${listing.phases}-Phase`, 15, y);
    y += 6;
    pdf.text(`Posted: ${new Date(listing.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`, 15, y);
    y += 3;
    pdf.setDrawColor(200); pdf.line(15, y, pw - 15, y); y += 8;

    const addSection = (title: string, rows: [string, string | undefined][]) => {
      const validRows = rows.filter(([, v]) => v !== undefined && v !== null && v !== "") as [string, string][];
      if (validRows.length === 0) return;
      if (y > 255) { pdf.addPage(); y = 15; }
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text(title, 15, y);
      y += 6;
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      for (const [label, value] of validRows) {
        if (y > 275) { pdf.addPage(); y = 15; }
        pdf.text(label, 20, y);
        pdf.text(value, pw - 15, y, { align: "right" });
        y += 5;
      }
      y += 4;
    };

    const r = requirements;
    const boolStr = (v?: boolean) => v === true ? "Yes" : v === false ? "No" : undefined;
    const reqStr = (v?: string) => v === "required" ? "Required" : v === "not_required" ? "Not Required" : v;

    // Rating & System
    addSection("Rating & System Parameters", [
      ["Base Rating", `${r.ratedPower.toLocaleString()} kVA`],
      ["Primary Voltage", formatV(r.primaryVoltage)],
      ["Secondary Voltage", formatV(r.secondaryVoltage)],
      ["Frequency", `${r.frequency} Hz`],
      ["Phases", `${r.phases}-Phase`],
      ["Vector Group", r.vectorGroup.name],
      ["Cooling Class", r.coolingClass.name],
      ["Target Impedance", `${r.targetImpedance}%`],
      ["Conductor", r.conductorType.name],
      ["Core Steel", r.steelGrade.name],
      ["Tap Changer", r.tapChangerType === "onLoad" ? "On-Load (OLTC)" : "No-Load (NLTC)"],
      ["Oil Type", r.oilType],
      ["Oil Preservation", r.oilPreservation],
      ["Includes TAC", boolStr(r.includeTAC)],
      ["Manufacturing Regions", r.manufacturingRegions?.map((rg: string) => rg === "usa" ? "USA" : rg === "north_america" ? "N. America" : rg === "global" ? "Global" : rg).join(", ")],
      ["FEOC Required", boolStr(r.requireFEOC)],
      ["Altitude", r.altitude ? `${r.altitude} m` : undefined],
      ["Ambient Temperature", r.ambientTemperature ? `${r.ambientTemperature}°C` : undefined],
    ]);

    // Pro sections
    if (proSpec) {
      const p = proSpec;
      addSection("Site Conditions", [
        ["Altitude", p.siteConditions.altitude ? `${p.siteConditions.altitude} ${p.siteConditions.altitudeUnit || "ft"}` : undefined],
        ["Max Ambient Temp", p.siteConditions.ambientTempMax ? `${p.siteConditions.ambientTempMax}°C` : undefined],
        ["Min Ambient Temp", p.siteConditions.ambientTempMin ? `${p.siteConditions.ambientTempMin}°C` : undefined],
        ["Seismic Qualification", reqStr(p.siteConditions.seismicQualification)],
        ["Moist/Corrosive Environment", boolStr(p.siteConditions.moistCorrosiveEnvironment)],
      ]);
      addSection("Certifications", [
        ["NRTL Listing", reqStr(p.nrtlListing)],
        ["FM Approved", reqStr(p.fmApproved)],
      ]);
      addSection("Windings & Temperature Rise", [
        ["Avg Temperature Rise", p.windingsAndTempRise.averageTempRise ? `${p.windingsAndTempRise.averageTempRise}°C` : undefined],
        ["Primary Connection", p.windingsAndTempRise.primaryConnection],
        ["Primary Material", p.windingsAndTempRise.primaryMaterial],
        ["Secondary Connection", p.windingsAndTempRise.secondaryConnection],
        ["Secondary Material", p.windingsAndTempRise.secondaryMaterial],
      ]);
      addSection("Losses & Efficiency", [
        ["Loss Evaluation Required", boolStr(p.losses.lossEvaluationRequired)],
        ["$/kW Offset", p.losses.dollarPerKwOffset ? `$${p.losses.dollarPerKwOffset}` : undefined],
      ]);
      addSection("Air Terminal Chamber", [
        ["Required", reqStr(p.airTerminalChamber.required)],
        ["Front Cover", p.airTerminalChamber.frontCover],
        ["Cable Entry", p.airTerminalChamber.cableEntry],
      ]);
      addSection("Tank", [
        ["Cover Type", p.tank.coverType],
        ["Jacking Pads", reqStr(p.tank.jackingPads)],
        ["Vacuum Rated", reqStr(p.tank.tankVacuumRated)],
      ]);
      addSection("Cooling", [
        ["Radiator Type", p.cooling.radiatorType],
        ["Radiator Material", p.cooling.radiatorMaterial],
        ["Removable Radiators", boolStr(p.cooling.removableRadiators)],
        ["Fans", p.fans.status === "required" ? `Required (${p.fans.mounting || ""} mount)` : reqStr(p.fans.status)],
      ]);
      addSection("Tap Changer", [
        ["No-Load", reqStr(p.tapChanger.noLoad.required)],
        ["No-Load Description", p.tapChanger.noLoad.description],
        ["On-Load", reqStr(p.tapChanger.onLoad.required)],
        ["Regulation Range", p.tapChanger.onLoad.regulationRange],
      ]);
      addSection("BIL", [
        ["Primary BIL", p.bil.primaryBilKv ? `${p.bil.primaryBilKv} kV` : undefined],
        ["Secondary BIL", p.bil.secondaryBilKv ? `${p.bil.secondaryBilKv} kV` : undefined],
      ]);
      addSection("Insulating Liquid", [
        ["Type", p.insulatingLiquid.type?.replace(/_/g, " ")],
        ["Preservation", p.liquidPreservation.type?.replace(/_/g, " ")],
      ]);
      addSection("Tests", [
        ["No-Load & Load Loss", boolStr(p.tests.noLoadAndLoadLoss)],
        ["Temperature Rise", boolStr(p.tests.tempRise)],
        ["Lightning Impulse", boolStr(p.tests.lightningImpulse)],
        ["Switching Impulse", boolStr(p.tests.switchingImpulse)],
        ["Audible Sound Level", boolStr(p.tests.audibleSoundLevel)],
        ["Witnessed", p.tests.witnessed === "witnessed" ? "Yes" : "No"],
      ]);
      if (p.otherRequirements) {
        addSection("Other Requirements", [["Notes", p.otherRequirements]]);
      }
    }

    // Footer
    if (y > 270) { pdf.addPage(); y = 15; }
    y += 3;
    pdf.setDrawColor(200); pdf.line(15, y, pw - 15, y); y += 5;
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text("Generated by FluxCo — fluxco.com", 15, y);
    pdf.text(new Date().toLocaleDateString(), pw - 15, y, { align: "right" });

    pdf.save(`${listing.serial_number || "spec"}-specification.pdf`);
  };

  if (loading || authLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[600px] rounded-lg" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Listing not found.</p>
        <Link href="/portal/marketplace" className="text-primary hover:underline text-sm mt-2 inline-block">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const specMode = (listing.spec_mode || "lite") as "lite" | "pro";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
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
          <Button variant="outline" onClick={handleDownloadPDF} disabled={!requirements}>
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

      {/* Read-Only Spec Sheet */}
      {requirements ? (
        <ReadOnlySpecSheet
          requirements={requirements}
          proSpec={proSpec}
          specMode={specMode}
        />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 opacity-50" />
          <p>Specification data not available.</p>
        </div>
      )}

      {/* Q&A */}
      <QASection
        listingId={listing.id}
        canAsk={!!supplier}
        accessToken={session?.access_token}
      />

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
