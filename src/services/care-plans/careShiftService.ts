
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// Domain model for care shifts (camelCase)
export interface CareShift {
  id: string;
  carePlanId: string;
  familyId: string;
  caregiverId?: string;
  title: string;
  description?: string;
  location?: string;
  status: 'open' | 'assigned' | 'completed' | 'cancelled';
  startTime: string;
  endTime: string;
  recurringPattern?: string;
  recurrenceRule?: string;
  createdAt: string;
  updatedAt: string;
  googleCalendarEventId?: string;
}

// Database model for care shifts (snake_case)
interface DbCareShift {
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

// Adapters for converting between domain and database models
const adaptCareShiftFromDb = (dbShift: DbCareShift): CareShift => ({
  id: dbShift.id,
  carePlanId: dbShift.care_plan_id,
  familyId: dbShift.family_id,
  caregiverId: dbShift.caregiver_id,
  title: dbShift.title,
  description: dbShift.description,
  location: dbShift.location,
  status: dbShift.status,
  startTime: dbShift.start_time,
  endTime: dbShift.end_time,
  recurringPattern: dbShift.recurring_pattern,
  recurrenceRule: dbShift.recurrence_rule,
  createdAt: dbShift.created_at,
  updatedAt: dbShift.updated_at,
  googleCalendarEventId: dbShift.google_calendar_event_id
});

const adaptCareShiftToDb = (shift: Partial<CareShift>): Partial<DbCareShift> => ({
  care_plan_id: shift.carePlanId,
  family_id: shift.familyId,
  caregiver_id: shift.caregiverId,
  title: shift.title,
  description: shift.description,
  location: shift.location,
  status: shift.status,
  start_time: shift.startTime,
  end_time: shift.endTime,
  recurring_pattern: shift.recurringPattern,
  recurrence_rule: shift.recurrenceRule,
  google_calendar_event_id: shift.googleCalendarEventId
});

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

    return (data || []).map(shift => adaptCareShiftFromDb(shift as DbCareShift));
  } catch (error) {
    console.error("Error fetching care shifts:", error);
    toast.error("Failed to load care schedule");
    return [];
  }
};

export const createCareShift = async (
  shift: Omit<CareShift, 'id' | 'createdAt' | 'updatedAt'>
): Promise<CareShift | null> => {
  try {
    const dbShift = adaptCareShiftToDb(shift);
    const { data, error } = await supabase
      .from('care_shifts')
      .insert(dbShift)
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast.success("Care shift created successfully");
    
    return data ? adaptCareShiftFromDb(data as DbCareShift) : null;
  } catch (error) {
    console.error("Error creating care shift:", error);
    toast.error("Failed to create care shift");
    return null;
  }
};

export const updateCareShift = async (
  shiftId: string,
  updates: Partial<Omit<CareShift, 'id' | 'carePlanId' | 'familyId' | 'createdAt' | 'updatedAt'>>
): Promise<CareShift | null> => {
  try {
    const dbUpdates = adaptCareShiftToDb(updates);
    const { data, error } = await supabase
      .from('care_shifts')
      .update(dbUpdates)
      .eq('id', shiftId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast.success("Care shift updated successfully");
    
    return data ? adaptCareShiftFromDb(data as DbCareShift) : null;
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
