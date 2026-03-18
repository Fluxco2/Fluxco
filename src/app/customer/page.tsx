"use client";

import { useState, useEffect } from "react";
import { useCustomerAuthContext } from "@/context/CustomerAuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  FolderOpen,
  CheckCircle,
  ArrowRight,
  Settings,
  Zap,
  Calendar,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { CustomerProject } from "@/lib/supabase";

const statusColors: Record<string, string> = {
  draft: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  submitted: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  quoted: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  ordered: "bg-green-500/10 text-green-500 border-green-500/20",
  completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CustomerDashboardPage() {
  const { customer, user, loading } = useCustomerAuthContext();
  const [supabaseProjects, setSupabaseProjects] = useState<CustomerProject[]>([]);
  const [sbLoading, setSbLoading] = useState(true);

  useEffect(() => {
    if (!customer) return;
    const fetchProjects = async () => {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) { setSbLoading(false); return; }

      const res = await fetch("/api/customer/projects/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const { projects } = await res.json();
        setSupabaseProjects(projects || []);
      }
      setSbLoading(false);
    };
    fetchProjects();
  }, [customer]);

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
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[200px] rounded-lg" />
      </div>
    );
  }

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
            {sbLoading ? "—" : supabaseProjects.length}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Projects</div>
        </Link>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-2xl font-bold text-green-500">
            <CheckCircle className="w-6 h-6" />
            {sbLoading ? "—" : supabaseProjects.filter(p => p.status === "completed" || p.status === "ordered").length}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Completed</div>
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

      {/* Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-primary" />
            Your Projects
          </h2>
          <Link
            href="/customer/projects"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {sbLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[160px] rounded-lg" />
            ))}
          </div>
        ) : supabaseProjects.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
            No projects yet. Create your first project to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {supabaseProjects.slice(0, 6).map((project) => (
              <Link
                key={project.id}
                href={`/customer/projects/${project.id}`}
                className="bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    <span className="text-xs font-mono text-muted-foreground">
                      {project.project_number}
                    </span>
                  </div>
                  <Badge variant="outline" className={statusColors[project.status] || ""}>
                    {project.status}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  {project.rated_power_kva && (
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5" />
                      <span>{project.rated_power_kva.toLocaleString()} kVA</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Updated {formatDate(project.updated_at)}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <Pencil className="w-3 h-3" />
                  Edit Spec
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
