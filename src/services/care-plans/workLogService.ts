
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { differenceInHours, isWeekend } from "date-fns";
import { CareShift } from "@/types/careTypes";

interface WorkLog {
  id: string;
  care_team_member_id: string;
  care_plan_id: string;
  start_time: string;
  end_time: string;
  break_duration_minutes: number;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
  caregiver_name?: string; // For display purposes
  expenses?: WorkLogExpense[]; // Related expenses
}

interface WorkLogExpense {
  id: string;
  work_log_id: string;
  category: 'medical_supplies' | 'food' | 'transportation' | 'other';
  amount: number;
  description: string;
  receipt_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
}

interface PayrollEntry {
  id: string;
  work_log_id: string;
  care_team_member_id: string;
  care_plan_id: string;
  regular_hours: number;
  overtime_hours: number;
  regular_rate: number;
  overtime_rate?: number;
  holiday_hours?: number;
  holiday_rate?: number;
  expense_total?: number;
  total_amount: number;
  payment_status: 'pending' | 'approved' | 'paid';
  payment_date?: string;
  created_at?: string;
  updated_at?: string;
  caregiver_name?: string; // For display purposes
  pay_period_start?: string;
  pay_period_end?: string;
}

interface WorkLogInput {
  care_team_member_id: string;
  care_plan_id: string;
  shift_id?: string;
  start_time: string;
  end_time: string;
  break_duration_minutes?: number;
  notes?: string;
}

interface WorkLogExpenseInput {
  work_log_id: string;
  category: 'medical_supplies' | 'food' | 'transportation' | 'other';
  amount: number;
  description: string;
  receipt_url?: string;
}

interface Holiday {
  date: string;
  name: string;
  pay_multiplier: number;
}

// US holidays (simplified example)
const HOLIDAYS: Holiday[] = [
  { date: '2024-01-01', name: 'New Year\'s Day', pay_multiplier: 1.5 },
  { date: '2024-07-04', name: 'Independence Day', pay_multiplier: 1.5 },
  { date: '2024-12-25', name: 'Christmas Day', pay_multiplier: 2.0 },
  // Add more holidays as needed
];

// Fetch work logs
export const fetchWorkLogs = async (carePlanId: string): Promise<WorkLog[]> => {
  try {
    // Get work logs with caregiver names
    const { data: workLogs, error } = await supabase
      .from('work_logs')
      .select(`
        *,
        care_team_members:care_team_member_id (
          caregiver_id
        )
      `)
      .eq('care_plan_id', carePlanId)
      .order('start_time', { ascending: false });

    if (error) throw error;
    
    // Get caregiver names from profiles
    const caregiverIds = workLogs
      .map(log => log.care_team_members?.caregiver_id)
      .filter(Boolean);

    if (caregiverIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', caregiverIds);

      if (profilesError) throw profilesError;

      // Map profiles to work logs
      const enhancedLogs = workLogs.map(log => {
        const caregiverId = log.care_team_members?.caregiver_id;
        const profile = profiles.find(p => p.id === caregiverId);
        
        return {
          ...log,
          caregiver_name: profile?.full_name || 'Unknown'
        };
      });

      return enhancedLogs as WorkLog[];
    }
    
    return workLogs as WorkLog[];
  } catch (error) {
    console.error("Error fetching work logs:", error);
    toast.error("Failed to load work logs");
    return [];
  }
};

// Fetch expenses for a work log
export const fetchWorkLogExpenses = async (workLogId: string): Promise<WorkLogExpense[]> => {
  try {
    const { data, error } = await supabase
      .from('work_log_expenses')
      .select('*')
      .eq('work_log_id', workLogId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data as WorkLogExpense[];
  } catch (error) {
    console.error("Error fetching work log expenses:", error);
    return [];
  }
};

// Fetch all payroll entries for a care plan
export const fetchPayrollEntries = async (carePlanId: string): Promise<PayrollEntry[]> => {
  try {
    // Get payroll entries with caregiver names
    const { data: entries, error } = await supabase
      .from('payroll_entries')
      .select(`
        *,
        care_team_members:care_team_member_id (
          caregiver_id
        )
      `)
      .eq('care_plan_id', carePlanId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Get caregiver names from profiles
    const caregiverIds = entries
      .map(entry => entry.care_team_members?.caregiver_id)
      .filter(Boolean);

    if (caregiverIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', caregiverIds);

      if (profilesError) throw profilesError;

      // Map profiles to entries
      const enhancedEntries = entries.map(entry => {
        const caregiverId = entry.care_team_members?.caregiver_id;
        const profile = profiles.find(p => p.id === caregiverId);
        
        return {
          ...entry,
          caregiver_name: profile?.full_name || 'Unknown'
        };
      });

      return enhancedEntries as PayrollEntry[];
    }
    
    return entries as PayrollEntry[];
  } catch (error) {
    console.error("Error fetching payroll entries:", error);
    toast.error("Failed to load payroll entries");
    return [];
  }
};

// Create a new work log
export const createWorkLog = async (workLogInput: WorkLogInput): Promise<{ success: boolean; workLog?: WorkLog; error?: string }> => {
  try {
    // Insert the work log
    const { data, error } = await supabase
      .from('work_logs')
      .insert(workLogInput)
      .select()
      .single();

    if (error) throw error;
    
    toast.success("Work log created successfully");
    return { success: true, workLog: data as WorkLog };
  } catch (error: any) {
    console.error("Error creating work log:", error);
    toast.error("Failed to create work log");
    return { success: false, error: error.message };
  }
};

// Create a work log from a shift
export const createWorkLogFromShift = async (
  shift: CareShift, 
  breakDuration: number = 0, 
  notes: string = ''
): Promise<{ success: boolean; workLog?: WorkLog; error?: string }> => {
  try {
    if (!shift.caregiverId) {
      return { success: false, error: "Shift has no assigned caregiver" };
    }

    // Fetch the care team member ID
    const { data: teamMember, error: teamError } = await supabase
      .from('care_team_members')
      .select('id')
      .eq('care_plan_id', shift.carePlanId)
      .eq('caregiver_id', shift.caregiverId)
      .single();

    if (teamError) throw teamError;
    
    if (!teamMember) {
      return { success: false, error: "Caregiver is not a team member" };
    }

    // Create work log input
    const workLogInput: WorkLogInput = {
      care_team_member_id: teamMember.id,
      care_plan_id: shift.carePlanId,
      shift_id: shift.id,
      start_time: shift.startTime,
      end_time: shift.endTime,
      break_duration_minutes: breakDuration,
      notes
    };

    return await createWorkLog(workLogInput);
  } catch (error: any) {
    console.error("Error creating work log from shift:", error);
    toast.error("Failed to create work log");
    return { success: false, error: error.message };
  }
};

// Add an expense to a work log
export const addWorkLogExpense = async (expenseInput: WorkLogExpenseInput): Promise<{ success: boolean; expense?: WorkLogExpense; error?: string }> => {
  try {
    // Insert the expense
    const { data, error } = await supabase
      .from('work_log_expenses')
      .insert(expenseInput)
      .select()
      .single();

    if (error) throw error;
    
    toast.success("Expense added successfully");
    return { success: true, expense: data as WorkLogExpense };
  } catch (error: any) {
    console.error("Error adding expense:", error);
    toast.error("Failed to add expense");
    return { success: false, error: error.message };
  }
};

// Approve a work log
export const approveWorkLog = async (workLogId: string): Promise<boolean> => {
  try {
    // Begin by approving the work log
    const { error } = await supabase
      .from('work_logs')
      .update({ status: 'approved' })
      .eq('id', workLogId);

    if (error) throw error;

    // Get the work log details to calculate payroll
    const { data: workLog, error: fetchError } = await supabase
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
      .eq('id', workLogId)
      .single();

    if (fetchError) throw fetchError;

    // Get expenses for this work log
    const { data: expenses, error: expensesError } = await supabase
      .from('work_log_expenses')
      .select('amount')
      .eq('work_log_id', workLogId)
      .eq('status', 'approved');

    if (expensesError) throw expensesError;

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
    const regularRate = workLog.care_team_members?.regular_rate || 15;
    const overtimeRate = workLog.care_team_members?.overtime_rate || regularRate * 1.5;
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
    
    // Calculate expense total
    const expenseTotal = expenses?.reduce((sum, expense) => 
      sum + (expense.amount || 0), 0) || 0;
    
    // Calculate total amount
    const totalAmount = 
      (regularHours * regularRate) +
      (overtimeHours * overtimeRate) +
      (holidayHours * holidayRate) +
      expenseTotal;

    // Create payroll entry
    const payrollEntry = {
      work_log_id: workLogId,
      care_team_member_id: workLog.care_team_member_id,
      care_plan_id: workLog.care_plan_id,
      regular_hours: regularHours,
      overtime_hours: overtimeHours,
      holiday_hours: holidayHours > 0 ? holidayHours : null,
      regular_rate: regularRate,
      overtime_rate: overtimeRate,
      holiday_rate: holidayHours > 0 ? holidayRate : null,
      expense_total: expenseTotal > 0 ? expenseTotal : null,
      total_amount: totalAmount,
      payment_status: 'pending',
      pay_period_start: startTime.toISOString(),
      pay_period_end: endTime.toISOString()
    };

    // Insert the payroll entry
    const { error: payrollError } = await supabase
      .from('payroll_entries')
      .insert(payrollEntry);
      
    if (payrollError) throw payrollError;

    toast.success("Work log approved and payroll entry created");
    return true;
  } catch (error) {
    console.error("Error approving work log:", error);
    toast.error("Failed to approve work log");
    return false;
  }
};

// Reject a work log
export const rejectWorkLog = async (workLogId: string, reason?: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('work_logs')
      .update({ 
        status: 'rejected',
        notes: reason ? `Rejected: ${reason}` : undefined
      })
      .eq('id', workLogId);

    if (error) throw error;
    toast.success("Work log rejected");
    return true;
  } catch (error) {
    console.error("Error rejecting work log:", error);
    toast.error("Failed to reject work log");
    return false;
  }
};

// Process a payroll entry for payment
export const processPayrollPayment = async (payrollId: string, paymentDate = new Date()): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('payroll_entries')
      .update({ 
        payment_status: 'paid',
        payment_date: paymentDate.toISOString()
      })
      .eq('id', payrollId);

    if (error) throw error;
    toast.success("Payment processed successfully");
    return true;
  } catch (error) {
    console.error("Error processing payroll payment:", error);
    toast.error("Failed to process payment");
    return false;
  }
};

// Export the types
export type { 
  WorkLog, 
  WorkLogInput, 
  WorkLogExpense, 
  WorkLogExpenseInput,
  PayrollEntry,
  Holiday 
};
