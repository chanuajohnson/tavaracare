
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { CareShift, CareShiftDto } from "@/types/careTypes";
import { useAuth } from "@/components/providers/AuthProvider";

// Adapter for converting database shifts to domain model
const adaptDbShiftToCareShift = (dbShift: any): CareShift => ({
  id: dbShift.id!,
  carePlanId: dbShift.care_plan_id,
  familyId: dbShift.family_id,
  caregiverId: dbShift.caregiver_id,
  title: dbShift.title,
  description: dbShift.description,
  location: dbShift.location,
  status: dbShift.status as 'open' | 'assigned' | 'completed' | 'cancelled',
  startTime: dbShift.start_time,
  endTime: dbShift.end_time,
  recurringPattern: dbShift.recurring_pattern,
  recurrenceRule: dbShift.recurrence_rule,
  createdAt: dbShift.created_at || new Date().toISOString(),
  updatedAt: dbShift.updated_at || new Date().toISOString(),
  googleCalendarEventId: dbShift.google_calendar_event_id
});

interface UseCareShiftsFilters {
  carePlanId?: string;
  status?: 'open' | 'assigned' | 'completed' | 'cancelled' | string;
  startDate?: Date;
  endDate?: Date;
}

export function useCareShifts(initialFilters?: UseCareShiftsFilters) {
  const [shifts, setShifts] = useState<CareShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UseCareShiftsFilters>(initialFilters || {});
  const { user } = useAuth();
  
  useEffect(() => {
    fetchShifts();
  }, [user, filters]);
  
  const fetchShifts = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('care_shifts')
        .select('*')
        .eq('caregiver_id', user.id);
      
      // Apply filters
      if (filters.carePlanId) {
        query = query.eq('care_plan_id', filters.carePlanId);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.startDate) {
        query = query.gte('start_time', filters.startDate.toISOString());
      }
      
      if (filters.endDate) {
        query = query.lte('end_time', filters.endDate.toISOString());
      }
      
      // Order by start time, ascending
      query = query.order('start_time', { ascending: true });
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      // Use type assertion to handle the casting from database format to our domain model
      const careShifts: CareShift[] = (data || []).map((item: any) => adaptDbShiftToCareShift(item));
      setShifts(careShifts);
    } catch (err: any) {
      console.error("Error fetching care shifts:", err);
      setError(err.message || "Failed to load shifts");
      toast.error("Failed to load care shifts");
    } finally {
      setLoading(false);
    }
  };
  
  const updateFilters = (newFilters: Partial<UseCareShiftsFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };
  
  const clearFilters = () => {
    setFilters({});
  };
  
  return { 
    shifts, 
    loading, 
    error, 
    filters,
    updateFilters,
    clearFilters,
    refreshShifts: fetchShifts
  };
}
