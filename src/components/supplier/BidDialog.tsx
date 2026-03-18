"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Zap, DollarSign, Clock, Send, CheckCircle, MapPin, HelpCircle, Upload, FileText, X } from "lucide-react";
import { MarketplaceListing } from "@/lib/supabase";

interface SupplierInfo {
  id: string;
  email: string;
  company_name: string;
  contact_name: string;
}

interface BidDialogProps {
  listing: MarketplaceListing | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: SupplierInfo | null;
  userEmail?: string | null;
  onViewSpecs?: () => void;
  hasExistingBid?: boolean;
}

const formatVoltage = (voltage: number): string => {
  if (voltage >= 1000) {
    return `${(voltage / 1000).toFixed(voltage % 1000 === 0 ? 0 : 1)} kV`;
  }
  return `${voltage} V`;
};

export function BidDialog({ listing, open, onOpenChange, supplier, userEmail, onViewSpecs, hasExistingBid = false }: BidDialogProps) {
  const [bidPrice, setBidPrice] = useState("");
  const [leadTimeWeeks, setLeadTimeWeeks] = useState("");
  const [notes, setNotes] = useState("");
  const [proposalFile, setProposalFile] = useState<File | null>(null);
  const [uploadingProposal, setUploadingProposal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitType, setSubmitType] = useState<"bid" | "info" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setError("Only PDF files are accepted");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be under 10MB");
        return;
      }
      setProposalFile(file);
      setError(null);
    }
  };

  const uploadProposal = async (): Promise<string | null> => {
    if (!proposalFile || !supplier || !listing) return null;

    setUploadingProposal(true);
    try {
      const formData = new FormData();
      formData.append("file", proposalFile);
      formData.append("supplierId", supplier.id);
      formData.append("listingId", listing.id);

      const res = await fetch("/api/supplier/upload-proposal", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      return data.url;
    } catch (err) {
      console.error("Proposal upload error:", err);
      throw err;
    } finally {
      setUploadingProposal(false);
    }
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!listing) {
      setError("No listing selected");
      return;
    }

    const email = supplier?.email || userEmail;
    if (!email) {
      setError("You must be logged in to submit a bid");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Upload proposal if one was selected
      let proposalUrl: string | null = null;
      if (proposalFile) {
        proposalUrl = await uploadProposal();
      }

      const response = await fetch("/api/supplier/express-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          serialNumber: listing.serial_number,
          supplierId: supplier?.id || "unknown",
          supplierEmail: email,
          supplierCompany: supplier?.company_name || "Unknown Company",
          contactName: supplier?.contact_name || email,
          bidPrice: parseFloat(bidPrice.replace(/[^0-9.]/g, "")),
          leadTimeWeeks: parseInt(leadTimeWeeks, 10),
          notes: notes || null,
          proposalUrl,
          type: "bid",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit bid");
      }

      setSubmitType("bid");
    } catch (err) {
      console.error("Bid submission error:", err);
      setError(err instanceof Error ? err.message : "Failed to submit bid");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNeedMoreInfo = async () => {
    if (!listing) {
      setError("No listing selected");
      return;
    }

    const email = supplier?.email || userEmail;
    if (!email) {
      setError("You must be logged in to request info");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/supplier/express-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          serialNumber: listing.serial_number,
          supplierId: supplier?.id || "unknown",
          supplierEmail: email,
          supplierCompany: supplier?.company_name || "Unknown Company",
          contactName: supplier?.contact_name || email,
          type: "info_request",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send request");
      }

      setSubmitType("info");
    } catch (err) {
      console.error("Info request error:", err);
      setError(err instanceof Error ? err.message : "Failed to send request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setBidPrice("");
      setLeadTimeWeeks("");
      setNotes("");
      setProposalFile(null);
      setSubmitType(null);
      setError(null);
    }, 200);
  };

  if (!listing) return null;

  // Success: Bid submitted
  if (submitType === "bid") {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="py-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Bid Submitted!</h3>
            <p className="text-muted-foreground mb-6">
              Your bid has been received. FluxCo will review and contact you soon.
            </p>
            <Button onClick={handleClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Success: Info request sent
  if (submitType === "info") {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="py-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Request Sent!</h3>
            <p className="text-muted-foreground mb-6">
              FluxCo has been notified. We&apos;ll reach out with more information about this project.
            </p>
            <Button onClick={handleClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Place Bid
          </DialogTitle>
          <DialogDescription>
            Submit your pricing, lead time, and optional proposal document
          </DialogDescription>
        </DialogHeader>

        {/* Listing Summary */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-lg text-primary">
              {listing.rated_power_kva.toLocaleString()} kVA
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">
                {listing.serial_number}
              </Badge>
              <Badge variant="secondary">{listing.phases}-Phase</Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">
              Primary: <span className="text-foreground">{formatVoltage(listing.primary_voltage)}</span>
            </div>
            <div className="text-muted-foreground">
              Secondary: <span className="text-foreground">{formatVoltage(listing.secondary_voltage)}</span>
            </div>
            {listing.vector_group && (
              <div className="text-muted-foreground">
                Vector: <span className="text-foreground">{listing.vector_group}</span>
              </div>
            )}
            {listing.cooling_class && (
              <div className="text-muted-foreground">
                Cooling: <span className="text-foreground">{listing.cooling_class}</span>
              </div>
            )}
          </div>
          {listing.zipcode && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground pt-2 border-t border-border">
              <MapPin className="w-3 h-3" />
              Project Location: {listing.zipcode}
            </div>
          )}
        </div>

        {hasExistingBid && (
          <Alert>
            <AlertDescription>
              You already submitted a bid on this listing. Submitting again will replace your previous bid.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              {error}
              {!supplier && " (OEM profile not found - please contact support)"}
            </AlertDescription>
          </Alert>
        )}

        {/* I Need More Info button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleNeedMoreInfo}
          disabled={isSubmitting}
          className="w-full"
        >
          <HelpCircle className="w-4 h-4 mr-2" />
          {isSubmitting ? "Sending..." : "I Need More Info"}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or submit a bid</span>
          </div>
        </div>

        {/* Bid Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bidPrice" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Your Bid Price (USD)
            </Label>
            <Input
              id="bidPrice"
              type="text"
              placeholder="e.g., 125,000"
              value={bidPrice}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "");
                if (value) {
                  setBidPrice(parseInt(value, 10).toLocaleString());
                } else {
                  setBidPrice("");
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="leadTime" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Lead Time (weeks)
            </Label>
            <Input
              id="leadTime"
              type="number"
              min="1"
              max="104"
              placeholder="e.g., 12"
              value={leadTimeWeeks}
              onChange={(e) => setLeadTimeWeeks(e.target.value)}
            />
          </div>

          {/* Proposal Upload */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Formal Proposal (PDF, optional)
            </Label>
            {proposalFile ? (
              <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm truncate flex-1">{proposalFile.name}</span>
                <span className="text-xs text-muted-foreground">
                  {(proposalFile.size / 1024 / 1024).toFixed(1)} MB
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => {
                    setProposalFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload proposal PDF
                </p>
                <p className="text-xs text-muted-foreground mt-1">Max 10MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information about your bid..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={handleSubmitBid}
            disabled={isSubmitting || uploadingProposal || !bidPrice || !leadTimeWeeks}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            {uploadingProposal
              ? "Uploading proposal..."
              : isSubmitting
              ? "Submitting..."
              : "Submit Bid"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
