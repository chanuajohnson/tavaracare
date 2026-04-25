import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import type { PricingCatalog } from '@/utils/lifecycleScenarios';
import { fmtUSD } from '@/utils/lifecycleScenarios';

export interface BuilderState {
  hourlyRate: number;
  hoursPerDay: number;
  daysPerWeek: number;
  subscription: 'active' | 'premium';
  addonMedication: boolean;
  addonSopMonitoring: boolean;
  addonMeal: boolean;
  addonSecondary: 'none' | 'light' | 'standard' | 'high' | 'podiatric';
  showWeek5Adjust: boolean;
  oneTimeSopActivation: boolean;
  oneTimeHomeReset: boolean;
}

interface Props {
  state: BuilderState;
  pricing: PricingCatalog;
  onChange: (next: BuilderState) => void;
}

export const LifecycleCostBuilder: React.FC<Props> = ({ state, pricing, onChange }) => {
  const update = <K extends keyof BuilderState>(k: K, v: BuilderState[K]) =>
    onChange({ ...state, [k]: v });

  const secondaryPrice = (() => {
    switch (state.addonSecondary) {
      case 'light': return pricing.addon_secondary_light;
      case 'standard': return pricing.addon_secondary_standard;
      case 'high': return pricing.addon_secondary_high;
      case 'podiatric': return pricing.addon_secondary_podiatric;
      default: return 0;
    }
  })();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Build a custom scenario</CardTitle>
        <p className="text-xs text-muted-foreground">
          Adjust to model a specific prospect's situation. The "Custom" column updates live.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-xs">Hourly rate</Label>
            <Slider
              min={30} max={60} step={1}
              value={[state.hourlyRate]}
              onValueChange={(v) => update('hourlyRate', v[0])}
            />
            <div className="text-sm font-medium">${state.hourlyRate}/hr</div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Hours / day</Label>
            <Slider
              min={4} max={12} step={1}
              value={[state.hoursPerDay]}
              onValueChange={(v) => update('hoursPerDay', v[0])}
            />
            <div className="text-sm font-medium">{state.hoursPerDay} hrs</div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Days / week</Label>
            <Slider
              min={1} max={7} step={1}
              value={[state.daysPerWeek]}
              onValueChange={(v) => update('daysPerWeek', v[0])}
            />
            <div className="text-sm font-medium">{state.daysPerWeek} days</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-md border p-3 space-y-2">
            <Label className="text-xs uppercase tracking-wide">Care management plan</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => update('subscription', 'active')}
                className={`flex-1 text-xs rounded-md border px-3 py-2 transition ${
                  state.subscription === 'active' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background'
                }`}
              >
                Active — {fmtUSD(pricing.sub_active)}/wk
              </button>
              <button
                type="button"
                onClick={() => update('subscription', 'premium')}
                className={`flex-1 text-xs rounded-md border px-3 py-2 transition ${
                  state.subscription === 'premium' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background'
                }`}
              >
                Premium — {fmtUSD(pricing.sub_premium)}/wk
              </button>
            </div>
          </div>
          <div className="rounded-md border p-3 space-y-2">
            <Label className="text-xs uppercase tracking-wide">Secondary household member</Label>
            <select
              className="w-full text-xs border rounded-md px-2 py-2 bg-background"
              value={state.addonSecondary}
              onChange={(e) => update('addonSecondary', e.target.value as BuilderState['addonSecondary'])}
            >
              <option value="none">None</option>
              <option value="light">Light — {fmtUSD(pricing.addon_secondary_light)}/wk</option>
              <option value="standard">Standard — Custom quote</option>
              <option value="high">High-need — Custom quote (re-assessment)</option>
              <option value="podiatric">Podiatric — {fmtUSD(pricing.addon_secondary_podiatric)}/wk</option>
            </select>
            {secondaryPrice > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                +{fmtUSD(secondaryPrice)}/wk recurring
              </Badge>
            )}
            {(state.addonSecondary === 'standard' || state.addonSecondary === 'high') && (
              <p className="text-[10px] text-muted-foreground leading-snug">
                Custom quote — not included in the projected total. Requires caregiver consultation
                {state.addonSecondary === 'high' ? ' and a re-assessment or additional caregiver.' : '; care payments may roughly double.'}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ToggleRow
            label="Medication Mgmt"
            sub={`+${fmtUSD(pricing.addon_medication)}/wk`}
            checked={state.addonMedication}
            onChange={(b) => update('addonMedication', b)}
          />
          <ToggleRow
            label="Daily SOP + Monitoring"
            sub={`+${fmtUSD(pricing.addon_sop_monitoring)}/wk`}
            checked={state.addonSopMonitoring}
            onChange={(b) => update('addonSopMonitoring', b)}
          />
          <ToggleRow
            label="Meal Support Upgrade"
            sub={`+${fmtUSD(pricing.addon_meal)}/wk`}
            checked={state.addonMeal}
            onChange={(b) => update('addonMeal', b)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ToggleRow
            label="One-time SOP Activation"
            sub={`${fmtUSD(pricing.onetime_sop_activation)} once`}
            checked={state.oneTimeSopActivation}
            onChange={(b) => update('oneTimeSopActivation', b)}
          />
          <ToggleRow
            label="Guided Home Reset"
            sub={`${fmtUSD(pricing.onetime_home_reset)} once`}
            checked={state.oneTimeHomeReset}
            onChange={(b) => update('oneTimeHomeReset', b)}
          />
          <ToggleRow
            label="Show Week 5 plan adjustment"
            sub={`${fmtUSD(pricing.fee_plan_adjust)} mid-stream`}
            checked={state.showWeek5Adjust}
            onChange={(b) => update('showWeek5Adjust', b)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

const ToggleRow: React.FC<{
  label: string; sub: string; checked: boolean; onChange: (b: boolean) => void;
}> = ({ label, sub, checked, onChange }) => (
  <div className="flex items-center justify-between rounded-md border p-3">
    <div>
      <div className="text-xs font-medium">{label}</div>
      <div className="text-[10px] text-muted-foreground">{sub}</div>
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);
