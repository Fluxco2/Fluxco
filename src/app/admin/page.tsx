"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Zap,
  Users,
  FileText,
  DollarSign,
  RefreshCw,
  UserCircle,
  ChevronDown,
  ChevronRight,
  KeyRound,
  FolderOpen,
  MapPin,
  Calendar,
  Copy,
  Check,
  Loader2,
  Link2,
  Unlink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Bid {
  id: string;
  listing_id: string;
  supplier_id: string;
  bid_price: number;
  lead_time_weeks: number;
  notes: string | null;
  status: string;
  created_at: string;
  listing?: {
    serial_number: string;
    rated_power_kva: number;
    primary_voltage: number;
    secondary_voltage: number;
  };
  supplier?: {
    company_name: string;
    contact_name: string;
    email: string;
  };
}

interface Listing {
  id: string;
  serial_number: string;
  rated_power_kva: number;
  primary_voltage: number;
  secondary_voltage: number;
  status: string;
  contact_name: string;
  contact_email: string;
  zipcode: string | null;
  created_at: string;
}

interface OEM {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  notify_new_listings: boolean;
  created_at: string;
}

interface Customer {
  id: string;
  user_id: string;
  email: string;
  company_name: string;
  contact_name: string;
  phone: string | null;
  notion_customer_id: string | null;
  created_at: string;
}

interface CustomerProject {
  id: string;
  slug: string;
  customerName: string;
  productDescription: string;
  mvaSize: number | null;
  deliveryDate: string | null;
  location: string;
  status: string;
}

interface NotionCustomer {
  id: string;
  name: string;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [savedPassword, setSavedPassword] = useState("");
  const [bids, setBids] = useState<Bid[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [oems, setOEMs] = useState<OEM[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Customer expansion and project state
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);
  const [customerProjects, setCustomerProjects] = useState<Record<string, CustomerProject[]>>({});
  const [loadingProjects, setLoadingProjects] = useState<string | null>(null);

  // Password reset state
  const [resettingPassword, setResettingPassword] = useState<string | null>(null);
  const [resetResult, setResetResult] = useState<Record<string, { tempPassword: string } | null>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Customer linking state
  const [linkingCustomer, setLinkingCustomer] = useState<string | null>(null);
  const [linkNotionId, setLinkNotionId] = useState("");
  const [savingLink, setSavingLink] = useState(false);

  // Notion customers list (for linking dropdown)
  const [notionCustomers, setNotionCustomers] = useState<NotionCustomer[]>([]);
  const [loadingNotionCustomers, setLoadingNotionCustomers] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.status === 401) {
      setError("Incorrect password");
      setLoading(false);
      return;
    }

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to login");
      setLoading(false);
      return;
    }

    const data = await res.json();
    setBids(data.bids);
    setListings(data.listings);
    setOEMs(data.suppliers);
    setCustomers(data.customers || []);
    setSavedPassword(password);
    setAuthenticated(true);
    setLoading(false);
  };

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: savedPassword }),
    });

    if (res.ok) {
      const data = await res.json();
      setBids(data.bids);
      setListings(data.listings);
      setOEMs(data.suppliers);
      setCustomers(data.customers || []);
    }
    setLoading(false);
  };

  const fetchCustomerProjects = async (customerId: string, notionCustomerId: string) => {
    if (expandedCustomer === customerId) {
      setExpandedCustomer(null);
      return;
    }

    setExpandedCustomer(customerId);

    // If we already fetched projects for this customer, don't re-fetch
    if (customerProjects[customerId]) return;

    setLoadingProjects(customerId);

    try {
      const res = await fetch("/api/admin/customer-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: savedPassword, notionCustomerId }),
      });

      if (res.ok) {
        const data = await res.json();
        setCustomerProjects((prev) => ({ ...prev, [customerId]: data.projects || [] }));
      }
    } catch (err) {
      console.error("Error fetching customer projects:", err);
    } finally {
      setLoadingProjects(null);
    }
  };

  const handlePasswordReset = async (customer: Customer) => {
    setResettingPassword(customer.id);
    setResetResult((prev) => ({ ...prev, [customer.id]: null }));

    try {
      const res = await fetch("/api/admin/customer-reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: savedPassword,
          customerUserId: customer.user_id,
          customerEmail: customer.email,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResetResult((prev) => ({
          ...prev,
          [customer.id]: { tempPassword: data.tempPassword },
        }));
      }
    } catch (err) {
      console.error("Password reset error:", err);
    } finally {
      setResettingPassword(null);
    }
  };

  const copyToClipboard = (text: string, customerId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(customerId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fetchNotionCustomers = async () => {
    if (notionCustomers.length > 0) return; // Already fetched
    setLoadingNotionCustomers(true);
    try {
      const res = await fetch("/api/admin/notion-customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: savedPassword }),
      });
      if (res.ok) {
        const data = await res.json();
        setNotionCustomers(data.customers || []);
      }
    } catch (err) {
      console.error("Error fetching Notion customers:", err);
    } finally {
      setLoadingNotionCustomers(false);
    }
  };

  const handleLinkCustomer = async (customerId: string) => {
    setSavingLink(true);
    try {
      const res = await fetch("/api/admin/link-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: savedPassword,
          customerId,
          notionCustomerId: linkNotionId.trim() || null,
        }),
      });

      if (res.ok) {
        // Update local state
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === customerId
              ? { ...c, notion_customer_id: linkNotionId.trim() || null }
              : c
          )
        );
        setLinkingCustomer(null);
        setLinkNotionId("");
        // Clear cached projects if unlinking
        if (!linkNotionId.trim()) {
          setCustomerProjects((prev) => {
            const updated = { ...prev };
            delete updated[customerId];
            return updated;
          });
        }
      }
    } catch (err) {
      console.error("Link customer error:", err);
    } finally {
      setSavingLink(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatShortDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-card border border-border rounded-lg p-8 w-full max-w-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl">FLUXCO Admin</span>
          </div>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-md bg-background mb-4"
              autoComplete="current-password"
            />
            {error && (
              <div className="text-red-500 text-sm mb-4">{error}</div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : "Login"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display text-2xl">FLUXCO</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground font-medium">Admin</span>
              <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="w-4 h-4" />
              Bids
            </div>
            <div className="text-3xl font-bold">{bids.length}</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <FileText className="w-4 h-4" />
              Listings
            </div>
            <div className="text-3xl font-bold">{listings.length}</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="w-4 h-4" />
              OEMs
            </div>
            <div className="text-3xl font-bold">{oems.length}</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <UserCircle className="w-4 h-4" />
              Customers
            </div>
            <div className="text-3xl font-bold">{customers.length}</div>
          </div>
        </div>

        <Tabs defaultValue="bids">
          <TabsList className="mb-6">
            <TabsTrigger value="bids">Bids ({bids.length})</TabsTrigger>
            <TabsTrigger value="listings">Listings ({listings.length})</TabsTrigger>
            <TabsTrigger value="oems">OEMs ({oems.length})</TabsTrigger>
            <TabsTrigger value="customers">Customers ({customers.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="bids">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>OEM</TableHead>
                    <TableHead>Bid Price</TableHead>
                    <TableHead>Lead Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bids.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No bids yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    bids.map((bid) => (
                      <TableRow key={bid.id}>
                        <TableCell className="text-sm">{formatDate(bid.created_at)}</TableCell>
                        <TableCell>
                          <div className="font-mono text-primary">{bid.listing?.serial_number}</div>
                          <div className="text-xs text-muted-foreground">
                            {bid.listing?.rated_power_kva} kVA
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>{bid.supplier?.company_name}</div>
                          <div className="text-xs text-muted-foreground">{bid.supplier?.email}</div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {bid.bid_price > 0 ? formatCurrency(bid.bid_price) : "-"}
                        </TableCell>
                        <TableCell>
                          {bid.lead_time_weeks > 0 ? `${bid.lead_time_weeks} weeks` : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={bid.status === "submitted" ? "default" : "secondary"}>
                            {bid.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {bid.notes || "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="listings">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>FLUX#</TableHead>
                    <TableHead>Power</TableHead>
                    <TableHead>Voltage</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listings.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell className="font-mono text-primary">{listing.serial_number}</TableCell>
                      <TableCell className="font-semibold">{listing.rated_power_kva} kVA</TableCell>
                      <TableCell>
                        {listing.primary_voltage}V / {listing.secondary_voltage}V
                      </TableCell>
                      <TableCell>{listing.zipcode || "-"}</TableCell>
                      <TableCell>
                        <div>{listing.contact_name}</div>
                        <div className="text-xs text-muted-foreground">{listing.contact_email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={listing.status === "listed" ? "default" : "secondary"}>
                          {listing.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(listing.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="oems">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Notifications</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {oems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No OEMs registered yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    oems.map((oem) => (
                      <TableRow key={oem.id}>
                        <TableCell className="font-semibold">{oem.company_name}</TableCell>
                        <TableCell>{oem.contact_name}</TableCell>
                        <TableCell>{oem.email}</TableCell>
                        <TableCell>{oem.phone || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={oem.notify_new_listings ? "default" : "outline"}>
                            {oem.notify_new_listings ? "On" : "Off"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(oem.created_at)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="customers">
            <div className="space-y-3">
              {customers.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
                  No customers registered yet
                </div>
              ) : (
                customers.map((customer) => {
                  const isExpanded = expandedCustomer === customer.id;
                  const projects = customerProjects[customer.id] || [];
                  const isLoadingThis = loadingProjects === customer.id;
                  const resetInfo = resetResult[customer.id];
                  const isResetting = resettingPassword === customer.id;

                  return (
                    <div key={customer.id} className="bg-card border border-border rounded-lg overflow-hidden">
                      {/* Customer Row */}
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{customer.company_name}</span>
                                {customer.notion_customer_id ? (
                                  <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/30 text-xs">
                                    {notionCustomers.find((nc) => nc.id === customer.notion_customer_id)?.name || "Linked"}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">
                                    Not Linked
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground mt-0.5">
                                {customer.contact_name} &middot; {customer.email}
                                {customer.phone && ` \u00B7 ${customer.phone}`}
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                Joined {formatShortDate(customer.created_at)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            {/* Link Customer Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (linkingCustomer === customer.id) {
                                  setLinkingCustomer(null);
                                  setLinkNotionId("");
                                } else {
                                  setLinkingCustomer(customer.id);
                                  setLinkNotionId(customer.notion_customer_id || "");
                                  fetchNotionCustomers();
                                }
                              }}
                              className={`text-xs ${linkingCustomer === customer.id ? "border-primary text-primary" : ""}`}
                            >
                              {customer.notion_customer_id ? (
                                <Link2 className="w-3.5 h-3.5 mr-1.5" />
                              ) : (
                                <Unlink className="w-3.5 h-3.5 mr-1.5" />
                              )}
                              {customer.notion_customer_id ? "Edit Link" : "Link"}
                            </Button>

                            {/* Password Reset Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePasswordReset(customer)}
                              disabled={isResetting}
                              className="text-xs"
                            >
                              {isResetting ? (
                                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                              ) : (
                                <KeyRound className="w-3.5 h-3.5 mr-1.5" />
                              )}
                              Reset Password
                            </Button>

                            {/* View Projects Button */}
                            {customer.notion_customer_id && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchCustomerProjects(customer.id, customer.notion_customer_id!)}
                                className="text-xs"
                              >
                                <FolderOpen className="w-3.5 h-3.5 mr-1.5" />
                                Projects
                                {isExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5 ml-1" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Customer Linking Form */}
                        {linkingCustomer === customer.id && (
                          <div className="mt-3 p-3 bg-muted/50 border border-border rounded-md">
                            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                              Link to Notion Customer
                            </div>
                            <div className="flex items-center gap-2">
                              {loadingNotionCustomers ? (
                                <div className="flex-1 flex items-center gap-2 text-sm text-muted-foreground">
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  Loading customers...
                                </div>
                              ) : (
                                <select
                                  value={linkNotionId}
                                  onChange={(e) => setLinkNotionId(e.target.value)}
                                  className="flex-1 px-3 py-1.5 text-sm border border-border rounded-md bg-background"
                                >
                                  <option value="">— Select a customer —</option>
                                  {notionCustomers.map((nc) => (
                                    <option key={nc.id} value={nc.id}>
                                      {nc.name}
                                    </option>
                                  ))}
                                </select>
                              )}
                              <Button
                                size="sm"
                                onClick={() => handleLinkCustomer(customer.id)}
                                disabled={savingLink || loadingNotionCustomers}
                                className="text-xs"
                              >
                                {savingLink ? (
                                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                                ) : null}
                                Save
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setLinkingCustomer(null);
                                  setLinkNotionId("");
                                }}
                                className="text-xs"
                              >
                                Cancel
                              </Button>
                              {customer.notion_customer_id && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setLinkNotionId("");
                                    handleLinkCustomer(customer.id);
                                  }}
                                  className="text-xs text-red-500 hover:text-red-400"
                                >
                                  <Unlink className="w-3.5 h-3.5 mr-1" />
                                  Unlink
                                </Button>
                              )}
                            </div>
                            {customer.notion_customer_id && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                Currently linked to: <span className="font-medium text-foreground">
                                  {notionCustomers.find((nc) => nc.id === customer.notion_customer_id)?.name || customer.notion_customer_id}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Password Reset Result */}
                        {resetInfo && (
                          <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-md">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-xs text-green-500 font-medium mb-1">
                                  Temporary password generated for {customer.email}:
                                </div>
                                <code className="text-sm font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded">
                                  {resetInfo.tempPassword}
                                </code>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(resetInfo.tempPassword, customer.id)}
                                className="text-green-500 hover:text-green-400"
                              >
                                {copiedId === customer.id ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Expanded Projects Section */}
                      {isExpanded && (
                        <div className="border-t border-border bg-background/50 p-4">
                          {isLoadingThis ? (
                            <div className="flex items-center justify-center py-6 text-muted-foreground">
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Loading projects...
                            </div>
                          ) : projects.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground text-sm">
                              No projects found for this customer.
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                                {projects.length} Project{projects.length !== 1 ? "s" : ""}
                              </div>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Description</TableHead>
                                    <TableHead>MVA</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Delivery</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Proposal</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {projects.map((project) => (
                                    <TableRow key={project.id}>
                                      <TableCell className="font-medium">
                                        {project.productDescription || "—"}
                                      </TableCell>
                                      <TableCell>
                                        {project.mvaSize ? `${project.mvaSize} MVA` : "—"}
                                      </TableCell>
                                      <TableCell>
                                        {project.location ? (
                                          <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {project.location}
                                          </span>
                                        ) : "—"}
                                      </TableCell>
                                      <TableCell>
                                        {project.deliveryDate ? (
                                          <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {formatShortDate(project.deliveryDate)}
                                          </span>
                                        ) : "—"}
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          variant={project.status === "In Progress" ? "default" : "secondary"}
                                          className={
                                            project.status === "Done"
                                              ? "bg-green-500/10 text-green-500 border-green-500/30"
                                              : project.status === "Canceled"
                                              ? "bg-red-500/10 text-red-500 border-red-500/30"
                                              : ""
                                          }
                                        >
                                          {project.status || "Unknown"}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        {project.slug ? (
                                          <Link
                                            href={`/proposal/${project.slug}`}
                                            className="text-primary hover:underline text-sm"
                                            target="_blank"
                                          >
                                            View →
                                          </Link>
                                        ) : (
                                          <span className="text-muted-foreground text-sm">—</span>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
