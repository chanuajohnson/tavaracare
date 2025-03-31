import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CarePlan {
  id: string;
  family_id: string;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  metadata?: any;
}

export interface CareTask {
  id: string;
  care_plan_id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  status: 'pending' | 'in_progress' | 'completed';
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CareTeamMember {
  id: string;
  care_plan_id: string;
  family_id: string;
  caregiver_id: string;
  role: 'caregiver' | 'nurse' | 'therapist' | 'coordinator';
  status: 'pending' | 'active' | 'inactive' | 'invited' | 'declined';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CareShift {
  id: string;
  care_plan_id?: string;
  family_id: string;
  caregiver_id?: string;
  title: string;
  description?: string;
  location?: string;
  status: 'open' | 'assigned' | 'completed' | 'cancelled';
  start_time: string;
  end_time: string;
  recurring_pattern?: string;
  created_at: string;
  updated_at: string;
  google_calendar_event_id?: string;
  recurrence_rule?: string;
}

export interface NewCareShift {
  care_plan_id?: string;
  family_id: string;
  caregiver_id?: string;
  title: string;
  description?: string;
  location?: string;
  status: 'open' | 'assigned' | 'completed' | 'cancelled';
  start_time: string;
  end_time: string;
  recurring_pattern?: string;
}

export interface CareRecipientProfile {
  id: string;
  user_id: string;
  full_name: string;
  birth_year: string;
  personality_traits?: string[];
  challenges?: string[];
  hobbies_interests?: string[];
  career_fields?: string[];
  caregiver_personality?: string[];
  life_story?: string;
  daily_routines?: string;
  specific_requests?: string;
  family_social_info?: string;
  notable_events?: string;
  sensitivities?: string;
  cultural_preferences?: string;
  unique_facts?: string;
  joyful_things?: string;
  created_at: string;
  last_updated: string;
}

export const createCarePlan = async (familyId: string, title: string, description?: string): Promise<CarePlan | null> => {
  try {
    const { data, error } = await supabase
      .from('care_plans')
      .insert({
        family_id: familyId,
        title,
        description,
        status: 'active'
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating care plan:", error);
    throw error;
  }
};

export const fetchCarePlans = async (familyId: string): Promise<CarePlan[]> => {
  try {
    const { data, error } = await supabase
      .from('care_plans')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching care plans:", error);
    throw error;
  }
};

export const fetchCarePlan = async (carePlanId: string): Promise<CarePlan | null> => {
  try {
    const { data, error } = await supabase
      .from('care_plans')
      .select('*')
      .eq('id', carePlanId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching care plan:", error);
    throw error;
  }
};

export const updateCarePlan = async (carePlanId: string, updates: Partial<CarePlan>): Promise<CarePlan | null> => {
  try {
    const { data, error } = await supabase
      .from('care_plans')
      .update(updates)
      .eq('id', carePlanId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating care plan:", error);
    throw error;
  }
};

export const deleteCarePlan = async (carePlanId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('care_plans')
      .delete()
      .eq('id', carePlanId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting care plan:", error);
    throw error;
  }
};

export const createCareTask = async (careTask: Partial<CareTask>): Promise<CareTask | null> => {
  try {
    const { data, error } = await supabase
      .from('care_tasks')
      .insert(careTask)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating care task:", error);
    throw error;
  }
};

export const fetchCareTasks = async (carePlanId: string): Promise<CareTask[]> => {
  try {
    const { data, error } = await supabase
      .from('care_tasks')
      .select('*')
      .eq('care_plan_id', carePlanId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching care tasks:", error);
    throw error;
  }
};

export const updateCareTask = async (taskId: string, updates: Partial<CareTask>): Promise<CareTask | null> => {
  try {
    const { data, error } = await supabase
      .from('care_tasks')
      .update(updates)
      .eq('id', taskId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating care task:", error);
    throw error;
  }
};

export const deleteCareTask = async (taskId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('care_tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting care task:", error);
    throw error;
  }
};

export const inviteCareTeamMember = async (member: Omit<CareTeamMember, 'id' | 'created_at' | 'updated_at'>): Promise<CareTeamMember | null> => {
  try {
    const { data, error } = await supabase
      .from('care_team_members')
      .insert(member)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error inviting care team member:", error);
    throw error;
  }
};

export const fetchCareTeamMembers = async (carePlanId: string): Promise<CareTeamMember[]> => {
  try {
    const { data, error } = await supabase
      .from('care_team_members')
      .select('*')
      .eq('care_plan_id', carePlanId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching care team members:", error);
    throw error;
  }
};

export const removeCareTeamMember = async (memberId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('care_team_members')
      .delete()
      .eq('id', memberId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error removing care team member:", error);
    throw error;
  }
};

export const createCareShift = async (shift: NewCareShift): Promise<CareShift | null> => {
  try {
    const { data, error } = await supabase
      .from('care_shifts')
      .insert({
        ...shift,
        status: shift.caregiver_id ? 'assigned' : 'open'
      })
      .select('*')
      .single();

    if (error) throw error;
    return data as unknown as CareShift;
  } catch (error) {
    console.error("Error creating care shift:", error);
    throw error;
  }
};

export const fetchCareShifts = async (carePlanId: string): Promise<CareShift[]> => {
  try {
    const { data, error } = await supabase
      .from('care_shifts')
      .select('*')
      .eq('care_plan_id', carePlanId)
      .order('start_time', { ascending: true });

    if (error) throw error;
    return (data || []) as unknown as CareShift[];
  } catch (error) {
    console.error("Error fetching care shifts:", error);
    throw error;
  }
};

export const fetchCareShiftsFiltered = async (carePlanId: string, filter: 'all' | 'assigned' | 'unassigned' | 'completed'): Promise<CareShift[]> => {
  try {
    let query = supabase
      .from('care_shifts')
      .select('*')
      .eq('care_plan_id', carePlanId);
    
    if (filter === 'assigned') {
      query = query.not('caregiver_id', 'is', null).eq('status', 'assigned');
    } else if (filter === 'unassigned') {
      query = query.is('caregiver_id', null).eq('status', 'open');
    } else if (filter === 'completed') {
      query = query.eq('status', 'completed');
    }
    
    const { data, error } = await query.order('start_time', { ascending: true });

    if (error) throw error;
    return (data || []) as unknown as CareShift[];
  } catch (error) {
    console.error("Error fetching filtered care shifts:", error);
    throw error;
  }
};

export const updateCareShift = async (shiftId: string, updates: Partial<CareShift>): Promise<CareShift | null> => {
  try {
    if (updates.caregiver_id && !updates.status) {
      updates.status = 'assigned';
    }
    
    const { data, error } = await supabase
      .from('care_shifts')
      .update(updates)
      .eq('id', shiftId)
      .select('*')
      .single();

    if (error) throw error;
    return data as unknown as CareShift;
  } catch (error) {
    console.error("Error updating care shift:", error);
    throw error;
  }
};

export const deleteCareShift = async (shiftId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('care_shifts')
      .delete()
      .eq('id', shiftId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting care shift:", error);
    throw error;
  }
};

export const claimCareShift = async (shiftId: string, caregiverId: string): Promise<CareShift | null> => {
  try {
    const { data: shiftData, error: checkError } = await supabase
      .from('care_shifts')
      .select('caregiver_id, status')
      .eq('id', shiftId)
      .single();
    
    if (checkError) throw checkError;
    
    if (shiftData.caregiver_id) {
      throw new Error("This shift has already been claimed by another caregiver");
    }
    
    const { data, error } = await supabase
      .from('care_shifts')
      .update({
        caregiver_id: caregiverId,
        status: 'assigned'
      })
      .eq('id', shiftId)
      .select('*')
      .single();

    if (error) throw error;
    
    try {
      console.log(`Shift ${shiftId} has been claimed by caregiver ${caregiverId}`);
    } catch (notificationError) {
      console.error("Failed to send notification:", notificationError);
    }
    
    return data as unknown as CareShift;
  } catch (error) {
    console.error("Error claiming care shift:", error);
    throw error;
  }
};

export const fetchOpenShiftsForCaregiver = async (caregiverId: string): Promise<CareShift[]> => {
  try {
    const { data: teamMemberships, error: teamError } = await supabase
      .from('care_team_members')
      .select('care_plan_id')
      .eq('caregiver_id', caregiverId)
      .eq('status', 'active');
    
    if (teamError) throw teamError;
    
    if (!teamMemberships || teamMemberships.length === 0) {
      return [];
    }
    
    const carePlanIds = teamMemberships.map(tm => tm.care_plan_id);
    
    const { data, error } = await supabase
      .from('care_shifts')
      .select('*')
      .in('care_plan_id', carePlanIds)
      .is('caregiver_id', null)
      .eq('status', 'open')
      .gt('start_time', new Date().toISOString())
      .order('start_time', { ascending: true });
    
    if (error) throw error;
    return (data || []) as unknown as CareShift[];
  } catch (error) {
    console.error("Error fetching open shifts for caregiver:", error);
    throw error;
  }
};

export const fetchCaregiverShifts = async (caregiverId: string): Promise<CareShift[]> => {
  try {
    const { data, error } = await supabase
      .from('care_shifts')
      .select('*')
      .eq('caregiver_id', caregiverId)
      .order('start_time', { ascending: true });
    
    if (error) throw error;
    return (data || []) as unknown as CareShift[];
  } catch (error) {
    console.error("Error fetching caregiver shifts:", error);
    throw error;
  }
};

export const fetchCareRecipientProfile = async (userId: string): Promise<CareRecipientProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('care_recipient_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data as unknown as CareRecipientProfile;
  } catch (error) {
    console.error("Error fetching care recipient profile:", error);
    throw error;
  }
};
