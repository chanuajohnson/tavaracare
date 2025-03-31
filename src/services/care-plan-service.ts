import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface CarePlan {
  id: string;
  title: string;
  description: string;
  family_id: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  metadata?: CarePlanMetadata;
}

export interface CarePlanMetadata {
  plan_type: 'scheduled' | 'on-demand' | 'both';
  weekday_coverage?: '8am-4pm' | '6am-6pm' | '6pm-8am' | 'none';
  weekend_coverage?: 'yes' | 'no';
  additional_shifts?: {
    weekdayEvening4pmTo6am?: boolean;
    weekdayEvening4pmTo8am?: boolean;
    weekdayEvening6pmTo6am?: boolean;
    weekdayEvening6pmTo8am?: boolean;
  };
}

export interface CareTask {
  id: string;
  care_plan_id: string;
  assigned_to: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface CareTeamMember {
  id: string;
  care_plan_id: string;
  family_id: string;
  caregiver_id: string;
  role: 'caregiver' | 'nurse' | 'therapist' | 'doctor' | 'other';
  status: 'invited' | 'active' | 'declined' | 'removed';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CareShift {
  id: string;
  care_plan_id: string;
  family_id: string;
  caregiver_id?: string;
  title: string;
  description?: string;
  location?: string;
  status: 'open' | 'assigned' | 'completed' | 'cancelled';
  start_time: string;
  end_time: string;
  recurring_pattern?: string;
  recurrence_rule?: string;
  created_at: string;
  updated_at: string;
  google_calendar_event_id?: string;
}

export const fetchCarePlans = async (userId: string): Promise<CarePlan[]> => {
  try {
    const { data, error } = await supabase
      .from('care_plans')
      .select('*')
      .eq('family_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching care plans:", error);
    toast.error("Failed to load care plans");
    return [];
  }
};

export const fetchCarePlan = async (planId: string): Promise<CarePlan | null> => {
  try {
    const { data, error } = await supabase
      .from('care_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching care plan:", error);
    toast.error("Failed to load care plan details");
    return null;
  }
};

export const createCarePlan = async (
  plan: Omit<CarePlan, 'id' | 'created_at' | 'updated_at'>
): Promise<CarePlan | null> => {
  try {
    const { data, error } = await supabase
      .from('care_plans')
      .insert(plan)
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast.success("Care plan created successfully");
    return data;
  } catch (error) {
    console.error("Error creating care plan:", error);
    toast.error("Failed to create care plan");
    return null;
  }
};

export const updateCarePlan = async (
  planId: string,
  updates: Partial<Omit<CarePlan, 'id' | 'family_id' | 'created_at' | 'updated_at'>>
): Promise<CarePlan | null> => {
  try {
    const { data, error } = await supabase
      .from('care_plans')
      .update(updates)
      .eq('id', planId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast.success("Care plan updated successfully");
    return data;
  } catch (error) {
    console.error("Error updating care plan:", error);
    toast.error("Failed to update care plan");
    return null;
  }
};

export const deleteCarePlan = async (planId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('care_plans')
      .delete()
      .eq('id', planId);

    if (error) {
      throw error;
    }

    toast.success("Care plan deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting care plan:", error);
    toast.error("Failed to delete care plan");
    return false;
  }
};

export const fetchCareTeamMembers = async (planId: string): Promise<CareTeamMember[]> => {
  try {
    const { data, error } = await supabase
      .from('care_team_members')
      .select('*')
      .eq('care_plan_id', planId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching care team members:", error);
    toast.error("Failed to load care team members");
    return [];
  }
};

export const inviteCareTeamMember = async (
  member: Omit<CareTeamMember, 'id' | 'created_at' | 'updated_at'>
): Promise<CareTeamMember | null> => {
  try {
    const { data, error } = await supabase
      .from('care_team_members')
      .insert(member)
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast.success("Team member assigned successfully");
    return data;
  } catch (error) {
    console.error("Error assigning team member:", error);
    toast.error("Failed to assign team member");
    return null;
  }
};

export const updateCareTeamMember = async (
  memberId: string,
  updates: Partial<Omit<CareTeamMember, 'id' | 'care_plan_id' | 'family_id' | 'caregiver_id' | 'created_at' | 'updated_at'>>
): Promise<CareTeamMember | null> => {
  try {
    const { data, error } = await supabase
      .from('care_team_members')
      .update(updates)
      .eq('id', memberId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast.success("Team member updated successfully");
    return data;
  } catch (error) {
    console.error("Error updating team member:", error);
    toast.error("Failed to update team member");
    return null;
  }
};

export const removeCareTeamMember = async (memberId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('care_team_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      throw error;
    }

    toast.success("Team member removed successfully");
    return true;
  } catch (error) {
    console.error("Error removing team member:", error);
    toast.error("Failed to remove team member");
    return false;
  }
};

export const fetchCareShifts = async (planId: string): Promise<CareShift[]> => {
  try {
    const { data, error } = await supabase
      .from('care_shifts')
      .select('*')
      .eq('care_plan_id', planId)
      .order('start_time', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching care shifts:", error);
    toast.error("Failed to load care schedule");
    return [];
  }
};

export const createCareShift = async (
  shift: Omit<CareShift, 'id' | 'created_at' | 'updated_at'>
): Promise<CareShift | null> => {
  try {
    const { data, error } = await supabase
      .from('care_shifts')
      .insert(shift)
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast.success("Care shift created successfully");
    return data;
  } catch (error) {
    console.error("Error creating care shift:", error);
    toast.error("Failed to create care shift");
    return null;
  }
};

export const updateCareShift = async (
  shiftId: string,
  updates: Partial<Omit<CareShift, 'id' | 'care_plan_id' | 'family_id' | 'created_at' | 'updated_at'>>
): Promise<CareShift | null> => {
  try {
    const { data, error } = await supabase
      .from('care_shifts')
      .update(updates)
      .eq('id', shiftId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast.success("Care shift updated successfully");
    return data;
  } catch (error) {
    console.error("Error updating care shift:", error);
    toast.error("Failed to update care shift");
    return null;
  }
};

export const deleteCareShift = async (shiftId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('care_shifts')
      .delete()
      .eq('id', shiftId);

    if (error) {
      throw error;
    }

    toast.success("Care shift deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting care shift:", error);
    toast.error("Failed to delete care shift");
    return false;
  }
};
