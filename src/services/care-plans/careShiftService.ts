
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface CareShift {
  id: string;
  care_plan_id: string;
  family_id: string;
  caregiver_id?: string;
  title: string;
  description?: string;
  location?: string;
  status: 'open' | 'assigned' | 'completed' | 'cancelled';
  start_time: string;
  end_time: string;
  recurring_pattern?: string;
  recurrence_rule?: string;
  created_at: string;
  updated_at: string;
  google_calendar_event_id?: string;
}

export const fetchCareShifts = async (planId: string): Promise<CareShift[]> => {
  try {
    const { data, error } = await supabase
      .from('care_shifts')
      .select('*')
      .eq('care_plan_id', planId)
      .order('start_time', { ascending: true });

    if (error) {
      throw error;
    }

    return (data || []).map(shift => ({
      ...shift,
      status: shift.status as 'open' | 'assigned' | 'completed' | 'cancelled',
    }));
  } catch (error) {
    console.error("Error fetching care shifts:", error);
    toast.error("Failed to load care schedule");
    return [];
  }
};

export const createCareShift = async (
  shift: Omit<CareShift, 'id' | 'created_at' | 'updated_at'>
): Promise<CareShift | null> => {
  try {
    const { data, error } = await supabase
      .from('care_shifts')
      .insert(shift)
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast.success("Care shift created successfully");
    
    return data ? {
      ...data,
      status: data.status as 'open' | 'assigned' | 'completed' | 'cancelled',
    } : null;
  } catch (error) {
    console.error("Error creating care shift:", error);
    toast.error("Failed to create care shift");
    return null;
  }
};

export const updateCareShift = async (
  shiftId: string,
  updates: Partial<Omit<CareShift, 'id' | 'care_plan_id' | 'family_id' | 'created_at' | 'updated_at'>>
): Promise<CareShift | null> => {
  try {
    const { data, error } = await supabase
      .from('care_shifts')
      .update(updates)
      .eq('id', shiftId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast.success("Care shift updated successfully");
    
    return data ? {
      ...data,
      status: data.status as 'open' | 'assigned' | 'completed' | 'cancelled',
    } : null;
  } catch (error) {
    console.error("Error updating care shift:", error);
    toast.error("Failed to update care shift");
    return null;
  }
};

export const deleteCareShift = async (shiftId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('care_shifts')
      .delete()
      .eq('id', shiftId);

    if (error) {
      throw error;
    }

    toast.success("Care shift deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting care shift:", error);
    toast.error("Failed to delete care shift");
    return false;
  }
};
