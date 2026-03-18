"use client";

import { Info } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DesignRequirements } from "@/engine/types/transformer.types";
import type { ProSpecData } from "@/engine/types/proSpec.types";
import { COOLING_CLASSES, VECTOR_GROUPS, calculatePowerRatings } from "@/engine/constants/materials";

interface ReadOnlySpecSheetProps {
  requirements: DesignRequirements;
  proSpec?: ProSpecData | null;
  specMode: "lite" | "pro";
}

function Row({ label, value }: { label: string; value: string | number | undefined | null | boolean }) {
  if (value === undefined || value === null || value === "") return null;
  const display = typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);
  return (
    <div className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-sm font-medium text-right max-w-[60%]">{display}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const hasContent = Array.isArray(children)
    ? children.some((c) => c !== null && c !== undefined)
    : children !== null && children !== undefined;
  if (!hasContent) return null;
  return (
    <AccordionItem value={title}>
      <AccordionTrigger className="text-base">{title}</AccordionTrigger>
      <AccordionContent className="pt-2">{children}</AccordionContent>
    </AccordionItem>
  );
}

const formatV = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)} kV` : `${v} V`);

const reqLabel = (v?: string) => {
  if (v === "required") return "Required";
  if (v === "not_required") return "Not Required";
  return v || "—";
};

export function ReadOnlySpecSheet({ requirements: r, proSpec: p, specMode }: ReadOnlySpecSheetProps) {
  const powerDisplay = calculatePowerRatings(r.ratedPower, r.coolingClass.id).display;

  const allSections = [
    "Rating & System Parameters",
    ...(specMode === "pro" && p
      ? [
          "Site Conditions",
          "Certifications",
          "Windings & Temperature Rise",
          "Losses & Efficiency Evaluation",
          "Bushings — Primary",
          "Bushings — Secondary",
          "Air Terminal Chamber",
          "Tank",
          "Cooling",
          "Space Heaters",
          "Accessories",
          "Protection Devices",
          "Alarm & Control",
          "Nameplates",
          "Wiring & Control Cabinet",
          "Coatings",
          "Tap Changer",
          "BIL (Basic Insulation Level)",
          "Insulating Liquid",
          "Tests",
          "Other Requirements",
        ]
      : []),
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          Transformer Specification
          <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {specMode === "pro" ? "PIP ELSTR01" : "Lite"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={allSections} className="w-full">
          {/* Rating & System */}
          <Section title="Rating & System Parameters">
            <Row label="Base Rating" value={powerDisplay} />
            <Row label="Primary Voltage" value={formatV(r.primaryVoltage)} />
            <Row label="Secondary Voltage" value={formatV(r.secondaryVoltage)} />
            <Row label="Frequency" value={`${r.frequency} Hz`} />
            <Row label="Phases" value={`${r.phases}-Phase`} />
            <Row label="Vector Group" value={r.vectorGroup.name} />
            <Row label="Cooling Class" value={r.coolingClass.name} />
            <Row label="Target Impedance" value={`${r.targetImpedance}%`} />
            <Row label="Conductor" value={r.conductorType.name} />
            <Row label="Core Steel" value={r.steelGrade.name} />
            <Row label="Tap Changer" value={r.tapChangerType === "onLoad" ? "On-Load (OLTC)" : r.tapChangerType === "noLoad" ? "No-Load (NLTC)" : r.tapChangerType} />
            <Row label="Oil Type" value={r.oilType} />
            <Row label="Oil Preservation" value={r.oilPreservation} />
            <Row label="Includes TAC" value={r.includeTAC} />
            <Row label="Manufacturing Regions" value={r.manufacturingRegions?.map((rg: string) => rg === "usa" ? "USA" : rg === "north_america" ? "N. America" : rg === "global" ? "Global" : rg).join(", ")} />
            <Row label="FEOC Required" value={r.requireFEOC} />
            <Row label="Altitude" value={r.altitude ? `${r.altitude} m` : undefined} />
            <Row label="Ambient Temperature" value={r.ambientTemperature ? `${r.ambientTemperature}°C` : undefined} />
          </Section>

          {/* Pro sections */}
          {specMode === "pro" && p && (
            <>
              <Section title="Site Conditions">
                <Row label="Altitude" value={p.siteConditions.altitude ? `${p.siteConditions.altitude} ${p.siteConditions.altitudeUnit || "ft"}` : undefined} />
                <Row label="Max Ambient Temp" value={p.siteConditions.ambientTempMax ? `${p.siteConditions.ambientTempMax}°C` : undefined} />
                <Row label="Min Ambient Temp" value={p.siteConditions.ambientTempMin ? `${p.siteConditions.ambientTempMin}°C` : undefined} />
                <Row label="24hr Avg Ambient" value={p.siteConditions.ambientTempAvg24hr ? `${p.siteConditions.ambientTempAvg24hr}°C` : undefined} />
                <Row label="Seismic Qualification" value={reqLabel(p.siteConditions.seismicQualification)} />
                <Row label="Seismic Standards" value={p.siteConditions.seismicStandards} />
                <Row label="Area Classification" value={p.siteConditions.areaClassification} />
                <Row label="Moist/Corrosive Environment" value={p.siteConditions.moistCorrosiveEnvironment} />
              </Section>

              <Section title="Certifications">
                <Row label="NRTL Listing" value={reqLabel(p.nrtlListing)} />
                <Row label="FM Approved" value={reqLabel(p.fmApproved)} />
              </Section>

              <Section title="Windings & Temperature Rise">
                <Row label="Avg Temperature Rise" value={p.windingsAndTempRise.averageTempRise ? `${p.windingsAndTempRise.averageTempRise}°C` : undefined} />
                <Row label="Primary Connection" value={p.windingsAndTempRise.primaryConnection} />
                <Row label="Primary Material" value={p.windingsAndTempRise.primaryMaterial} />
                <Row label="Secondary Connection" value={p.windingsAndTempRise.secondaryConnection} />
                <Row label="Secondary Material" value={p.windingsAndTempRise.secondaryMaterial} />
                <Row label="Frequent Energizing Under Load" value={p.windingsAndTempRise.frequentEnergizingUnderLoad} />
                <Row label="Rapid Cycling / Surge" value={p.windingsAndTempRise.rapidCyclingOrSurge} />
                <Row label="Captive with Larger Motor" value={p.windingsAndTempRise.captiveWithLargerMotor} />
                {p.windingsAndTempRise.captiveWithLargerMotor && (
                  <>
                    <Row label="Motor HP" value={p.windingsAndTempRise.motorHP} />
                    <Row label="Motor Volts" value={p.windingsAndTempRise.motorVolts} />
                    <Row label="Motor FLA" value={p.windingsAndTempRise.motorFLA} />
                    <Row label="Motor LRA" value={p.windingsAndTempRise.motorLRA} />
                  </>
                )}
              </Section>

              <Section title="Losses & Efficiency Evaluation">
                <Row label="Loss Evaluation Required" value={p.losses.lossEvaluationRequired} />
                <Row label="$/kW Offset" value={p.losses.dollarPerKwOffset} />
                <Row label="Evaluation Load Point" value={p.losses.evaluationLoadPoint === "other" ? p.losses.evaluationLoadPointOther : p.losses.evaluationLoadPoint ? `${p.losses.evaluationLoadPoint}%` : undefined} />
              </Section>

              <Section title="Bushings — Primary">
                <Row label="Top Mounted" value={p.bushingsPrimary.topMounted} />
                <Row label="Side Mounted" value={p.bushingsPrimary.sideMounted} />
                <Row label="Material" value={p.bushingsPrimary.material} />
                <Row label="Connections" value={p.bushingsPrimary.connections} />
                <Row label="Under 1kV Type" value={p.bushingsPrimary.underOneKvType} />
              </Section>

              <Section title="Bushings — Secondary">
                <Row label="Top Mounted" value={p.bushingsSecondary.topMounted} />
                <Row label="Side Mounted" value={p.bushingsSecondary.sideMounted} />
                <Row label="Material" value={p.bushingsSecondary.material} />
                <Row label="Connections" value={p.bushingsSecondary.connections} />
                <Row label="Under 1kV Type" value={p.bushingsSecondary.underOneKvType} />
              </Section>

              <Section title="Air Terminal Chamber">
                <Row label="Required" value={reqLabel(p.airTerminalChamber.required)} />
                <Row label="Full Height" value={p.airTerminalChamber.fullHeight} />
                <Row label="Front Cover" value={p.airTerminalChamber.frontCover} />
                <Row label="Cable Entry" value={p.airTerminalChamber.cableEntry} />
                <Row label="Withstand Internal Fault" value={p.airTerminalChamber.withstandInternalFault} />
              </Section>

              <Section title="Tank">
                <Row label="Cover Type" value={p.tank.coverType} />
                <Row label="Continuously Welded" value={p.tank.coverContinuouslyWelded} />
                <Row label="SS Bottom Support" value={p.tank.stainlessSteelBottomSupport} />
                <Row label="Jacking Pads" value={reqLabel(p.tank.jackingPads)} />
                <Row label="Vacuum Rated" value={reqLabel(p.tank.tankVacuumRated)} />
              </Section>

              <Section title="Cooling">
                <Row label="Radiator Type" value={p.cooling.radiatorType === "other" ? p.cooling.radiatorTypeOther : p.cooling.radiatorType} />
                <Row label="Radiator Material" value={p.cooling.radiatorMaterial} />
                <Row label="Removable Radiators" value={p.cooling.removableRadiators} />
                <Row label="Auxiliary Cooling" value={reqLabel(p.auxiliaryCooling.required)} />
                <Row label="Fans" value={p.fans.status === "required" ? `Required (${p.fans.mounting || ""} mount)` : reqLabel(p.fans.status)} />
                <Row label="Cooling Pumps" value={reqLabel(p.coolingPumps)} />
              </Section>

              <Section title="Space Heaters">
                <Row label="Required For" value={p.spaceHeaters.requiredFor === "none" ? "Not Required" : p.spaceHeaters.requiredFor} />
                <Row label="Temperature to Maintain" value={p.spaceHeaters.temperatureToMaintain ? `${p.spaceHeaters.temperatureToMaintain}°C` : undefined} />
                <Row label="Ammeter" value={p.spaceHeaters.ammeter} />
                <Row label="LED Indicator" value={p.spaceHeaters.ledIndicator} />
              </Section>

              <Section title="Accessories">
                <Row label="Isolation Valve" value={p.accessories.isolationValve} />
                <Row label="Primary CTs" value={p.accessories.primaryCTs?.quantity ? `${p.accessories.primaryCTs.quantity}x, ratio ${p.accessories.primaryCTs.ratio || "—"}` : undefined} />
                <Row label="Secondary CTs" value={p.accessories.secondaryCTs?.quantity ? `${p.accessories.secondaryCTs.quantity}x, ratio ${p.accessories.secondaryCTs.ratio || "—"}` : undefined} />
              </Section>

              <Section title="Protection Devices">
                <Row label="Sudden Pressure Relay" value={reqLabel(p.suddenPressureRelay)} />
                <Row label="Surge Arresters" value={reqLabel(p.surgeArresters.required)} />
                <Row label="Surge Arrester Voltage" value={p.surgeArresters.voltageRating ? `${p.surgeArresters.voltageRating} kV` : undefined} />
                <Row label="Pressure Relief Vent" value={reqLabel(p.pressureReliefVent.required)} />
              </Section>

              <Section title="Alarm & Control">
                <Row label="Control Voltage" value={p.alarmAndControl.controlVoltage === "other" ? p.alarmAndControl.controlVoltageOther : p.alarmAndControl.controlVoltage} />
                <Row label="Hermetically Sealed Contacts" value={p.alarmAndControl.hermeticallySealedContacts} />
                <Row label="Intrinsically Safe Barriers" value={p.alarmAndControl.intrinsicallySafeBarriers} />
              </Section>

              <Section title="Nameplates">
                <Row label="Material" value={p.nameplates.material?.replace(/_/g, " ")} />
                <Row label="Lettering" value={p.nameplates.letteringColor?.replace(/_/g, " ")} />
              </Section>

              <Section title="Wiring & Control Cabinet">
                <Row label="Branch Circuit Protection" value={p.wiringAndControlCabinet.branchCircuitProtection} />
                <Row label="Conduit Type" value={p.wiringAndControlCabinet.conduitType?.replace(/_/g, " ")} />
              </Section>

              <Section title="Coatings">
                <Row label="Color" value={p.coatings.color === "other" ? p.coatings.colorOther : p.coatings.color?.replace(/_/g, " ")} />
                <Row label="Paint Thickness" value={p.coatings.paintThicknessMils ? `${p.coatings.paintThicknessMils} mils` : undefined} />
              </Section>

              <Section title="Tap Changer">
                <Row label="No-Load" value={reqLabel(p.tapChanger.noLoad.required)} />
                <Row label="No-Load Description" value={p.tapChanger.noLoad.description} />
                <Row label="On-Load" value={reqLabel(p.tapChanger.onLoad.required)} />
                <Row label="Regulation Range" value={p.tapChanger.onLoad.regulationRange} />
                <Row label="Steps" value={p.tapChanger.onLoad.steps} />
                <Row label="Auto Controlled" value={reqLabel(p.tapChanger.onLoad.autoControlled)} />
              </Section>

              <Section title="BIL (Basic Insulation Level)">
                <Row label="Primary BIL" value={p.bil.primaryBilKv ? `${p.bil.primaryBilKv} kV` : undefined} />
                <Row label="Secondary BIL" value={p.bil.secondaryBilKv ? `${p.bil.secondaryBilKv} kV` : undefined} />
              </Section>

              <Section title="Insulating Liquid">
                <Row label="Type" value={p.insulatingLiquid.type?.replace(/_/g, " ")} />
                <Row label="Preservation" value={p.liquidPreservation.type?.replace(/_/g, " ")} />
              </Section>

              <Section title="Tests">
                <Row label="No-Load & Load Loss" value={p.tests.noLoadAndLoadLoss} />
                <Row label="Temperature Rise" value={p.tests.tempRise} />
                <Row label="Lightning Impulse" value={p.tests.lightningImpulse} />
                <Row label="Switching Impulse" value={p.tests.switchingImpulse} />
                <Row label="Front of Wave" value={p.tests.frontOfWave} />
                <Row label="Audible Sound Level" value={p.tests.audibleSoundLevel} />
                <Row label="Frequency Response Analysis" value={reqLabel(p.tests.frequencyResponseAnalysis)} />
                <Row label="Witnessed" value={p.tests.witnessed === "witnessed" ? "Yes" : "No"} />
              </Section>

              <Section title="Other Requirements">
                <Row label="Notes" value={p.otherRequirements} />
              </Section>
            </>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
}
