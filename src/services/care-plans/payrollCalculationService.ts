
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
  
  // Determine if any hours were on a holiday
  const workDate = new Date(startTime);
  const holiday = HOLIDAYS.find(h => 
    new Date(h.date).toDateString() === workDate.toDateString()
  );
  
  // Get rates from work log or fall back to default rates
  const regularRate = workLogWithTeamMember.care_team_members?.regular_rate || 15;
  const overtimeRate = workLogWithTeamMember.care_team_members?.overtime_rate || regularRate * 1.5;
  
  // Use work log's custom multiplier if set
  const rateMultiplier = workLogWithTeamMember.rate_multiplier || 1;
  const effectiveRate = regularRate * rateMultiplier;
  
  // Calculate hours by type based on work log rate type
  let regularHours = totalHours;
  let overtimeHours = 0;
  let holidayHours = 0;
  
  if (workLogWithTeamMember.rate_type === 'overtime' || 
      (isWeekend(workDate) && !holiday && workLogWithTeamMember.rate_type !== 'regular')) {
    overtimeHours = totalHours;
    regularHours = 0;
  } else if (holiday && workLogWithTeamMember.rate_type !== 'regular') {
    holidayHours = totalHours;
    regularHours = 0;
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
    regularRate: effectiveRate, // Use effective rate that includes multiplier
    overtimeRate,
    holidayRate: holiday ? regularRate * holiday.pay_multiplier : regularRate * 2,
    expenseTotal
  };
};
