
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { CarePlan, CarePlanMetadata } from "@/types/careTypes";

// Database model for care plans
export interface DbCarePlan {
  id: string;
  family_id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  metadata?: any;
}

// Adapters for converting between domain and database models
export const adaptCarePlanFromDb = (dbPlan: DbCarePlan): CarePlan => ({
  id: dbPlan.id,
  familyId: dbPlan.family_id,
  title: dbPlan.title,
  description: dbPlan.description,
  status: dbPlan.status,
  createdAt: dbPlan.created_at,
  updatedAt: dbPlan.updated_at,
  metadata: dbPlan.metadata as CarePlanMetadata
});

export const adaptCarePlanToDb = (plan: Partial<CarePlan>): Partial<DbCarePlan> => ({
  id: plan.id,
  family_id: plan.familyId,
  title: plan.title,
  description: plan.description,
  status: plan.status,
  metadata: plan.metadata
});

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

    return (data || []).map(plan => adaptCarePlanFromDb(plan as DbCarePlan));
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

    return data ? adaptCarePlanFromDb(data as DbCarePlan) : null;
  } catch (error) {
    console.error("Error fetching care plan:", error);
    toast.error("Failed to load care plan");
    return null;
  }
};

export const createCarePlan = async (plan: Omit<CarePlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<CarePlan | null> => {
  try {
    const dbPlan = adaptCarePlanToDb(plan);
    const { data, error } = await supabase
      .from('care_plans')
      .insert([dbPlan])
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast.success("Care plan created successfully");
    return data ? adaptCarePlanFromDb(data as DbCarePlan) : null;
  } catch (error) {
    console.error("Error creating care plan:", error);
    toast.error("Failed to create care plan");
    return null;
  }
};

export const updateCarePlan = async (
  planId: string, 
  updates: Partial<Omit<CarePlan, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<CarePlan | null> => {
  try {
    const dbUpdates = adaptCarePlanToDb(updates);
    const { data, error } = await supabase
      .from('care_plans')
      .update(dbUpdates)
      .eq('id', planId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast.success("Care plan updated successfully");
    return data ? adaptCarePlanFromDb(data as DbCarePlan) : null;
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
