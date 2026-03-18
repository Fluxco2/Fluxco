"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { Loader2, Zap, LayoutDashboard, FolderOpen, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/customer", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customer/projects", label: "Projects", icon: FolderOpen },
  { href: "/customer/settings", label: "Settings", icon: Settings },
];

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, customer, loading, signOut } = useCustomerAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage =
    pathname === "/customer/login" || pathname === "/customer/register";

  useEffect(() => {
    if (loading) return;

    if (user && isAuthPage) {
      router.replace("/customer");
    } else if (!user && !isAuthPage) {
      router.replace("/customer/login");
    }
  }, [user, loading, isAuthPage, router]);

  // Auth pages (login/register) render immediately — no loading gate
  if (isAuthPage) {
    if (!loading && user) {
      // Already logged in, redirect away handled by useEffect
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
    }
    return <>{children}</>;
  }

  // Protected pages: show spinner while auth initializes
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in on a protected page — waiting for redirect
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/customer/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display text-2xl tracking-wide text-foreground">
                FLUXCO
              </span>
            </Link>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                {customer?.contact_name || user?.email || "Sign Out"}
              </Button>
            </div>
          </div>

          {/* Mobile Nav */}
          <nav className="flex md:hidden items-center gap-1 mt-3 -mb-1 overflow-x-auto">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
