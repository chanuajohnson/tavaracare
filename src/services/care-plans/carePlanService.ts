
import { supabase } from "@/lib/supabase";

export interface CarePlan {
  id: string;
  title: string;
  description?: string;
  family_id: string;
  status: string;
  metadata?: any;
  created_at: string;
  updated_at?: string;
}

export interface CarePlanDto extends CarePlan {}
export interface CarePlanInput extends Omit<CarePlan, 'id' | 'created_at' | 'updated_at'> {}

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
    return data;
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

    return data || [];
  } catch (error) {
    console.error('Failed to fetch care plans for family:', error);
    throw error;
  }
};

export const fetchCarePlansForFamily = fetchCarePlans; // Alias for backward compatibility

export const createCarePlan = async (carePlan: CarePlanInput): Promise<CarePlan> => {
  try {
    const { data, error } = await supabase
      .from('care_plans')
      .insert(carePlan)
      .select()
      .single();

    if (error) {
      console.error('Error creating care plan:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to create care plan:', error);
    throw error;
  }
};

export const updateCarePlan = async (id: string, updates: Partial<CarePlan>): Promise<CarePlan> => {
  try {
    const { data, error } = await supabase
      .from('care_plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating care plan:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to update care plan:', error);
    throw error;
  }
};
