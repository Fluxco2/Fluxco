"use client";

import { useState } from "react";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useSupplierAuth } from "@/hooks/useSupplierAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, PackageSearch, Zap, MapPin, CheckCircle, Clock, LogIn, FileText, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { MarketplaceListing } from "@/lib/supabase";
import { BidDialog } from "./BidDialog";
import { SpecSheetDialog } from "./SpecSheetDialog";

const formatVoltage = (voltage: number): string => {
  if (voltage >= 1000) {
    return `${(voltage / 1000).toFixed(voltage % 1000 === 0 ? 0 : 1)} kV`;
  }
  return `${voltage} V`;
};

const formatCurrency = (value: number | null): string => {
  if (!value) return "Contact";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};

export function MarketplaceList() {
  const { data, isLoading, error } = useMarketplace();
  const { supplier, user } = useSupplierAuth();
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [specSheetListing, setSpecSheetListing] = useState<MarketplaceListing | null>(null);
  const [specSheetOpen, setSpecSheetOpen] = useState(false);

  const handleBidClick = (listing: MarketplaceListing) => {
    setSelectedListing(listing);
    setBidDialogOpen(true);
  };

  const handleViewSpecs = (listing: MarketplaceListing) => {
    setSpecSheetListing(listing);
    setSpecSheetOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load marketplace listings. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const activeListings = data?.active || [];
  const completedListings = data?.completed || [];

  const renderTable = (listings: MarketplaceListing[], isCompleted: boolean) => {
    if (listings.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <PackageSearch className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {isCompleted ? "No completed bids yet" : "No active listings"}
          </h3>
          <p className="text-muted-foreground max-w-md">
            {isCompleted
              ? "Completed bid opportunities will appear here."
              : "New transformer opportunities will appear here. Check back soon!"}
          </p>
        </div>
      );
    }

    return (
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground font-semibold">FLUX#</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Power</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Primary</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Secondary</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Freq</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Phase</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Vector</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Cooling</TableHead>
                <TableHead className="text-muted-foreground font-semibold">%Z</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Conductor</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Tap</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Oil</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Preservation</TableHead>
                <TableHead className="text-muted-foreground font-semibold">TAC</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Ambient</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Region</TableHead>
                <TableHead className="text-muted-foreground font-semibold">FEOC</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Location</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((listing) => {
                const specs = listing.design_specs as any;
                const req = specs?.requirements;

                const oilLabels: Record<string, string> = {
                  mineral: "Mineral",
                  naturalEster: "Natural Ester",
                  syntheticEster: "Synthetic Ester",
                  silicon: "Silicone",
                };
                const preservationLabels: Record<string, string> = {
                  conservator: "Conservator",
                  sealedTank: "Sealed Tank",
                  nitrogen: "Nitrogen",
                };
                const regionLabels: Record<string, string> = {
                  usa: "USA",
                  northAmerica: "N. America",
                  global: "Global",
                  china: "China",
                };

                return (
                  <TableRow
                    key={listing.id}
                    className="border-border hover:bg-secondary/50 cursor-pointer"
                    onClick={() => handleViewSpecs(listing)}
                  >
                    <TableCell className="font-mono text-sm text-primary">
                      {listing.serial_number || "-"}
                    </TableCell>
                    <TableCell className="font-semibold text-primary whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        {listing.rated_power_kva.toLocaleString()} kVA
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground whitespace-nowrap">
                      {formatVoltage(listing.primary_voltage)}
                    </TableCell>
                    <TableCell className="text-foreground whitespace-nowrap">
                      {formatVoltage(listing.secondary_voltage)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {listing.frequency} Hz
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {listing.phases}-Ph
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {listing.vector_group || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                      {listing.cooling_class || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {listing.impedance_percent ? `${listing.impedance_percent}%` : "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {listing.conductor_type || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                      {req?.tapChangerType === "onLoad" ? "OLTC" : req?.tapChangerType === "noLoad" ? "NLTC" : "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                      {req?.oilType ? (oilLabels[req.oilType] || req.oilType) : "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                      {req?.oilPreservation ? (preservationLabels[req.oilPreservation] || req.oilPreservation) : "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {req?.includeTAC ? "Yes" : req ? "No" : "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                      {req?.ambientTemperature ? `${req.ambientTemperature}°C` : "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                      {req?.manufacturingRegions
                        ? req.manufacturingRegions.map((r: string) => regionLabels[r] || r).join(", ")
                        : "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {req?.requireFEOC ? (
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                      ) : req ? (
                        <span className="text-muted-foreground">No</span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {listing.zipcode ? (
                        <span className="flex items-center gap-1 whitespace-nowrap">
                          <MapPin className="w-3 h-3" />
                          {listing.zipcode}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground hover:text-primary"
                          onClick={(e) => { e.stopPropagation(); handleViewSpecs(listing); }}
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          Specs
                        </Button>
                        {isCompleted ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Awarded
                          </Badge>
                        ) : supplier ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
                            onClick={(e) => { e.stopPropagation(); handleBidClick(listing); }}
                          >
                            Place Bid
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
                            asChild
                          >
                            <Link href="/portal/login">
                              <LogIn className="w-3 h-3 mr-1" />
                              Login to Bid
                            </Link>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Results Count */}
        <div className="px-4 py-3 border-t border-border bg-muted/30 text-sm text-muted-foreground">
          {listings.length} {isCompleted ? "completed" : "active"} listing{listings.length !== 1 ? "s" : ""}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-card/50 border border-border rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
            <Clock className="w-6 h-6" />
            {activeListings.length}
          </div>
          <div className="text-sm text-muted-foreground">Active Opportunities</div>
        </div>
        <div className="bg-card/50 border border-border rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-2xl font-bold text-green-500">
            <CheckCircle className="w-6 h-6" />
            {completedListings.length}
          </div>
          <div className="text-sm text-muted-foreground">Completed</div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="active" className="gap-2">
            <Clock className="w-4 h-4" />
            Active ({activeListings.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircle className="w-4 h-4" />
            Completed ({completedListings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {renderTable(activeListings, false)}
        </TabsContent>

        <TabsContent value="completed">
          {renderTable(completedListings, true)}
        </TabsContent>
      </Tabs>

      {/* Bid Dialog */}
      <BidDialog
        listing={selectedListing}
        open={bidDialogOpen}
        onOpenChange={setBidDialogOpen}
        supplier={supplier}
        userEmail={user?.email}
      />

      {/* Spec Sheet Dialog */}
      <SpecSheetDialog
        listing={specSheetListing}
        open={specSheetOpen}
        onOpenChange={setSpecSheetOpen}
      />
    </>
  );
}
