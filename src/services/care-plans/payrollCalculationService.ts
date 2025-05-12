
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
        caregiver_id
      )
    `)
    .eq('id', workLog.id)
    .single();

  if (fetchError) throw fetchError;

  // Calculate total worked hours
  const startTime = new Date(workLog.start_time);
  const endTime = new Date(workLog.end_time);
  const totalHours = Math.max(0, differenceInHours(endTime, startTime));
  
  // Use work log's base rate, fall back to care team member's rate, then default
  const baseRate = workLogWithTeamMember.base_rate || 
    workLogWithTeamMember.care_team_members?.regular_rate || 
    15;
  
  // Use work log's rate multiplier if set
  const rateMultiplier = workLogWithTeamMember.rate_multiplier || 1;
  const effectiveRate = baseRate * rateMultiplier;
  
  // Get rates for different types
  const regularRate = baseRate;
  const overtimeRate = workLogWithTeamMember.care_team_members?.overtime_rate || baseRate * 1.5;
  
  // Determine holiday rate if applicable
  const workDate = new Date(startTime);
  const holiday = HOLIDAYS.find(h => 
    new Date(h.date).toDateString() === workDate.toDateString()
  );
  const holidayRate = holiday ? baseRate * holiday.pay_multiplier : baseRate * 2;

  // Calculate hours based on rate type
  let regularHours = totalHours;
  let overtimeHours = 0;
  let holidayHours = 0;

  // Use work log's rate_type to determine hour categories
  switch (workLogWithTeamMember.rate_type) {
    case 'overtime':
      overtimeHours = totalHours;
      regularHours = 0;
      break;
    case 'holiday':
      holidayHours = totalHours;
      regularHours = 0;
      break;
    case 'regular':
      regularHours = totalHours;
      break;
    default:
      // If no specific rate type, use default weekend/holiday logic
      if (holiday) {
        holidayHours = totalHours;
        regularHours = 0;
      } else if (isWeekend(workDate)) {
        overtimeHours = totalHours;
        regularHours = 0;
      }
  }

  // Fetch expense total for this work log
  let expenseTotal = 0;
  try {
    const { data: expenses } = await supabase
      .from('work_log_expenses')
      .select('amount')
      .eq('work_log_id', workLog.id);
      
    if (expenses) {
      expenseTotal = expenses.reduce((total, expense) => 
        total + (parseFloat(String(expense.amount)) || 0), 0
      );
    }
  } catch (err) {
    console.error("Error calculating expense total:", err);
  }

  return {
    workLogWithTeamMember,
    regularHours,
    overtimeHours,
    holidayHours,
    regularRate, 
    overtimeRate,
    holidayRate,
    expenseTotal
  };
};
