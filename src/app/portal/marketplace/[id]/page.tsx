"use client";

import { use, useState, useEffect, useRef } from "react";
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
  const specRef = useRef<HTMLDivElement>(null);

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
    if (!specRef.current || !listing) return;
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");

    const canvas = await html2canvas(specRef.current, {
      scale: 2,
      backgroundColor: "#0a0a0a",
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10;

    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - 20;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;
    }

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
      <div ref={specRef}>
        {hasDesign ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className={`grid w-full ${specMode === "pro" ? "grid-cols-5" : "grid-cols-4"}`}>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              {specMode === "pro" && <TabsTrigger value="specifications">Specifications</TabsTrigger>}
              <TabsTrigger value="calculations">Calculations</TabsTrigger>
              <TabsTrigger value="drawings">Drawings</TabsTrigger>
              <TabsTrigger value="bom">BOM</TabsTrigger>
            </TabsList>

            <TabsContent value="summary">
              <DesignSummary design={design!} requirements={requirements!} hideSensitive />
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
