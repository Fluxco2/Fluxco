"use client";

import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { useCustomerProjects } from "@/hooks/useCustomerProjects";
import { ProjectCard } from "@/components/customer/ProjectCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FolderOpen,
  CheckCircle,
  ArrowRight,
  Settings,
} from "lucide-react";
import Link from "next/link";

export default function CustomerDashboardPage() {
  const { customer, user, loading } = useCustomerAuth();
  const { current, past, isLoading: projectsLoading } = useCustomerProjects(
    customer?.notion_customer_id
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-[300px] rounded-lg" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Welcome</h1>
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <Settings className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-lg mb-2">Account Setup In Progress</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your login is working, but your customer profile hasn&apos;t been set up yet.
            Please contact your FluxCo representative to complete your account setup.
          </p>
        </div>
      </div>
    );
  }

  const hasNotionLink = !!customer.notion_customer_id;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold mb-1">
          Welcome, {customer.contact_name?.split(" ")[0] || customer.company_name}
        </h1>
        <p className="text-muted-foreground">
          {customer.company_name} &mdash; Customer Dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Link
          href="/customer/projects"
          className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center gap-2 text-2xl font-bold text-primary">
            <FolderOpen className="w-6 h-6" />
            {hasNotionLink ? current.length : "—"}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Current Projects</div>
        </Link>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-2xl font-bold text-green-500">
            <CheckCircle className="w-6 h-6" />
            {hasNotionLink ? past.length : "—"}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Completed Projects</div>
        </div>

        <Link
          href="/customer/settings"
          className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div className="text-sm text-muted-foreground mt-1">Account Settings</div>
        </Link>
      </div>

      {/* No Notion Link Notice */}
      {!hasNotionLink && (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <FolderOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-lg mb-2">Projects Not Linked Yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your account has not been linked to your projects yet. Please contact
            your FluxCo representative to connect your project data.
          </p>
        </div>
      )}

      {/* Current Projects */}
      {hasNotionLink && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-primary" />
              Current Projects
            </h2>
            <Link
              href="/customer/projects"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {projectsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[160px] rounded-lg" />
              ))}
            </div>
          ) : current.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
              No current projects. Check back soon for updates.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {current.slice(0, 6).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link
          href="/customer/projects"
          className="flex items-center gap-4 bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors group"
        >
          <FolderOpen className="w-8 h-8 text-primary" />
          <div>
            <h3 className="font-semibold group-hover:text-primary transition-colors">
              View All Projects
            </h3>
            <p className="text-sm text-muted-foreground">
              Browse current and past projects with proposal links
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
        </Link>

        <Link
          href="/customer/settings"
          className="flex items-center gap-4 bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors group"
        >
          <Settings className="w-8 h-8 text-primary" />
          <div>
            <h3 className="font-semibold group-hover:text-primary transition-colors">
              Account Settings
            </h3>
            <p className="text-sm text-muted-foreground">
              Update your profile and manage account security
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
        </Link>
      </div>
    </div>
  );
}
