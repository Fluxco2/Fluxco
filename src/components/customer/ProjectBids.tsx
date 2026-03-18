"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Clock, Building2, MapPin, FileText, ExternalLink } from "lucide-react";

interface Bid {
  id: string;
  bid_price: number;
  lead_time_weeks: number;
  notes: string | null;
  proposal_url: string | null;
  status: string;
  created_at: string;
  company_name: string;
  contact_name: string;
  location: string | null;
}

interface ProjectBidsProps {
  projectId: string;
  accessToken: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  submitted: { label: "New", className: "bg-blue-500/10 text-blue-500 border-blue-500/30" },
  interested: { label: "Interested", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30" },
  under_review: { label: "Under Review", className: "bg-purple-500/10 text-purple-500 border-purple-500/30" },
  accepted: { label: "Accepted", className: "bg-green-500/10 text-green-500 border-green-500/30" },
  rejected: { label: "Declined", className: "bg-red-500/10 text-red-500 border-red-500/30" },
};

export function ProjectBids({ projectId, accessToken }: ProjectBidsProps) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingBid, setUpdatingBid] = useState<string | null>(null);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const res = await fetch(`/api/customer/projects/${projectId}/bids`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const { bids: b } = await res.json();
          setBids(b || []);
        }
      } catch (err) {
        console.error("Error fetching bids:", err);
      }
      setLoading(false);
    };
    fetchBids();
  }, [projectId, accessToken]);

  const updateBidStatus = async (bidId: string, status: string) => {
    setUpdatingBid(bidId);
    try {
      const res = await fetch(`/api/customer/projects/${projectId}/bids/${bidId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setBids((prev) => prev.map((b) => b.id === bidId ? { ...b, status } : b));
      }
    } catch (err) {
      console.error("Error updating bid:", err);
    }
    setUpdatingBid(null);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            OEM Bids
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          OEM Bids
          {bids.length > 0 && (
            <Badge variant="secondary" className="text-xs">{bids.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {bids.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No bids yet. OEMs will be able to bid once the project is published to the marketplace.
          </p>
        ) : (
          <div className="space-y-3">
            {bids.map((bid) => {
              const config = statusConfig[bid.status] || { label: bid.status, className: "" };
              return (
                <div
                  key={bid.id}
                  className="border border-border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{bid.company_name}</p>
                        <p className="text-xs text-muted-foreground">{bid.contact_name}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={config.className}>
                      {config.label}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-6 text-sm pl-[52px]">
                    {bid.bid_price > 0 && (
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="font-semibold">${bid.bid_price.toLocaleString()}</span>
                      </div>
                    )}
                    {bid.lead_time_weeks > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{bid.lead_time_weeks} weeks</span>
                      </div>
                    )}
                    {bid.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{bid.location}</span>
                      </div>
                    )}
                  </div>

                  {bid.notes && (
                    <p className="text-sm text-muted-foreground pl-[52px]">{bid.notes}</p>
                  )}

                  {bid.proposal_url && (
                    <div className="pl-[52px]">
                      <a
                        href={bid.proposal_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        View Proposal
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  <div className="flex items-center justify-between pl-[52px]">
                    <p className="text-xs text-muted-foreground">
                      {new Date(bid.created_at).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
                      })}
                    </p>
                    {(bid.status === "submitted" || bid.status === "under_review") && (
                      <div className="flex items-center gap-2">
                        {bid.status === "submitted" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateBidStatus(bid.id, "under_review")}
                            disabled={updatingBid === bid.id}
                          >
                            Review
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-500/30 hover:bg-green-500/10"
                          onClick={() => updateBidStatus(bid.id, "accepted")}
                          disabled={updatingBid === bid.id}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-500/30 hover:bg-red-500/10"
                          onClick={() => updateBidStatus(bid.id, "rejected")}
                          disabled={updatingBid === bid.id}
                        >
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
