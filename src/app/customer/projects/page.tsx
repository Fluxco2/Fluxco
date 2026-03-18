"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Plus, Zap, Calendar, DollarSign, Pencil } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { CustomerProject } from "@/lib/supabase";

const statusColors: Record<string, string> = {
  draft: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  submitted: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  quoted: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  ordered: "bg-green-500/10 text-green-500 border-green-500/20",
  completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
};

function formatCost(cost: number | null) {
  if (!cost) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cost);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CustomerProjectsPage() {
  const { customer, loading } = useCustomerAuth();
  const [projects, setProjects] = useState<CustomerProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    if (!customer) return;

    const fetchProjects = async () => {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) return;

      const res = await fetch("/api/customer/projects/list", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const { projects } = await res.json();
        setProjects(projects);
      }
      setLoadingProjects(false);
    };

    fetchProjects();
  }, [customer]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <FolderOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-semibold text-lg mb-2">Account Setup In Progress</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Your customer profile hasn&apos;t been set up yet. Please contact your FluxCo representative.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Projects</h1>
          <p className="text-muted-foreground">
            Build and manage your transformer specifications.
          </p>
        </div>
        <Link href="/customer/projects/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      {loadingProjects ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[200px] rounded-lg" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="font-semibold text-lg mb-2">No projects yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Use the Spec Builder to design your first transformer project.
            You can save it, come back to adjust specs, and submit when ready.
          </p>
          <Link href="/customer/projects/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Project
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
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
                    <span>
                      {project.rated_power_kva.toLocaleString()} kVA
                      {project.primary_voltage && project.secondary_voltage && (
                        <> &middot; {project.primary_voltage.toLocaleString()}V / {project.secondary_voltage.toLocaleString()}V</>
                      )}
                    </span>
                  </div>
                )}
                {project.estimated_cost && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>{formatCost(project.estimated_cost)} est.</span>
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
  );
}
