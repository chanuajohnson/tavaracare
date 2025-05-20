
import { supabase } from "@/lib/supabase";
import { CarePlan } from "../types/carePlan";
import { DbCarePlan, DbCarePlanInsert } from "../types/carePlan";
import { adaptCarePlanFromDb, adaptCarePlanToDb } from "../adapters/carePlanAdapter";
import { v4 as uuidv4 } from 'uuid';

/**
 * Service for managing care plans
 */
export class CarePlanService {
  
  /**
   * Get a care plan by ID
   */
  async getCarePlan(id: string): Promise<CarePlan | null> {
    try {
      const { data, error } = await supabase
        .from('care_plans')
        .select('*')
        .eq('id', id)
        .maybeSingle();
        
      if (error) {
        console.error("[CarePlanService] getCarePlan error:", error);
        throw error;
      }
      
      return data ? adaptCarePlanFromDb(data) : null;
    } catch (error) {
      console.error("[CarePlanService] getCarePlan exception:", error);
      throw error;
    }
  }
  
  /**
   * Get care plans for a family
   */
  async getCarePlansForFamily(familyId: string): Promise<CarePlan[]> {
    try {
      const { data, error } = await supabase
        .from('care_plans')
        .select('*')
        .eq('family_id', familyId);
        
      if (error) {
        console.error("[CarePlanService] getCarePlansForFamily error:", error);
        throw error;
      }
      
      return (data || []).map(item => adaptCarePlanFromDb(item));
    } catch (error) {
      console.error("[CarePlanService] getCarePlansForFamily exception:", error);
      throw error;
    }
  }
  
  /**
   * Create a new care plan
   */
  async createCarePlan(carePlan: Omit<CarePlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<CarePlan> {
    const id = uuidv4();
    const dbCarePlan = adaptCarePlanToDb({
      ...carePlan,
      id
    });
    
    try {
      const { data, error } = await supabase
        .from('care_plans')
        .insert([dbCarePlan])
        .select()
        .single();
        
      if (error) {
        console.error("[CarePlanService] createCarePlan error:", error);
        throw error;
      }
      
      if (!data) {
        throw new Error(`Inserted care plan with ID ${id} not found`);
      }
      
      return adaptCarePlanFromDb(data);
    } catch (error) {
      console.error("[CarePlanService] createCarePlan exception:", error);
      throw error;
    }
  }
  
  /**
   * Update a care plan
   */
  async updateCarePlan(id: string, updates: Partial<CarePlan>): Promise<CarePlan> {
    const dbUpdates = adaptCarePlanToDb(updates);
    
    try {
      const { data, error } = await supabase
        .from('care_plans')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        console.error("[CarePlanService] updateCarePlan error:", error);
        throw error;
      }
      
      if (!data) {
        throw new Error(`Updated care plan with ID ${id} not found`);
      }
      
      return adaptCarePlanFromDb(data);
    } catch (error) {
      console.error("[CarePlanService] updateCarePlan exception:", error);
      throw error;
    }
  }
  
  /**
   * Delete a care plan
   */
  async deleteCarePlan(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('care_plans')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error("[CarePlanService] deleteCarePlan error:", error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error("[CarePlanService] deleteCarePlan exception:", error);
      throw error;
    }
  }
  
  /**
   * Update care plan status
   */
  async updateCarePlanStatus(id: string, status: 'active' | 'completed' | 'cancelled'): Promise<CarePlan> {
    return this.updateCarePlan(id, { status });
  }
}

// Create a singleton instance
export const carePlanService = new CarePlanService();
