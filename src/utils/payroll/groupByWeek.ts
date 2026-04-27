import { startOfWeek, endOfWeek, format, startOfMonth, getMonth, getYear } from "date-fns";
import type { PayrollEntry } from "@/services/care-plans/types/workLogTypes";

export interface WeekGroup {
  key: string;
  weekStart: Date;
  weekEnd: Date;
  caregiverId: string;
  caregiverName: string;
  entries: PayrollEntry[];
  weeklyGross: number;
  weeklyExpenses: number;
  weeklyTotal: number;
  weeklyRegularHours: number;
  weeklyOvertimeHours: number;
  weeklyHolidayHours: number;
  // NIS aggregated at week level
  nisApplicable: boolean;
  nisClass: string | null;
  employeeContribution: number;
  employerContribution: number;
  weeklyNetPay: number;
  allPaid: boolean;
  allPending: boolean;
}

export interface MonthGroup {
  key: string;
  monthLabel: string;
  weeks: WeekGroup[];
  totalGross: number;
  totalEmployeeNIS: number;
  totalEmployerNIS: number;
  totalNetPay: number;
  totalHours: number;
  totalRegularHours: number;
  totalOvertimeHours: number;
  totalHolidayHours: number;
  allPaid: boolean;
  allPending: boolean;
}

/**
 * Group payroll entries by caregiver + ISO week (Monday start).
 */
export function groupEntriesByWeek(entries: PayrollEntry[]): WeekGroup[] {
  const map = new Map<string, WeekGroup>();

  for (const entry of entries) {
    const dateStr = entry.pay_period_start || entry.created_at;
    if (!dateStr) continue;

    const date = new Date(dateStr);
    const ws = startOfWeek(date, { weekStartsOn: 1 });
    const we = endOfWeek(date, { weekStartsOn: 1 });
    const caregiverId = entry.care_team_member_id || "unknown";
    const key = `${caregiverId}_${format(ws, "yyyy-MM-dd")}`;

    if (!map.has(key)) {
      map.set(key, {
        key,
        weekStart: ws,
        weekEnd: we,
        caregiverId,
        caregiverName: entry.caregiver_name || "Unknown",
        entries: [],
        weeklyGross: 0,
        weeklyExpenses: 0,
        weeklyTotal: 0,
        weeklyRegularHours: 0,
        weeklyOvertimeHours: 0,
        weeklyHolidayHours: 0,
        nisApplicable: false,
        nisClass: null,
        employeeContribution: 0,
        employerContribution: 0,
        weeklyNetPay: 0,
        allPaid: true,
        allPending: true,
      });
    }

    const group = map.get(key)!;
    group.entries.push(entry);
    group.weeklyGross += entry.gross_pay || entry.total_amount || 0;
    group.weeklyExpenses += entry.expense_total || 0;
    group.weeklyTotal += entry.total_amount || 0;
    group.weeklyRegularHours += entry.regular_hours || 0;
    group.weeklyOvertimeHours += entry.overtime_hours || 0;
    group.weeklyHolidayHours += entry.holiday_hours || 0;

    // Aggregate NIS (take the class from any entry that has it)
    if (entry.nis_applicable) {
      group.nisApplicable = true;
      if (entry.nis_class) group.nisClass = entry.nis_class;
    }
    group.employeeContribution += entry.employee_contribution || 0;
    group.employerContribution += entry.employer_contribution || 0;
    group.weeklyNetPay += entry.net_pay_after_nis || entry.total_amount || 0;

    if (entry.payment_status !== "paid") group.allPaid = false;
    if (entry.payment_status !== "pending") group.allPending = false;
  }

  // Sort entries within each group by date, and groups by weekStart desc
  const groups = Array.from(map.values());
  for (const g of groups) {
    g.entries.sort((a, b) => {
      const da = new Date(a.pay_period_start || a.created_at || 0).getTime();
      const db = new Date(b.pay_period_start || b.created_at || 0).getTime();
      return da - db;
    });
  }
  groups.sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime());

  return groups;
}

/**
 * Group weeks into months for the monthly summary.
 * A week belongs to the month of its Monday (weekStart).
 */
export function groupWeeksByMonth(weeks: WeekGroup[]): MonthGroup[] {
  const map = new Map<string, MonthGroup>();

  for (const week of weeks) {
    // Use week-ending date (Sunday) to determine which month a week belongs to.
    // This ensures a week like Mar 30–Apr 5 counts under April, not March.
    const m = getMonth(week.weekEnd);
    const y = getYear(week.weekEnd);
    const key = `${y}-${String(m).padStart(2, "0")}`;

    if (!map.has(key)) {
      map.set(key, {
        key,
        monthLabel: format(week.weekEnd, "MMMM yyyy"),
        weeks: [],
        totalGross: 0,
        totalEmployeeNIS: 0,
        totalEmployerNIS: 0,
        totalNetPay: 0,
        totalHours: 0,
        totalRegularHours: 0,
        totalOvertimeHours: 0,
        totalHolidayHours: 0,
        allPaid: true,
        allPending: true,
      });
    }

    const mg = map.get(key)!;
    mg.weeks.push(week);
    mg.totalGross += week.weeklyGross;
    mg.totalEmployeeNIS += week.employeeContribution;
    mg.totalEmployerNIS += week.employerContribution;
    mg.totalNetPay += week.weeklyNetPay;
    mg.totalHours += week.weeklyRegularHours + week.weeklyOvertimeHours + week.weeklyHolidayHours;
    mg.totalRegularHours += week.weeklyRegularHours;
    mg.totalOvertimeHours += week.weeklyOvertimeHours;
    mg.totalHolidayHours += week.weeklyHolidayHours;
    if (!week.allPaid) mg.allPaid = false;
    if (!week.allPending) mg.allPending = false;
  }

  return Array.from(map.values()).sort((a, b) => b.key.localeCompare(a.key));
}
