"use client";

import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { useCustomerProjects } from "@/hooks/useCustomerProjects";
import { ProjectCard } from "@/components/customer/ProjectCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderOpen, CheckCircle } from "lucide-react";

export default function CustomerProjectsPage() {
  const { customer, loading } = useCustomerAuth();
  const { current, past, isLoading: projectsLoading } = useCustomerProjects(
    customer?.notion_customer_id
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
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

  const hasNotionLink = !!customer.notion_customer_id;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Projects</h1>
        <p className="text-muted-foreground">
          Track your current and past transformer projects.
        </p>
      </div>

      {!hasNotionLink ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <FolderOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-lg mb-2">Projects Not Linked Yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your account has not been linked to your projects yet. Please contact
            your FluxCo representative to connect your project data.
          </p>
        </div>
      ) : (
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="current" className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              Current ({current.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Past ({past.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current">
            {projectsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[160px] rounded-lg" />
                ))}
              </div>
            ) : current.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
                <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No current projects at this time.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {current.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {projectsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[160px] rounded-lg" />
                ))}
              </div>
            ) : past.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No completed projects yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {past.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
