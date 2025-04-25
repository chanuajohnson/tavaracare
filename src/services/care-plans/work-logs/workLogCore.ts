
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
          profiles:caregiver_id (
            full_name
          )
        )
      `)
      .eq('care_plan_id', carePlanId)
      .order('start_time', { ascending: false });

    if (error) throw error;
    
    if (workLogs && workLogs.length > 0) {
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

        // Map profiles to work logs and ensure rate_type is valid
        return workLogs.map(log => {
          const caregiverId = log.care_team_members?.caregiver_id;
          const profile = profiles?.find(p => p.id === caregiverId);
          
          // Ensure rate_type is one of the allowed values
          let validRateType: 'regular' | 'overtime' | 'holiday' = 'regular';
          if (log.rate_type === 'overtime') validRateType = 'overtime';
          if (log.rate_type === 'holiday') validRateType = 'holiday';
          
          return {
            ...log,
            caregiver_name: profile?.full_name || 'Unknown',
            rate_type: validRateType
          };
        });
      }
    }
    
    return [] as WorkLog[];
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
    
    // Ensure rate_type is one of the allowed values
    let validRateType: 'regular' | 'overtime' | 'holiday' = 'regular';
    if (data.rate_type === 'overtime') validRateType = 'overtime';
    if (data.rate_type === 'holiday') validRateType = 'holiday';
    
    const result: WorkLog = {
      ...data,
      rate_type: validRateType
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
    
    toast.success("Work log created successfully");
    
    // Ensure rate_type is one of the allowed values for the returned data
    const validRateType: 'regular' | 'overtime' | 'holiday' = 
      data.rate_type === 'overtime' ? 'overtime' : 
      data.rate_type === 'holiday' ? 'holiday' : 'regular';
    
    const workLog: WorkLog = {
      ...data,
      rate_type: validRateType
    };
    
    return { success: true, workLog };
  } catch (error: any) {
    console.error("Error creating work log:", error);
    toast.error("Failed to create work log");
    return { success: false, error: error.message };
  }
};
