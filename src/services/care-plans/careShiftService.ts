
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { CareShift, CareShiftDto, CareShiftInput } from "@/types/careTypes";

// Adapters for converting between domain and database models
export const adaptCareShiftFromDb = (dbShift: CareShiftDto): CareShift => ({
  id: dbShift.id!,
  carePlanId: dbShift.care_plan_id,
  familyId: dbShift.family_id,
  caregiverId: dbShift.caregiver_id,
  title: dbShift.title,
  description: dbShift.description,
  location: dbShift.location,
  status: dbShift.status || 'open',
  startTime: dbShift.start_time,
  endTime: dbShift.end_time,
  recurringPattern: dbShift.recurring_pattern,
  recurrenceRule: dbShift.recurrence_rule,
  createdAt: dbShift.created_at || new Date().toISOString(),
  updatedAt: dbShift.updated_at || new Date().toISOString(),
  googleCalendarEventId: dbShift.google_calendar_event_id
});

export const adaptCareShiftToDb = (shift: Partial<CareShift>): Partial<CareShiftDto> => ({
  id: shift.id,
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

    return (data || []).map(shift => adaptCareShiftFromDb(shift as CareShiftDto));
  } catch (error) {
    console.error("Error fetching care shifts:", error);
    toast.error("Failed to load care schedule");
    return [];
  }
};

export const createCareShift = async (
  shift: CareShiftInput
): Promise<CareShift | null> => {
  try {
    // Determine initial status based on caregiver assignment
    const initialStatus = shift.caregiverId ? 'assigned' : 'open';
    
    // Convert from domain model input to database model
    const dbShift: CareShiftDto = {
      care_plan_id: shift.carePlanId,
      family_id: shift.familyId,
      caregiver_id: shift.caregiverId,
      title: shift.title,
      description: shift.description,
      location: shift.location,
      status: shift.status || initialStatus,
      start_time: shift.startTime,
      end_time: shift.endTime,
      recurring_pattern: shift.recurringPattern,
      recurrence_rule: shift.recurrenceRule,
      google_calendar_event_id: shift.googleCalendarEventId
    };

    const { data, error } = await supabase
      .from('care_shifts')
      .insert([dbShift])
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast.success("Care shift created successfully");
    
    return data ? adaptCareShiftFromDb(data as CareShiftDto) : null;
  } catch (error) {
    console.error("Error creating care shift:", error);
    toast.error("Failed to create care shift");
    return null;
  }
};

export const updateCareShift = async (
  shiftId: string,
  updates: Partial<CareShiftInput>
): Promise<CareShift | null> => {
  try {
    // Automatically update status based on caregiver assignment
    let statusUpdate = {};
    if ('caregiverId' in updates) {
      statusUpdate = {
        status: updates.caregiverId ? 'assigned' : 'open'
      };
    }
    
    // Convert from domain model input to database model
    const dbUpdates: Partial<CareShiftDto> = {
      care_plan_id: updates.carePlanId,
      family_id: updates.familyId,
      caregiver_id: updates.caregiverId,
      title: updates.title,
      description: updates.description,
      location: updates.location,
      status: updates.status,
      start_time: updates.startTime,
      end_time: updates.endTime,
      recurring_pattern: updates.recurringPattern,
      recurrence_rule: updates.recurrenceRule,
      google_calendar_event_id: updates.googleCalendarEventId,
      ...statusUpdate
    };

    // Remove undefined properties
    Object.keys(dbUpdates).forEach(key => 
      dbUpdates[key as keyof Partial<CareShiftDto>] === undefined && delete dbUpdates[key as keyof Partial<CareShiftDto>]
    );

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
    
    return data ? adaptCareShiftFromDb(data as CareShiftDto) : null;
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
