
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Json } from "@/utils/json";

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

function isValidCarePlanMetadata(data: any): data is CarePlanMetadata {
  return (
    data &&
    typeof data === 'object' &&
    'plan_type' in data &&
    (data.plan_type === 'scheduled' || data.plan_type === 'on-demand' || data.plan_type === 'both')
  );
}

function convertToCarePlanMetadata(data: Json | null): CarePlanMetadata | undefined {
  if (!data) return undefined;
  
  if (isValidCarePlanMetadata(data)) {
    return data as CarePlanMetadata;
  }
  
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      if (isValidCarePlanMetadata(parsed)) {
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse metadata JSON string:", e);
    }
  }
  
  console.warn("Invalid care plan metadata format:", data);
  return undefined;
}

function createDefaultMetadata(): CarePlanMetadata {
  return {
    plan_type: 'scheduled',
    weekday_coverage: '8am-4pm',
    weekend_coverage: 'no',
    additional_shifts: {
      weekdayEvening4pmTo6am: false,
    }
  };
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

    return (data || []).map(plan => ({
      ...plan,
      status: plan.status as 'active' | 'completed' | 'cancelled',
      metadata: convertToCarePlanMetadata(plan.metadata),
    }));
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

    return data ? {
      ...data,
      status: data.status as 'active' | 'completed' | 'cancelled',
      metadata: convertToCarePlanMetadata(data.metadata)
    } : null;
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
    const planData = {
      title: plan.title,
      description: plan.description,
      family_id: plan.family_id,
      status: plan.status,
      metadata: plan.metadata || createDefaultMetadata(),
    };
    
    const { data, error } = await supabase
      .from('care_plans')
      .insert({
        ...planData,
        metadata: planData.metadata as unknown as Json
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast.success("Care plan created successfully");
    
    return data ? {
      ...data,
      status: data.status as 'active' | 'completed' | 'cancelled',
      metadata: convertToCarePlanMetadata(data.metadata)
    } : null;
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
    const updateData: any = { ...updates };
    
    if (updates.metadata) {
      updateData.metadata = updates.metadata as unknown as Json;
    }
    
    const { data, error } = await supabase
      .from('care_plans')
      .update(updateData)
      .eq('id', planId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast.success("Care plan updated successfully");
    
    return data ? {
      ...data,
      status: data.status as 'active' | 'completed' | 'cancelled',
      metadata: convertToCarePlanMetadata(data.metadata)
    } : null;
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
