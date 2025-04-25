
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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
  total_amount: number;
  payment_status: 'pending' | 'approved' | 'paid';
  payment_date?: string;
  created_at?: string;
  updated_at?: string;
  caregiver_name?: string; // For display purposes
}

export const fetchWorkLogs = async (carePlanId: string): Promise<WorkLog[]> => {
  try {
    const { data, error } = await supabase
      .from('work_logs')
      .select('*')
      .eq('care_plan_id', carePlanId)
      .order('start_time', { ascending: false });

    if (error) throw error;
    
    // Type casting with explicit status validation
    return data.map(log => ({
      ...log,
      status: log.status as 'pending' | 'approved' | 'rejected' 
    })) as WorkLog[];
  } catch (error) {
    console.error("Error fetching work logs:", error);
    toast.error("Failed to load work logs");
    return [];
  }
};

export const fetchPayrollEntries = async (carePlanId: string): Promise<PayrollEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('payroll_entries')
      .select('*')
      .eq('care_plan_id', carePlanId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Type casting with explicit payment_status validation
    return data.map(entry => ({
      ...entry,
      payment_status: entry.payment_status as 'pending' | 'approved' | 'paid'
    })) as PayrollEntry[];
  } catch (error) {
    console.error("Error fetching payroll entries:", error);
    toast.error("Failed to load payroll entries");
    return [];
  }
};

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

// Export the types
export type { WorkLog, PayrollEntry };
