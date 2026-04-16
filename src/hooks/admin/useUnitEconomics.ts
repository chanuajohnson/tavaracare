import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, parse, startOfWeek, endOfWeek, getMonth, getYear } from 'date-fns';
import {
  CostCategory,
  loadFramework,
  saveFramework,
  frameworkWeeklyTotal,
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
  // Monthly figures
  monthlySubscriptionRevenue: number;
  monthlyCaregiverFees: number;
  monthlyServiceRevenue: number;
  monthlyRevenue: number;
  monthlyCaregiverCost: number;
  monthlyNisCost: number;
  monthlyEmployeeNis: number;
  monthlyExpenses: number;
  monthlyOperatingCost: number;
  monthlyTotalCost: number;
  monthlyMargin: number;
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

export interface UnitEconomicsSummary {
  totalActiveClients: number;
  totalMonthlyRevenue: number;
  totalMonthlyCost: number;
  avgMarginPercent: number;
}

function getWeeklySubscriptionRevenue(planName: string | null, price: number | null): number {
  if (!planName || !price) return 0;
  const name = planName.toLowerCase();
  if (name.includes('basic') || name.includes('free')) return 0;
  if (name.includes('premium')) return 899;
  if (name.includes('care') || name.includes('active')) return 699;
  if (price > 200) return Math.round((price / 4.33) * 100) / 100;
  return price;
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

export function useUnitEconomics(selectedMonth: string) {
  const [clients, setClients] = useState<ClientEconomics[]>([]);
  const [draftCarePlans, setDraftCarePlans] = useState<DraftCarePlan[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [operatingCosts, setOperatingCosts] = useState<OperatingCosts>(loadOperatingCosts);
  const [framework, setFramework] = useState<CostCategory[]>(loadFramework);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [carePlansWithoutPayroll, setCarePlansWithoutPayroll] = useState<number>(0);
  const [fetchErrors, setFetchErrors] = useState<string[]>([]);

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

      // Use new framework for operating costs (falls back to legacy if framework empty)
      const baseWeeklyOpCost = frameworkWeeklyTotal(framework) || totalOperatingCost(operatingCosts);
      let plansWithoutPayroll = 0;

      const result: ClientEconomics[] = carePlans.map(cp => {
        // Filter payroll entries for this care plan AND the selected payroll month
        const allEntries = payrollArr.filter(pe => pe.care_plan_id === cp.id);
        const monthEntries = allEntries.filter(pe =>
          pe.pay_period_start && getPayrollMonthKey(pe.pay_period_start) === selectedMonth
        );

        // Count distinct ISO weeks in this payroll month
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

        // Aggregate by caregiver
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

        // Calculate service revenue from selected billable services
        const cpServices = serviceSelectionsArr.filter((s: any) => s.care_plan_id === cp.id);
        const serviceBreakdown: ServiceRevenueItem[] = [];
        let monthlyServiceRevenue = 0;

        cpServices.forEach((s: any) => {
          const svc = s.billable_service_items;
          if (!svc || svc.visible_in_unit_economics === false) return;
          const price = s.override_price ?? svc.unit_price ?? 0;
          const qty = s.quantity || 1;
          let monthlyAmount = 0;
          if (svc.billing_type === 'weekly') {
            monthlyAmount = price * qty * payrollWeeks;
          } else if (svc.billing_type === 'monthly') {
            monthlyAmount = price * qty;
          } else if (svc.billing_type === 'one_time') {
            // One-time fees only count if payroll weeks > 0 (active month)
            monthlyAmount = payrollWeeks > 0 ? price * qty : 0;
          } else if (svc.billing_type === 'hourly') {
            monthlyAmount = price * qty * payrollWeeks;
          }
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

        // Compute weekly gross revenue first so statutory costs (% of revenue) can include it
        const weeklyGrossRevenue = payrollWeeks > 0
          ? (monthlySubRevenue + monthlyCaregiverFees + monthlyServiceRevenue) / payrollWeeks
          : 0;
        const statutoryWeekly = statutoryWeeklyFromRevenue(framework, weeklyGrossRevenue);
        const effectiveWeeklyOpCost = baseWeeklyOpCost + statutoryWeekly;
        const monthlyOpCost = Math.round(effectiveWeeklyOpCost * payrollWeeks * 100) / 100;

        const monthlyRevenue = monthlySubRevenue + monthlyCaregiverFees + monthlyServiceRevenue;
        const monthlyTotalCost = Math.round((totalCaregiverCost + totalEmployerNis + totalExpenses + monthlyOpCost) * 100) / 100;
        const monthlyMargin = Math.round((monthlyRevenue - monthlyTotalCost) * 100) / 100;
        const marginPercent = monthlyRevenue > 0 ? (monthlyMargin / monthlyRevenue) * 100 : (monthlyTotalCost > 0 ? -100 : 0);

        return {
          carePlanId: cp.id,
          carePlanTitle: cp.title,
          familyId: cp.family_id,
          familyName: profilesMap[cp.family_id] || 'Unknown',
          subscriptionPlan: sub?.planName || 'No subscription',
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
          monthlyOperatingCost: monthlyOpCost,
          monthlyTotalCost,
          monthlyMargin,
          weeklyRevenue: payrollWeeks > 0 ? Math.round((monthlyRevenue / payrollWeeks) * 100) / 100 : 0,
          weeklyCaregiverCost: payrollWeeks > 0 ? Math.round((totalCaregiverCost / payrollWeeks) * 100) / 100 : 0,
          weeklyOperatingCost: effectiveWeeklyOpCost,
          marginPercent: Math.round(marginPercent * 10) / 10,
          status: getStatus(marginPercent),
          caregiverBreakdowns: Object.values(cgMap).map(cg => ({
            ...cg,
            totalHours: Math.round(cg.totalHours * 10) / 10,
            totalPay: Math.round(cg.totalPay * 100) / 100,
            employerNis: Math.round(cg.employerNis * 100) / 100,
            employeeNis: Math.round(cg.employeeNis * 100) / 100,
          })),
          serviceBreakdown,
        };
      });

      setClients(result);
      setCarePlansWithoutPayroll(plansWithoutPayroll);
      setFetchErrors(errors);
    } catch (err) {
      console.error('Error fetching unit economics:', err);
      setFetchErrors([...errors, (err as any)?.message || 'unknown error']);
    } finally {
      setLoading(false);
    }
  };

  const summary: UnitEconomicsSummary = useMemo(() => {
    if (!clients.length) return { totalActiveClients: 0, totalMonthlyRevenue: 0, totalMonthlyCost: 0, avgMarginPercent: 0 };
    const n = clients.length;
    return {
      totalActiveClients: n,
      totalMonthlyRevenue: Math.round(clients.reduce((s, c) => s + c.monthlyRevenue, 0)),
      totalMonthlyCost: Math.round(clients.reduce((s, c) => s + c.monthlyTotalCost, 0)),
      avgMarginPercent: Math.round(clients.reduce((s, c) => s + c.marginPercent, 0) / n * 10) / 10,
    };
  }, [clients]);

  // Recalculate margins when operating costs framework changes
  useEffect(() => {
    if (clients.length > 0 && selectedMonth) {
      const baseWeeklyOpCost = frameworkWeeklyTotal(framework) || totalOperatingCost(operatingCosts);

      setClients(prev => prev.map(c => {
        const weeklyGross = c.payrollWeeks > 0 ? c.monthlyRevenue / c.payrollWeeks : 0;
        const statutoryWeekly = statutoryWeeklyFromRevenue(framework, weeklyGross);
        const effectiveWeekly = baseWeeklyOpCost + statutoryWeekly;
        const monthlyOpCost = Math.round(effectiveWeekly * c.payrollWeeks * 100) / 100;
        const newTotalCost = c.monthlyCaregiverCost + c.monthlyNisCost + c.monthlyExpenses + monthlyOpCost;
        const newRevenue = c.monthlySubscriptionRevenue + c.monthlyCaregiverFees + c.monthlyServiceRevenue;
        const newMargin = newRevenue - newTotalCost;
        const newPct = newRevenue > 0 ? (newMargin / newRevenue) * 100 : (newTotalCost > 0 ? -100 : 0);
        return {
          ...c,
          monthlyOperatingCost: monthlyOpCost,
          weeklyOperatingCost: effectiveWeekly,
          monthlyRevenue: Math.round(newRevenue * 100) / 100,
          monthlyTotalCost: Math.round(newTotalCost * 100) / 100,
          monthlyMargin: Math.round(newMargin * 100) / 100,
          marginPercent: Math.round(newPct * 10) / 10,
          status: getStatus(newPct),
        };
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operatingCosts, framework]);

  return {
    clients,
    summary,
    loading,
    operatingCosts,
    updateOperatingCosts,
    framework,
    updateFramework,
    availableMonths,
    carePlansWithoutPayroll,
    fetchErrors,
    refetch: fetchData,
  };
}
