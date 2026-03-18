"use client";

import { use, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSupplierAuthContext } from "@/context/SupplierAuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Zap,
  Thermometer,
  Weight,
  DollarSign,
  FileText,
  Download,
  Send,
  MapPin,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { MarketplaceListing } from "@/lib/supabase";
import { QASection } from "@/components/marketplace/QASection";
import { BidDialog } from "@/components/supplier/BidDialog";

const formatVoltage = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)} kV` : `${v} V`);
const formatNum = (n: number | null | undefined) => (n == null ? "—" : n.toLocaleString());

export default function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { supplier, user, loading: authLoading } = useSupplierAuthContext();
  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidOpen, setBidOpen] = useState(false);
  const specRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchListing = async () => {
      const res = await fetch(`/api/marketplace/${id}`);
      if (res.ok) {
        const { listing: l } = await res.json();
        setListing(l);
      }
      setLoading(false);
    };
    fetchListing();
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!specRef.current || !listing) return;

    // Dynamic import to avoid SSR issues
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

  const specs = listing.design_specs as any;
  const reqs = specs?.requirements || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/portal/marketplace"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
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

      {/* Spec Sheet (printable area) */}
      <div ref={specRef}>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Electrical Specifications */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Electrical Specifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Power Rating</span>
                  <span className="font-medium">{listing.rated_power_kva.toLocaleString()} kVA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Primary Voltage</span>
                  <span className="font-medium">{formatVoltage(listing.primary_voltage)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Secondary Voltage</span>
                  <span className="font-medium">{formatVoltage(listing.secondary_voltage)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frequency</span>
                  <span className="font-medium">{listing.frequency} Hz</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phases</span>
                  <span className="font-medium">{listing.phases}-Phase</span>
                </div>
                {listing.impedance_percent && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Impedance</span>
                    <span className="font-medium">{listing.impedance_percent}%</span>
                  </div>
                )}
                {listing.vector_group && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vector Group</span>
                    <span className="font-medium">{listing.vector_group}</span>
                  </div>
                )}
                {listing.cooling_class && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cooling Class</span>
                    <span className="font-medium">{listing.cooling_class}</span>
                  </div>
                )}
                {listing.conductor_type && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Conductor</span>
                    <span className="font-medium capitalize">{listing.conductor_type}</span>
                  </div>
                )}
                {listing.steel_grade && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Core Steel</span>
                    <span className="font-medium">{listing.steel_grade}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Design Requirements */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Design Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {reqs.tapChangerType && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tap Changer</span>
                    <span className="font-medium">
                      {reqs.tapChangerType === "onLoad" ? "OLTC" : reqs.tapChangerType === "noLoad" ? "NLTC" : reqs.tapChangerType}
                    </span>
                  </div>
                )}
                {reqs.oilType && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Oil Type</span>
                    <span className="font-medium capitalize">{reqs.oilType}</span>
                  </div>
                )}
                {reqs.oilPreservation && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Oil Preservation</span>
                    <span className="font-medium capitalize">{reqs.oilPreservation}</span>
                  </div>
                )}
                {reqs.altitude && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Altitude</span>
                    <span className="font-medium">{formatNum(reqs.altitude)} m</span>
                  </div>
                )}
                {reqs.ambientTemperature && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ambient Temp</span>
                    <span className="font-medium">{reqs.ambientTemperature}°C</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Includes TAC</span>
                  <span className="font-medium">{reqs.includeTAC ? "Yes" : "No"}</span>
                </div>
                {reqs.manufacturingRegions && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Region</span>
                    <span className="font-medium">
                      {reqs.manufacturingRegions.map((r: string) =>
                        r === "usa" ? "USA" : r === "north_america" ? "N. America" : r === "global" ? "Global" : r
                      ).join(", ")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">FEOC Required</span>
                  <span className="font-medium">{reqs.requireFEOC ? "Yes" : "No"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Data */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-primary" />
                Performance Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {listing.no_load_loss_w && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">No-Load Loss</span>
                    <span className="font-medium">{formatNum(listing.no_load_loss_w)} W</span>
                  </div>
                )}
                {listing.load_loss_w && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Load Loss</span>
                    <span className="font-medium">{formatNum(listing.load_loss_w)} W</span>
                  </div>
                )}
                {listing.efficiency_percent && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Efficiency</span>
                    <span className="font-medium">{listing.efficiency_percent}%</span>
                  </div>
                )}
                {listing.total_weight_kg && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Weight</span>
                    <span className="font-medium">
                      {formatNum(listing.total_weight_kg)} kg ({formatNum(Math.round(listing.total_weight_kg * 2.205))} lbs)
                    </span>
                  </div>
                )}
                {!listing.no_load_loss_w && !listing.load_loss_w && !listing.efficiency_percent && !listing.total_weight_kg && (
                  <p className="text-muted-foreground col-span-2">Performance data will be available after design review.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Budget Estimate */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                Budget Estimate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {listing.estimated_cost ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estimated Cost</span>
                      <span className="font-medium">${formatNum(listing.estimated_cost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cost per kVA</span>
                      <span className="font-medium">
                        ${formatNum(Math.round(listing.estimated_cost / listing.rated_power_kva))}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground col-span-2">Budget estimate not available.</p>
                )}
              </div>
              {listing.estimated_cost && (
                <p className="text-xs text-muted-foreground mt-3">
                  Budget estimate for planning purposes. Actual pricing may vary.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {listing.notes && (
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{listing.notes}</p>
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
