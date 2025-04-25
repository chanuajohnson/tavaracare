
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { calculatePayrollEntry } from "./payrollCalculationService";
import type { 
  WorkLog, 
  WorkLogInput, 
  WorkLogExpense, 
  WorkLogExpenseInput,
  PayrollEntry 
} from "./types/workLogTypes";
import type { CareShift } from "@/types/careTypes";

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
  // Since the work_log_expenses table isn't created yet, we'll return an empty array
  console.log("Expense fetching will be enabled after database migration");
  return [];
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
  // Database table doesn't exist yet, so we'll return a placeholder
  console.log("Expense tracking will be enabled after database migration");
  toast.info("Expense tracking will be enabled soon");
  return { success: false, error: "Expense tracking feature is coming soon" };
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

    // Get work log for payroll calculation
    const { data: workLog, error: fetchError } = await supabase
      .from('work_logs')
      .select('*')
      .eq('id', workLogId)
      .single();

    if (fetchError) throw fetchError;

    // Calculate payroll details
    const payrollData = await calculatePayrollEntry(workLog);
    
    // Calculate total amount
    const totalAmount = 
      (payrollData.regularHours * payrollData.regularRate) +
      (payrollData.overtimeHours * payrollData.overtimeRate) +
      (payrollData.holidayHours * payrollData.holidayRate) +
      payrollData.expenseTotal;

    // Create payroll entry
    const payrollEntry = {
      work_log_id: workLogId,
      care_team_member_id: workLog.care_team_member_id,
      care_plan_id: workLog.care_plan_id,
      regular_hours: payrollData.regularHours,
      overtime_hours: payrollData.overtimeHours,
      regular_rate: payrollData.regularRate,
      overtime_rate: payrollData.overtimeRate,
      total_amount: totalAmount,
      payment_status: 'pending'
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

export type { 
  WorkLog, 
  WorkLogInput, 
  WorkLogExpense, 
  WorkLogExpenseInput,
  PayrollEntry,
  Holiday 
};
