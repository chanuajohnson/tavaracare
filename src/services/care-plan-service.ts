
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
  weekday_coverage?: '8am-4pm' | '6am-6pm' | 'none';
  weekend_coverage?: 'yes' | 'no';
  additional_shifts?: {
    weekdayEvening: boolean;
    weekdayOvernight: boolean;
    weekendEvening: boolean;
    weekendOvernight: boolean;
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

    toast.success("Team member invited successfully");
    return data;
  } catch (error) {
    console.error("Error inviting team member:", error);
    toast.error("Failed to invite team member");
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
