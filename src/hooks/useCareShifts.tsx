
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
  title: dbShift.title || 'Untitled Shift',
  description: dbShift.description || '',
  location: dbShift.location,
  status: dbShift.status as 'open' | 'confirmed' | 'completed' | 'cancelled',
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
  status?: 'open' | 'confirmed' | 'completed' | 'cancelled' | string;
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
    if (user) {
      fetchShifts();
    } else {
      setLoading(false);
    }
  }, [user, filters]);
  
  const fetchShifts = async () => {
    if (!user) {
      console.log("No user found, skipping care shifts fetch");
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching care shifts for user:", user.id, "with filters:", filters);
      
      // IMPROVED QUERY: Better error handling and data validation
      let query = supabase
        .from('care_shifts')
        .select(`
          id,
          care_plan_id,
          family_id,
          caregiver_id,
          title,
          description,
          location,
          status,
          start_time,
          end_time,
          recurring_pattern,
          recurrence_rule,
          created_at,
          updated_at,
          google_calendar_event_id
        `)
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
      
      // Add explicit type assertion and debug logging
      console.log("Raw care shifts data count:", data?.length || 0);
      console.log("Raw care shifts data:", data);
      
      // Validate and transform each shift with better error handling
      const careShifts: CareShift[] = [];
      (data || []).forEach((item: any) => {
        try {
          const shift = adaptDbShiftToCareShift(item);
          careShifts.push(shift);
        } catch (err) {
          console.error("Error transforming shift data:", err, item);
          // Continue processing other shifts
        }
      });
      
      console.log("Transformed care shifts count:", careShifts.length);
      console.log("Transformed care shifts:", careShifts);
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
    console.log("Updating care shifts filters:", newFilters);
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };
  
  const clearFilters = () => {
    console.log("Clearing care shifts filters");
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
