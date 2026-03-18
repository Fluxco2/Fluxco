"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Thermometer, Weight, DollarSign, FileText, Send } from "lucide-react";
import { MarketplaceListing } from "@/lib/supabase";
import { QASection } from "@/components/marketplace/QASection";

interface SpecSheetDialogProps {
  listing: MarketplaceListing | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlaceBid?: (listing: MarketplaceListing) => void;
  isSupplier?: boolean;
  accessToken?: string | null;
}

const formatVoltage = (voltage: number): string => {
  if (voltage >= 1000) {
    return `${(voltage / 1000).toFixed(voltage % 1000 === 0 ? 0 : 1)} kV`;
  }
  return `${voltage} V`;
};

const formatNumber = (n: number | null | undefined): string => {
  if (n == null) return "-";
  return n.toLocaleString();
};

export function SpecSheetDialog({ listing, open, onOpenChange, onPlaceBid, isSupplier = false, accessToken }: SpecSheetDialogProps) {
  if (!listing) return null;

  const specs = listing.design_specs as any;
  const hasDetailedSpecs = specs && specs.requirements;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Specification Sheet
          </DialogTitle>
        </DialogHeader>

        {/* Header */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold text-primary">
              {listing.rated_power_kva.toLocaleString()} kVA
            </span>
            <Badge variant="outline" className="font-mono">
              {listing.serial_number}
            </Badge>
          </div>
          {hasDetailedSpecs && specs.powerRating && (
            <p className="text-sm text-muted-foreground">
              Power Rating: {specs.powerRating}
            </p>
          )}
        </div>

        {/* Basic Specs (always available from listing) */}
        <div>
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-primary" />
            Electrical Specifications
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
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
            {listing.impedance_percent && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Impedance</span>
                <span className="font-medium">{listing.impedance_percent}%</span>
              </div>
            )}
            {listing.conductor_type && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Conductor</span>
                <span className="font-medium">{listing.conductor_type}</span>
              </div>
            )}
            {listing.steel_grade && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Core Steel</span>
                <span className="font-medium">{listing.steel_grade}</span>
              </div>
            )}
          </div>
        </div>

        {/* Detailed specs from design_specs JSON */}
        {hasDetailedSpecs && specs.requirements && (
          <div>
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-primary" />
              Design Requirements
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {specs.requirements.altitude && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Altitude</span>
                  <span className="font-medium">{formatNumber(specs.requirements.altitude)} m</span>
                </div>
              )}
              {specs.requirements.ambientTemperature && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ambient Temp</span>
                  <span className="font-medium">{specs.requirements.ambientTemperature}°C</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Performance */}
        <div>
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <Thermometer className="w-4 h-4 text-primary" />
            Performance Data
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {listing.no_load_loss_w && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">No-Load Loss</span>
                <span className="font-medium">{formatNumber(listing.no_load_loss_w)} W</span>
              </div>
            )}
            {listing.load_loss_w && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Load Loss</span>
                <span className="font-medium">{formatNumber(listing.load_loss_w)} W</span>
              </div>
            )}
            {listing.efficiency_percent && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Efficiency</span>
                <span className="font-medium">{listing.efficiency_percent}%</span>
              </div>
            )}
            {hasDetailedSpecs && specs.performance && (
              <>
                {specs.performance.topOilRiseC && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Top Oil Rise</span>
                    <span className="font-medium">{specs.performance.topOilRiseC}°C</span>
                  </div>
                )}
                {specs.performance.avgWindingRiseC && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Winding Rise</span>
                    <span className="font-medium">{specs.performance.avgWindingRiseC}°C</span>
                  </div>
                )}
                {specs.performance.hotSpotTempC && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hot Spot Temp</span>
                    <span className="font-medium">{specs.performance.hotSpotTempC}°C</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Physical */}
        <div>
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <Weight className="w-4 h-4 text-primary" />
            Physical
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {listing.total_weight_kg && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Weight</span>
                <span className="font-medium">
                  {formatNumber(listing.total_weight_kg)} kg ({formatNumber(Math.round(listing.total_weight_kg * 2.205))} lbs)
                </span>
              </div>
            )}
            {hasDetailedSpecs && specs.physical?.coreWeightKg && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Core Weight</span>
                <span className="font-medium">{formatNumber(specs.physical.coreWeightKg)} kg</span>
              </div>
            )}
          </div>
        </div>

        {/* Cost Estimate */}
        {listing.estimated_cost && (
          <div>
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-primary" />
              Budget Estimate
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Cost</span>
                <span className="font-medium">
                  ${listing.estimated_cost.toLocaleString()}
                </span>
              </div>
              {hasDetailedSpecs && specs.cost?.costPerKVA && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cost per kVA</span>
                  <span className="font-medium">${specs.cost.costPerKVA.toLocaleString()}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Budget estimate for planning purposes. Actual pricing may vary.
            </p>
          </div>
        )}

        {listing.notes && (
          <div>
            <h3 className="font-semibold mb-2">Notes</h3>
            <p className="text-sm text-muted-foreground">{listing.notes}</p>
          </div>
        )}

        {/* Q&A Section */}
        <div className="border-t border-border pt-4">
          <QASection
            listingId={listing.id}
            canAsk={isSupplier}
            accessToken={accessToken}
          />
        </div>

        {onPlaceBid && (
          <Button
            className="w-full mt-2"
            onClick={() => {
              onOpenChange(false);
              onPlaceBid(listing);
            }}
          >
            <Send className="w-4 h-4 mr-2" />
            Place Bid
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
