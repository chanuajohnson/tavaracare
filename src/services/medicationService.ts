import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { medicationConflictService, ConflictResolution } from "./medicationConflictService";

// Types aligned with your database schema
export interface Medication {
  id: string;
  name: string;
  dosage?: string;
  medication_type?: string;
  instructions?: string;
  prescription_terms?: string;
  special_instructions?: string;
  schedule?: any; // JSONB field
  term_definitions?: any; // JSONB field
  care_plan_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface MedicationAdministration {
  id: string;
  medication_id: string;
  administered_at: string;
  administered_by?: string;
  status: 'administered' | 'missed' | 'refused';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MedicationWithAdministrations extends Medication {
  recent_administrations?: MedicationAdministration[];
  next_dose?: string;
  adherence_rate?: number;
}

export class MedicationService {
  /**
   * Helper function to ensure proper typing for medication administrations
   */
  private mapAdministrationData(data: any[]): MedicationAdministration[] {
    return data.map(admin => ({
      ...admin,
      status: admin.status as 'administered' | 'missed' | 'refused'
    }));
  }

  /**
   * Get all medications for a care plan
   */
  async getMedicationsForCarePlan(carePlanId: string): Promise<MedicationWithAdministrations[]> {
    try {
      const { data: medications, error } = await supabase
        .from('medications')
        .select('*')
        .eq('care_plan_id', carePlanId)
        .order('name');

      if (error) {
        console.error("[MedicationService] Error fetching medications:", error);
        throw error;
      }

      // Get recent administrations for each medication
      const medicationsWithAdministrations = await Promise.all(
        (medications || []).map(async (med) => {
          const { data: administrations } = await supabase
            .from('medication_administrations')
            .select('*')
            .eq('medication_id', med.id)
            .order('administered_at', { ascending: false })
            .limit(5);

          const mappedAdministrations = this.mapAdministrationData(administrations || []);

          return {
            ...med,
            recent_administrations: mappedAdministrations,
            next_dose: this.calculateNextDose(med.schedule),
            adherence_rate: this.calculateAdherenceRate(mappedAdministrations)
          };
        })
      );

      return medicationsWithAdministrations;
    } catch (error) {
      console.error("[MedicationService] Exception in getMedicationsForCarePlan:", error);
      toast.error("Failed to load medications");
      return [];
    }
  }

  /**
   * Get single medication by ID
   */
  async getMedicationById(medicationId: string): Promise<Medication | null> {
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('id', medicationId)
        .maybeSingle();

      if (error) {
        console.error("[MedicationService] Error fetching medication:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("[MedicationService] Exception in getMedicationById:", error);
      toast.error("Failed to load medication");
      return null;
    }
  }

  /**
   * Create new medication
   */
  async createMedication(medication: Omit<Medication, 'id' | 'created_at' | 'updated_at'>): Promise<Medication | null> {
    try {
      const { data, error } = await supabase
        .from('medications')
        .insert([medication])
        .select()
        .single();

      if (error) {
        console.error("[MedicationService] Error creating medication:", error);
        throw error;
      }

      toast.success("Medication added successfully");
      return data;
    } catch (error) {
      console.error("[MedicationService] Exception in createMedication:", error);
      toast.error("Failed to add medication");
      return null;
    }
  }

  /**
   * Update medication
   */
  async updateMedication(medicationId: string, updates: Partial<Medication>): Promise<Medication | null> {
    try {
      const { data, error } = await supabase
        .from('medications')
        .update(updates)
        .eq('id', medicationId)
        .select()
        .single();

      if (error) {
        console.error("[MedicationService] Error updating medication:", error);
        throw error;
      }

      toast.success("Medication updated successfully");
      return data;
    } catch (error) {
      console.error("[MedicationService] Exception in updateMedication:", error);
      toast.error("Failed to update medication");
      return null;
    }
  }

  /**
   * Delete medication
   */
  async deleteMedication(medicationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', medicationId);

      if (error) {
        console.error("[MedicationService] Error deleting medication:", error);
        throw error;
      }

      toast.success("Medication deleted successfully");
      return true;
    } catch (error) {
      console.error("[MedicationService] Exception in deleteMedication:", error);
      toast.error("Failed to delete medication");
      return false;
    }
  }

  /**
   * Record medication administration with conflict detection
   */
  async recordAdministrationWithConflictDetection(
    medicationId: string,
    administeredAt: string,
    administeredBy: string,
    userRole: 'family' | 'professional',
    notes?: string,
    conflictResolution?: ConflictResolution
  ) {
    return await medicationConflictService.recordAdministrationWithConflictCheck(
      medicationId,
      administeredAt,
      administeredBy,
      userRole,
      notes,
      conflictResolution
    );
  }

  /**
   * Enhanced record administration (backwards compatible)
   */
  async recordAdministration(administration: Omit<MedicationAdministration, 'id' | 'created_at' | 'updated_at'>): Promise<MedicationAdministration | null> {
    try {
      const { data, error } = await supabase
        .from('medication_administrations')
        .insert([{
          ...administration,
          administered_by_role: 'professional' // Default for backwards compatibility
        }])
        .select()
        .single();

      if (error) {
        console.error("[MedicationService] Error recording administration:", error);
        throw error;
      }

      toast.success("Medication administration recorded");
      return {
        ...data,
        status: data.status as 'administered' | 'missed' | 'refused'
      };
    } catch (error) {
      console.error("[MedicationService] Exception in recordAdministration:", error);
      toast.error("Failed to record administration");
      return null;
    }
  }

  /**
   * Get administrations with conflict information
   */
  async getMedicationAdministrationsWithConflicts(medicationId: string, limit?: number) {
    return await medicationConflictService.getAdministrationHistory(medicationId, limit);
  }

  /**
   * Get administrations for a medication
   */
  async getMedicationAdministrations(medicationId: string, limit?: number): Promise<MedicationAdministration[]> {
    try {
      let query = supabase
        .from('medication_administrations')
        .select('*')
        .eq('medication_id', medicationId)
        .order('administered_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error("[MedicationService] Error fetching administrations:", error);
        throw error;
      }

      return this.mapAdministrationData(data || []);
    } catch (error) {
      console.error("[MedicationService] Exception in getMedicationAdministrations:", error);
      return [];
    }
  }

  /**
   * Get medications for assigned care plans (professional view)
   */
  async getMedicationsForAssignedCarePlans(professionalId: string): Promise<{[carePlanId: string]: MedicationWithAdministrations[]}> {
    try {
      // First get care plans assigned to this professional
      const { data: careTeamMembers, error: teamError } = await supabase
        .from('care_team_members')
        .select('care_plan_id')
        .eq('caregiver_id', professionalId)
        .eq('status', 'active');

      if (teamError) {
        console.error("[MedicationService] Error fetching assigned care plans:", teamError);
        throw teamError;
      }

      const carePlanIds = careTeamMembers?.map(member => member.care_plan_id) || [];
      const medicationsByCarePlan: {[key: string]: MedicationWithAdministrations[]} = {};

      // Get medications for each care plan
      for (const carePlanId of carePlanIds) {
        if (carePlanId) {
          medicationsByCarePlan[carePlanId] = await this.getMedicationsForCarePlan(carePlanId);
        }
      }

      return medicationsByCarePlan;
    } catch (error) {
      console.error("[MedicationService] Exception in getMedicationsForAssignedCarePlans:", error);
      toast.error("Failed to load assigned medications");
      return {};
    }
  }

  /**
   * Helper: Calculate next dose time based on schedule
   */
  private calculateNextDose(schedule: any): string | undefined {
    if (!schedule || !schedule.times) return undefined;
    
    // Simple implementation - in real app, would be more sophisticated
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    if (Array.isArray(schedule.times)) {
      const nextTime = schedule.times.find((time: string) => {
        const doseTime = new Date(`${today}T${time}`);
        return doseTime > now;
      });
      
      if (nextTime) {
        return `${today}T${nextTime}`;
      }
    }
    
    return undefined;
  }

  /**
   * Helper: Calculate adherence rate from administrations
   */
  private calculateAdherenceRate(administrations: MedicationAdministration[]): number {
    if (administrations.length === 0) return 0;
    
    const administered = administrations.filter(admin => admin.status === 'administered').length;
    return Math.round((administered / administrations.length) * 100);
  }
}

// Create singleton instance
export const medicationService = new MedicationService();
