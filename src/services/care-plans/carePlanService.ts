
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { CarePlan, CarePlanMetadata } from "@/types/carePlan";
import { Json } from "@/utils/json";

// Define DTO types for internal use
interface CarePlanDto {
  id?: string;
  family_id: string;
  title: string;
  description?: string;
  status?: 'active' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
  metadata?: Json;
}

interface CarePlanInput {
  familyId: string;
  title: string;
  description?: string;
  status?: 'active' | 'completed' | 'cancelled';
  metadata?: CarePlanMetadata;
}

// Adapters for converting between domain and database models
export const adaptCarePlanFromDb = (dbPlan: CarePlanDto): CarePlan => ({
  id: dbPlan.id!,
  familyId: dbPlan.family_id,
  title: dbPlan.title,
  description: dbPlan.description || "",
  status: dbPlan.status || 'active',
  createdAt: dbPlan.created_at || new Date().toISOString(),
  updatedAt: dbPlan.updated_at || new Date().toISOString(),
  metadata: dbPlan.metadata as unknown as CarePlanMetadata
});

export const adaptCarePlanToDb = (plan: Partial<CarePlan>): Partial<CarePlanDto> => ({
  id: plan.id,
  family_id: plan.familyId,
  title: plan.title,
  description: plan.description,
  status: plan.status,
  metadata: plan.metadata as unknown as Json
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

    return (data || []).map(plan => adaptCarePlanFromDb(plan as CarePlanDto));
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

    return data ? adaptCarePlanFromDb(data as CarePlanDto) : null;
  } catch (error) {
    console.error("Error fetching care plan:", error);
    toast.error("Failed to load care plan");
    return null;
  }
};

export const createCarePlan = async (plan: CarePlanInput): Promise<CarePlan | null> => {
  try {
    // Convert from domain model input to database model
    const dbPlan: CarePlanDto = {
      family_id: plan.familyId,
      title: plan.title,
      description: plan.description,
      status: plan.status || 'active',
      metadata: plan.metadata as unknown as Json
    };

    const { data, error } = await supabase
      .from('care_plans')
      .insert([dbPlan])
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast.success("Care plan created successfully");
    return data ? adaptCarePlanFromDb(data as CarePlanDto) : null;
  } catch (error) {
    console.error("Error creating care plan:", error);
    toast.error("Failed to create care plan");
    return null;
  }
};

export const updateCarePlan = async (
  planId: string, 
  updates: Partial<CarePlanInput>
): Promise<CarePlan | null> => {
  try {
    // Convert from domain model input to database model
    const dbUpdates: Partial<CarePlanDto> = {
      title: updates.title,
      description: updates.description,
      status: updates.status,
      family_id: updates.familyId,
      metadata: updates.metadata as unknown as Json
    };
    
    // Remove undefined properties
    Object.keys(dbUpdates).forEach(key => 
      dbUpdates[key as keyof Partial<CarePlanDto>] === undefined && delete dbUpdates[key as keyof Partial<CarePlanDto>]
    );

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
    return data ? adaptCarePlanFromDb(data as CarePlanDto) : null;
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

// Re-export types for external use
export type { CarePlanInput, CarePlanDto };
