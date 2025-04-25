
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { WorkLog, WorkLogInput } from "../types/workLogTypes";

export const fetchWorkLogs = async (carePlanId: string): Promise<WorkLog[]> => {
  try {
    const { data: workLogs, error } = await supabase
      .from('work_logs')
      .select(`
        *,
        care_team_members:care_team_member_id (
          caregiver_id,
          display_name
        )
      `)
      .eq('care_plan_id', carePlanId)
      .order('start_time', { ascending: false });

    if (error) throw error;
    
    // Map the display names from care team members and ensure types match WorkLog interface
    return workLogs.map(log => {
      const validStatus = ['pending', 'approved', 'rejected'].includes(log.status) 
        ? log.status as 'pending' | 'approved' | 'rejected'
        : 'pending';
      
      const validRateType = log.rate_type === 'overtime' 
        ? 'overtime' 
        : log.rate_type === 'holiday' 
        ? 'holiday' 
        : 'regular';
      
      return {
        id: log.id,
        care_team_member_id: log.care_team_member_id,
        care_plan_id: log.care_plan_id,
        caregiver_id: log.care_team_members?.caregiver_id,
        start_time: log.start_time,
        end_time: log.end_time,
        status: validStatus,
        notes: log.notes || '',
        base_rate: log.base_rate || 25,
        rate_multiplier: log.rate_multiplier || 1,
        rate_type: validRateType,
        created_at: log.created_at || '',
        updated_at: log.updated_at || '',
        caregiver_name: log.care_team_members?.display_name || 'Unknown'
      };
    });
    
  } catch (error) {
    console.error("Error fetching work logs:", error);
    toast.error("Failed to load work logs");
    return [];
  }
};

export const getWorkLogById = async (workLogId: string): Promise<WorkLog | null> => {
  try {
    const { data, error } = await supabase
      .from('work_logs')
      .select(`
        *,
        care_team_members:care_team_member_id (
          caregiver_id
        )
      `)
      .eq('id', workLogId)
      .single();

    if (error) throw error;
    
    // Ensure status is one of the allowed values
    const validStatus = ['pending', 'approved', 'rejected'].includes(data.status) 
      ? data.status as 'pending' | 'approved' | 'rejected'
      : 'pending';
      
    // Ensure rate_type is one of the allowed values
    const validRateType = data.rate_type === 'overtime' 
      ? 'overtime' 
      : data.rate_type === 'holiday' 
      ? 'holiday' 
      : 'regular';
    
    const result: WorkLog = {
      id: data.id,
      care_team_member_id: data.care_team_member_id,
      care_plan_id: data.care_plan_id,
      caregiver_id: data.care_team_members?.caregiver_id,
      start_time: data.start_time,
      end_time: data.end_time,
      status: validStatus,
      notes: data.notes || '',
      base_rate: data.base_rate || 25,
      rate_multiplier: data.rate_multiplier || 1,
      rate_type: validRateType,
      created_at: data.created_at || '',
      updated_at: data.updated_at || ''
    };
    
    if (data.care_team_members?.caregiver_id) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', data.care_team_members.caregiver_id)
        .single();

      if (!profileError && profile) {
        result.caregiver_name = profile.full_name;
      }
    }

    return result;
  } catch (error) {
    console.error("Error fetching work log:", error);
    return null;
  }
};

export const createWorkLog = async (workLogInput: WorkLogInput): Promise<{ success: boolean; workLog?: WorkLog; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('work_logs')
      .insert(workLogInput)
      .select()
      .single();

    if (error) throw error;
    
    // Ensure we return data that conforms to the WorkLog type
    const validStatus = ['pending', 'approved', 'rejected'].includes(data.status) 
      ? data.status as 'pending' | 'approved' | 'rejected'
      : 'pending';

    const workLog: WorkLog = {
      id: data.id,
      care_team_member_id: data.care_team_member_id,
      care_plan_id: data.care_plan_id,
      start_time: data.start_time,
      end_time: data.end_time,
      status: validStatus,
      notes: data.notes || '',
      base_rate: data.base_rate || 25,
      rate_multiplier: data.rate_multiplier || 1,
      created_at: data.created_at || '',
      updated_at: data.updated_at || ''
    };
    
    toast.success("Work log created successfully");
    return { success: true, workLog };
  } catch (error: any) {
    console.error("Error creating work log:", error);
    toast.error("Failed to create work log");
    return { success: false, error: error.message };
  }
};
