import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, parse, startOfWeek, endOfWeek, getMonth, getYear } from 'date-fns';
import {
  CostCategory,
  loadFramework,
  saveFramework,
  frameworkWeeklyTotal,
  weeklyByLayer,
  statutoryWeeklyFromRevenue,
  DEFAULT_FRAMEWORK,
} from './operatingCostFramework';

/** @deprecated Use CostCategory[] framework instead. Kept for backward-compat consumers. */
export interface OperatingCosts {
  careCoordination: number;
  replacementBuffer: number;
  paymentProcessing: number;
  adminDocumentation: number;
  platformOverhead: number;
  salesAcquisition: number;
}

export const DEFAULT_OPERATING_COSTS: OperatingCosts = {
  careCoordination: 75,
  replacementBuffer: 75,
  paymentProcessing: 30,
  adminDocumentation: 45,
  platformOverhead: 35,
  salesAcquisition: 100,
};

export interface CaregiverBreakdown {
  caregiverId: string;
  caregiverName: string;
  totalHours: number;
  totalPay: number;
  employerNis: number;
  employeeNis: number;
}

export interface ServiceRevenueItem {
  label: string;
  billingType: string;
  amount: number;
}

export interface ClientEconomics {
  carePlanId: string;
  carePlanTitle: string;
  familyId: string;
  familyName: string;
  subscriptionPlan: string;
  // Payroll month info
  payrollWeeks: number;
  periodStart: string;
  periodEnd: string;
  // Monthly revenue
  monthlySubscriptionRevenue: number;
  monthlyCaregiverFees: number;
  monthlyServiceRevenue: number;
  monthlyRevenue: number;
  // Layer 1 — Direct Care Costs (per client, scales 1:1)
  monthlyCaregiverCost: number;
  monthlyNisCost: number;
  monthlyEmployeeNis: number;
  monthlyExpenses: number;
  monthlyDirectCost: number;
  // Layer 2 — Care Operations (per-client, prorated)
  monthlyCareOpsCost: number;
  // Layer 3 — Allocated Platform Overhead (shared / active clients)
  monthlyAllocatedPlatformCost: number;
  // Combined ops (= careOps + allocatedPlatform) — back-compat
  monthlyOperatingCost: number;
  monthlyTotalCost: number;
  monthlyMargin: number;
  // Pre-allocation margin (revenue − direct − careOps) — "marginal profitability"
  monthlyDirectMargin: number;
  monthlyDirectMarginPercent: number;
  // Weekly averages
  weeklyRevenue: number;
  weeklyCaregiverCost: number;
  weeklyOperatingCost: number;
  // Derived
  marginPercent: number;
  status: 'profitable' | 'at-risk' | 'losing';
  caregiverBreakdowns: CaregiverBreakdown[];
  serviceBreakdown: ServiceRevenueItem[];
}

export interface PlatformSummary {
  weeklyTotal: number;
  monthlyTotal: number;
  yearlyTotal: number;
  perClientWeeklyAllocation: number;
  perClientMonthlyAllocation: number;
  activeClientCount: number;
  /** Effective divisor used to allocate platform costs (max(scenario, 1)) */
  allocationDivisor: number;
}

export interface UnitEconomicsSummary {
  totalActiveClients: number;
  totalMonthlyRevenue: number;
  totalMonthlyCost: number;
  totalMonthlyDirectCost: number;
  totalMonthlyCareOpsCost: number;
  totalMonthlyPlatformCost: number;
  avgMarginPercent: number;
  avgDirectMarginPercent: number;
}

function getWeeklySubscriptionRevenue(planName: string | null, price: number | null): number {
  if (!planName || !price) return 0;
  const name = planName.toLowerCase().trim();
  if (name === 'basic' || name === 'free' || name.includes('basic') || name.includes('free')) return 0;
  // Legacy "Family Care" plan: $499 is a flat MONTHLY rate, not weekly
  if (name === 'family care') return Math.round((price / 4.33) * 100) / 100;
  if (name.includes('premium')) return 899;
  if (name.includes('care') || name.includes('active')) return 699;
  if (price > 200) return Math.round((price / 4.33) * 100) / 100;
  return price;
}

/**
 * Map raw subscription plan names to friendly, customer-facing labels
 * used in the unit economics table and tooltips.
 */
function friendlyPlanLabel(planName: string | null | undefined): string {
  if (!planName) return 'No subscription';
  const name = planName.toLowerCase().trim();
  if (name === 'family care') return 'Active Care Management'; // legacy $499 plan
  if (name.includes('premium')) return 'Premium Care Management';
  if (name.includes('care') || name.includes('active')) return 'Active Care Management';
  return planName;
}

/** True when the subscription is the legacy Family Care $499 plan (which already includes Active Care Management). */
function isLegacyFamilyCarePlan(planName: string | null | undefined): boolean {
  return !!planName && planName.toLowerCase().trim() === 'family care';
}

function getStatus(marginPercent: number): 'profitable' | 'at-risk' | 'losing' {
  if (marginPercent >= 20) return 'profitable';
  if (marginPercent >= 10) return 'at-risk';
  return 'losing';
}

export function loadOperatingCosts(): OperatingCosts {
  try {
    const stored = localStorage.getItem('tavara_operating_costs');
    if (stored) return { ...DEFAULT_OPERATING_COSTS, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_OPERATING_COSTS;
}

export function saveOperatingCosts(costs: OperatingCosts) {
  localStorage.setItem('tavara_operating_costs', JSON.stringify(costs));
}

/** Sum of legacy flat operating costs object (per-week) */
export function totalOperatingCost(costs: OperatingCosts): number {
  return Object.values(costs).reduce((s, v) => s + v, 0);
}

/**
 * Determine which payroll month a given date belongs to,
 * using the same ISO-week logic as the payroll system:
 * A week (Mon–Sun) belongs to the month of its ending Sunday.
 */
function getPayrollMonthKey(dateStr: string): string {
  const date = new Date(dateStr);
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
  const m = getMonth(weekEnd); // 0-indexed
  const y = getYear(weekEnd);
  return `${y}-${String(m + 1).padStart(2, '0')}`;
}

function getWeekKey(dateStr: string): string {
  const date = new Date(dateStr);
  const ws = startOfWeek(date, { weekStartsOn: 1 });
  return format(ws, 'yyyy-MM-dd');
}

export interface DraftCarePlan {
  carePlanId: string;
  carePlanTitle: string;
  familyId: string;
  familyName: string;
  status: string;
}

export function useUnitEconomics(selectedMonth: string, scenarioClientCount?: number) {
  const [clients, setClients] = useState<ClientEconomics[]>([]);
  const [draftCarePlans, setDraftCarePlans] = useState<DraftCarePlan[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [operatingCosts, setOperatingCosts] = useState<OperatingCosts>(loadOperatingCosts);
  const [framework, setFramework] = useState<CostCategory[]>(loadFramework);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [carePlansWithoutPayroll, setCarePlansWithoutPayroll] = useState<number>(0);
  const [fetchErrors, setFetchErrors] = useState<string[]>([]);
  const [activeClientCount, setActiveClientCount] = useState<number>(0);

  const updateOperatingCosts = (costs: OperatingCosts) => {
    setOperatingCosts(costs);
    saveOperatingCosts(costs);
  };

  const updateFramework = (next: CostCategory[]) => {
    setFramework(next);
    saveFramework(next);
  };

  useEffect(() => {
    fetchAvailableMonths();
  }, []);

  useEffect(() => {
    if (selectedMonth) fetchData();
  }, [selectedMonth]);

  const fetchAvailableMonths = async () => {
    try {
      const { data } = await supabase
        .from('payroll_entries')
        .select('pay_period_start')
        .not('pay_period_start', 'is', null)
        .order('pay_period_start', { ascending: false });

      if (data?.length) {
        const months = new Set<string>();
        data.forEach(row => {
          if (row.pay_period_start) {
            months.add(getPayrollMonthKey(row.pay_period_start));
          }
        });
        months.add(format(new Date(), 'yyyy-MM'));
        setAvailableMonths([...months].sort().reverse());
      } else {
        setAvailableMonths([format(new Date(), 'yyyy-MM')]);
      }
    } catch (err) {
      console.error('Error fetching available months:', err);
      setAvailableMonths([format(new Date(), 'yyyy-MM')]);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const errors: string[] = [];
    try {
      // Fetch ALL care plans (no status filter — split client-side for diagnostics)
      const carePlansRes = await supabase
        .from('care_plans')
        .select('id, title, family_id, status');

      if (carePlansRes.error) {
        console.error('[unit-economics] care_plans fetch error:', carePlansRes.error);
        errors.push(`Care plans: ${carePlansRes.error.message}`);
      }

      const allCarePlans = carePlansRes.data || [];

      // Diagnostic: count by status
      const counts: Record<string, number> = {};
      allCarePlans.forEach(cp => {
        const s = cp.status || 'unknown';
        counts[s] = (counts[s] || 0) + 1;
      });
      console.log('[unit-economics] care plans by status:', counts, '— total:', allCarePlans.length);
      setStatusCounts(counts);

      const carePlans = allCarePlans.filter(cp => cp.status === 'active');
      const nonActivePlans = allCarePlans.filter(cp => cp.status !== 'active');

      if (!carePlans.length) {
        setClients([]);
        setCarePlansWithoutPayroll(0);
        setDraftCarePlans([]);
        setFetchErrors(errors);
        setLoading(false);
        return;
      }

      const familyIds = [...new Set([...carePlans.map(cp => cp.family_id), ...nonActivePlans.map(cp => cp.family_id)])];
      const carePlanIds = carePlans.map(cp => cp.id);

      // Parallel fetches — each isolated so a single failure doesn't blank the dashboard
      const safeFetch = async <T,>(label: string, p: Promise<{ data: T | null; error: any }>): Promise<T | null> => {
        try {
          const res = await p;
          if (res.error) {
            console.error(`[unit-economics] ${label} error:`, res.error);
            errors.push(`${label}: ${res.error.message}`);
            return null;
          }
          return res.data;
        } catch (err: any) {
          console.error(`[unit-economics] ${label} threw:`, err);
          errors.push(`${label}: ${err?.message || 'unknown error'}`);
          return null;
        }
      };

      const [profilesData, subscriptionsData, payrollData, teamData, serviceSelectionsData] = await Promise.all([
        safeFetch('profiles', supabase.from('profiles').select('id, full_name').in('id', familyIds) as any),
        safeFetch('user_subscriptions', supabase.from('user_subscriptions').select('user_id, plan_id, status').in('user_id', familyIds).eq('status', 'active') as any),
        safeFetch('payroll_entries', supabase.from('payroll_entries').select('care_plan_id, care_team_member_id, regular_hours, regular_rate, overtime_hours, overtime_rate, holiday_hours, holiday_rate, expense_total, employer_contribution, employee_contribution, gross_pay, pay_period_start')
          .in('care_plan_id', carePlanIds)
          .not('pay_period_start', 'is', null) as any),
        safeFetch('care_team_members', supabase.from('care_team_members').select('id, care_plan_id, caregiver_id, display_name').in('care_plan_id', carePlanIds) as any),
        safeFetch('care_plan_service_selections', supabase.from('care_plan_service_selections')
          .select('care_plan_id, quantity, override_price, billable_service_items(label, billing_type, unit_price, visible_in_unit_economics)')
          .in('care_plan_id', carePlanIds)
          .eq('selected', true) as any),
      ]);

      const profilesArr = (profilesData as any[]) || [];
      const subscriptionsArr = (subscriptionsData as any[]) || [];
      const payrollArr = (payrollData as any[]) || [];
      const teamArr = (teamData as any[]) || [];
      const serviceSelectionsArr = (serviceSelectionsData as any[]) || [];

      // Fetch subscription plans
      const planIds = [...new Set(subscriptionsArr.map(s => s.plan_id).filter(Boolean))];
      let plansMap: Record<string, { name: string; price: number }> = {};
      if (planIds.length) {
        const plansRes = await supabase.from('subscription_plans').select('id, name, price').in('id', planIds);
        if (plansRes.error) {
          console.error('[unit-economics] subscription_plans error:', plansRes.error);
          errors.push(`Subscription plans: ${plansRes.error.message}`);
        }
        (plansRes.data || []).forEach(p => { plansMap[p.id] = { name: p.name, price: p.price }; });
      }

      const profilesMap: Record<string, string> = {};
      profilesArr.forEach(p => { profilesMap[p.id] = p.full_name || 'Unknown'; });

      const subMap: Record<string, { planName: string; price: number }> = {};
      subscriptionsArr.forEach(s => {
        if (s.plan_id && plansMap[s.plan_id]) {
          subMap[s.user_id] = { planName: plansMap[s.plan_id].name, price: plansMap[s.plan_id].price };
        }
      });

      const teamMap: Record<string, Record<string, string>> = {};
      teamArr.forEach(tm => {
        if (tm.care_plan_id) {
          if (!teamMap[tm.care_plan_id]) teamMap[tm.care_plan_id] = {};
          teamMap[tm.care_plan_id][tm.id] = tm.display_name || 'Caregiver';
        }
      });

      // Compute layered weekly framework totals (excludes statutory auto-calc)
      const layered = weeklyByLayer(framework);
      const baseWeeklyOpCost = frameworkWeeklyTotal(framework) || totalOperatingCost(operatingCosts);

      // Active count is the # of care plans with payroll this month — used for
      // platform cost allocation. We compute the per-plan rows first, then attach
      // the allocated platform cost in a second pass once we know the divisor.
      let plansWithoutPayroll = 0;

      type PartialClient = Omit<
        ClientEconomics,
        | 'monthlyAllocatedPlatformCost'
        | 'monthlyOperatingCost'
        | 'monthlyTotalCost'
        | 'monthlyMargin'
        | 'marginPercent'
        | 'status'
        | 'weeklyOperatingCost'
      > & { _statutoryWeekly: number };

      const partial: PartialClient[] = carePlans.map(cp => {
        const allEntries = payrollArr.filter(pe => pe.care_plan_id === cp.id);
        const monthEntries = allEntries.filter(pe =>
          pe.pay_period_start && getPayrollMonthKey(pe.pay_period_start) === selectedMonth
        );

        const weekKeys = new Set<string>();
        let earliestDate: Date | null = null;
        let latestWeekEnd: Date | null = null;

        monthEntries.forEach(pe => {
          if (pe.pay_period_start) {
            const wk = getWeekKey(pe.pay_period_start);
            weekKeys.add(wk);
            const d = new Date(pe.pay_period_start);
            const ws = startOfWeek(d, { weekStartsOn: 1 });
            const we = endOfWeek(d, { weekStartsOn: 1 });
            if (!earliestDate || ws < earliestDate) earliestDate = ws;
            if (!latestWeekEnd || we > latestWeekEnd) latestWeekEnd = we;
          }
        });

        const payrollWeeks = weekKeys.size || 0;
        if (payrollWeeks === 0) plansWithoutPayroll += 1;

        const cgMap: Record<string, CaregiverBreakdown> = {};
        let totalCaregiverCost = 0;
        let totalEmployerNis = 0;
        let totalEmployeeNis = 0;
        let totalExpenses = 0;

        monthEntries.forEach(pe => {
          const cgId = pe.care_team_member_id || 'unknown';
          if (!cgMap[cgId]) {
            cgMap[cgId] = {
              caregiverId: cgId,
              caregiverName: teamMap[cp.id]?.[cgId] || 'Caregiver',
              totalHours: 0,
              totalPay: 0,
              employerNis: 0,
              employeeNis: 0,
            };
          }
          const hours = (Number(pe.regular_hours) || 0) + (Number(pe.overtime_hours) || 0) + (Number(pe.holiday_hours) || 0);
          const pay = (Number(pe.regular_hours) || 0) * (Number(pe.regular_rate) || 0)
            + (Number(pe.overtime_hours) || 0) * (Number(pe.overtime_rate) || 0)
            + (Number(pe.holiday_hours) || 0) * (Number(pe.holiday_rate) || 0);

          cgMap[cgId].totalHours += hours;
          cgMap[cgId].totalPay += pay;
          cgMap[cgId].employerNis += Number(pe.employer_contribution) || 0;
          cgMap[cgId].employeeNis += Number(pe.employee_contribution) || 0;

          totalCaregiverCost += pay;
          totalEmployerNis += Number(pe.employer_contribution) || 0;
          totalEmployeeNis += Number(pe.employee_contribution) || 0;
          totalExpenses += Number(pe.expense_total) || 0;
        });

        const sub = subMap[cp.family_id];
        const weeklySubRevenue = sub ? getWeeklySubscriptionRevenue(sub.planName, sub.price) : 0;

        const cpServices = serviceSelectionsArr.filter((s: any) => s.care_plan_id === cp.id);
        const serviceBreakdown: ServiceRevenueItem[] = [];
        let monthlyServiceRevenue = 0;
        const subIsLegacyFamilyCare = isLegacyFamilyCarePlan(sub?.planName);

        cpServices.forEach((s: any) => {
          const svc = s.billable_service_items;
          if (!svc || svc.visible_in_unit_economics === false) return;
          if (subIsLegacyFamilyCare && typeof svc.label === 'string' && svc.label.toLowerCase().includes('active care management')) {
            console.warn(`[unit-economics] Suppressing duplicate "Active Care Management" service for care plan ${cp.id} — already billed via legacy Family Care $499 subscription.`);
            return;
          }
          const price = s.override_price ?? svc.unit_price ?? 0;
          const qty = s.quantity || 1;
          let monthlyAmount = 0;
          if (svc.billing_type === 'weekly') monthlyAmount = price * qty * payrollWeeks;
          else if (svc.billing_type === 'monthly') monthlyAmount = price * qty;
          else if (svc.billing_type === 'one_time') monthlyAmount = payrollWeeks > 0 ? price * qty : 0;
          else if (svc.billing_type === 'hourly') monthlyAmount = price * qty * payrollWeeks;
          if (monthlyAmount > 0) {
            serviceBreakdown.push({
              label: svc.label,
              billingType: svc.billing_type,
              amount: Math.round(monthlyAmount * 100) / 100,
            });
            monthlyServiceRevenue += monthlyAmount;
          }
        });

        monthlyServiceRevenue = Math.round(monthlyServiceRevenue * 100) / 100;
        const monthlyCaregiverFees = Math.round(totalCaregiverCost * 100) / 100;
        const monthlySubRevenue = Math.round(weeklySubRevenue * payrollWeeks * 100) / 100;
        const monthlyRevenue = monthlySubRevenue + monthlyCaregiverFees + monthlyServiceRevenue;

        // Layer 1 — Direct Care Costs (caregiver wages + employer NIS + reimbursable expenses)
        const monthlyDirectCost = Math.round((totalCaregiverCost + totalEmployerNis + totalExpenses) * 100) / 100;

        // Layer 2 — Care Operations (per-client, prorated by # of payroll weeks active this month)
        const monthlyCareOpsCost = Math.round(layered.careOps * payrollWeeks * 100) / 100;

        // Statutory weekly cost (revenue-dependent — counted as platform overhead per client)
        const weeklyGross = payrollWeeks > 0 ? monthlyRevenue / payrollWeeks : 0;
        const statutoryWeekly = statutoryWeeklyFromRevenue(framework, weeklyGross);

        const monthlyDirectMargin = Math.round((monthlyRevenue - monthlyDirectCost - monthlyCareOpsCost) * 100) / 100;
        const monthlyDirectMarginPercent = monthlyRevenue > 0
          ? Math.round((monthlyDirectMargin / monthlyRevenue) * 1000) / 10
          : (monthlyDirectCost + monthlyCareOpsCost > 0 ? -100 : 0);

        return {
          carePlanId: cp.id,
          carePlanTitle: cp.title,
          familyId: cp.family_id,
          familyName: profilesMap[cp.family_id] || 'Unknown',
          subscriptionPlan: friendlyPlanLabel(sub?.planName),
          payrollWeeks,
          periodStart: earliestDate ? format(earliestDate, 'MMM d, yyyy') : '',
          periodEnd: latestWeekEnd ? format(latestWeekEnd, 'MMM d, yyyy') : '',
          monthlySubscriptionRevenue: monthlySubRevenue,
          monthlyCaregiverFees,
          monthlyServiceRevenue,
          monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
          monthlyCaregiverCost: Math.round(totalCaregiverCost * 100) / 100,
          monthlyNisCost: Math.round(totalEmployerNis * 100) / 100,
          monthlyEmployeeNis: Math.round(totalEmployeeNis * 100) / 100,
          monthlyExpenses: Math.round(totalExpenses * 100) / 100,
          monthlyDirectCost,
          monthlyCareOpsCost,
          monthlyDirectMargin,
          monthlyDirectMarginPercent,
          weeklyRevenue: payrollWeeks > 0 ? Math.round((monthlyRevenue / payrollWeeks) * 100) / 100 : 0,
          weeklyCaregiverCost: payrollWeeks > 0 ? Math.round((totalCaregiverCost / payrollWeeks) * 100) / 100 : 0,
          caregiverBreakdowns: Object.values(cgMap).map(cg => ({
            ...cg,
            totalHours: Math.round(cg.totalHours * 10) / 10,
            totalPay: Math.round(cg.totalPay * 100) / 100,
            employerNis: Math.round(cg.employerNis * 100) / 100,
            employeeNis: Math.round(cg.employeeNis * 100) / 100,
          })),
          serviceBreakdown,
          _statutoryWeekly: statutoryWeekly,
        } as PartialClient;
      });

      // Pass 2: allocate platform overhead. Divisor = max(scenario, real active, 1).
      const realActive = partial.filter(p => p.payrollWeeks > 0).length;
      setActiveClientCount(realActive);

      // Use the most recent scenarioClientCount (closure captures initial value, see updater below)
      const divisor = Math.max(scenarioClientCount ?? realActive ?? 1, 1);
      const platformWeeklyTotal = layered.platform; // statutory handled per-client
      const platformWeeklyPerClient = platformWeeklyTotal / divisor;

      const result: ClientEconomics[] = partial.map(p => {
        // Each client's allocated platform cost = (shared platform / divisor) × payrollWeeks
        // PLUS its own statutory weekly (which depends on its own revenue) × payrollWeeks
        const monthlyAllocatedPlatformCost = Math.round(
          ((platformWeeklyPerClient + p._statutoryWeekly) * p.payrollWeeks) * 100
        ) / 100;
        const monthlyOperatingCost = Math.round((p.monthlyCareOpsCost + monthlyAllocatedPlatformCost) * 100) / 100;
        const monthlyTotalCost = Math.round((p.monthlyDirectCost + monthlyOperatingCost) * 100) / 100;
        const monthlyMargin = Math.round((p.monthlyRevenue - monthlyTotalCost) * 100) / 100;
        const marginPercent = p.monthlyRevenue > 0
          ? Math.round((monthlyMargin / p.monthlyRevenue) * 1000) / 10
          : (monthlyTotalCost > 0 ? -100 : 0);
        const weeklyOperatingCost = p.payrollWeeks > 0
          ? Math.round((monthlyOperatingCost / p.payrollWeeks) * 100) / 100
          : Math.round((layered.careOps + platformWeeklyPerClient) * 100) / 100;

        const { _statutoryWeekly, ...rest } = p;
        return {
          ...rest,
          monthlyAllocatedPlatformCost,
          monthlyOperatingCost,
          monthlyTotalCost,
          monthlyMargin,
          marginPercent,
          status: getStatus(marginPercent),
          weeklyOperatingCost,
        };
      });

      setClients(result);
      setCarePlansWithoutPayroll(plansWithoutPayroll);

      // Build draft list (active-but-not-shown should never happen, but include any non-active here)
      const drafts: DraftCarePlan[] = nonActivePlans.map(cp => ({
        carePlanId: cp.id,
        carePlanTitle: cp.title,
        familyId: cp.family_id,
        familyName: profilesMap[cp.family_id] || 'Unknown',
        status: cp.status || 'unknown',
      }));
      setDraftCarePlans(drafts);
      console.log('[unit-economics] active rendered:', result.length, '| draft/other:', drafts.length);

      setFetchErrors(errors);
    } catch (err) {
      console.error('Error fetching unit economics:', err);
      setFetchErrors([...errors, (err as any)?.message || 'unknown error']);
    } finally {
      setLoading(false);
    }
  };

  const summary: UnitEconomicsSummary = useMemo(() => {
    if (!clients.length) {
      return {
        totalActiveClients: 0,
        totalMonthlyRevenue: 0,
        totalMonthlyCost: 0,
        totalMonthlyDirectCost: 0,
        totalMonthlyCareOpsCost: 0,
        totalMonthlyPlatformCost: 0,
        avgMarginPercent: 0,
        avgDirectMarginPercent: 0,
      };
    }
    const n = clients.length;
    return {
      totalActiveClients: n,
      totalMonthlyRevenue: Math.round(clients.reduce((s, c) => s + c.monthlyRevenue, 0)),
      totalMonthlyCost: Math.round(clients.reduce((s, c) => s + c.monthlyTotalCost, 0)),
      totalMonthlyDirectCost: Math.round(clients.reduce((s, c) => s + c.monthlyDirectCost, 0)),
      totalMonthlyCareOpsCost: Math.round(clients.reduce((s, c) => s + c.monthlyCareOpsCost, 0)),
      totalMonthlyPlatformCost: Math.round(clients.reduce((s, c) => s + c.monthlyAllocatedPlatformCost, 0)),
      avgMarginPercent: Math.round(clients.reduce((s, c) => s + c.marginPercent, 0) / n * 10) / 10,
      avgDirectMarginPercent: Math.round(clients.reduce((s, c) => s + c.monthlyDirectMarginPercent, 0) / n * 10) / 10,
    };
  }, [clients]);

  // Platform overhead summary (read-only, scenario-aware)
  const platformSummary: PlatformSummary = useMemo(() => {
    const layered = weeklyByLayer(framework);
    const realActive = activeClientCount;
    const divisor = Math.max(scenarioClientCount ?? realActive ?? 1, 1);
    const weeklyTotal = Math.round(layered.platform * 100) / 100;
    const monthlyTotal = Math.round(weeklyTotal * 4.333 * 100) / 100;
    const yearlyTotal = Math.round(weeklyTotal * 52 * 100) / 100;
    const perClientWeeklyAllocation = Math.round((layered.platform / divisor) * 100) / 100;
    const perClientMonthlyAllocation = Math.round(perClientWeeklyAllocation * 4.333 * 100) / 100;
    return {
      weeklyTotal,
      monthlyTotal,
      yearlyTotal,
      perClientWeeklyAllocation,
      perClientMonthlyAllocation,
      activeClientCount: realActive,
      allocationDivisor: divisor,
    };
  }, [framework, activeClientCount, scenarioClientCount]);

  // Recalculate margins when framework or scenario changes (without re-fetching)
  useEffect(() => {
    if (clients.length === 0) return;
    const layered = weeklyByLayer(framework);
    const realActive = clients.filter(c => c.payrollWeeks > 0).length;
    const divisor = Math.max(scenarioClientCount ?? realActive ?? 1, 1);
    const platformWeeklyPerClient = layered.platform / divisor;

    setClients(prev => prev.map(c => {
      const weeklyGross = c.payrollWeeks > 0 ? c.monthlyRevenue / c.payrollWeeks : 0;
      const statutoryWeekly = statutoryWeeklyFromRevenue(framework, weeklyGross);
      const monthlyCareOpsCost = Math.round(layered.careOps * c.payrollWeeks * 100) / 100;
      const monthlyAllocatedPlatformCost = Math.round(
        ((platformWeeklyPerClient + statutoryWeekly) * c.payrollWeeks) * 100
      ) / 100;
      const monthlyOperatingCost = Math.round((monthlyCareOpsCost + monthlyAllocatedPlatformCost) * 100) / 100;
      const monthlyTotalCost = Math.round((c.monthlyDirectCost + monthlyOperatingCost) * 100) / 100;
      const monthlyMargin = Math.round((c.monthlyRevenue - monthlyTotalCost) * 100) / 100;
      const marginPercent = c.monthlyRevenue > 0
        ? Math.round((monthlyMargin / c.monthlyRevenue) * 1000) / 10
        : (monthlyTotalCost > 0 ? -100 : 0);
      const monthlyDirectMargin = Math.round((c.monthlyRevenue - c.monthlyDirectCost - monthlyCareOpsCost) * 100) / 100;
      const monthlyDirectMarginPercent = c.monthlyRevenue > 0
        ? Math.round((monthlyDirectMargin / c.monthlyRevenue) * 1000) / 10
        : (c.monthlyDirectCost + monthlyCareOpsCost > 0 ? -100 : 0);
      const weeklyOperatingCost = c.payrollWeeks > 0
        ? Math.round((monthlyOperatingCost / c.payrollWeeks) * 100) / 100
        : Math.round((layered.careOps + platformWeeklyPerClient) * 100) / 100;

      return {
        ...c,
        monthlyCareOpsCost,
        monthlyAllocatedPlatformCost,
        monthlyOperatingCost,
        monthlyTotalCost,
        monthlyMargin,
        monthlyDirectMargin,
        monthlyDirectMarginPercent,
        marginPercent,
        status: getStatus(marginPercent),
        weeklyOperatingCost,
      };
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [framework, scenarioClientCount]);

  return {
    clients,
    draftCarePlans,
    statusCounts,
    summary,
    platformSummary,
    loading,
    operatingCosts,
    updateOperatingCosts,
    framework,
    updateFramework,
    availableMonths,
    carePlansWithoutPayroll,
    fetchErrors,
    activeClientCount,
    refetch: fetchData,
  };
}
