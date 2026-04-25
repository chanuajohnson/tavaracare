/**
 * Lifecycle Cost Scenarios — Tavara Care
 *
 * Pure calculation utilities for the Day-0 → Month-3 cost timeline.
 * All pricing is sourced LIVE from billable_service_items + subscription_plans
 * via useLifecycleCost — these helpers are prop-driven and have no DB calls.
 *
 * Billing cadence (per stakeholder spec):
 *   - Day 0  = mandatory setup bundle ONLY (no wages, no subscription)
 *   - Day 5  = first partial-week wages + first week of subscription
 *   - Wk 2+  = stable weekly rhythm (wages + subscription + recurring add-ons)
 *
 * The "Week 5 reality check" event optionally surfaces a Care Plan Adjustment
 * fee ($149) so prospects can see how mid-stream changes are absorbed.
 */

export type ScenarioPreset = 'conservative' | 'typical' | 'premium';

export interface PricingCatalog {
  // Day 0 mandatory bundle
  setup_assessment: number;          // Care Assessment & Setup
  setup_matching: number;            // Caregiver Matching & Placement
  setup_readiness: number;           // Care Readiness Assessment
  setup_nis: number;                 // NIS Employer Registration Support
  // Subscriptions (weekly)
  sub_active: number;                // Active Care Management
  sub_premium: number;               // Premium Care Management
  // Optional weekly add-ons
  addon_medication: number;
  addon_sop_monitoring: number;
  addon_meal: number;
  addon_secondary_light: number;
  addon_secondary_standard: number;
  addon_secondary_high: number;
  addon_secondary_podiatric: number;
  // Optional one-time
  onetime_sop_activation: number;
  onetime_home_reset: number;
  // Care change fees
  fee_plan_adjust: number;
  fee_basic_escalation: number;
  fee_urgent_escalation: number;
}

export interface ScenarioConfig {
  key: ScenarioPreset;
  label: string;
  description: string;
  hourlyRate: number;
  hoursPerDay: number;
  daysPerWeek: number;
  subscriptionWeekly: number;
  weeklyAddons: number; // sum of selected weekly add-ons
}

export interface TimelineEvent {
  weekIndex: number;        // 0 = Day 0, 1 = end of week 1 (Day 5), etc.
  label: string;            // "Day 0", "Wk 1 (Fri)", "Wk 2", ...
  oneTime: number;          // one-time fees billed this point
  wages: number;            // caregiver wages billed this point
  subscription: number;     // subscription billed this point
  addons: number;           // recurring add-ons billed this point
  cumulative: number;       // running total
  note?: string;            // event description ("Setup", "Plan adjust", etc.)
}

export interface ScenarioTimeline {
  scenario: ScenarioConfig;
  events: TimelineEvent[];
  day0Total: number;
  weeklyRecurring: number;
  quarterTotal: number;
  monthlyAverage: number;
}

export const DEFAULT_PRICING: PricingCatalog = {
  setup_assessment: 499,
  setup_matching: 299,
  setup_readiness: 199,
  setup_nis: 349,
  sub_active: 699,
  sub_premium: 899,
  addon_medication: 99,
  addon_sop_monitoring: 149,
  addon_meal: 75,
  addon_secondary_light: 150,
  addon_secondary_standard: 250,
  addon_secondary_high: 400,
  addon_secondary_podiatric: 349,
  onetime_sop_activation: 199,
  onetime_home_reset: 499,
  fee_plan_adjust: 149,
  fee_basic_escalation: 100,
  fee_urgent_escalation: 200,
};

/**
 * Day-0 MANDATORY setup bundle.
 * NIS Employer Registration ($349) is OPTIONAL — billed only when families employ
 * a caregiver formally and want NIS compliance handled. Surfaced separately in
 * the Optional Services row so prospects aren't blindsided.
 */
export function day0Bundle(p: PricingCatalog): number {
  return p.setup_assessment + p.setup_matching + p.setup_readiness;
}

export function buildScenarioPresets(p: PricingCatalog): Record<ScenarioPreset, ScenarioConfig> {
  return {
    conservative: {
      key: 'conservative',
      label: 'Conservative',
      description: '$40/hr standard caregiver, 8h × 5d, Active Care Management',
      hourlyRate: 40,
      hoursPerDay: 8,
      daysPerWeek: 5,
      subscriptionWeekly: p.sub_active,
      weeklyAddons: 0,
    },
    typical: {
      key: 'typical',
      label: 'Typical',
      description: 'Conservative + Medication Mgmt + Daily SOP Monitoring',
      hourlyRate: 40,
      hoursPerDay: 8,
      daysPerWeek: 5,
      subscriptionWeekly: p.sub_active,
      weeklyAddons: p.addon_medication + p.addon_sop_monitoring,
    },
    premium: {
      key: 'premium',
      label: 'Premium',
      description: '$45/hr Specialist, 10h × 5d, Premium Care Mgmt + Medication',
      hourlyRate: 45,
      hoursPerDay: 10,
      daysPerWeek: 5,
      subscriptionWeekly: p.sub_premium,
      weeklyAddons: p.addon_medication,
    },
  };
}

export interface TimelineOptions {
  weeks?: number;             // total weeks to project (default 13 = ~3 months)
  includeWeek5Adjustment?: boolean;  // surface a Care Plan Adjustment at end of wk 5
  planAdjustmentFee?: number;
}

/**
 * Build a Day-0 → Quarter timeline of billing events for one scenario.
 */
export function buildScenarioTimeline(
  scenario: ScenarioConfig,
  pricing: PricingCatalog,
  options: TimelineOptions = {}
): ScenarioTimeline {
  const weeks = options.weeks ?? 13;
  const includeAdjust = options.includeWeek5Adjustment ?? false;
  const adjustFee = options.planAdjustmentFee ?? pricing.fee_plan_adjust;

  const weeklyWages = scenario.hourlyRate * scenario.hoursPerDay * scenario.daysPerWeek;
  const weeklyRecurring = weeklyWages + scenario.subscriptionWeekly + scenario.weeklyAddons;
  const day0 = day0Bundle(pricing);

  const events: TimelineEvent[] = [];
  let cumulative = 0;

  // Day 0 — setup bundle only
  cumulative += day0;
  events.push({
    weekIndex: 0,
    label: 'Day 0',
    oneTime: day0,
    wages: 0,
    subscription: 0,
    addons: 0,
    cumulative,
    note: 'Setup bundle only — no wages or subscription billed yet',
  });

  // Weeks 1..N — wages + subscription + add-ons billed at end of each week (Friday)
  for (let w = 1; w <= weeks; w++) {
    let oneTime = 0;
    let note: string | undefined;
    if (includeAdjust && w === 5) {
      oneTime = adjustFee;
      note = 'Care Plan Adjustment fee absorbed';
    }
    const weekTotal = weeklyWages + scenario.subscriptionWeekly + scenario.weeklyAddons + oneTime;
    cumulative += weekTotal;
    events.push({
      weekIndex: w,
      label: w === 1 ? 'Wk 1 (Fri)' : `Wk ${w}`,
      oneTime,
      wages: weeklyWages,
      subscription: scenario.subscriptionWeekly,
      addons: scenario.weeklyAddons,
      cumulative,
      note,
    });
  }

  return {
    scenario,
    events,
    day0Total: day0,
    weeklyRecurring,
    quarterTotal: cumulative,
    monthlyAverage: cumulative / 3,
  };
}

/**
 * TTD → USD indicative conversion rate.
 * Matches src/utils/currency.ts (USD_TO_TTD_RATE = 6.78) so the whole app
 * stays on a single source of truth. Update both files together if the rate moves.
 */
export const TTD_PER_USD = 6.78;

/** Format a TTD amount as the primary figure, e.g. "TTD $2,099". */
export function fmtTTD(n: number): string {
  return 'TTD $' + Math.round(n).toLocaleString('en-US');
}

/** Format the indicative USD equivalent in brackets, e.g. "(USD ~$309)". */
export function fmtUSDBracket(ttd: number): string {
  const usd = ttd / TTD_PER_USD;
  return '(USD ~$' + Math.round(usd).toLocaleString('en-US') + ')';
}

/**
 * Combined TTD primary + USD bracketed.
 * Use as the canonical money formatter on display surfaces.
 */
export function fmtTTDWithUSD(n: number): string {
  return `${fmtTTD(n)} ${fmtUSDBracket(n)}`;
}

/**
 * @deprecated Use fmtTTD or fmtTTDWithUSD. Kept as alias so existing imports
 * compile during the rollout — the underlying numbers are TTD, never USD.
 */
export function fmtUSD(n: number): string {
  return fmtTTD(n);
}

/**
 * Optional services menu — shown to prospects so the full evolving cost picture
 * is transparent at Day 0. Not added to mandatory totals.
 */
export interface OptionalServiceItem {
  label: string;
  amount: number;
  cadence: 'one-time' | 'weekly';
  category: 'day0' | 'addon' | 'secondary';
}

export function buildOptionalServices(p: PricingCatalog): OptionalServiceItem[] {
  return [
    { label: 'NIS Employer Registration Support', amount: p.setup_nis, cadence: 'one-time', category: 'day0' },
    { label: 'Daily Care SOP — One-Time Activation', amount: p.onetime_sop_activation, cadence: 'one-time', category: 'day0' },
    { label: 'Guided Home Reset', amount: p.onetime_home_reset, cadence: 'one-time', category: 'day0' },
    { label: 'Medication Management Support', amount: p.addon_medication, cadence: 'weekly', category: 'addon' },
    { label: 'Daily Care SOP + Monitoring', amount: p.addon_sop_monitoring, cadence: 'weekly', category: 'addon' },
    { label: 'Meal Support Upgrade', amount: p.addon_meal, cadence: 'weekly', category: 'addon' },
    { label: 'Light Secondary Support', amount: p.addon_secondary_light, cadence: 'weekly', category: 'secondary' },
    { label: 'Standard Secondary Support', amount: p.addon_secondary_standard, cadence: 'weekly', category: 'secondary' },
    { label: 'High-Need Secondary Support', amount: p.addon_secondary_high, cadence: 'weekly', category: 'secondary' },
  ];
}
