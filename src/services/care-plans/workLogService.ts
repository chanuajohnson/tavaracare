
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// Define WorkLogExpense type - ensure it matches the database schema
export interface WorkLogExpense {
  id: string;
  work_log_id: string;
  category: string;
  description: string;
  amount: number;
  receipt_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
}

// Define WorkLog type - ensure it matches the database schema
export interface WorkLog {
  id: string;
  care_team_member_id: string;
  care_plan_id: string;
  caregiver_id?: string;
  caregiver_name?: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  expenses?: WorkLogExpense[];
  base_rate?: number;
  rate_multiplier?: number;
  rate_type?: string;
  created_at?: string;
  updated_at?: string;
}

// Define WorkLogExpenseInput for creating new expenses
export interface WorkLogExpenseInput {
  work_log_id: string;
  category: string;
  description: string;
  amount: number;
  receipt_url?: string;
}

// Define WorkLogInput for creating new work logs
export interface WorkLogInput {
  care_team_member_id: string;
  care_plan_id: string;
  start_time: string;
  end_time: string;
  notes?: string;
  status?: 'pending' | 'approved' | 'rejected';
  base_rate?: number;
  rate_multiplier?: number;
  rate_type?: string;
  shift_id?: string;
}

// Define PayrollEntry type
export interface PayrollEntry {
  id: string;
  care_plan_id: string;
  care_team_member_id: string;
  caregiver_id?: string;
  caregiver_name?: string;
  work_log_id: string;
  regular_hours: number;
  regular_rate: number;
  overtime_hours?: number;
  overtime_rate?: number;
  holiday_hours?: number;
  holiday_rate?: number;
  shadow_hours?: number;
  expense_total?: number;
  total_amount: number;
  payment_status: 'pending' | 'approved' | 'paid';
  payment_date?: string;
  created_at?: string;
  updated_at?: string;
  entered_at?: string;
}

// Define Holiday type
export interface Holiday {
  date: string;
  name: string;
  pay_multiplier: number;
}

/**
 * Fetch work logs for a care plan
 */
export const fetchWorkLogs = async (carePlanId: string): Promise<WorkLog[]> => {
  try {
    const { data, error } = await supabase
      .from('work_logs')
      .select(`
        *,
        care_team_members (
          id,
          display_name,
          caregiver_id,
          regular_rate,
          overtime_rate
        ),
        expenses:work_log_expenses (
          id,
          amount,
          category,
          description,
          status,
          work_log_id
        )
      `)
      .eq('care_plan_id', carePlanId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(log => ({
      ...log,
      status: log.status as "pending" | "approved" | "rejected",
      caregiver_id: log.care_team_members?.caregiver_id || '',
      caregiver_name: log.care_team_members?.display_name || 'Unknown',
      expenses: (log.expenses || []).map(expense => ({
        ...expense,
        work_log_id: expense.work_log_id || log.id
      }))
    })) as WorkLog[];
  } catch (error) {
    console.error("Error fetching work logs:", error);
    toast.error("Failed to load work logs");
    return [];
  }
};

/**
 * Fetch a single work log by ID
 */
export const getWorkLogById = async (workLogId: string): Promise<WorkLog | null> => {
  try {
    const { data, error } = await supabase
      .from('work_logs')
      .select(`
        *,
        care_team_members (
          id,
          display_name,
          caregiver_id,
          regular_rate,
          overtime_rate
        ),
        expenses:work_log_expenses (
          id,
          amount,
          category,
          description,
          status,
          work_log_id
        )
      `)
      .eq('id', workLogId)
      .single();

    if (error) throw error;

    return {
      ...data,
      status: data.status as "pending" | "approved" | "rejected",
      caregiver_id: data.care_team_members?.caregiver_id || '',
      caregiver_name: data.care_team_members?.display_name || 'Unknown',
      expenses: (data.expenses || []).map(expense => ({
        ...expense,
        work_log_id: expense.work_log_id || data.id
      }))
    } as WorkLog;
  } catch (error) {
    console.error("Error fetching work log:", error);
    return null;
  }
};

/**
 * Fetch payroll entries for a care plan
 */
export const fetchPayrollEntries = async (carePlanId: string): Promise<PayrollEntry[]> => {
  try {
    const { data: entries, error } = await supabase
      .from('payroll_entries')
      .select(`
        *,
        care_team_members:care_team_member_id (
          display_name,
          caregiver_id
        )
      `)
      .eq('care_plan_id', carePlanId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    if (entries.length > 0) {
      return entries.map(entry => {        
        return {
          ...entry,
          caregiver_id: entry.care_team_members?.caregiver_id || '',
          caregiver_name: entry.care_team_members?.display_name || 'Unknown',
          payment_status: ['pending', 'approved', 'paid'].includes(entry.payment_status) 
            ? entry.payment_status as 'pending' | 'approved' | 'paid'
            : 'pending'
        };
      });
    }
    
    return [] as PayrollEntry[];
  } catch (error) {
    console.error("Error fetching payroll entries:", error);
    toast.error("Failed to load payroll entries");
    return [];
  }
};

/**
 * Approve a work log
 */
export const approveWorkLog = async (workLogId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('work_logs')
      .update({ status: 'approved' })
      .eq('id', workLogId);

    if (error) throw error;
    
    toast.success("Work log approved successfully");
    return true;
  } catch (error) {
    console.error("Error approving work log:", error);
    toast.error("Failed to approve work log");
    return false;
  }
};

/**
 * Reject a work log with a reason
 */
export const rejectWorkLog = async (workLogId: string, reason: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('work_logs')
      .update({ status: 'rejected', notes: `Rejected: ${reason}` })
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

/**
 * Process payment for a payroll entry
 */
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
