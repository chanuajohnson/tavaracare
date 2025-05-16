
import { supabase } from '@/lib/supabase';
import { Medication, MedicationAdministration } from '@/types/medicationTypes';
import { toast } from 'sonner';

export const medicationService = {
  // Fetch medications for a care plan
  async fetchMedications(carePlanId: string): Promise<Medication[]> {
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('care_plan_id', carePlanId)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching medications:', error);
      toast.error('Failed to load medications');
      return [];
    }
  },

  // Fetch a single medication by ID
  async fetchMedicationById(medicationId: string): Promise<Medication | null> {
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('id', medicationId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching medication:', error);
      toast.error('Failed to load medication details');
      return null;
    }
  },

  // Create a new medication
  async createMedication(medication: Omit<Medication, 'id' | 'created_at' | 'updated_at'>): Promise<Medication | null> {
    try {
      const { data, error } = await supabase
        .from('medications')
        .insert(medication)
        .select('*')
        .single();

      if (error) throw error;
      toast.success('Medication added successfully');
      return data;
    } catch (error) {
      console.error('Error creating medication:', error);
      toast.error('Failed to add medication');
      return null;
    }
  },

  // Update an existing medication
  async updateMedication(medicationId: string, updates: Partial<Medication>): Promise<Medication | null> {
    try {
      const { data, error } = await supabase
        .from('medications')
        .update(updates)
        .eq('id', medicationId)
        .select('*')
        .single();

      if (error) throw error;
      toast.success('Medication updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating medication:', error);
      toast.error('Failed to update medication');
      return null;
    }
  },

  // Delete a medication
  async deleteMedication(medicationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', medicationId);

      if (error) throw error;
      toast.success('Medication deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting medication:', error);
      toast.error('Failed to delete medication');
      return false;
    }
  },

  // Fetch medication administrations for a medication
  async fetchAdministrations(medicationId: string): Promise<MedicationAdministration[]> {
    try {
      const { data, error } = await supabase
        .from('medication_administrations')
        .select(`
          *,
          profiles:administered_by (full_name)
        `)
        .eq('medication_id', medicationId)
        .order('administered_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to include caregiver_name
      return (data || []).map(item => ({
        ...item,
        caregiver_name: item.profiles?.full_name || 'Unknown'
      }));
    } catch (error) {
      console.error('Error fetching medication administrations:', error);
      toast.error('Failed to load medication history');
      return [];
    }
  },

  // Record a medication administration
  async recordAdministration(administration: Omit<MedicationAdministration, 'id' | 'created_at' | 'updated_at' | 'caregiver_name'>): Promise<MedicationAdministration | null> {
    try {
      const { data, error } = await supabase
        .from('medication_administrations')
        .insert(administration)
        .select('*')
        .single();

      if (error) throw error;
      toast.success('Medication administration recorded');
      return data;
    } catch (error) {
      console.error('Error recording medication administration:', error);
      toast.error('Failed to record medication administration');
      return null;
    }
  },

  // Count medications for a care plan
  async countMedications(carePlanId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('medications')
        .select('id', { count: 'exact', head: true })
        .eq('care_plan_id', carePlanId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error counting medications:', error);
      return 0;
    }
  }
};
