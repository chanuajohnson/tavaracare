
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface CarePlan {
  id: string;
  family_id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  metadata?: any;
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

export const fetchCarePlans = async (familyId: string): Promise<CarePlan[]> => {
  try {
    const { data, error } = await supabase
      .from('care_plans')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data as CarePlan[];
  } catch (error) {
    console.error("Error fetching care plans:", error);
    toast.error("Failed to load care plans");
    return [];
  }
};

export const fetchCarePlanById = async (planId: string): Promise<CarePlan | null> => {
  try {
    const { data, error } = await supabase
      .from('care_plans')
      .select('*')
      .eq('id', planId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data as CarePlan | null;
  } catch (error) {
    console.error("Error fetching care plan:", error);
    toast.error("Failed to load care plan");
    return null;
  }
};

export const createCarePlan = async (plan: Omit<CarePlan, 'id' | 'created_at' | 'updated_at'>): Promise<CarePlan | null> => {
  try {
    const { data, error } = await supabase
      .from('care_plans')
      .insert([plan])
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast.success("Care plan created successfully");
    return data as CarePlan;
  } catch (error) {
    console.error("Error creating care plan:", error);
    toast.error("Failed to create care plan");
    return null;
  }
};

export const updateCarePlan = async (planId: string, updates: Partial<Omit<CarePlan, 'id' | 'created_at' | 'updated_at'>>): Promise<CarePlan | null> => {
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
    return data as CarePlan;
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
