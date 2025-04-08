
import { DatabaseService } from "./databaseService";
import { CarePlan } from "../types/carePlan";
import { DbCarePlan, DbCarePlanInsert } from "../types/carePlan";
import { adaptCarePlanFromDb, adaptCarePlanToDb } from "../adapters/carePlanAdapter";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from 'uuid';

export class CarePlanService extends DatabaseService<CarePlan, DbCarePlanInsert, 'care_plans'> {
  constructor() {
    super('care_plans', adaptCarePlanFromDb);
  }
  
  /**
   * Get a care plan by ID
   */
  async getCarePlan(id: string): Promise<CarePlan | null> {
    return this.getSingle(id);
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
    
    return this.insert(dbCarePlan);
  }
  
  /**
   * Update a care plan
   */
  async updateCarePlan(id: string, updates: Partial<CarePlan>): Promise<CarePlan> {
    const dbUpdates = adaptCarePlanToDb(updates);
    return this.update(id, dbUpdates);
  }
  
  /**
   * Delete a care plan
   */
  async deleteCarePlan(id: string): Promise<boolean> {
    return this.delete(id);
  }
  
  /**
   * Update care plan status
   */
  async updateCarePlanStatus(id: string, status: 'active' | 'completed' | 'cancelled'): Promise<CarePlan> {
    return this.update(id, { status });
  }
}

// Create a singleton instance
export const carePlanService = new CarePlanService();
