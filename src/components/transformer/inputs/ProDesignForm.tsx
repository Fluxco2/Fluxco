"use client";
import { Calculator, Info, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { DesignRequirements } from '@/engine/types/transformer.types';
import type { ProSpecData } from '@/engine/types/proSpec.types';
import { CONDUCTOR_TYPES, COOLING_CLASSES, VECTOR_GROUPS, calculatePowerRatings } from '@/engine/constants/materials';

interface ProDesignFormProps {
  requirements: DesignRequirements;
  proSpec: ProSpecData;
  onChange: (requirements: DesignRequirements) => void;
  onProSpecChange: (proSpec: ProSpecData) => void;
  onCalculate: () => void;
  readOnly?: boolean;
}

function HelpText({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
      <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
      <span>{children}</span>
    </p>
  );
}

function SectionBadge({ filled, total }: { filled: number; total: number }) {
  const color = filled === total ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground';
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${color}`}>
      {filled}/{total}
    </span>
  );
}

function FieldRow({ children, cols = 2 }: { children: React.ReactNode; cols?: 2 | 3 }) {
  const gridClass = cols === 3 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2';
  return <div className={`grid gap-4 ${gridClass}`}>{children}</div>;
}

function RequiredNotRequired({
  value,
  onChange,
}: {
  value?: string;
  onChange: (v: 'required' | 'not_required') => void;
}) {
  return (
    <Select value={value || 'not_required'} onValueChange={(v) => onChange(v as 'required' | 'not_required')}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="required">Required</SelectItem>
        <SelectItem value="not_required">Not Required</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function ProDesignForm({
  requirements,
  proSpec,
  onChange,
  onProSpecChange,
  onCalculate,
  readOnly = false,
}: ProDesignFormProps) {
  const updateReq = <K extends keyof DesignRequirements>(key: K, value: DesignRequirements[K]) => {
    onChange({ ...requirements, [key]: value });
  };

  const updatePro = (path: string, value: unknown) => {
    const keys = path.split('.');
    const updated = structuredClone(proSpec);
    let obj: Record<string, unknown> = updated as unknown as Record<string, unknown>;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]] || typeof obj[keys[i]] !== 'object') {
        obj[keys[i]] = {};
      }
      obj = obj[keys[i]] as Record<string, unknown>;
    }
    obj[keys[keys.length - 1]] = value;
    onProSpecChange(updated);
  };

  return (
    <div className={`space-y-4 ${readOnly ? '[&_input]:pointer-events-none [&_input]:opacity-80 [&_select]:pointer-events-none [&_textarea]:pointer-events-none [&_textarea]:opacity-80 [&_button[role=combobox]]:pointer-events-none [&_button[role=checkbox]]:pointer-events-none [&_.cursor-pointer:not([data-state])]:pointer-events-none' : ''}`}>
      {!readOnly && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-sm text-blue-700 dark:text-blue-300">
          <strong>Pro Mode</strong> — PIP ELSTR01 data sheet format. All sections are optional — fill what applies to your project.
        </div>
      )}

      <Accordion type="multiple" defaultValue={["rating"]} className="w-full">

        {/* ============================================================ */}
        {/* RATING & SYSTEM PARAMETERS (4.1.1.3) */}
        {/* ============================================================ */}
        <AccordionItem value="rating">
          <AccordionTrigger className="text-base">
            <span className="flex items-center gap-3">Rating & System Parameters</span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <FieldRow cols={3}>
              <div className="space-y-2">
                <Label>Base Rating (kVA) <span className="text-red-500">*</span></Label>
                <Input
                  type="number" step="100" min="100" max="100000"
                  value={requirements.ratedPower}
                  onChange={(e) => updateReq('ratedPower', parseFloat(e.target.value) || 0)}
                  className="text-lg font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label>Primary Voltage <span className="text-red-500">*</span></Label>
                <Select value={requirements.primaryVoltage.toString()} onValueChange={(v) => updateReq('primaryVoltage', parseFloat(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4160">4.16 kV</SelectItem>
                    <SelectItem value="7200">7.2 kV</SelectItem>
                    <SelectItem value="12470">12.47 kV</SelectItem>
                    <SelectItem value="13200">13.2 kV</SelectItem>
                    <SelectItem value="13800">13.8 kV</SelectItem>
                    <SelectItem value="23000">23 kV</SelectItem>
                    <SelectItem value="34500">34.5 kV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Secondary Voltage <span className="text-red-500">*</span></Label>
                <Select value={requirements.secondaryVoltage.toString()} onValueChange={(v) => updateReq('secondaryVoltage', parseFloat(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="208">208 V</SelectItem>
                    <SelectItem value="240">240 V</SelectItem>
                    <SelectItem value="277">277 V</SelectItem>
                    <SelectItem value="480">480 V</SelectItem>
                    <SelectItem value="600">600 V</SelectItem>
                    <SelectItem value="4160">4,160 V</SelectItem>
                    <SelectItem value="13800">13.8 kV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FieldRow>

            <FieldRow cols={3}>
              <div className="space-y-2">
                <Label>Phases</Label>
                <Select value={requirements.phases.toString()} onValueChange={(v) => updateReq('phases', parseInt(v) as 1 | 3)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Phase</SelectItem>
                    <SelectItem value="1">1 Phase</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select value={requirements.frequency.toString()} onValueChange={(v) => updateReq('frequency', parseInt(v) as 50 | 60)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">60 Hz</SelectItem>
                    <SelectItem value="50">50 Hz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Vector Group</Label>
                <Select value={requirements.vectorGroup.id} onValueChange={(v) => { const vg = VECTOR_GROUPS.find(x => x.id === v); if (vg) updateReq('vectorGroup', vg); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {VECTOR_GROUPS.map(vg => <SelectItem key={vg.id} value={vg.id}>{vg.name} — {vg.description}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </FieldRow>

            <FieldRow cols={3}>
              <div className="space-y-2">
                <Label>Primary Grounding</Label>
                <Select defaultValue="ungrounded">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ungrounded">Ungrounded</SelectItem>
                    <SelectItem value="solidly_grounded">Solidly Grounded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Secondary Grounding</Label>
                <Select defaultValue="solidly_grounded">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solidly_grounded">Solidly Grounded</SelectItem>
                    <SelectItem value="ungrounded">Ungrounded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cooling Method</Label>
                <Select value={requirements.coolingClass.id} onValueChange={(v) => { const cc = COOLING_CLASSES.find(x => x.id === v); if (cc) updateReq('coolingClass', cc); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COOLING_CLASSES.map(cc => <SelectItem key={cc.id} value={cc.id}>{cc.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </FieldRow>

            <FieldRow>
              <div className="space-y-2">
                <Label>Conductor Type</Label>
                <Select value={requirements.conductorType.id} onValueChange={(v) => { const ct = CONDUCTOR_TYPES.find(x => x.id === v); if (ct) updateReq('conductorType', ct); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONDUCTOR_TYPES.map(ct => <SelectItem key={ct.id} value={ct.id}>{ct.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Impedance (%Z)</Label>
                <Select value={requirements.targetImpedance.toString()} onValueChange={(v) => updateReq('targetImpedance', parseFloat(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4.5">4.5%</SelectItem>
                    <SelectItem value="5.0">5.0%</SelectItem>
                    <SelectItem value="5.5">5.5%</SelectItem>
                    <SelectItem value="5.75">5.75% (Standard)</SelectItem>
                    <SelectItem value="6.0">6.0%</SelectItem>
                    <SelectItem value="6.5">6.5%</SelectItem>
                    <SelectItem value="7.0">7.0%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FieldRow>

            {/* Manufacturing Region & Compliance */}
            <div className="space-y-3 mt-2">
              <Label>Manufacturing Region & Compliance</Label>
              <p className="text-xs text-muted-foreground -mt-1">
                Select all regions you would accept. More regions = wider price and lead time range.
              </p>
              <div className="grid gap-2 md:grid-cols-2">
                {([
                  { id: 'usa' as const, label: 'USA', desc: 'Premium pricing, 26-52 week lead time', feoc: true },
                  { id: 'northAmerica' as const, label: 'North America', desc: 'USA/Canada/Mexico, 20-40 weeks', feoc: true },
                  { id: 'global' as const, label: 'Global (excl. China)', desc: 'Broader supplier pool, 16-36 weeks', feoc: true },
                  { id: 'china' as const, label: 'China', desc: 'Lowest pricing, 12-24 weeks', feoc: false },
                ]).map((region) => {
                  const regions = requirements.manufacturingRegions || ['usa'];
                  const isChecked = regions.includes(region.id);
                  const toggleRegion = () => {
                    const next = isChecked
                      ? regions.filter(r => r !== region.id)
                      : [...regions, region.id];
                    if (next.length > 0) updateReq('manufacturingRegions', next);
                  };
                  return (
                    <div
                      key={region.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-secondary/50 border-primary/30'
                          : 'bg-secondary/10 border-transparent opacity-60'
                      }`}
                      onClick={toggleRegion}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleRegion()}
                        className="mt-0.5"
                      />
                      <div>
                        <p className="text-sm font-medium">{region.label}</p>
                        <p className="text-xs text-muted-foreground">{region.desc}</p>
                        {!region.feoc && (
                          <p className="text-xs text-red-600 mt-0.5 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Not FEOC compliant
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* FEOC Compliance */}
              <div
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  requirements.requireFEOC
                    ? 'bg-green-500/10 border-green-500/40'
                    : 'bg-secondary/30 border-transparent'
                }`}
                onClick={() => updateReq('requireFEOC', !requirements.requireFEOC)}
              >
                <Checkbox
                  checked={requirements.requireFEOC ?? true}
                  onCheckedChange={(checked) => updateReq('requireFEOC', checked === true)}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    Require FEOC Compliance
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Required for IRA Section 45X tax credits, federal/state projects, and critical infrastructure.
                  </p>
                </div>
              </div>
              {requirements.requireFEOC && (requirements.manufacturingRegions || ['usa']).includes('china') && (
                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-700 dark:text-red-300">
                    <strong>Conflict:</strong> China is selected but does not meet FEOC requirements.
                    China will be excluded from your cost estimate while FEOC is required.
                  </p>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ============================================================ */}
        {/* SITE CONDITIONS (4.1.1) */}
        {/* ============================================================ */}
        <AccordionItem value="site">
          <AccordionTrigger className="text-base">
            <span className="flex items-center gap-3">Site Conditions <span className="text-xs text-muted-foreground">(4.1.1)</span></span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <FieldRow cols={3}>
              <div className="space-y-2">
                <Label>Altitude</Label>
                <div className="flex gap-2">
                  <Input type="number" value={proSpec.siteConditions.altitude || ''} onChange={(e) => updatePro('siteConditions.altitude', parseFloat(e.target.value) || undefined)} placeholder="2000" />
                  <Select value={proSpec.siteConditions.altitudeUnit || 'ft'} onValueChange={(v) => updatePro('siteConditions.altitudeUnit', v)}>
                    <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ft">ft</SelectItem>
                      <SelectItem value="m">m</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Max Ambient Temp (°C)</Label>
                <Input type="number" value={proSpec.siteConditions.ambientTempMax ?? ''} onChange={(e) => updatePro('siteConditions.ambientTempMax', parseFloat(e.target.value) || undefined)} placeholder="40" />
              </div>
              <div className="space-y-2">
                <Label>Min Ambient Temp (°C)</Label>
                <Input type="number" value={proSpec.siteConditions.ambientTempMin ?? ''} onChange={(e) => updatePro('siteConditions.ambientTempMin', parseFloat(e.target.value) || undefined)} placeholder="-25" />
              </div>
            </FieldRow>

            <FieldRow cols={3}>
              <div className="space-y-2">
                <Label>Average 24-hr Temp (°C)</Label>
                <Input type="number" value={proSpec.siteConditions.ambientTempAvg24hr ?? ''} onChange={(e) => updatePro('siteConditions.ambientTempAvg24hr', parseFloat(e.target.value) || undefined)} placeholder="30" />
              </div>
              <div className="space-y-2">
                <Label>Seismic Qualification</Label>
                <RequiredNotRequired value={proSpec.siteConditions.seismicQualification} onChange={(v) => updatePro('siteConditions.seismicQualification', v)} />
              </div>
              <div className="space-y-2">
                <Label>Area Classification</Label>
                <Select value={proSpec.siteConditions.areaClassification || 'non_classified'} onValueChange={(v) => updatePro('siteConditions.areaClassification', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="non_classified">Non-Classified</SelectItem>
                    <SelectItem value="classified">Classified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FieldRow>

            {proSpec.siteConditions.areaClassification === 'classified' && (
              <FieldRow cols={3}>
                <div className="space-y-2">
                  <Label>Class</Label>
                  <Input value={proSpec.siteConditions.areaClass || ''} onChange={(e) => updatePro('siteConditions.areaClass', e.target.value)} placeholder="I, II, III" />
                </div>
                <div className="space-y-2">
                  <Label>Division</Label>
                  <Input value={proSpec.siteConditions.areaDivision || ''} onChange={(e) => updatePro('siteConditions.areaDivision', e.target.value)} placeholder="1, 2" />
                </div>
                <div className="space-y-2">
                  <Label>Group</Label>
                  <Input value={proSpec.siteConditions.areaGroup || ''} onChange={(e) => updatePro('siteConditions.areaGroup', e.target.value)} placeholder="A, B, C, D" />
                </div>
              </FieldRow>
            )}

            <FieldRow>
              <div className="flex items-center gap-2">
                <Checkbox checked={proSpec.siteConditions.moistCorrosiveEnvironment || false} onCheckedChange={(v) => updatePro('siteConditions.moistCorrosiveEnvironment', !!v)} />
                <Label>Exposed to moist/moderate corrosive environment</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={proSpec.siteConditions.environmentalDataSheet || false} onCheckedChange={(v) => updatePro('siteConditions.environmentalDataSheet', !!v)} />
                <Label>Site environmental data sheet attached</Label>
              </div>
            </FieldRow>
          </AccordionContent>
        </AccordionItem>

        {/* ============================================================ */}
        {/* CERTIFICATIONS (4.1.3, 4.1.4) */}
        {/* ============================================================ */}
        <AccordionItem value="certifications">
          <AccordionTrigger className="text-base">
            <span className="flex items-center gap-3">Certifications <span className="text-xs text-muted-foreground">(4.1.3–4.1.4)</span></span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <FieldRow>
              <div className="space-y-2">
                <Label>NRTL Listing (4.1.3)</Label>
                <RequiredNotRequired value={proSpec.nrtlListing} onChange={(v) => onProSpecChange({ ...proSpec, nrtlListing: v })} />
                <HelpText>Nationally Recognized Testing Laboratory listing (e.g., UL, CSA)</HelpText>
              </div>
              <div className="space-y-2">
                <Label>FM Approved (4.1.4)</Label>
                <RequiredNotRequired value={proSpec.fmApproved} onChange={(v) => onProSpecChange({ ...proSpec, fmApproved: v })} />
                <HelpText>Factory Mutual approval for fire protection</HelpText>
              </div>
            </FieldRow>
          </AccordionContent>
        </AccordionItem>

        {/* ============================================================ */}
        {/* WINDINGS & TEMPERATURE RISE (4.2.1) */}
        {/* ============================================================ */}
        <AccordionItem value="windings">
          <AccordionTrigger className="text-base">
            <span className="flex items-center gap-3">Windings & Temperature Rise <span className="text-xs text-muted-foreground">(4.2.1)</span></span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <FieldRow cols={3}>
              <div className="space-y-2">
                <Label>Average Temp Rise</Label>
                <Select value={(proSpec.windingsAndTempRise.averageTempRise || 65).toString()} onValueChange={(v) => updatePro('windingsAndTempRise.averageTempRise', parseInt(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="55">55°C</SelectItem>
                    <SelectItem value="65">65°C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Primary Winding Material</Label>
                <Select value={proSpec.windingsAndTempRise.primaryMaterial || 'copper'} onValueChange={(v) => updatePro('windingsAndTempRise.primaryMaterial', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="copper">Copper</SelectItem>
                    <SelectItem value="aluminum">Aluminum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Secondary Winding Material</Label>
                <Select value={proSpec.windingsAndTempRise.secondaryMaterial || 'aluminum'} onValueChange={(v) => updatePro('windingsAndTempRise.secondaryMaterial', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="copper">Copper</SelectItem>
                    <SelectItem value="aluminum">Aluminum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FieldRow>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox checked={proSpec.windingsAndTempRise.frequentEnergizingUnderLoad || false} onCheckedChange={(v) => updatePro('windingsAndTempRise.frequentEnergizingUnderLoad', !!v)} />
                <Label>Subjected to frequent energizing under load</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={proSpec.windingsAndTempRise.rapidCyclingOrSurge || false} onCheckedChange={(v) => updatePro('windingsAndTempRise.rapidCyclingOrSurge', !!v)} />
                <Label>Rapid cycling, or repetitive surge loading (4.2.1.8)</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={proSpec.windingsAndTempRise.captiveWithLargerMotor || false} onCheckedChange={(v) => updatePro('windingsAndTempRise.captiveWithLargerMotor', !!v)} />
                <Label>Transformer shall be used as captive with a larger motor (4.2.1.9)</Label>
              </div>
            </div>

            {proSpec.windingsAndTempRise.captiveWithLargerMotor && (
              <FieldRow cols={3}>
                <div className="space-y-2">
                  <Label>Motor HP</Label>
                  <Input type="number" value={proSpec.windingsAndTempRise.motorHP || ''} onChange={(e) => updatePro('windingsAndTempRise.motorHP', parseFloat(e.target.value) || undefined)} />
                </div>
                <div className="space-y-2">
                  <Label>Motor Volts</Label>
                  <Input type="number" value={proSpec.windingsAndTempRise.motorVolts || ''} onChange={(e) => updatePro('windingsAndTempRise.motorVolts', parseFloat(e.target.value) || undefined)} />
                </div>
                <div className="space-y-2">
                  <Label>Motor FLA</Label>
                  <Input type="number" value={proSpec.windingsAndTempRise.motorFLA || ''} onChange={(e) => updatePro('windingsAndTempRise.motorFLA', parseFloat(e.target.value) || undefined)} />
                </div>
              </FieldRow>
            )}

            <div className="space-y-2">
              <Label>Multiple Winding Note</Label>
              <Input value={proSpec.windingsAndTempRise.multipleWindingNote || ''} onChange={(e) => updatePro('windingsAndTempRise.multipleWindingNote', e.target.value)} placeholder="e.g., LV side shall have (2) windings rated 1500kVA each" />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ============================================================ */}
        {/* IMPEDANCE & LOSSES (4.2.1.4, 4.2.2) */}
        {/* ============================================================ */}
        <AccordionItem value="losses">
          <AccordionTrigger className="text-base">
            <span className="flex items-center gap-3">Impedance & Losses <span className="text-xs text-muted-foreground">(4.2.1.4–4.2.2)</span></span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <FieldRow>
              <div className="space-y-2">
                <Label>Impedance (4.2.1.4)</Label>
                <Select value={proSpec.impedance.type || 'standard'} onValueChange={(v) => updatePro('impedance.type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="custom">Custom Value</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox checked={proSpec.losses.lossEvaluationRequired || false} onCheckedChange={(v) => updatePro('losses.lossEvaluationRequired', !!v)} />
                  <Label>Loss Evaluation Required</Label>
                </div>
                {proSpec.losses.lossEvaluationRequired && (
                  <div className="mt-2 space-y-2">
                    <Label>$ to offset 1 kW of losses</Label>
                    <Input type="number" value={proSpec.losses.dollarPerKwOffset || ''} onChange={(e) => updatePro('losses.dollarPerKwOffset', parseFloat(e.target.value) || undefined)} placeholder="e.g., 5000" />
                  </div>
                )}
              </div>
            </FieldRow>
            {proSpec.losses.lossEvaluationRequired && (
              <FieldRow cols={3}>
                <div className="space-y-2">
                  <Label>Evaluation Load Point</Label>
                  <Select value={proSpec.losses.evaluationLoadPoint || '75'} onValueChange={(v) => updatePro('losses.evaluationLoadPoint', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="40">40% Load</SelectItem>
                      <SelectItem value="75">75% Load</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Load Losses (kW)</Label>
                  <Input type="number" value={proSpec.losses.loadLossesKw || ''} onChange={(e) => updatePro('losses.loadLossesKw', parseFloat(e.target.value) || undefined)} />
                </div>
                <div className="space-y-2">
                  <Label>No-Load Losses (kW)</Label>
                  <Input type="number" value={proSpec.losses.noLoadLossesKw || ''} onChange={(e) => updatePro('losses.noLoadLossesKw', parseFloat(e.target.value) || undefined)} />
                </div>
              </FieldRow>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* ============================================================ */}
        {/* BUSHINGS & TERMINALS (4.2.3) */}
        {/* ============================================================ */}
        <AccordionItem value="bushings">
          <AccordionTrigger className="text-base">
            <span className="flex items-center gap-3">Bushings & Terminal Enclosures <span className="text-xs text-muted-foreground">(4.2.3)</span></span>
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-2">
            <h4 className="font-medium">Primary Bushings</h4>
            <FieldRow cols={3}>
              <div className="space-y-2">
                <Label>Mounting</Label>
                <Select value={proSpec.bushingsPrimary.sideMounted ? 'side' : 'top'} onValueChange={(v) => { updatePro('bushingsPrimary.sideMounted', v === 'side'); updatePro('bushingsPrimary.topMounted', v === 'top'); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">Top Mounted</SelectItem>
                    <SelectItem value="side">Side Mounted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Bushing Material</Label>
                <Select value={proSpec.bushingsPrimary.material || 'porcelain'} onValueChange={(v) => updatePro('bushingsPrimary.material', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="porcelain">Porcelain</SelectItem>
                    <SelectItem value="cycloaliphatic">Cycloaliphatic</SelectItem>
                    <SelectItem value="epoxy">Epoxy (LV 1.2 kV class only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Bushing Connections</Label>
                <Select value={proSpec.bushingsPrimary.connections || 'nema_4hole'} onValueChange={(v) => updatePro('bushingsPrimary.connections', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nema_4hole">NEMA 4-Hole Pad</SelectItem>
                    <SelectItem value="nema_12hole">NEMA 12-Hole Pad</SelectItem>
                    <SelectItem value="stud">Stud</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FieldRow>
            <div className="space-y-2">
              <Label>Special Notes (Primary)</Label>
              <Input value={proSpec.bushingsPrimary.specialNotes || ''} onChange={(e) => updatePro('bushingsPrimary.specialNotes', e.target.value)} placeholder="e.g., 600 Amp 35 kV Deadfront Bushing, radial configuration" />
            </div>

            <h4 className="font-medium pt-2">Secondary Bushings</h4>
            <FieldRow cols={3}>
              <div className="space-y-2">
                <Label>Mounting</Label>
                <Select value={proSpec.bushingsSecondary.sideMounted ? 'side' : 'top'} onValueChange={(v) => { updatePro('bushingsSecondary.sideMounted', v === 'side'); updatePro('bushingsSecondary.topMounted', v === 'top'); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">Top Mounted</SelectItem>
                    <SelectItem value="side">Side Mounted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Bushings &lt; 1 kV</Label>
                <Select value={proSpec.bushingsSecondary.underOneKvType || 'bolted'} onValueChange={(v) => updatePro('bushingsSecondary.underOneKvType', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welded">Welded</SelectItem>
                    <SelectItem value="bolted">Bolted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Bushing Connections</Label>
                <Select value={proSpec.bushingsSecondary.connections || 'nema_4hole'} onValueChange={(v) => updatePro('bushingsSecondary.connections', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nema_4hole">NEMA 4-Hole Pad</SelectItem>
                    <SelectItem value="nema_12hole">NEMA 12-Hole Pad</SelectItem>
                    <SelectItem value="stud">Stud</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FieldRow>
          </AccordionContent>
        </AccordionItem>

        {/* ============================================================ */}
        {/* AIR TERMINAL CHAMBER */}
        {/* ============================================================ */}
        <AccordionItem value="atc">
          <AccordionTrigger className="text-base">
            <span className="flex items-center gap-3">Air Terminal Chamber <span className="text-xs text-muted-foreground">(4.2.3)</span></span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <FieldRow cols={3}>
              <div className="space-y-2">
                <Label>Air Terminal Chamber</Label>
                <RequiredNotRequired value={proSpec.airTerminalChamber.required} onChange={(v) => updatePro('airTerminalChamber.required', v)} />
              </div>
              <div className="space-y-2">
                <Label>Material</Label>
                <Select value={proSpec.airTerminalChamber.material || 'mfg_std'} onValueChange={(v) => updatePro('airTerminalChamber.material', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mfg_std">Mfg. Standard</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Front Cover</Label>
                <Select value={proSpec.airTerminalChamber.frontCover || 'hinged'} onValueChange={(v) => updatePro('airTerminalChamber.frontCover', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bolted">Bolted</SelectItem>
                    <SelectItem value="hinged">Hinged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FieldRow>
            <FieldRow cols={3}>
              <div className="space-y-2">
                <Label>Internal Fault Level (kA)</Label>
                <Input type="number" value={proSpec.airTerminalChamber.internalFaultLevel || ''} onChange={(e) => updatePro('airTerminalChamber.internalFaultLevel', parseFloat(e.target.value) || undefined)} placeholder="< 13" />
              </div>
              <div className="space-y-2">
                <Label>Cable Entry</Label>
                <Select value={proSpec.airTerminalChamber.cableEntry || 'bottom'} onValueChange={(v) => updatePro('airTerminalChamber.cableEntry', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="sides">Sides</SelectItem>
                    <SelectItem value="bottom">Bottom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Min Space: Cable Entry to Bushing (in)</Label>
                <Input type="number" value={proSpec.airTerminalChamber.minSpaceCableEntryToBushing || ''} onChange={(e) => updatePro('airTerminalChamber.minSpaceCableEntryToBushing', parseFloat(e.target.value) || undefined)} placeholder="36" />
              </div>
            </FieldRow>
            <div className="flex items-center gap-2">
              <Checkbox checked={proSpec.airTerminalChamber.closeCoupledToSwitch || false} onCheckedChange={(v) => updatePro('airTerminalChamber.closeCoupledToSwitch', !!v)} />
              <Label>Close coupled to switch</Label>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ============================================================ */}
        {/* TANK (4.2.4) */}
        {/* ============================================================ */}
        <AccordionItem value="tank">
          <AccordionTrigger className="text-base">
            <span className="flex items-center gap-3">Tank <span className="text-xs text-muted-foreground">(4.2.4)</span></span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <FieldRow cols={3}>
              <div className="space-y-2">
                <Label>Tank Cover</Label>
                <Select value={proSpec.tank.coverType || 'welded'} onValueChange={(v) => updatePro('tank.coverType', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bolted">Bolted</SelectItem>
                    <SelectItem value="welded">Welded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tank Vacuum Rated</Label>
                <RequiredNotRequired value={proSpec.tank.tankVacuumRated} onChange={(v) => updatePro('tank.tankVacuumRated', v)} />
              </div>
              <div className="space-y-2">
                <Label>Jacking Pads</Label>
                <RequiredNotRequired value={proSpec.tank.jackingPads} onChange={(v) => updatePro('tank.jackingPads', v)} />
              </div>
            </FieldRow>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox checked={proSpec.tank.coverContinuouslyWelded || false} onCheckedChange={(v) => updatePro('tank.coverContinuouslyWelded', !!v)} />
                <Label>Tank cover continuously welded</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={proSpec.tank.stainlessSteelBottomSupport || false} onCheckedChange={(v) => updatePro('tank.stainlessSteelBottomSupport', !!v)} />
                <Label>Stainless steel bottom support members</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={proSpec.tank.manufacturerStandard || false} onCheckedChange={(v) => updatePro('tank.manufacturerStandard', !!v)} />
                <Label>Manufacturer&apos;s standard</Label>
              </div>
            </div>
            <FieldRow>
              <div className="space-y-2">
                <Label>Grounding Pads (4.2.4.7)</Label>
                <Select value={proSpec.groundingPads.material || 'stainless_steel'} onValueChange={(v) => updatePro('groundingPads.material', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stainless_steel">Stainless Steel</SelectItem>
                    <SelectItem value="copper_faced_steel">Copper-Faced Steel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FieldRow>
          </AccordionContent>
        </AccordionItem>

        {/* ============================================================ */}
        {/* COOLING (4.2.5) */}
        {/* ============================================================ */}
        <AccordionItem value="cooling">
          <AccordionTrigger className="text-base">
            <span className="flex items-center gap-3">Cooling, Fans & Pumps <span className="text-xs text-muted-foreground">(4.2.5)</span></span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <FieldRow cols={3}>
              <div className="space-y-2">
                <Label>Radiator Type</Label>
                <Select value={proSpec.cooling.radiatorType || 'mfg_std'} onValueChange={(v) => updatePro('cooling.radiatorType', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tube">Tube Type</SelectItem>
                    <SelectItem value="formed_sheet_metal">Formed Sheet Metal</SelectItem>
                    <SelectItem value="mfg_std">Mfg. Standard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Radiator Material</Label>
                <Select value={proSpec.cooling.radiatorMaterial || 'mfg_std'} onValueChange={(v) => updatePro('cooling.radiatorMaterial', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stainless_steel">Stainless Steel</SelectItem>
                    <SelectItem value="galv_steel">Galvanized Steel</SelectItem>
                    <SelectItem value="mfg_std">Mfg. Standard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fans (4.2.5)</Label>
                <Select value={proSpec.fans.status || 'not_required'} onValueChange={(v) => updatePro('fans.status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="required">Fans Required</SelectItem>
                    <SelectItem value="provisions_for_future">Provisions for Future Fans</SelectItem>
                    <SelectItem value="not_required">Not Required</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FieldRow>

            {proSpec.fans.status === 'required' && (
              <FieldRow>
                <div className="space-y-2">
                  <Label>Fan Mounting</Label>
                  <Select value={proSpec.fans.mounting || 'radiator'} onValueChange={(v) => updatePro('fans.mounting', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tank">Mounted on Tank</SelectItem>
                      <SelectItem value="radiator">Mounted on Radiator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fan Voltage</Label>
                  <Input value={proSpec.fans.voltage || ''} onChange={(e) => updatePro('fans.voltage', e.target.value)} placeholder="e.g., 120V" />
                </div>
              </FieldRow>
            )}

            <FieldRow>
              <div className="space-y-2">
                <Label>Auxiliary Cooling (4.2.5)</Label>
                <RequiredNotRequired value={proSpec.auxiliaryCooling.required} onChange={(v) => updatePro('auxiliaryCooling.required', v)} />
              </div>
              <div className="space-y-2">
                <Label>Cooling Pumps (4.2.5.9)</Label>
                <RequiredNotRequired value={proSpec.coolingPumps} onChange={(v) => onProSpecChange({ ...proSpec, coolingPumps: v })} />
              </div>
            </FieldRow>

            <div className="flex items-center gap-2">
              <Checkbox checked={proSpec.cooling.removableRadiators || false} onCheckedChange={(v) => updatePro('cooling.removableRadiators', !!v)} />
              <Label>Removable radiators required</Label>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ============================================================ */}
        {/* SPACE HEATERS (4.2.3) */}
        {/* ============================================================ */}
        <AccordionItem value="spaceheaters">
          <AccordionTrigger className="text-base">
            <span className="flex items-center gap-3">Space Heaters <span className="text-xs text-muted-foreground">(4.2.3)</span></span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <FieldRow>
              <div className="space-y-2">
                <Label>Space Heaters Required For</Label>
                <Select value={proSpec.spaceHeaters.requiredFor || 'none'} onValueChange={(v) => updatePro('spaceHeaters.requiredFor', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not Required</SelectItem>
                    <SelectItem value="primary_atc">Primary ATC Only</SelectItem>
                    <SelectItem value="secondary_atc">Secondary ATC Only</SelectItem>
                    <SelectItem value="both">Both ATCs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {proSpec.spaceHeaters.requiredFor !== 'none' && (
                <div className="space-y-2">
                  <Label>Temperature to Maintain (°F)</Label>
                  <Input type="number" value={proSpec.spaceHeaters.temperatureToMaintain ?? ''} onChange={(e) => updatePro('spaceHeaters.temperatureToMaintain', parseFloat(e.target.value) || undefined)} placeholder="40" />
                </div>
              )}
            </FieldRow>
            {proSpec.spaceHeaters.requiredFor !== 'none' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox checked={proSpec.spaceHeaters.ammeter || false} onCheckedChange={(v) => updatePro('spaceHeaters.ammeter', !!v)} />
                  <Label>Ammeter</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={proSpec.spaceHeaters.ledIndicator || false} onCheckedChange={(v) => updatePro('spaceHeaters.ledIndicator', !!v)} />
                  <Label>LED indicator</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={proSpec.spaceHeaters.pushToTestLed || false} onCheckedChange={(v) => updatePro('spaceHeaters.pushToTestLed', !!v)} />
                  <Label>Push-to-test LED</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={proSpec.spaceHeaters.thermostatWithBypass || false} onCheckedChange={(v) => updatePro('spaceHeaters.thermostatWithBypass', !!v)} />
                  <Label>Thermostat with bypass</Label>
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* ============================================================ */}
        {/* ACCESSORIES & CTs (4.2.6) */}
        {/* ============================================================ */}
        <AccordionItem value="accessories">
          <AccordionTrigger className="text-base">
            <span className="flex items-center gap-3">Accessories & Current Transformers <span className="text-xs text-muted-foreground">(4.2.6)</span></span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <Checkbox checked={proSpec.accessories.isolationValve || false} onCheckedChange={(v) => updatePro('accessories.isolationValve', !!v)} />
              <Label>Isolation valve for pressure vacuum gauge required</Label>
            </div>

            <h4 className="font-medium pt-2">Secondary CTs</h4>
            <FieldRow cols={3}>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input type="number" value={proSpec.accessories.secondaryCTs?.quantity || ''} onChange={(e) => updatePro('accessories.secondaryCTs.quantity', parseInt(e.target.value) || undefined)} placeholder="12" />
              </div>
              <div className="space-y-2">
                <Label>Ratio</Label>
                <Input value={proSpec.accessories.secondaryCTs?.ratio || ''} onChange={(e) => updatePro('accessories.secondaryCTs.ratio', e.target.value)} placeholder="3000:5A" />
              </div>
              <div className="space-y-2">
                <Label>Purpose</Label>
                <Select value={proSpec.accessories.secondaryCTs?.purpose || 'relaying'} onValueChange={(v) => updatePro('accessories.secondaryCTs.purpose', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metering">Metering</SelectItem>
                    <SelectItem value="relaying">Relaying</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FieldRow>
            <div className="space-y-2">
              <Label>CT Location</Label>
              <Input value={proSpec.accessories.secondaryCTs?.location || ''} onChange={(e) => updatePro('accessories.secondaryCTs.location', e.target.value)} placeholder="e.g., Window-type CTs inside the LV ATCs" />
            </div>

            <div className="space-y-2">
              <Label>Other Accuracy Class</Label>
              <Input value={proSpec.accessories.otherAccuracyClass || ''} onChange={(e) => updatePro('accessories.otherAccuracyClass', e.target.value)} placeholder="e.g., C200" />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ============================================================ */}
        {/* PROTECTION (4.2.6.3-4.2.6.4) */}
        {/* ============================================================ */}
        <AccordionItem value="protection">
          <AccordionTrigger className="text-base">
            <span className="flex items-center gap-3">Protection Devices <span className="text-xs text-muted-foreground">(4.2.6.3–4.2.6.4)</span></span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <FieldRow cols={3}>
              <div className="space-y-2">
                <Label>Sudden Pressure Relay (63)</Label>
                <RequiredNotRequired value={proSpec.suddenPressureRelay} onChange={(v) => onProSpecChange({ ...proSpec, suddenPressureRelay: v })} />
              </div>
              <div className="space-y-2">
                <Label>Surge Arresters (4.2.6.4)</Label>
                <RequiredNotRequired value={proSpec.surgeArresters.required} onChange={(v) => updatePro('surgeArresters.required', v)} />
              </div>
              <div className="space-y-2">
                <Label>Pressure Relief Vent</Label>
                <RequiredNotRequired value={proSpec.pressureReliefVent.required} onChange={(v) => updatePro('pressureReliefVent.required', v)} />
              </div>
            </FieldRow>
          </AccordionContent>
        </AccordionItem>

        {/* ============================================================ */}
        {/* ALARM & CONTROL (4.2.8) */}
        {/* ============================================================ */}
        <AccordionItem value="alarm">
          <AccordionTrigger className="text-base">
            <span className="flex items-center gap-3">Alarm & Control Devices <span className="text-xs text-muted-foreground">(4.2.8)</span></span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <FieldRow cols={3}>
              <div className="space-y-2">
                <Label>Control Voltage</Label>
                <Select value={proSpec.alarmAndControl.controlVoltage || '125vdc'} onValueChange={(v) => updatePro('alarmAndControl.controlVoltage', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="120vac">120 VAC</SelectItem>
                    <SelectItem value="125vdc">125 VDC</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FieldRow>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox checked={proSpec.alarmAndControl.hermeticallySealedContacts || false} onCheckedChange={(v) => updatePro('alarmAndControl.hermeticallySealedContacts', !!v)} />
                <Label>Hermetically sealed contacts</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={proSpec.alarmAndControl.intrinsicallySafeBarriers || false} onCheckedChange={(v) => updatePro('alarmAndControl.intrinsicallySafeBarriers', !!v)} />
                <Label>Intrinsically safe barriers</Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ============================================================ */}
        {/* NAMEPLATES (4.2.8.5) */}
        {/* ============================================================ */}
        <AccordionItem value="nameplates">
          <AccordionTrigger className="text-base">
            <span className="flex items-center gap-3">Nameplates <span className="text-xs text-muted-foreground">(4.2.8.5)</span></span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <FieldRow>
              <div className="space-y-2">
                <Label>Nameplate Material</Label>
                <Select value={proSpec.nameplates.material || 'laminated_plastic'} onValueChange={(v) => updatePro('nameplates.material', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="laminated_plastic">Laminated Plastic</SelectItem>
                    <SelectItem value="vinyl_adhesive">Vinyl Adhesive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Lettering Color</Label>
                <Select value={proSpec.nameplates.letteringColor || 'black_on_white'} onValueChange={(v) => updatePro('nameplates.letteringColor', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="black_on_white">Black on White</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FieldRow>
            {proSpec.nameplates.letteringColor === 'other' && (
              <div className="space-y-2">
                <Label>Specify Lettering Color</Label>
                <Input value={proSpec.nameplates.letteringColorOther || ''} onChange={(e) => updatePro('nameplates.letteringColorOther', e.target.value)} placeholder="e.g., White on Black" />
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* ============================================================ */}
        {/* WIRING & CONTROL CABINET (4.2.9) */}
        {/* ============================================================ */}
        <AccordionItem value="wiring">
          <AccordionTrigger className="text-base">
            <span className="flex items-center gap-3">Wiring & Control Cabinet <span className="text-xs text-muted-foreground">(4.2.9)</span></span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <FieldRow>
              <div className="space-y-2">
                <Label>Conduit Type</Label>
                <Select value={proSpec.wiringAndControlCabinet.conduitType || 'rigid_galv_steel'} onValueChange={(v) => updatePro('wiringAndControlCabinet.conduitType', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rigid_galv_steel">Rigid Galvanized Steel</SelectItem>
                    <SelectItem value="liquid_tight">Liquid Tight</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Checkbox checked={proSpec.wiringAndControlCabinet.branchCircuitProtection || false} onCheckedChange={(v) => updatePro('wiringAndControlCabinet.branchCircuitProtection', !!v)} />
                <Label>Branch circuit protection required</Label>
              </div>
            </FieldRow>
            {proSpec.wiringAndControlCabinet.conduitType === 'other' && (
              <div className="space-y-2">
                <Label>Specify Conduit Type</Label>
                <Input value={proSpec.wiringAndControlCabinet.conduitTypeOther || ''} onChange={(e) => updatePro('wiringAndControlCabinet.conduitTypeOther', e.target.value)} />
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* ============================================================ */}
        {/* COATINGS & SOUND (4.2.10-4.2.11) */}
        {/* ============================================================ */}
        <AccordionItem value="coatings">
          <AccordionTrigger className="text-base">
            <span className="flex items-center gap-3">Coatings & Sound <span className="text-xs text-muted-foreground">(4.2.10–4.2.11)</span></span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <FieldRow cols={3}>
              <div className="space-y-2">
                <Label>Paint Color</Label>
                <Select value={proSpec.coatings.color || 'ansi_70'} onValueChange={(v) => updatePro('coatings.color', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ansi_61">ANSI 61 (Light Gray)</SelectItem>
                    <SelectItem value="ansi_70">ANSI 70 (Medium Gray)</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Paint Thickness (mils)</Label>
                <Input type="number" value={proSpec.coatings.paintThicknessMils || ''} onChange={(e) => updatePro('coatings.paintThicknessMils', parseFloat(e.target.value) || undefined)} />
              </div>
              <div className="space-y-2">
                <Label>Audible Sound Testing</Label>
                <RequiredNotRequired value={proSpec.audibleSound.testingRequired} onChange={(v) => updatePro('audibleSound.testingRequired', v)} />
              </div>
            </FieldRow>
          </AccordionContent>
        </AccordionItem>

        {/* ============================================================ */}
        {/* TAP CHANGER (4.2.12) */}
        {/* ============================================================ */}
        <AccordionItem value="tapchanger">
          <AccordionTrigger className="text-base">
            <span className="flex items-center gap-3">Tap Changer <span className="text-xs text-muted-foreground">(4.2.12)</span></span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <h4 className="font-medium">No-Load Tap Changer (4.2.12.1)</h4>
            <FieldRow>
              <div className="space-y-2">
                <Label>NLTC</Label>
                <RequiredNotRequired value={proSpec.tapChanger.noLoad.required} onChange={(v) => updatePro('tapChanger.noLoad.required', v)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={proSpec.tapChanger.noLoad.description || ''} onChange={(e) => updatePro('tapChanger.noLoad.description', e.target.value)} placeholder="5-pos. with four 2.5% taps - 2 above and 2 below" />
              </div>
            </FieldRow>

            <h4 className="font-medium pt-2">On-Load Tap Changer (4.2.12.2)</h4>
            <FieldRow>
              <div className="space-y-2">
                <Label>OLTC</Label>
                <RequiredNotRequired value={proSpec.tapChanger.onLoad.required} onChange={(v) => updatePro('tapChanger.onLoad.required', v)} />
              </div>
              {proSpec.tapChanger.onLoad.required === 'required' && (
                <div className="space-y-2">
                  <Label>Regulation Range / Steps</Label>
                  <Input value={proSpec.tapChanger.onLoad.regulationRange || ''} onChange={(e) => updatePro('tapChanger.onLoad.regulationRange', e.target.value)} placeholder="±10% with 16-16 steps" />
                </div>
              )}
            </FieldRow>
          </AccordionContent>
        </AccordionItem>

        {/* ============================================================ */}
        {/* BIL & HARMONICS (4.2.14-4.2.15) */}
        {/* ============================================================ */}
        <AccordionItem value="bil">
          <AccordionTrigger className="text-base">
            <span className="flex items-center gap-3">BIL & Harmonics <span className="text-xs text-muted-foreground">(4.2.14–4.2.15)</span></span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <FieldRow cols={3}>
              <div className="space-y-2">
                <Label>Primary BIL (kV)</Label>
                <Input type="number" value={proSpec.bil.primaryBilKv || ''} onChange={(e) => updatePro('bil.primaryBilKv', parseFloat(e.target.value) || undefined)} placeholder="150" />
                <HelpText>Per IEEE Std C57.12.00-2010 Tables 4 and 5</HelpText>
              </div>
              <div className="space-y-2">
                <Label>Secondary BIL (kV)</Label>
                <Input type="number" value={proSpec.bil.secondaryBilKv || ''} onChange={(e) => updatePro('bil.secondaryBilKv', parseFloat(e.target.value) || undefined)} placeholder="30" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 pt-6">
                  <Checkbox checked={proSpec.harmonics.nonLinearLoads || false} onCheckedChange={(v) => updatePro('harmonics.nonLinearLoads', !!v)} />
                  <Label>Transformer shall supply non-linear loads</Label>
                </div>
              </div>
            </FieldRow>
          </AccordionContent>
        </AccordionItem>

        {/* ============================================================ */}
        {/* INSULATING LIQUID (4.3) */}
        {/* ============================================================ */}
        <AccordionItem value="liquid">
          <AccordionTrigger className="text-base">
            <span className="flex items-center gap-3">Insulating Liquid & Preservation <span className="text-xs text-muted-foreground">(4.3)</span></span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <FieldRow>
              <div className="space-y-2">
                <Label>Insulating Liquid Type (4.3.1.2)</Label>
                <Select value={proSpec.insulatingLiquid.type || 'mineral_type_i'} onValueChange={(v) => updatePro('insulatingLiquid.type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mineral_type_i">Mineral Oil (Type I)</SelectItem>
                    <SelectItem value="mineral_type_ii">Mineral Oil (Type II)</SelectItem>
                    <SelectItem value="silicon">Silicon</SelectItem>
                    <SelectItem value="fire_resistant_ester">Fire Resistant Ester</SelectItem>
                    <SelectItem value="less_flammable_hc">Less Flammable HC</SelectItem>
                    <SelectItem value="mfg_discretion">MFG to determine based on loading</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Liquid Preservation System (4.3.2)</Label>
                <Select value={proSpec.liquidPreservation.type || 'sealed_tank'} onValueChange={(v) => updatePro('liquidPreservation.type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sealed_tank">Sealed Tank</SelectItem>
                    <SelectItem value="inert_gas">Inert Gas Pressure System</SelectItem>
                    <SelectItem value="conservator_without_diaphragm">Conservator (without diaphragm)</SelectItem>
                    <SelectItem value="conservator_with_diaphragm">Conservator (with diaphragm)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FieldRow>
          </AccordionContent>
        </AccordionItem>

        {/* ============================================================ */}
        {/* TESTS, SHIPPING & DOCS (4.4-4.6) */}
        {/* ============================================================ */}
        <AccordionItem value="tests">
          <AccordionTrigger className="text-base">
            <span className="flex items-center gap-3">Tests, Shipping & Documentation <span className="text-xs text-muted-foreground">(4.4–4.6)</span></span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <h4 className="font-medium">Tests (4.4)</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox checked={proSpec.tests.noLoadAndLoadLoss || false} onCheckedChange={(v) => updatePro('tests.noLoadAndLoadLoss', !!v)} />
                <Label>No load test and load loss test required</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={proSpec.tests.tempRise || false} onCheckedChange={(v) => updatePro('tests.tempRise', !!v)} />
                <Label>Temperature rise</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={proSpec.tests.lightningImpulse || false} onCheckedChange={(v) => updatePro('tests.lightningImpulse', !!v)} />
                <Label>Lightning impulse</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={proSpec.tests.switchingImpulse || false} onCheckedChange={(v) => updatePro('tests.switchingImpulse', !!v)} />
                <Label>Switching impulse</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={proSpec.tests.audibleSoundLevel || false} onCheckedChange={(v) => updatePro('tests.audibleSoundLevel', !!v)} />
                <Label>Audible sound level</Label>
              </div>
            </div>
            <FieldRow>
              <div className="space-y-2">
                <Label>Frequency Response Analysis</Label>
                <RequiredNotRequired value={proSpec.tests.frequencyResponseAnalysis} onChange={(v) => updatePro('tests.frequencyResponseAnalysis', v)} />
              </div>
              <div className="space-y-2">
                <Label>Witnessed</Label>
                <Select value={proSpec.tests.witnessed || 'not_witnessed'} onValueChange={(v) => updatePro('tests.witnessed', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="witnessed">Witnessed</SelectItem>
                    <SelectItem value="not_witnessed">Not Witnessed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FieldRow>

            <h4 className="font-medium pt-2">Shipping (4.5)</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox checked={proSpec.shipping.manufacturerStandard || false} onCheckedChange={(v) => updatePro('shipping.manufacturerStandard', !!v)} />
                <Label>Manufacturer&apos;s standard</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={proSpec.shipping.valvesSealedWithTags || false} onCheckedChange={(v) => updatePro('shipping.valvesSealedWithTags', !!v)} />
                <Label>Valves sealed with tags</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={proSpec.shipping.impactIndicator || false} onCheckedChange={(v) => updatePro('shipping.impactIndicator', !!v)} />
                <Label>Impact indicator required</Label>
              </div>
            </div>

            <h4 className="font-medium pt-2">Documentation (4.6)</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox checked={proSpec.documentation.designTestReportOnSimilar || false} onCheckedChange={(v) => updatePro('documentation.designTestReportOnSimilar', !!v)} />
                <Label>Design test report on similar units for following tests with quotation</Label>
              </div>
            </div>
            <FieldRow cols={3}>
              <div className="flex items-center gap-2">
                <Checkbox checked={proSpec.documentation.electronicFormatDwg || false} onCheckedChange={(v) => updatePro('documentation.electronicFormatDwg', !!v)} />
                <Label>DWG</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={proSpec.documentation.electronicFormatPdf || false} onCheckedChange={(v) => updatePro('documentation.electronicFormatPdf', !!v)} />
                <Label>PDF</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={proSpec.documentation.electronicFormat3dModel || false} onCheckedChange={(v) => updatePro('documentation.electronicFormat3dModel', !!v)} />
                <Label>3D Model</Label>
              </div>
            </FieldRow>
          </AccordionContent>
        </AccordionItem>

        {/* ============================================================ */}
        {/* OTHER REQUIREMENTS */}
        {/* ============================================================ */}
        <AccordionItem value="other">
          <AccordionTrigger className="text-base">
            <span className="flex items-center gap-3">Other Requirements</span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Special Requirements & Notes</Label>
              <Textarea
                rows={6}
                value={proSpec.otherRequirements || ''}
                onChange={(e) => onProSpecChange({ ...proSpec, otherRequirements: e.target.value })}
                placeholder={"1. Transformer manufacturer shall provide air-core impedance and windings resistance values.\n2. Transformer shall have (2) LV ATC cabinets on opposite sides.\n3. Primary side bushings rated for 600A, loop feed configuration.\n4. Visible disconnect switch on exterior of the unit."}
              />
              <HelpText>Add any requirements not covered by the sections above. Number each requirement.</HelpText>
            </div>
          </AccordionContent>
        </AccordionItem>

      </Accordion>

      {/* Summary */}
      <div className="bg-secondary/30 rounded-lg p-4">
        <h4 className="font-medium mb-2">Configuration Summary</h4>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4 text-sm">
          <div>
            <span className="text-muted-foreground">Power:</span>
            <span className="ml-2 font-medium">{calculatePowerRatings(requirements.ratedPower, requirements.coolingClass.id).display}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Voltages:</span>
            <span className="ml-2 font-medium">{(requirements.primaryVoltage / 1000).toFixed(1)}kV / {requirements.secondaryVoltage}V</span>
          </div>
          <div>
            <span className="text-muted-foreground">Vector Group:</span>
            <span className="ml-2 font-medium">{requirements.vectorGroup.name}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Mode:</span>
            <span className="ml-2 font-medium text-blue-600">Pro (PIP ELSTR01)</span>
          </div>
        </div>
      </div>

      {/* Calculate Button */}
      {!readOnly && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Calculate to see design, cost estimate, drawings, and full specification sheet.
          </p>
          <Button onClick={onCalculate} size="lg" className="w-full sm:w-auto">
            <Calculator className="w-5 h-5 mr-2" />
            Calculate Design & Cost
          </Button>
        </div>
      )}
    </div>
  );
}

export default ProDesignForm;
