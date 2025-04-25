
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { WorkLog, WorkLogInput } from "../types/workLogTypes";

export const fetchWorkLogs = async (carePlanId: string): Promise<WorkLog[]> => {
  try {
    console.log("Fetching work logs for care plan:", carePlanId);
    const { data, error } = await supabase
      .from('work_logs')
      .select(`
        *,
        care_team_members (
          id,
          display_name,
          caregiver_id,
          regular_rate,
          overtime_rate,
          profiles:caregiver_id (
            full_name,
            professional_type
          )
        ),
        work_log_expenses (*)
      `)
      .eq('care_plan_id', carePlanId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log("Raw work logs data:", data);

    return data.map(log => {
      // Enhanced name resolution logic with better error handling
      let displayName = 'Unknown';
      
      try {
        if (log.care_team_members?.display_name) {
          displayName = log.care_team_members.display_name;
          console.log(`Using display_name: ${displayName} for log ${log.id}`);
        } else if (log.care_team_members?.profiles?.full_name) {
          displayName = log.care_team_members.profiles.full_name;
          console.log(`Using profile full_name: ${displayName} for log ${log.id}`);
        } else if (log.care_team_member_id) {
          displayName = `Member: ${log.care_team_member_id.substring(0, 8)}`;
          console.log(`Using fallback ID: ${displayName} for log ${log.id}`);
        }
      } catch (err) {
        console.error('Error resolving display name:', err);
      }

      // Process expenses correctly
      const expenses = log.work_log_expenses || [];

      return {
        ...log,
        status: log.status as "pending" | "approved" | "rejected",
        caregiver_id: log.care_team_members?.caregiver_id || '',
        caregiver_name: displayName,
        expenses: expenses.map(expense => ({
          ...expense,
          work_log_id: expense.work_log_id || log.id
        }))
      };
    }) as WorkLog[];
  } catch (error) {
    console.error("Error fetching work logs:", error);
    toast.error("Failed to load work logs");
    return [];
  }
};

export const createWorkLog = async (workLogInput: WorkLogInput): Promise<{ success: boolean; workLog?: WorkLog; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('work_logs')
      .insert({
        care_team_member_id: workLogInput.care_team_member_id,
        care_plan_id: workLogInput.care_plan_id,
        start_time: workLogInput.start_time,
        end_time: workLogInput.end_time,
        notes: workLogInput.notes,
        status: workLogInput.status || 'pending',
        base_rate: workLogInput.base_rate,
        rate_multiplier: workLogInput.rate_multiplier,
        rate_type: workLogInput.rate_type,
        shift_id: workLogInput.shift_id
      })
      .select(`
        *,
        care_team_members (
          id,
          caregiver_id,
          display_name,
          regular_rate,
          overtime_rate
        )
      `)
      .single();

    if (error) throw error;

    // Convert the data to match our WorkLog type
    const workLog: WorkLog = {
      id: data.id,
      care_team_member_id: data.care_team_member_id,
      care_plan_id: data.care_plan_id,
      caregiver_id: data.care_team_members?.caregiver_id,
      caregiver_name: data.care_team_members?.display_name,
      start_time: data.start_time,
      end_time: data.end_time,
      status: (data.status as 'pending' | 'approved' | 'rejected'),
      notes: data.notes || '',
      expenses: [],
      base_rate: data.base_rate || 0,
      rate_multiplier: data.rate_multiplier || 1,
      rate_type: data.rate_type || 'regular',
      created_at: data.created_at,
      updated_at: data.updated_at
    };
    
    toast.success("Work log created successfully");
    return { success: true, workLog };
  } catch (error: any) {
    console.error("Error creating work log:", error);
    toast.error("Failed to create work log");
    return { success: false, error: error.message };
  }
};

export const updateWorkLogStatus = async (workLogId: string, status: 'approved' | 'rejected'): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('work_logs')
      .update({ status })
      .eq('id', workLogId);

    if (error) throw error;
    
    toast.success(`Work log ${status}`);
    return true;
  } catch (error: any) {
    console.error(`Error ${status === 'approved' ? 'approving' : 'rejecting'} work log:`, error);
    toast.error(`Failed to ${status === 'approved' ? 'approve' : 'reject'} work log`);
    return false;
  }
};
