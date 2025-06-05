
import { supabase } from "@/lib/supabase";
import { CarePlan, CarePlanInput, CarePlanDto } from "@/types/carePlan";
import { Json } from "@/utils/json";

// Database interface (snake_case)
interface DbCarePlan {
  id: string;
  title: string;
  description?: string;
  family_id: string;
  status: string;
  metadata?: Json;
  created_at: string;
  updated_at?: string;
}

// Transform database format to frontend format
const transformCarePlanFromDb = (dbPlan: DbCarePlan): CarePlan => {
  return {
    id: dbPlan.id,
    title: dbPlan.title,
    description: dbPlan.description || '',
    familyId: dbPlan.family_id,
    status: dbPlan.status as 'active' | 'completed' | 'cancelled',
    metadata: dbPlan.metadata as any, // Cast Json to CarePlanMetadata
    createdAt: dbPlan.created_at,
    updatedAt: dbPlan.updated_at || dbPlan.created_at
  };
};

// Transform frontend format to database format
const transformCarePlanToDb = (plan: Partial<CarePlan>): Partial<DbCarePlan> => {
  const dbPlan: Partial<DbCarePlan> = {
    title: plan.title,
    description: plan.description,
    status: plan.status,
    metadata: plan.metadata as unknown as Json // Cast CarePlanMetadata to Json via unknown
  };
  
  if (plan.familyId) {
    dbPlan.family_id = plan.familyId;
  }
  
  return dbPlan;
};

export const fetchCarePlanById = async (carePlanId: string): Promise<CarePlan | null> => {
  try {
    console.log(`Fetching care plan with ID: ${carePlanId}`);
    
    const { data, error } = await supabase
      .from('care_plans')
      .select('*')
      .eq('id', carePlanId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching care plan:', error);
      throw error;
    }

    if (!data) {
      console.log('No care plan found with ID:', carePlanId);
      return null;
    }

    console.log('Successfully fetched care plan:', data);
    return transformCarePlanFromDb(data);
  } catch (error) {
    console.error('Failed to fetch care plan:', error);
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

    if (error) {
      console.error('Error fetching care plans for family:', error);
      throw error;
    }

    return (data || []).map(transformCarePlanFromDb);
  } catch (error) {
    console.error('Failed to fetch care plans for family:', error);
    throw error;
  }
};

export const fetchCarePlansForFamily = fetchCarePlans; // Alias for backward compatibility

export const createCarePlan = async (carePlan: CarePlanInput): Promise<CarePlan> => {
  try {
    const dbCarePlan = {
      title: carePlan.title,
      description: carePlan.description,
      family_id: carePlan.familyId,
      status: carePlan.status,
      metadata: carePlan.metadata as unknown as Json // Cast CarePlanMetadata to Json via unknown
    };

    const { data, error } = await supabase
      .from('care_plans')
      .insert(dbCarePlan)
      .select()
      .single();

    if (error) {
      console.error('Error creating care plan:', error);
      throw error;
    }

    return transformCarePlanFromDb(data);
  } catch (error) {
    console.error('Failed to create care plan:', error);
    throw error;
  }
};

export const updateCarePlan = async (id: string, updates: Partial<CarePlan>): Promise<CarePlan> => {
  try {
    const dbUpdates = transformCarePlanToDb(updates);

    const { data, error } = await supabase
      .from('care_plans')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating care plan:', error);
      throw error;
    }

    return transformCarePlanFromDb(data);
  } catch (error) {
    console.error('Failed to update care plan:', error);
    throw error;
  }
};
