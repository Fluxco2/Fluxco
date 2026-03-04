"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Zap, FileDown, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DesignRequirementsForm } from '@/components/transformer/inputs/DesignRequirementsForm';
import { ProDesignForm } from '@/components/transformer/inputs/ProDesignForm';
import { SpecificationSheet } from '@/components/transformer/output/SpecificationSheet';
import { Switch } from '@/components/ui/switch';
import type { ProSpecData } from '@/engine/types/proSpec.types';
import { getDefaultProSpec } from '@/engine/constants/proDefaults';
import { CalculationSteps } from '@/components/transformer/calculations/CalculationSteps';
import { DesignSummary } from '@/components/transformer/output/DesignSummary';
import { BillOfMaterials } from '@/components/transformer/output/BillOfMaterials';
import { CostEstimate } from '@/components/transformer/output/CostEstimate';
import { DesignCalculationLoader } from '@/components/transformer/DesignCalculationLoader';
import { calculateCostEstimate, calculateLifecycleCost, formatCurrency } from '@/engine/core/costEstimation';
import { AssemblyDrawing } from '@/components/transformer/drawings/AssemblyDrawing';
import { SideViewDrawing } from '@/components/transformer/drawings/SideViewDrawing';
import { TopViewDrawing } from '@/components/transformer/drawings/TopViewDrawing';
import { designTransformer } from '@/engine/TransformerDesignEngine';
import type { DesignRequirements, TransformerDesign } from '@/engine/types/transformer.types';
import { STEEL_GRADES, CONDUCTOR_TYPES, COOLING_CLASSES, VECTOR_GROUPS, calculatePowerRatings } from '@/engine/constants/materials';

const defaultRequirements: DesignRequirements = {
  ratedPower: 1500,
  primaryVoltage: 13800,
  secondaryVoltage: 480,
  frequency: 60,
  phases: 3,
  targetImpedance: 5.75,
  steelGrade: STEEL_GRADES.find(s => s.id === 'hi-b')!,
  conductorType: CONDUCTOR_TYPES.find(c => c.id === 'copper')!,
  coolingClass: COOLING_CLASSES.find(c => c.id === 'onan')!,
  vectorGroup: VECTOR_GROUPS.find(v => v.id === 'dyn11')!,
  tapChangerType: 'noLoad',
  oilType: 'mineral',
  oilPreservation: 'conservator',
  includeTAC: false,
  manufacturingRegions: ['usa'],
  requireFEOC: true,
};

export function TransformerDesigner() {
  const [requirements, setRequirements] = useState<DesignRequirements>(defaultRequirements);
  const [design, setDesign] = useState<TransformerDesign | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [activeDrawingTab, setActiveDrawingTab] = useState('assembly-front');
  const [marketplaceOpen, setMarketplaceOpen] = useState(false);
  const [marketplaceSubmitting, setMarketplaceSubmitting] = useState(false);
  const [marketplaceSuccess, setMarketplaceSuccess] = useState(false);
  const [specMode, setSpecMode] = useState<'lite' | 'pro'>('lite');
  const [proSpec, setProSpec] = useState<ProSpecData>(getDefaultProSpec());
  const [marketplaceForm, setMarketplaceForm] = useState({
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    zipcode: '',
  });

  const handleCalculate = () => {
    setIsCalculating(true);
  };

  const handleCalculationComplete = () => {
    const result = designTransformer(requirements, {
      steelGrade: requirements.steelGrade.id,
      hvConductorMaterial: requirements.conductorType.id === 'copper' ? 'copper' : 'aluminum',
      lvConductorMaterial: requirements.conductorType.id === 'copper' ? 'copper' : 'aluminum',
    });
    if (result.success && result.design) {
      setDesign(result.design);
    }
    setIsCalculating(false);
  };

  const handleExportPDF = async () => {
    if (!design) return;

    // Dynamic import to avoid loading jspdf/html2canvas until needed
    const { default: html2canvas } = await import('html2canvas');
    const { jsPDF } = await import('jspdf');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    const lineHeight = 6;

    // Brand colors (RGB)
    const brand = { r: 15, g: 118, b: 110 };   // teal-700
    const brandDark = { r: 10, g: 80, b: 75 };  // deeper teal for accents
    const rowAlt = { r: 245, g: 250, b: 249 };  // very light teal tint for alternating rows

    // Load logo as base64
    let logoBase64: string | null = null;
    try {
      const response = await fetch('/fluxco-logo-light.png');
      const blob = await response.blob();
      logoBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      // Logo unavailable — continue without it
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    const addPageHeader = (pageNum: number, title: string) => {
      // Top bar
      pdf.setFillColor(brand.r, brand.g, brand.b);
      pdf.rect(0, 0, pageWidth, 14, 'F');

      // Logo in header
      if (logoBase64) {
        pdf.addImage(logoBase64, 'PNG', margin, 2, 28, 10);
      } else {
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('FLUXCO', margin, 9);
      }

      // Page title right-aligned in header
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(title, pageWidth - margin, 9, { align: 'right' });

      // Reset text color
      pdf.setTextColor(30, 30, 30);

      // Footer rule + text
      pdf.setDrawColor(brand.r, brand.g, brand.b);
      pdf.setLineWidth(0.4);
      pdf.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

      pdf.setFontSize(7.5);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(120, 120, 120);
      pdf.text('Confidential — Prepared by Fluxco · fluxco.com', margin, pageHeight - 6);
      pdf.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
      pdf.setTextColor(30, 30, 30);
    };

    const drawSectionHeader = (label: string, yPos: number): number => {
      pdf.setFillColor(brand.r, brand.g, brand.b);
      pdf.rect(margin, yPos, contentWidth, 7, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text(label, margin + 3, yPos + 5);
      pdf.setTextColor(30, 30, 30);
      return yPos + 7 + 2;
    };

    const drawTable = (
      rows: [string, string][],
      startY: number,
      colSplit: number = margin + 75,
    ): number => {
      const rowH = 6.5;
      pdf.setFontSize(9);
      rows.forEach(([label, value], i) => {
        // Alternating row background
        if (i % 2 === 1) {
          pdf.setFillColor(rowAlt.r, rowAlt.g, rowAlt.b);
          pdf.rect(margin, startY + i * rowH, contentWidth, rowH, 'F');
        }
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(80, 80, 80);
        pdf.text(label, margin + 3, startY + i * rowH + 4.5);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(30, 30, 30);
        pdf.text(value, colSplit, startY + i * rowH + 4.5);
      });
      pdf.setFont('helvetica', 'normal');
      return startY + rows.length * rowH + 4;
    };

    const drawSubtotalRow = (label: string, value: string, yPos: number): number => {
      pdf.setFillColor(brandDark.r, brandDark.g, brandDark.b);
      pdf.rect(margin, yPos, contentWidth, 7, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text(label, margin + 3, yPos + 5);
      pdf.text(value, pageWidth - margin - 3, yPos + 5, { align: 'right' });
      pdf.setTextColor(30, 30, 30);
      return yPos + 7 + 3;
    };

    // ── Page 1: Cover ──────────────────────────────────────────────────────────

    const ratings = calculatePowerRatings(requirements.ratedPower, requirements.coolingClass.id);

    // Full-height left accent strip
    pdf.setFillColor(brand.r, brand.g, brand.b);
    pdf.rect(0, 0, 8, pageHeight, 'F');

    // Top header band
    pdf.setFillColor(brand.r, brand.g, brand.b);
    pdf.rect(8, 0, pageWidth - 8, 55, 'F');

    // Logo on cover
    if (logoBase64) {
      pdf.addImage(logoBase64, 'PNG', 18, 8, 50, 18);
    } else {
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text('FLUXCO', 18, 24);
    }

    // Tagline under logo
    pdf.setTextColor(200, 240, 235);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text("America's Transformer Marketplace", 18, 32);

    // Document title block
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Transformer Specification Report', 18, 48);

    // Specification summary card
    pdf.setFillColor(250, 253, 252);
    pdf.roundedRect(18, 65, pageWidth - 26, 68, 2, 2, 'F');
    pdf.setDrawColor(brand.r, brand.g, brand.b);
    pdf.setLineWidth(0.6);
    pdf.roundedRect(18, 65, pageWidth - 26, 68, 2, 2, 'S');

    pdf.setTextColor(brand.r, brand.g, brand.b);
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${ratings.display} Power Transformer`, 26, 77);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(60, 60, 60);
    const coverSpecs: [string, string][] = [
      ['Primary Voltage', `${requirements.primaryVoltage.toLocaleString()} V`],
      ['Secondary Voltage', `${requirements.secondaryVoltage.toLocaleString()} V`],
      ['Frequency', `${requirements.frequency} Hz`],
      ['Vector Group', requirements.vectorGroup.name],
      ['Cooling Class', requirements.coolingClass.name],
      ['Phases', `${requirements.phases}-Phase`],
    ];
    const colA = 26;
    const colB = 115;
    coverSpecs.forEach(([label, value], i) => {
      const col = i < 3 ? colA : colB;
      const row = i % 3;
      const yy = 86 + row * 10;
      pdf.setTextColor(100, 100, 100);
      pdf.setFont('helvetica', 'normal');
      pdf.text(label, col, yy);
      pdf.setTextColor(30, 30, 30);
      pdf.setFont('helvetica', 'bold');
      pdf.text(value, col, yy + 5);
    });

    // Divider
    pdf.setDrawColor(brand.r, brand.g, brand.b);
    pdf.setLineWidth(0.3);
    pdf.line(18, 141, pageWidth - 8, 141);

    // Prepared by / date block
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(80, 80, 80);
    pdf.text('Prepared by', 18, 150);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 30, 30);
    pdf.text('Fluxco Spec Builder', 18, 156);

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(80, 80, 80);
    pdf.text('Date Generated', 18, 166);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 30, 30);
    pdf.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 18, 172);

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(80, 80, 80);
    pdf.text('Specification Mode', 18, 182);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 30, 30);
    pdf.text(specMode === 'pro' ? 'Professional (PIP ELSTR01)' : 'Standard', 18, 188);

    // Footer disclaimer on cover
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(150, 150, 150);
    const disclaimer = 'This document contains budgetary estimates generated by the Fluxco Spec Builder. All specifications should be verified by a qualified engineer before procurement.';
    const disclaimerLines = pdf.splitTextToSize(disclaimer, pageWidth - 30);
    pdf.text(disclaimerLines, 18, pageHeight - 14);

    // ── Page 2: Design Summary ─────────────────────────────────────────────────

    pdf.addPage();
    addPageHeader(2, 'Design Summary');
    let y = 22;

    y = drawSectionHeader('Electrical Ratings', y);
    y = drawTable([
      ['Power Rating', ratings.display],
      ['Primary Voltage', `${requirements.primaryVoltage.toLocaleString()} V`],
      ['Secondary Voltage', `${requirements.secondaryVoltage.toLocaleString()} V`],
      ['Frequency', `${requirements.frequency} Hz`],
      ['Phases', `${requirements.phases}`],
      ['Vector Group', requirements.vectorGroup.name],
      ['Cooling Class', requirements.coolingClass.name],
    ], y);

    y = drawSectionHeader('Core Design', y);
    y = drawTable([
      ['Steel Grade', design.core.steelGrade.name],
      ['Flux Density', `${design.core.fluxDensity} T`],
      ['Core Diameter', `${design.core.coreDiameter} mm`],
      ['Core Weight', `${design.core.coreWeight.toFixed(1)} kg`],
    ], y);

    y = drawSectionHeader('Winding Design', y);
    y = drawTable([
      ['HV Turns', `${design.hvWinding.turns}`],
      ['LV Turns', `${design.lvWinding.turns}`],
      ['HV Conductor', `${design.hvWinding.conductorType}`],
      ['LV Conductor', `${design.lvWinding.conductorType}`],
      ['Target Impedance', `${requirements.targetImpedance.toFixed(2)}%`],
      ['Achieved Impedance', `${design.impedance.percentZ.toFixed(2)}%`],
    ], y);

    y = drawSectionHeader('Losses & Efficiency', y);
    const effAt100 = design.losses.efficiency.find(e => e.loadPercent === 100)?.efficiency.toFixed(2) ?? 'N/A';
    const effAt50 = design.losses.efficiency.find(e => e.loadPercent === 50)?.efficiency.toFixed(2) ?? 'N/A';
    y = drawTable([
      ['No-Load Loss', `${design.losses.noLoadLoss.toFixed(0)} W`],
      ['Load Loss (100%)', `${design.losses.loadLoss.toFixed(0)} W`],
      ['Efficiency @ 50% load', `${effAt50}%`],
      ['Efficiency @ 100% load', `${effAt100}%`],
    ], y);

    y = drawSectionHeader('Thermal Performance', y);
    y = drawTable([
      ['Top Oil Rise', `${design.thermal?.topOilRise?.toFixed(1) ?? 'N/A'} °C`],
      ['Average Winding Rise', `${design.thermal?.averageWindingRise?.toFixed(1) ?? 'N/A'} °C`],
      ['Hot Spot Rise', `${design.thermal?.hotSpotRise?.toFixed(1) ?? 'N/A'} °C`],
      ['Oil Volume', `${design.thermal?.oilVolume?.toFixed(0) ?? 'N/A'} L`],
    ], y);

    // ── Page 3: Cost Estimate ──────────────────────────────────────────────────

    pdf.addPage();
    addPageHeader(3, 'Cost Estimate');
    y = 22;

    const costBreakdown = calculateCostEstimate(design, requirements, { oilType: 'mineral' });
    const lifecycleCost = calculateLifecycleCost(design, requirements, {
      electricityRate: 0.10,
      yearsOfOperation: 25,
      loadFactor: 0.5,
    });

    // Total cost highlight card
    pdf.setFillColor(brand.r, brand.g, brand.b);
    pdf.roundedRect(margin, y, contentWidth, 16, 2, 2, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Estimated Total Cost', margin + 4, y + 6);
    pdf.setFontSize(15);
    pdf.setFont('helvetica', 'bold');
    pdf.text(formatCurrency(costBreakdown.totalCost), margin + 4, y + 13);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${formatCurrency(costBreakdown.costPerKVA)} / kVA`, pageWidth - margin - 4, y + 10, { align: 'right' });
    pdf.setTextColor(30, 30, 30);
    y += 22;

    y = drawSectionHeader('Materials', y);
    y = drawTable([
      ['Core Steel', formatCurrency(costBreakdown.coreSteel)],
      ['Conductors', formatCurrency(costBreakdown.conductors)],
      ['Insulation', formatCurrency(costBreakdown.insulation)],
      ['Transformer Oil', formatCurrency(costBreakdown.oil)],
      ['Tank & Structure', formatCurrency(costBreakdown.tank)],
      ['Bushings', formatCurrency(costBreakdown.bushings)],
      ['Cooling Equipment', formatCurrency(costBreakdown.cooling)],
      ['Tap Changer', formatCurrency(costBreakdown.tapChanger)],
      ['Accessories', formatCurrency(costBreakdown.accessories)],
    ], y, margin + 90);
    y = drawSubtotalRow('Total Materials', formatCurrency(costBreakdown.totalMaterials), y);

    y = drawSectionHeader('Labor', y);
    y = drawTable([
      ['Assembly', formatCurrency(costBreakdown.assembly)],
      ['Testing', formatCurrency(costBreakdown.testing)],
      ['Engineering', formatCurrency(costBreakdown.engineering)],
    ], y, margin + 90);
    y = drawSubtotalRow('Total Labor', formatCurrency(costBreakdown.totalLabor), y);

    y = drawSectionHeader('Overhead & Margin', y);
    y = drawTable([
      ['Facility Overhead', formatCurrency(costBreakdown.facilityOverhead)],
      ['Quality Control', formatCurrency(costBreakdown.qualityControl)],
      ['Shipping', formatCurrency(costBreakdown.shipping)],
      ['Warranty Reserve', formatCurrency(costBreakdown.warrantyReserve)],
      ['Profit Margin (12%)', formatCurrency(costBreakdown.profitMargin)],
    ], y, margin + 90);
    y = drawSubtotalRow('Grand Total', formatCurrency(costBreakdown.totalCost), y);

    y += 4;
    y = drawSectionHeader('Lifecycle Cost Analysis  (25 yr · $0.10/kWh · 50% load factor)', y);
    y = drawTable([
      ['Initial Cost', formatCurrency(lifecycleCost.initialCost)],
      ['Annual Loss Cost', formatCurrency(lifecycleCost.annualLossCost)],
      ['25-Year Total Cost of Ownership', formatCurrency(lifecycleCost.totalLifecycleCost)],
    ], y, margin + 90);

    // Disclaimer
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(140, 140, 140);
    pdf.text('Budgetary estimates for planning purposes only. Actual costs vary by supplier and market conditions.', margin, y + 4);
    pdf.setTextColor(30, 30, 30);

    // ── Page 4 (pro): PIP ELSTR01 Specification ────────────────────────────────

    let pageNum = 4;

    if (specMode === 'pro') {
      pdf.addPage();
      addPageHeader(pageNum, 'PIP ELSTR01 Specification');
      y = 22;
      pageNum++;

      const specSections: [string, [string, string][]][] = [
        ['Site Conditions (4.1.1)', [
          ['Altitude', proSpec.siteConditions.altitude ? `${proSpec.siteConditions.altitude} ${proSpec.siteConditions.altitudeUnit || 'ft'}` : 'N/A'],
          ['Max Ambient Temp', proSpec.siteConditions.ambientTempMax != null ? `${proSpec.siteConditions.ambientTempMax}°C` : 'N/A'],
          ['Seismic Qualification', proSpec.siteConditions.seismicQualification === 'required' ? 'Required' : 'Not Required'],
        ]],
        ['Certifications (4.1.3–4.1.4)', [
          ['NRTL Listing', proSpec.nrtlListing === 'required' ? 'Required' : 'Not Required'],
          ['FM Approved', proSpec.fmApproved === 'required' ? 'Required' : 'Not Required'],
        ]],
        ['Windings & Temp Rise (4.2.1)', [
          ['Temp Rise', `${proSpec.windingsAndTempRise.averageTempRise || 65}°C`],
          ['Primary', `${proSpec.windingsAndTempRise.primaryConnection === 'delta' ? 'Delta' : 'Wye'} — ${proSpec.windingsAndTempRise.primaryMaterial === 'copper' ? 'Copper' : 'Aluminum'}`],
          ['Secondary', `${proSpec.windingsAndTempRise.secondaryConnection === 'delta' ? 'Delta' : 'Wye'} — ${proSpec.windingsAndTempRise.secondaryMaterial === 'copper' ? 'Copper' : 'Aluminum'}`],
        ]],
        ['Bushings (4.2.3)', [
          ['Primary Mounting', proSpec.bushingsPrimary.sideMounted ? 'Side' : 'Top'],
          ['Primary Material', proSpec.bushingsPrimary.material || 'Porcelain'],
          ['Secondary Mounting', proSpec.bushingsSecondary.sideMounted ? 'Side' : 'Top'],
        ]],
        ['Tank (4.2.4)', [
          ['Cover', proSpec.tank.coverType === 'welded' ? 'Welded' : 'Bolted'],
          ['Vacuum Rated', proSpec.tank.tankVacuumRated === 'required' ? 'Required' : 'Not Required'],
        ]],
        ['Cooling (4.2.5)', [
          ['Radiator Type', proSpec.cooling.radiatorType === 'mfg_std' ? 'Mfg. Standard' : proSpec.cooling.radiatorType || 'N/A'],
          ['Fans', proSpec.fans.status === 'required' ? 'Required' : proSpec.fans.status === 'provisions_for_future' ? 'Provisions' : 'Not Required'],
        ]],
        ['Tap Changer (4.2.12)', [
          ['NLTC', proSpec.tapChanger.noLoad.required === 'required' ? `Required — ${proSpec.tapChanger.noLoad.description || ''}` : 'Not Required'],
          ['OLTC', proSpec.tapChanger.onLoad.required === 'required' ? `Required — ${proSpec.tapChanger.onLoad.regulationRange || ''}` : 'Not Required'],
        ]],
        ['Insulating Liquid (4.3)', [
          ['Type', proSpec.insulatingLiquid.type === 'mineral_type_i' ? 'Mineral Oil (Type I)' : proSpec.insulatingLiquid.type || 'N/A'],
          ['Preservation', proSpec.liquidPreservation.type === 'sealed_tank' ? 'Sealed Tank' : proSpec.liquidPreservation.type || 'N/A'],
        ]],
        ['Coatings (4.2.11)', [
          ['Color', proSpec.coatings.color === 'ansi_70' ? 'ANSI 70 (Medium Gray)' : proSpec.coatings.color === 'ansi_61' ? 'ANSI 61 (Light Gray)' : 'Other'],
        ]],
        ['Tests (4.4)', [
          ['No-Load & Load Loss', proSpec.tests.noLoadAndLoadLoss ? 'Yes' : 'No'],
          ['Witnessed', proSpec.tests.witnessed === 'witnessed' ? 'Witnessed' : 'Not Witnessed'],
        ]],
      ];

      for (const [sectionTitle, fields] of specSections) {
        const sectionHeight = 7 + fields.length * 6.5 + 6;
        if (y + sectionHeight > pageHeight - 16) {
          pdf.addPage();
          addPageHeader(pageNum, 'PIP ELSTR01 Specification');
          pageNum++;
          y = 22;
        }
        y = drawSectionHeader(sectionTitle, y);
        y = drawTable(fields as [string, string][], y);
      }

      if (proSpec.otherRequirements) {
        const lines = pdf.splitTextToSize(proSpec.otherRequirements, contentWidth - 6);
        const blockHeight = 7 + lines.length * lineHeight + 4;
        if (y + blockHeight > pageHeight - 16) {
          pdf.addPage();
          addPageHeader(pageNum, 'PIP ELSTR01 Specification');
          pageNum++;
          y = 22;
        }
        y = drawSectionHeader('Other Requirements', y);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(60, 60, 60);
        pdf.text(lines, margin + 3, y);
        y += lines.length * lineHeight + 4;
        pdf.setTextColor(30, 30, 30);
      }
    }

    // ── Final page: Technical Drawings ────────────────────────────────────────

    const drawingsContainer = document.getElementById('drawings-container');
    if (drawingsContainer) {
      pdf.addPage();
      addPageHeader(pageNum, 'Technical Drawings');

      const canvas = await html2canvas(drawingsContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const drawingY = 20;
      const maxDrawingHeight = pageHeight - drawingY - 14;

      pdf.addImage(imgData, 'PNG', margin, drawingY, imgWidth, Math.min(imgHeight, maxDrawingHeight));
    }

    pdf.save(`fluxco-spec-${requirements.ratedPower}kva-${requirements.primaryVoltage}v-${requirements.secondaryVoltage}v.pdf`);
  };

  const handleMarketplaceSubmit = async () => {
    if (!design) return;

    setMarketplaceSubmitting(true);

    const costBreakdown = calculateCostEstimate(design, requirements, { oilType: 'mineral' });

    // Round numeric values to fit database column constraints
    const round2 = (n: number | null | undefined) => n != null ? Math.round(n * 100) / 100 : null;
    const efficiency = design.losses.efficiency.find(e => e.loadPercent === 100)?.efficiency;

    const listingData = {
      rated_power_kva: requirements.ratedPower,
      primary_voltage: requirements.primaryVoltage,
      secondary_voltage: requirements.secondaryVoltage,
      frequency: requirements.frequency,
      phases: requirements.phases,
      impedance_percent: round2(design.impedance.percentZ),
      vector_group: requirements.vectorGroup.name,
      cooling_class: requirements.coolingClass.name,
      conductor_type: requirements.conductorType.name,
      steel_grade: requirements.steelGrade.name,
      estimated_cost: round2(costBreakdown.totalCost),
      no_load_loss_w: round2(design.losses.noLoadLoss),
      load_loss_w: round2(design.losses.loadLoss),
      efficiency_percent: round2(efficiency),
      total_weight_kg: round2(design.core.coreWeight + design.hvWinding.conductorWeight + design.lvWinding.conductorWeight),
      contact_name: marketplaceForm.contactName,
      contact_email: marketplaceForm.contactEmail,
      contact_phone: marketplaceForm.contactPhone || null,
      asking_price: null,
      notes: [
        marketplaceForm.zipcode ? `Zipcode: ${marketplaceForm.zipcode}` : null,
        requirements.coolingClass.id !== 'onan' ? `Power Rating: ${calculatePowerRatings(requirements.ratedPower, requirements.coolingClass.id).display}` : null,
      ].filter(Boolean).join('. ') || null,
      zipcode: marketplaceForm.zipcode || null,
      spec_mode: specMode,
      status: 'listed',
      design_specs: {
        spec_mode: specMode,
        ...(specMode === 'pro' ? { proSpec } : {}),
        requirements: {
          ratedPower: requirements.ratedPower,
          primaryVoltage: requirements.primaryVoltage,
          secondaryVoltage: requirements.secondaryVoltage,
          frequency: requirements.frequency,
          phases: requirements.phases,
          vectorGroup: requirements.vectorGroup.name,
          coolingClass: requirements.coolingClass.name,
          conductorType: requirements.conductorType.name,
          steelGrade: requirements.steelGrade.name,
          altitude: requirements.altitude,
          ambientTemperature: requirements.ambientTemperature,
          tapChangerType: requirements.tapChangerType || 'noLoad',
          oilType: requirements.oilType || 'mineral',
          oilPreservation: requirements.oilPreservation || 'conservator',
          includeTAC: requirements.includeTAC || false,
          manufacturingRegions: requirements.manufacturingRegions || ['usa'],
          requireFEOC: requirements.requireFEOC ?? true,
        },
        performance: {
          impedancePercent: round2(design.impedance.percentZ),
          noLoadLossW: round2(design.losses.noLoadLoss),
          loadLossW: round2(design.losses.loadLoss),
          efficiencyPercent: round2(efficiency),
          topOilRiseC: round2(design.thermal.topOilRise),
          avgWindingRiseC: round2(design.thermal.averageWindingRise),
          hotSpotTempC: round2(design.thermal.hotSpotRise + (requirements.ambientTemperature || 30)),
        },
        physical: {
          totalWeightKg: round2(design.core.coreWeight + design.hvWinding.conductorWeight + design.lvWinding.conductorWeight),
          coreWeightKg: round2(design.core.coreWeight),
        },
        cost: {
          totalCost: round2(costBreakdown.totalCost),
          costPerKVA: round2(costBreakdown.costPerKVA),
        },
        powerRating: calculatePowerRatings(requirements.ratedPower, requirements.coolingClass.id).display,
      },
    };

    // Use API route to bypass RLS
    const response = await fetch('/api/marketplace/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(listingData),
    });

    const result = await response.json();

    setMarketplaceSubmitting(false);

    if (!response.ok) {
      alert('Error submitting to marketplace: ' + result.error);
    } else {
      setMarketplaceSuccess(true);
      setTimeout(() => {
        setMarketplaceOpen(false);
        setMarketplaceSuccess(false);
        setMarketplaceForm({
          contactName: '',
          contactEmail: '',
          contactPhone: '',
          zipcode: '',
        });
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Loading Animation */}
      {isCalculating && (
        <DesignCalculationLoader
          onComplete={handleCalculationComplete}
          ratedPower={requirements.ratedPower}
          primaryVoltage={requirements.primaryVoltage}
          secondaryVoltage={requirements.secondaryVoltage}
        />
      )}

      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity w-fit">
            <div className="p-2 bg-primary rounded-lg">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Fluxco</h1>
              <p className="text-sm text-muted-foreground">Spec Builder</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Input Form */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Design Requirements</CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="spec-mode" className={`text-sm ${specMode === 'lite' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>Lite</Label>
              <Switch
                id="spec-mode"
                checked={specMode === 'pro'}
                onCheckedChange={(checked) => setSpecMode(checked ? 'pro' : 'lite')}
              />
              <Label htmlFor="spec-mode" className={`text-sm ${specMode === 'pro' ? 'text-blue-600 font-medium' : 'text-muted-foreground'}`}>Pro</Label>
            </div>
          </CardHeader>
          <CardContent>
            {specMode === 'lite' ? (
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Design Results</h2>
              <div className="flex gap-2">
                <Button onClick={handleExportPDF} variant="outline">
                  <FileDown className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Dialog open={marketplaceOpen} onOpenChange={setMarketplaceOpen}>
                  <DialogTrigger asChild>
                    <Button variant="default">
                      <Store className="h-4 w-4 mr-2" />
                      Post to Marketplace
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Post to Marketplace</DialogTitle>
                      <DialogDescription>
                        Submit this {requirements.ratedPower} kVA transformer design to the supplier marketplace.
                      </DialogDescription>
                    </DialogHeader>
                    {marketplaceSuccess ? (
                      <div className="py-8 text-center">
                        <p className="text-green-500 font-semibold">Successfully submitted!</p>
                        <p className="text-sm text-muted-foreground mt-2">Your listing is pending review.</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="contactName">Your Name *</Label>
                              <Input
                                id="contactName"
                                value={marketplaceForm.contactName}
                                onChange={(e) => setMarketplaceForm(f => ({ ...f, contactName: e.target.value }))}
                                placeholder="John Smith"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="contactEmail">Email *</Label>
                              <Input
                                id="contactEmail"
                                type="email"
                                value={marketplaceForm.contactEmail}
                                onChange={(e) => setMarketplaceForm(f => ({ ...f, contactEmail: e.target.value }))}
                                placeholder="you@company.com"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="contactPhone">Phone</Label>
                              <Input
                                id="contactPhone"
                                value={marketplaceForm.contactPhone}
                                onChange={(e) => setMarketplaceForm(f => ({ ...f, contactPhone: e.target.value }))}
                                placeholder="+1 (555) 000-0000"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="zipcode">Project Zipcode *</Label>
                              <Input
                                id="zipcode"
                                value={marketplaceForm.zipcode}
                                onChange={(e) => setMarketplaceForm(f => ({ ...f, zipcode: e.target.value }))}
                                placeholder="12345"
                              />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={handleMarketplaceSubmit}
                            disabled={!marketplaceForm.contactName || !marketplaceForm.contactEmail || !marketplaceForm.zipcode || marketplaceSubmitting}
                          >
                            {marketplaceSubmitting ? 'Submitting...' : 'Submit Listing'}
                          </Button>
                        </DialogFooter>
                      </>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className={`grid w-full ${specMode === 'pro' ? 'grid-cols-6' : 'grid-cols-5'}`}>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                {specMode === 'pro' && <TabsTrigger value="specifications">Specifications</TabsTrigger>}
                <TabsTrigger value="calculations">Calculations</TabsTrigger>
                <TabsTrigger value="drawings">Drawings</TabsTrigger>
                <TabsTrigger value="bom">BOM</TabsTrigger>
                <TabsTrigger value="cost">Cost Estimate</TabsTrigger>
              </TabsList>

              <TabsContent value="summary">
                <DesignSummary design={design} requirements={requirements} />
              </TabsContent>

              {specMode === 'pro' && (
                <TabsContent value="specifications">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">PIP ELSTR01 Specification Sheet</CardTitle>
                      <p className="text-sm text-muted-foreground">Full procurement specification as configured in Pro mode</p>
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
                    <p className="text-sm text-muted-foreground">Complete manufacturing drawings with dimensions</p>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={activeDrawingTab} onValueChange={setActiveDrawingTab}>
                      <TabsList className="grid w-full grid-cols-3 mb-4">
                        <TabsTrigger value="assembly-front" className="text-xs">Front View</TabsTrigger>
                        <TabsTrigger value="assembly-side" className="text-xs">Side View</TabsTrigger>
                        <TabsTrigger value="assembly-top" className="text-xs">Top View</TabsTrigger>
                      </TabsList>

                      <div id="drawings-container">
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

                      </div>
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
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-4 flex flex-col items-center gap-1">
          <p className="text-sm text-muted-foreground text-center">
            Fluxco Spec Builder. Always verify results with a qualified electrical engineer.
          </p>
          <a href="tel:+15128593335" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            (512) 859-3335
          </a>
        </div>
      </footer>
    </div>
  );
}

export default TransformerDesigner;
