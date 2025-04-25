
import { supabase } from "@/lib/supabase";
import { differenceInHours, isWeekend } from "date-fns";
import { HOLIDAYS } from "./holidaysService";
import type { WorkLog } from "./types/workLogTypes";

export const calculatePayrollEntry = async (workLog: WorkLog) => {
  // Get the work log details with care team member info
  const { data: workLogWithTeamMember, error: fetchError } = await supabase
    .from('work_logs')
    .select(`
      *,
      care_team_members:care_team_member_id (
        id,
        regular_rate,
        overtime_rate,
        caregiver_id,
        display_name
      )
    `)
    .eq('id', workLog.id)
    .single();

  if (fetchError) throw fetchError;

  // Calculate total worked hours
  const startTime = new Date(workLog.start_time);
  const endTime = new Date(workLog.end_time);
  
  // Total hours worked (no break time to account for now)
  const totalHours = Math.max(
    0, 
    differenceInHours(endTime, startTime)
  );
  
  // Determine if any hours were on a holiday
  const workDate = new Date(startTime);
  const isHoliday = HOLIDAYS.find(h => 
    new Date(h.date).toDateString() === workDate.toDateString()
  );
  
  // Get multiplier from work log, defaulting to 1.0 if not set
  const rateMultiplier = workLog.rate_multiplier || 1.0;
  const isShadowDay = rateMultiplier === 0.5;
  
  // Default rates if not specified
  const regularRate = workLogWithTeamMember.care_team_members?.regular_rate || 15;
  const baseRate = workLog.base_rate || regularRate;
  const overtimeRate = workLogWithTeamMember.care_team_members?.overtime_rate || regularRate * 1.5;
  
  // Calculate holiday rate, considering shadow day special case
  let holidayRate = regularRate;
  let effectiveMultiplier = rateMultiplier;
  
  if (isHoliday) {
    if (isShadowDay) {
      // When it's both a shadow day and a holiday, use 0.75x multiplier (0.5 × 1.5)
      effectiveMultiplier = 0.75;
      holidayRate = baseRate * 0.75;
    } else {
      effectiveMultiplier = isHoliday.pay_multiplier;
      holidayRate = baseRate * isHoliday.pay_multiplier;
    }
  }
  
  // Calculate hours by type
  let regularHours = 0;
  let overtimeHours = 0;
  let holidayHours = 0;
  let shadowHours = 0;
  
  // For holiday, all hours are at holiday rate
  if (isHoliday) {
    holidayHours = totalHours;
  } 
  // For weekend, all hours are at overtime rate if not a holiday
  else if (isWeekend(workDate) && !isHoliday && !isShadowDay) {
    overtimeHours = totalHours;
  }
  // For shadow days that are not holidays
  else if (isShadowDay) {
    shadowHours = totalHours;
  }
  // Default case - regular hours
  else {
    regularHours = totalHours;
  }

  // Fetch expense total for this work log
  let expenseTotal = 0;
  try {
    const { data: expenses, error } = await supabase
      .from('work_log_expenses')
      .select('amount')
      .eq('work_log_id', workLog.id);
      
    if (!error && expenses) {
      expenseTotal = expenses.reduce((total, expense) => total + (parseFloat(String(expense.amount)) || 0), 0);
    }
  } catch (err) {
    console.error("Error calculating expense total:", err);
  }

  // Calculate the effective rate based on multiplier
  const effectiveRate = isHoliday && isShadowDay ? baseRate * 0.75 : 
                        isShadowDay && !isHoliday ? baseRate * 0.5 : 
                        isHoliday ? holidayRate : 
                        baseRate;

  return {
    workLogWithTeamMember,
    regularHours,
    overtimeHours,
    holidayHours,
    shadowHours,
    regularRate: baseRate,
    overtimeRate,
    holidayRate,
    shadowRate: baseRate * 0.5,
    effectiveRate,
    effectiveMultiplier,
    expenseTotal
  };
};
