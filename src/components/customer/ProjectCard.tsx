"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Zap, ArrowRight } from "lucide-react";
import type { CustomerProject } from "@/types/notion";

interface ProjectCardProps {
  project: CustomerProject;
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" {
  switch (status) {
    case "In Progress":
      return "default";
    case "Done":
      return "secondary";
    case "Canceled":
      return "destructive";
    default:
      return "secondary";
  }
}

function getStatusStyle(status: string): string {
  switch (status) {
    case "In Progress":
      return "bg-primary/10 text-primary border-primary/30";
    case "Done":
      return "bg-green-500/10 text-green-500 border-green-500/30";
    case "Canceled":
      return "";
    default:
      return "";
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  const formattedDate = project.deliveryDate
    ? new Date(project.deliveryDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="bg-card border border-border rounded-lg p-5 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">
            {project.productDescription || "Transformer Project"}
          </h3>
          {project.mvaSize && (
            <div className="flex items-center gap-1.5 text-sm text-primary mt-1">
              <Zap className="w-3.5 h-3.5" />
              {project.mvaSize} MVA
            </div>
          )}
        </div>
        <Badge
          variant={getStatusVariant(project.status)}
          className={getStatusStyle(project.status)}
        >
          {project.status}
        </Badge>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        {project.location && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {project.location}
          </span>
        )}
        {formattedDate && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </span>
        )}
      </div>

      {project.slug && (
        <Link href={`/proposal/${project.slug}`}>
          <Button variant="outline" size="sm" className="w-full">
            View Proposal
            <ArrowRight className="w-3.5 h-3.5 ml-2" />
          </Button>
        </Link>
      )}
    </div>
  );
}
