
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { CareShift } from "@/types/careTypes";
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

interface CareShiftWithCaregiverDetails extends CareShift {
  caregiverDetails?: {
    full_name: string;
    professional_type: string;
    avatar_url: string | null;
  };
  carePlanTitle?: string;
  familyName?: string;
}

interface UseCarePlanShiftsFilters {
  carePlanId?: string;
  startDate?: Date;
  endDate?: Date;
}

export function useCarePlanShifts(initialFilters?: UseCarePlanShiftsFilters) {
  const [shifts, setShifts] = useState<CareShiftWithCaregiverDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UseCarePlanShiftsFilters>(initialFilters || {});
  const { user } = useAuth();
  
  useEffect(() => {
    if (user && filters.carePlanId) {
      fetchCarePlanShifts();
    } else {
      setShifts([]);
      setLoading(false);
    }
  }, [user, filters]);
  
  const fetchCarePlanShifts = async () => {
    if (!user || !filters.carePlanId) {
      console.log("No user or care plan ID found, skipping care plan shifts fetch");
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching care plan shifts for plan:", filters.carePlanId, "with filters:", filters);
      
      // Query shifts with care plan title and family profile
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
          google_calendar_event_id,
          care_plans:care_plans!care_shifts_care_plan_id_fkey(
            title
          ),
          family_profile:profiles!care_shifts_family_id_fkey(
            full_name
          ),
          profiles:profiles!care_shifts_caregiver_id_fkey(
            full_name,
            professional_type,
            avatar_url
          )
        `)
        .eq('care_plan_id', filters.carePlanId);
      
      // Apply date filters
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
      
      console.log("Raw care plan shifts data count:", data?.length || 0);
      
      // Collect caregiver IDs where the FK join returned NULL (RLS issue)
      const missingCaregiverIds = new Set<string>();
      (data || []).forEach((item: any) => {
        if (item.caregiver_id && !item.profiles) {
          missingCaregiverIds.add(item.caregiver_id);
        }
      });

      // Fallback: fetch caregiver profiles separately if FK join failed
      let caregiverFallbackMap: Record<string, { full_name: string; professional_type: string; avatar_url: string | null }> = {};
      if (missingCaregiverIds.size > 0) {
        console.log("FK join returned NULL for caregivers, fetching via RPC fallback:", [...missingCaregiverIds]);
        const { data: fallbackProfiles } = await supabase
          .rpc('get_public_professional_profiles', { 
            ids: [...missingCaregiverIds] 
          });
        
        if (fallbackProfiles) {
          fallbackProfiles.forEach((p: any) => {
            caregiverFallbackMap[p.id] = {
              full_name: p.full_name || 'Unknown Professional',
              professional_type: p.professional_type || 'Care Professional',
              avatar_url: p.avatar_url || null
            };
          });
        }
      }
      
      // Transform the data with caregiver details
      const careShifts: CareShiftWithCaregiverDetails[] = [];
      (data || []).forEach((item: any) => {
        try {
          const shift = adaptDbShiftToCareShift(item);
          
          // Resolve caregiver details: prefer FK join, fallback to RPC
          const profileData = item.profiles || (item.caregiver_id ? caregiverFallbackMap[item.caregiver_id] : undefined);
          
          const shiftWithDetails: CareShiftWithCaregiverDetails = {
            ...shift,
            caregiverDetails: profileData ? {
              full_name: profileData.full_name || 'Unknown Professional',
              professional_type: profileData.professional_type || 'Care Professional',
              avatar_url: profileData.avatar_url
            } : undefined,
            carePlanTitle: item.care_plans?.title || undefined,
            familyName: item.family_profile?.full_name || undefined
          };
          careShifts.push(shiftWithDetails);
        } catch (err) {
          console.error("Error transforming shift data:", err, item);
        }
      });
      
      console.log("Transformed care plan shifts count:", careShifts.length);
      setShifts(careShifts);
    } catch (err: any) {
      console.error("Error fetching care plan shifts:", err);
      setError(err.message || "Failed to load care plan shifts");
      toast.error("Failed to load care plan shifts");
    } finally {
      setLoading(false);
    }
  };
  
  const updateFilters = (newFilters: Partial<UseCarePlanShiftsFilters>) => {
    console.log("Updating care plan shifts filters:", newFilters);
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };
  
  const clearFilters = () => {
    console.log("Clearing care plan shifts filters");
    setFilters({});
  };
  
  return { 
    shifts, 
    loading, 
    error, 
    filters,
    updateFilters,
    clearFilters,
    refreshShifts: fetchCarePlanShifts
  };
}
