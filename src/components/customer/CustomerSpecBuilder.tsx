"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Send, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DesignRequirementsForm } from "@/components/transformer/inputs/DesignRequirementsForm";
import { ProDesignForm } from "@/components/transformer/inputs/ProDesignForm";
import { DesignCalculationLoader } from "@/components/transformer/DesignCalculationLoader";
import { DesignSummary } from "@/components/transformer/output/DesignSummary";
import { CalculationSteps } from "@/components/transformer/calculations/CalculationSteps";
import { BillOfMaterials } from "@/components/transformer/output/BillOfMaterials";
import { CostEstimate } from "@/components/transformer/output/CostEstimate";
import { SpecificationSheet } from "@/components/transformer/output/SpecificationSheet";
import { AssemblyDrawing } from "@/components/transformer/drawings/AssemblyDrawing";
import { SideViewDrawing } from "@/components/transformer/drawings/SideViewDrawing";
import { TopViewDrawing } from "@/components/transformer/drawings/TopViewDrawing";
import { designTransformer } from "@/engine/TransformerDesignEngine";
import { calculateCostEstimate } from "@/engine/core/costEstimation";
import { STEEL_GRADES, CONDUCTOR_TYPES, COOLING_CLASSES, VECTOR_GROUPS } from "@/engine/constants/materials";
import { MANUFACTURING_REGIONS } from "@/engine/constants/pricing";
import type { DesignRequirements, TransformerDesign } from "@/engine/types/transformer.types";
import type { ProSpecData } from "@/engine/types/proSpec.types";
import { getDefaultProSpec } from "@/engine/constants/proDefaults";
import { supabase } from "@/lib/supabase";

const defaultRequirements: DesignRequirements = {
  ratedPower: 1500,
  primaryVoltage: 13800,
  secondaryVoltage: 480,
  frequency: 60,
  phases: 3,
  targetImpedance: 5.75,
  steelGrade: STEEL_GRADES.find((s) => s.id === "hi-b")!,
  conductorType: CONDUCTOR_TYPES.find((c) => c.id === "copper")!,
  coolingClass: COOLING_CLASSES.find((c) => c.id === "onan")!,
  vectorGroup: VECTOR_GROUPS.find((v) => v.id === "dyn11")!,
  tapChangerType: "noLoad",
  oilType: "mineral",
  oilPreservation: "conservator",
  includeTAC: false,
  manufacturingRegions: ["usa"],
  requireFEOC: true,
};

// Serialize requirements for storage (convert objects to IDs)
function serializeRequirements(req: DesignRequirements) {
  return {
    ratedPower: req.ratedPower,
    primaryVoltage: req.primaryVoltage,
    secondaryVoltage: req.secondaryVoltage,
    frequency: req.frequency,
    phases: req.phases,
    targetImpedance: req.targetImpedance,
    steelGradeId: req.steelGrade.id,
    conductorTypeId: req.conductorType.id,
    coolingClassId: req.coolingClass.id,
    vectorGroupId: req.vectorGroup.id,
    tapChangerType: req.tapChangerType,
    oilType: req.oilType,
    oilPreservation: req.oilPreservation,
    includeTAC: req.includeTAC,
    manufacturingRegions: req.manufacturingRegions,
    requireFEOC: req.requireFEOC,
    altitude: req.altitude,
    ambientTemperature: req.ambientTemperature,
  };
}

// Deserialize requirements from storage (convert IDs back to objects)
function deserializeRequirements(data: any): DesignRequirements {
  return {
    ratedPower: data.ratedPower ?? 1500,
    primaryVoltage: data.primaryVoltage ?? 13800,
    secondaryVoltage: data.secondaryVoltage ?? 480,
    frequency: data.frequency ?? 60,
    phases: data.phases ?? 3,
    targetImpedance: data.targetImpedance ?? 5.75,
    steelGrade: STEEL_GRADES.find((s) => s.id === data.steelGradeId) ?? STEEL_GRADES.find((s) => s.id === "hi-b")!,
    conductorType: CONDUCTOR_TYPES.find((c) => c.id === data.conductorTypeId) ?? CONDUCTOR_TYPES.find((c) => c.id === "copper")!,
    coolingClass: COOLING_CLASSES.find((c) => c.id === data.coolingClassId) ?? COOLING_CLASSES.find((c) => c.id === "onan")!,
    vectorGroup: VECTOR_GROUPS.find((v) => v.id === data.vectorGroupId) ?? VECTOR_GROUPS.find((v) => v.id === "dyn11")!,
    tapChangerType: data.tapChangerType ?? "noLoad",
    oilType: data.oilType ?? "mineral",
    oilPreservation: data.oilPreservation ?? "conservator",
    includeTAC: data.includeTAC ?? false,
    manufacturingRegions: data.manufacturingRegions ?? ["usa"],
    requireFEOC: data.requireFEOC ?? true,
    altitude: data.altitude,
    ambientTemperature: data.ambientTemperature,
  };
}

const PROJECT_STAGES = [
  { key: "draft", label: "Draft", color: "bg-yellow-500" },
  { key: "submitted", label: "Submitted", color: "bg-blue-500" },
  { key: "quoted", label: "Quoted", color: "bg-purple-500" },
  { key: "ordered", label: "Ordered", color: "bg-green-500" },
  { key: "completed", label: "Completed", color: "bg-emerald-500" },
];

function ProjectStatusTracker({ status }: { status: string }) {
  const currentIndex = PROJECT_STAGES.findIndex((s) => s.key === status);

  return (
    <div className="flex items-center gap-1 w-full">
      {PROJECT_STAGES.map((stage, i) => {
        const isActive = i === currentIndex;
        const isPast = i < currentIndex;

        return (
          <div key={stage.key} className="flex-1 flex flex-col items-center gap-1.5">
            <div
              className={`h-2 w-full rounded-full transition-colors ${
                isActive
                  ? stage.color
                  : isPast
                  ? `${stage.color} opacity-40`
                  : "bg-muted"
              }`}
            />
            <span
              className={`text-xs transition-colors ${
                isActive
                  ? "text-foreground font-medium"
                  : isPast
                  ? "text-muted-foreground"
                  : "text-muted-foreground/50"
              }`}
            >
              {stage.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

interface CustomerSpecBuilderProps {
  customerId: string;
  projectId?: string; // If provided, load existing project
}

export function CustomerSpecBuilder({ customerId, projectId }: CustomerSpecBuilderProps) {
  const router = useRouter();
  const [requirements, setRequirements] = useState<DesignRequirements>(defaultRequirements);
  const [design, setDesign] = useState<TransformerDesign | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");
  const [activeDrawingTab, setActiveDrawingTab] = useState("assembly-front");
  const [specMode, setSpecMode] = useState<"lite" | "pro">("lite");
  const [proSpec, setProSpec] = useState<ProSpecData>(getDefaultProSpec());
  const [projectName, setProjectName] = useState("");
  const [projectNumber, setProjectNumber] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingProject, setLoadingProject] = useState(!!projectId);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(projectId || null);
  const [projectStatus, setProjectStatus] = useState("draft");

  // Load existing project
  useEffect(() => {
    if (!projectId) return;

    const loadProject = async () => {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) return;

      const res = await fetch(`/api/customer/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const { project } = await res.json();
        setProjectName(project.name || "");
        setProjectNumber(project.project_number);
        setProjectStatus(project.status || "draft");
        setSpecMode(project.spec_mode || "lite");

        if (project.design_requirements) {
          setRequirements(deserializeRequirements(project.design_requirements));
        }
        if (project.pro_spec) {
          setProSpec(project.pro_spec);
        }
        // Re-run the design engine to restore results
        if (project.design_requirements) {
          const reqs = deserializeRequirements(project.design_requirements);
          const result = designTransformer(reqs, {
            steelGrade: reqs.steelGrade.id,
            hvConductorMaterial: reqs.conductorType.id === "copper" ? "copper" : "aluminum",
            lvConductorMaterial: reqs.conductorType.id === "copper" ? "copper" : "aluminum",
          });
          if (result.success && result.design) {
            setDesign(result.design);
          }
        }
      }
      setLoadingProject(false);
    };

    loadProject();
  }, [projectId]);

  const getRegionMultiplier = () => {
    let regions = requirements.manufacturingRegions || ["usa"];
    if (requirements.requireFEOC) {
      regions = regions.filter((r) => MANUFACTURING_REGIONS[r]?.feocCompliant !== false);
    }
    if (regions.length === 0) regions = ["usa"];
    const multipliers = regions.map((r) => MANUFACTURING_REGIONS[r]?.multiplier ?? 1.0);
    return multipliers.reduce((sum, m) => sum + m, 0) / multipliers.length;
  };

  const handleCalculate = () => {
    setIsCalculating(true);
  };

  const handleCalculationComplete = () => {
    const result = designTransformer(requirements, {
      steelGrade: requirements.steelGrade.id,
      hvConductorMaterial: requirements.conductorType.id === "copper" ? "copper" : "aluminum",
      lvConductorMaterial: requirements.conductorType.id === "copper" ? "copper" : "aluminum",
    });
    if (result.success && result.design) {
      setDesign(result.design);
    }
    setIsCalculating(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    let estimatedCost: number | null = null;
    if (design) {
      const costBreakdown = calculateCostEstimate(design, requirements, { oilType: "mineral" });
      estimatedCost = Math.round(costBreakdown.totalCost * getRegionMultiplier() * 100) / 100;
    }

    const payload = {
      name: projectName || `${requirements.ratedPower} kVA Transformer`,
      spec_mode: specMode,
      rated_power_kva: requirements.ratedPower,
      primary_voltage: requirements.primaryVoltage,
      secondary_voltage: requirements.secondaryVoltage,
      frequency: requirements.frequency,
      phases: requirements.phases,
      design_requirements: serializeRequirements(requirements),
      pro_spec: specMode === "pro" ? proSpec : null,
      estimated_cost: estimatedCost,
    };

    try {
      if (currentProjectId) {
        // Update existing
        const res = await fetch(`/api/customer/projects/${currentProjectId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const { project } = await res.json();
          setProjectNumber(project.project_number);
          setSaved(true);
        }
      } else {
        // Create new
        const res = await fetch("/api/customer/projects/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, customerId }),
        });
        if (res.ok) {
          const { project } = await res.json();
          setCurrentProjectId(project.id);
          setProjectNumber(project.project_number);
          setSaved(true);
          // Update URL without full navigation
          window.history.replaceState(null, "", `/customer/projects/${project.id}`);
        }
      }
    } catch (err) {
      console.error("Save error:", err);
    }

    setSaving(false);
    if (saved) {
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleSubmit = async () => {
    if (!currentProjectId) return;
    setSubmitting(true);

    // Save first to capture any unsaved changes
    await handleSave();

    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    try {
      const res = await fetch(`/api/customer/projects/${currentProjectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "submitted" }),
      });
      if (res.ok) {
        setProjectStatus("submitted");
      }
    } catch (err) {
      console.error("Submit error:", err);
    }
    setSubmitting(false);
  };

  if (loadingProject) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Loading Animation */}
      {isCalculating && (
        <DesignCalculationLoader
          onComplete={handleCalculationComplete}
          ratedPower={requirements.ratedPower}
          primaryVoltage={requirements.primaryVoltage}
          secondaryVoltage={requirements.secondaryVoltage}
        />
      )}

      {/* Status Tracker */}
      {currentProjectId && (
        <ProjectStatusTracker status={projectStatus} />
      )}

      {/* Project Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Project Name (e.g. 'Dallas Data Center')"
            className="max-w-md text-lg font-semibold"
            disabled={projectStatus !== "draft"}
          />
          {projectNumber && (
            <span className="text-sm text-muted-foreground font-mono bg-muted px-3 py-1 rounded">
              {projectNumber}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} disabled={saving || projectStatus !== "draft"} variant="outline">
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saved ? "Saved!" : saving ? "Saving..." : "Save"}
          </Button>
          {projectStatus === "draft" && currentProjectId && (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {submitting ? "Submitting..." : "Submit for Quoting"}
            </Button>
          )}
          {projectStatus === "submitted" && (
            <div className="flex items-center gap-2 text-sm text-blue-500 font-medium px-3">
              <Check className="h-4 w-4" />
              Submitted
            </div>
          )}
        </div>
      </div>

      {/* Spec Builder Form */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Design Requirements</CardTitle>
          <div className="flex items-center gap-2">
            <Label className={`text-sm ${specMode === "lite" ? "text-foreground font-medium" : "text-muted-foreground"}`}>
              Lite
            </Label>
            <Switch
              checked={specMode === "pro"}
              onCheckedChange={(checked) => setSpecMode(checked ? "pro" : "lite")}
            />
            <Label className={`text-sm ${specMode === "pro" ? "text-blue-600 font-medium" : "text-muted-foreground"}`}>
              Pro
            </Label>
          </div>
        </CardHeader>
        <CardContent>
          {specMode === "lite" ? (
            <DesignRequirementsForm
              requirements={requirements}
              onChange={setRequirements}
              onCalculate={handleCalculate}
            />
          ) : (
            <ProDesignForm
              requirements={requirements}
              proSpec={proSpec}
              onChange={setRequirements}
              onProSpecChange={setProSpec}
              onCalculate={handleCalculate}
            />
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {design && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Design Results</h2>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className={`grid w-full ${specMode === "pro" ? "grid-cols-6" : "grid-cols-5"}`}>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              {specMode === "pro" && <TabsTrigger value="specifications">Specifications</TabsTrigger>}
              <TabsTrigger value="calculations">Calculations</TabsTrigger>
              <TabsTrigger value="drawings">Drawings</TabsTrigger>
              <TabsTrigger value="bom">BOM</TabsTrigger>
              <TabsTrigger value="cost">Cost Estimate</TabsTrigger>
            </TabsList>

            <TabsContent value="summary">
              <DesignSummary design={design} requirements={requirements} />
            </TabsContent>

            {specMode === "pro" && (
              <TabsContent value="specifications">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">PIP ELSTR01 Specification Sheet</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SpecificationSheet proSpec={proSpec} requirements={requirements} />
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            <TabsContent value="calculations">
              <CalculationSteps design={design} requirements={requirements} />
            </TabsContent>

            <TabsContent value="drawings">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Engineering Drawing Set</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeDrawingTab} onValueChange={setActiveDrawingTab}>
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                      <TabsTrigger value="assembly-front" className="text-xs">Front View</TabsTrigger>
                      <TabsTrigger value="assembly-side" className="text-xs">Side View</TabsTrigger>
                      <TabsTrigger value="assembly-top" className="text-xs">Top View</TabsTrigger>
                    </TabsList>
                    <TabsContent value="assembly-front" className="mt-0">
                      <AssemblyDrawing
                        core={design.core}
                        hvWinding={design.hvWinding}
                        lvWinding={design.lvWinding}
                        tank={design.tank}
                        thermal={design.thermal}
                        primaryVoltage={requirements.primaryVoltage}
                        secondaryVoltage={requirements.secondaryVoltage}
                        vectorGroup={requirements.vectorGroup.name}
                        requirements={requirements}
                        bom={design.bom}
                      />
                    </TabsContent>
                    <TabsContent value="assembly-side" className="mt-0">
                      <SideViewDrawing
                        core={design.core}
                        hvWinding={design.hvWinding}
                        lvWinding={design.lvWinding}
                        tank={design.tank}
                        thermal={design.thermal}
                      />
                    </TabsContent>
                    <TabsContent value="assembly-top" className="mt-0">
                      <TopViewDrawing
                        core={design.core}
                        hvWinding={design.hvWinding}
                        lvWinding={design.lvWinding}
                        tank={design.tank}
                        thermal={design.thermal}
                        phases={requirements.phases}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bom">
              <BillOfMaterials design={design} />
            </TabsContent>

            <TabsContent value="cost">
              <CostEstimate design={design} requirements={requirements} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
