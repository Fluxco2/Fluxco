"use client";

import { use, useState, useEffect } from "react";
import { useSupplierAuthContext } from "@/context/SupplierAuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { BidDialog } from "@/components/supplier/BidDialog";

// Design engine + output components
import { designTransformer } from "@/engine/TransformerDesignEngine";
import { STEEL_GRADES, CONDUCTOR_TYPES, COOLING_CLASSES, VECTOR_GROUPS } from "@/engine/constants/materials";
import { DesignSummary } from "@/components/transformer/output/DesignSummary";
import { CalculationSteps } from "@/components/transformer/calculations/CalculationSteps";
import { CostEstimate } from "@/components/transformer/output/CostEstimate";
import { BillOfMaterials } from "@/components/transformer/output/BillOfMaterials";
import { SpecificationSheet } from "@/components/transformer/output/SpecificationSheet";
import { AssemblyDrawing } from "@/components/transformer/drawings/AssemblyDrawing";
import { SideViewDrawing } from "@/components/transformer/drawings/SideViewDrawing";
import { TopViewDrawing } from "@/components/transformer/drawings/TopViewDrawing";
import type { DesignRequirements, TransformerDesign } from "@/engine/types/transformer.types";
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
  const [activeTab, setActiveTab] = useState("summary");
  const [activeDrawingTab, setActiveDrawingTab] = useState("assembly-front");


  // Computed from listing's stored requirements
  const [design, setDesign] = useState<TransformerDesign | null>(null);
  const [requirements, setRequirements] = useState<DesignRequirements | null>(null);
  const [proSpec, setProSpec] = useState<ProSpecData | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      const res = await fetch(`/api/marketplace/${id}`);
      if (res.ok) {
        const { listing: l } = await res.json();
        setListing(l);

        // Re-run design engine from stored requirements
        const specs = l.design_specs as any;
        if (specs?.requirements) {
          const reqs = deserializeRequirements(specs.requirements);
          setRequirements(reqs);
          if (specs.proSpec) setProSpec(specs.proSpec);

          const result = designTransformer(reqs, {
            steelGrade: reqs.steelGrade.id,
            hvConductorMaterial: reqs.conductorType.id === "copper" ? "copper" : "aluminum",
            lvConductorMaterial: reqs.conductorType.id === "copper" ? "copper" : "aluminum",
          });
          if (result.success && result.design) {
            setDesign(result.design);
          }
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

    const addSection = (title: string, rows: [string, string][]) => {
      if (y > 255) { pdf.addPage(); y = 15; }
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text(title, 15, y);
      y += 7;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      for (const [label, value] of rows) {
        if (y > 275) { pdf.addPage(); y = 15; }
        pdf.text(label, 20, y);
        pdf.text(value, pw - 15, y, { align: "right" });
        y += 5.5;
      }
      y += 5;
    };

    // 1. Electrical Specifications
    const electricalRows: [string, string][] = [
      ["Power Rating", `${listing.rated_power_kva.toLocaleString()} kVA`],
      ["Primary Voltage", formatV(listing.primary_voltage)],
      ["Secondary Voltage", formatV(listing.secondary_voltage)],
      ["Frequency", `${listing.frequency} Hz`],
      ["Phases", `${listing.phases}-Phase`],
    ];
    if (listing.impedance_percent) electricalRows.push(["Impedance", `${listing.impedance_percent}%`]);
    if (listing.vector_group) electricalRows.push(["Vector Group", listing.vector_group]);
    if (listing.cooling_class) electricalRows.push(["Cooling Class", listing.cooling_class]);
    if (listing.conductor_type) electricalRows.push(["Conductor", listing.conductor_type]);
    if (listing.steel_grade) electricalRows.push(["Core Steel", listing.steel_grade]);
    if (design) {
      electricalRows.push(["X/R Ratio", design.impedance.xrRatio.toFixed(1)]);
    }
    addSection("Electrical Specifications", electricalRows);

    // 2. Loss & Efficiency
    if (design) {
      addSection("Loss & Efficiency", [
        ["No-Load Loss", `${design.losses.noLoadLoss.toFixed(0)} W`],
        ["Load Loss (100%)", `${design.losses.loadLoss.toFixed(0)} W`],
        ["Total Loss", `${design.losses.totalLoss.toFixed(0)} W`],
        ["Efficiency at 100%", `${design.losses.efficiency.find(e => e.loadPercent === 100)?.efficiency.toFixed(2)}%`],
        ["Max Efficiency", `${design.losses.maxEfficiency.toFixed(2)}% at ${design.losses.maxEfficiencyLoad}% load`],
      ]);
    }

    // 3. Thermal Data
    if (design) {
      addSection("Thermal Data", [
        ["Cooling Class", requirements.coolingClass.name],
        ["Oil Volume", `${design.thermal.oilVolume.toFixed(0)} L`],
        ["Top Oil Rise", `${design.thermal.topOilRise.toFixed(0)}°C`],
        ["Avg Winding Rise", `${design.thermal.averageWindingRise.toFixed(0)}°C`],
        ["Hot Spot Rise", `${design.thermal.hotSpotRise.toFixed(0)}°C`],
      ]);
    }

    // 4. Physical Data (no weight)
    if (design) {
      addSection("Physical Data", [
        ["Tank Dimensions (L×W×H)", `${design.tank.length} × ${design.tank.width} × ${design.tank.height} mm`],
        ["Overall Height", `${design.tank.overallHeight} mm`],
      ]);
    }

    // 5. Design Requirements
    const reqs = (listing.design_specs as any)?.requirements || {};
    const designRows: [string, string][] = [];
    if (reqs.tapChangerType) designRows.push(["Tap Changer", reqs.tapChangerType === "onLoad" ? "OLTC" : "NLTC"]);
    if (reqs.oilType) designRows.push(["Oil Type", reqs.oilType]);
    if (reqs.oilPreservation) designRows.push(["Oil Preservation", reqs.oilPreservation]);
    if (reqs.altitude) designRows.push(["Altitude", `${reqs.altitude} m`]);
    if (reqs.ambientTemperature) designRows.push(["Ambient Temperature", `${reqs.ambientTemperature}°C`]);
    designRows.push(["Includes TAC", reqs.includeTAC ? "Yes" : "No"]);
    if (reqs.manufacturingRegions) {
      const regionMap: Record<string, string> = { usa: "USA", north_america: "N. America", global: "Global" };
      designRows.push(["Manufacturing Region", reqs.manufacturingRegions.map((r: string) => regionMap[r] || r).join(", ")]);
    }
    designRows.push(["FEOC Required", reqs.requireFEOC ? "Yes" : "No"]);
    if (designRows.length > 0) addSection("Design Requirements", designRows);

    // 6. Core Design
    if (design) {
      addSection("Core Design", [
        ["Core Type", `3-Limb, ${requirements.phases}-Phase`],
        ["Steel Grade", requirements.steelGrade.name],
        ["Core Weight", `${design.core.coreWeight} kg`],
        ["Flux Density", `${design.core.fluxDensity.toFixed(3)} T`],
        ["Core Diameter", `${design.core.coreDiameter} mm`],
        ["Window Height", `${design.core.windowHeight} mm`],
      ]);
    }

    // 7. Winding Design
    if (design) {
      addSection("Winding Design — HV", [
        ["Conductor", requirements.conductorType.name],
        ["Turns", `${design.hvWinding.turns}`],
        ["Current Density", `${design.hvWinding.currentDensity.toFixed(2)} A/mm²`],
        ["Rated Current", `${design.hvWinding.ratedCurrent.toFixed(1)} A`],
        ["Layers", `${design.hvWinding.layers}`],
        ["Winding Height", `${design.hvWinding.windingHeight} mm`],
        ["Inner Radius", `${design.hvWinding.innerRadius} mm`],
        ["Outer Radius", `${design.hvWinding.outerRadius} mm`],
      ]);
      addSection("Winding Design — LV", [
        ["Conductor", requirements.conductorType.name],
        ["Turns", `${design.lvWinding.turns}`],
        ["Current Density", `${design.lvWinding.currentDensity.toFixed(2)} A/mm²`],
        ["Rated Current", `${design.lvWinding.ratedCurrent.toFixed(1)} A`],
        ["Layers", `${design.lvWinding.layers}`],
        ["Winding Height", `${design.lvWinding.windingHeight} mm`],
        ["Inner Radius", `${design.lvWinding.innerRadius} mm`],
        ["Outer Radius", `${design.lvWinding.outerRadius} mm`],
      ]);
    }

    // 8. Bill of Materials Summary
    if (design) {
      const bomRows: [string, string][] = [
        ["Core Steel", `${requirements.steelGrade.name} — ${design.core.coreWeight} kg`],
        ["HV Winding", `${requirements.conductorType.name} — ${design.hvWinding.turns} turns`],
        ["LV Winding", `${requirements.conductorType.name} — ${design.lvWinding.turns} turns`],
        ["Tank", `${design.tank.length} × ${design.tank.width} × ${design.tank.height} mm`],
        ["Oil Volume", `${design.thermal.oilVolume.toFixed(0)} L`],
      ];
      addSection("Bill of Materials", bomRows);
    }

    // Footer
    if (y > 270) { pdf.addPage(); y = 15; }
    y += 5;
    pdf.setDrawColor(200); pdf.line(15, y, pw - 15, y); y += 5;
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text("Generated by FluxCo — fluxco.com", 15, y);
    pdf.text(`${new Date().toLocaleDateString()}`, pw - 15, y, { align: "right" });

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

  const specMode = listing.spec_mode || "lite";
  const hasDesign = !!design && !!requirements;

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

      {/* Full Spec Builder Output (read-only) */}
      <div>
        {hasDesign ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className={`grid w-full ${specMode === "pro" ? "grid-cols-6" : "grid-cols-5"}`}>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              {specMode === "pro" && <TabsTrigger value="specifications">Specifications</TabsTrigger>}
              <TabsTrigger value="calculations">Calculations</TabsTrigger>
              <TabsTrigger value="drawings">Drawings</TabsTrigger>
              <TabsTrigger value="bom">BOM</TabsTrigger>
              <TabsTrigger value="cost">Cost Estimate</TabsTrigger>
            </TabsList>

            <TabsContent value="summary">
              <DesignSummary design={design!} requirements={requirements!} />
            </TabsContent>

            {specMode === "pro" && proSpec && (
              <TabsContent value="specifications">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">PIP ELSTR01 Specification Sheet</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SpecificationSheet proSpec={proSpec} requirements={requirements!} />
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            <TabsContent value="calculations">
              <CalculationSteps design={design!} requirements={requirements!} />
            </TabsContent>

            <TabsContent value="drawings">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Engineering Drawing Set</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeDrawingTab} onValueChange={setActiveDrawingTab}>
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                      <TabsTrigger value="assembly-front" className="text-xs">Front View</TabsTrigger>
                      <TabsTrigger value="assembly-side" className="text-xs">Side View</TabsTrigger>
                      <TabsTrigger value="assembly-top" className="text-xs">Top View</TabsTrigger>
                    </TabsList>
                    <TabsContent value="assembly-front" className="mt-0">
                      <AssemblyDrawing
                        core={design!.core}
                        hvWinding={design!.hvWinding}
                        lvWinding={design!.lvWinding}
                        tank={design!.tank}
                        thermal={design!.thermal}
                        primaryVoltage={requirements!.primaryVoltage}
                        secondaryVoltage={requirements!.secondaryVoltage}
                        vectorGroup={requirements!.vectorGroup.name}
                        requirements={requirements!}
                        bom={design!.bom}
                      />
                    </TabsContent>
                    <TabsContent value="assembly-side" className="mt-0">
                      <SideViewDrawing
                        core={design!.core}
                        hvWinding={design!.hvWinding}
                        lvWinding={design!.lvWinding}
                        tank={design!.tank}
                        thermal={design!.thermal}
                      />
                    </TabsContent>
                    <TabsContent value="assembly-top" className="mt-0">
                      <TopViewDrawing
                        core={design!.core}
                        hvWinding={design!.hvWinding}
                        lvWinding={design!.lvWinding}
                        tank={design!.tank}
                        thermal={design!.thermal}
                        phases={requirements!.phases}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bom">
              <BillOfMaterials design={design!} />
            </TabsContent>

            <TabsContent value="cost">
              <CostEstimate design={design!} requirements={requirements!} />
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 opacity-50" />
              <p>Design data not available for this listing.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Q&A Section */}
      <Card>
        <CardContent className="pt-6">
          <QASection
            listingId={listing.id}
            canAsk={!!supplier}
            accessToken={session?.access_token}
          />
        </CardContent>
      </Card>

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
