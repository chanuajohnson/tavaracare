
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
  const breakDurationHours = (workLog.break_duration_minutes || 0) / 60;
  
  // Total hours worked (accounting for break time)
  const totalHours = Math.max(
    0, 
    differenceInHours(endTime, startTime) - breakDurationHours
  );
  
  // Determine if any hours were on a holiday
  const workDate = new Date(startTime);
  const isHoliday = HOLIDAYS.find(h => 
    new Date(h.date).toDateString() === workDate.toDateString()
  );
  
  // Default rates if not specified
  const regularRate = workLogWithTeamMember.care_team_members?.regular_rate || 15;
  const overtimeRate = workLogWithTeamMember.care_team_members?.overtime_rate || regularRate * 1.5;
  const holidayRate = isHoliday ? regularRate * isHoliday.pay_multiplier : regularRate;
  
  // Calculate hours by type
  let regularHours = totalHours;
  let overtimeHours = 0;
  let holidayHours = 0;
  
  // For weekend, all hours are at overtime rate if not a holiday
  const isWeekendDay = isWeekend(workDate);
  if (isWeekendDay && !isHoliday) {
    overtimeHours = totalHours;
    regularHours = 0;
  }
  
  // For holiday, all hours are at holiday rate
  if (isHoliday) {
    holidayHours = totalHours;
    regularHours = 0;
  }

  return {
    workLogWithTeamMember,
    regularHours,
    overtimeHours,
    holidayHours,
    regularRate,
    overtimeRate,
    holidayRate,
    expenseTotal: 0 // We'll implement expense calculation when the table exists
  };
};
