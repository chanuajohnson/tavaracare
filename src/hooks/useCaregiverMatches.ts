
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useTracking } from "@/hooks/useTracking";
import { toast } from "sonner";

interface Caregiver {
  id: string;
  full_name: string;
  avatar_url: string | null;
  location: string | null;
  care_types: string[] | null;
  years_of_experience: string | null;
  match_score: number;
  is_premium: boolean;
  shift_compatibility_score?: number;
  match_explanation?: string;
  availability_schedule?: string[] | null;
  hourly_rate?: string | number;
  expected_rate?: string | number;
  professional_type?: string;
  certifications?: string[];
  care_schedule?: string;
}

interface FamilyScheduleData {
  care_schedule?: string;
  care_types?: string[] | null;
  special_needs?: string[] | null;
}

// Parse care schedule string into array
const parseCareSchedule = (scheduleString: string | null | undefined): string[] => {
  if (!scheduleString) return [];
  
  try {
    const parsed = JSON.parse(scheduleString);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return scheduleString.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }
};

// Shift compatibility scoring algorithm
const calculateShiftCompatibility = (familySchedule: string[], caregiverSchedule: string[]): number => {
  if (!familySchedule || familySchedule.length === 0) return 70; // Default good score
  if (!caregiverSchedule || caregiverSchedule.length === 0) return 60; // Slightly lower
  
  let compatibilityScore = 0;
  let totalPossibleMatches = familySchedule.length;
  
  // Direct matches get full points
  const directMatches = familySchedule.filter(shift => caregiverSchedule.includes(shift));
  compatibilityScore += directMatches.length * 100;
  
  // Flexible caregivers get bonus points
  if (caregiverSchedule.includes('flexible') || caregiverSchedule.includes('24_7_care')) {
    compatibilityScore += familySchedule.length * 75;
  }
  
  // Live-in care matches most needs
  if (caregiverSchedule.includes('live_in_care')) {
    compatibilityScore += familySchedule.length * 85;
  }
  
  // Calculate final percentage
  const maxScore = totalPossibleMatches * 100;
  return Math.min(100, Math.round((compatibilityScore / maxScore) * 100));
};

// Generate match explanation
const generateMatchExplanation = (shiftScore: number): string => {
  if (shiftScore >= 90) {
    return "Excellent schedule match - this caregiver's availability perfectly aligns with your needs";
  } else if (shiftScore >= 75) {
    return "Great schedule compatibility - most of your preferred times are covered";
  } else if (shiftScore >= 60) {
    return "Good availability overlap - some schedule coordination may be needed";
  } else {
    return "Schedule compatibility requires coordination between both parties";
  }
};

export const useCaregiverMatches = (showOnlyBestMatch: boolean = true) => {
  const { user } = useAuth();
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { trackEngagement } = useTracking();
  
  const loadingRef = useRef(false);
  const processedCaregiversRef = useRef<Caregiver[] | null>(null);

  const loadCaregivers = useCallback(async () => {
    if (loadingRef.current || !user) {
      return;
    }
    
    console.log('Loading caregiver assignments for user:', user.id);
    loadingRef.current = true;
    
    try {
      setIsLoading(true);
      setError(null);

      // Use the unified caregiver_assignments table
      const { data: assignments, error: assignmentError } = await supabase
        .from('caregiver_assignments')
        .select('*')
        .eq('family_user_id', user.id)
        .eq('is_active', true)
        .order('match_score', { ascending: false });

      if (assignmentError) {
        console.error("Error fetching caregiver assignments:", assignmentError);
        setError("Unable to load caregiver matches. Please try again.");
        return;
      }

      if (!assignments || assignments.length === 0) {
        console.log("No active caregiver assignments found for user");
        setError("No caregiver matches found. Complete your profile to get matched with caregivers.");
        setCaregivers([]);
        await trackEngagement('caregiver_matches_view', { 
          data_source: 'unified_assignments',
          caregiver_count: 0,
          view_context: showOnlyBestMatch ? 'dashboard_widget' : 'matching_page',
          error: 'no_assignments_found'
        });
        return;
      }

      // Fetch caregiver profiles separately
      const caregiverIds = assignments.map(a => a.caregiver_id);
      const { data: caregiverProfiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, location, care_types, years_of_experience, professional_type')
        .in('id', caregiverIds);

      if (profileError) {
        console.error("Error fetching caregiver profiles:", profileError);
        setError("Unable to load caregiver details. Please try again.");
        return;
      }

      // Process assignment data into caregiver format
      const realCaregivers: Caregiver[] = assignments.map((assignment) => {
        const professional = caregiverProfiles?.find(p => p.id === assignment.caregiver_id);
        
        if (!professional) {
          console.warn('Assignment missing caregiver data:', assignment.id);
          return null;
        }
        
        // Parse care_types
        let careTypes: string[] = ['General Care'];
        if (professional.care_types) {
          if (typeof professional.care_types === 'string') {
            try {
              careTypes = JSON.parse(professional.care_types);
            } catch {
              careTypes = [professional.care_types];
            }
          } else if (Array.isArray(professional.care_types)) {
            careTypes = professional.care_types;
          }
        }

        // Determine premium status consistently
        const hash = professional.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const isPremium = (hash % 10) < 3; // 30% chance of premium

        return {
          id: professional.id,
          full_name: professional.full_name || 'Professional Caregiver',
          avatar_url: professional.avatar_url,
          location: professional.location || 'Trinidad and Tobago',
          care_types: careTypes,
          years_of_experience: professional.years_of_experience || '2+ years',
          match_score: assignment.match_score || 75,
          is_premium: isPremium,
          shift_compatibility_score: assignment.shift_compatibility_score || 70,
          match_explanation: assignment.match_explanation || 'Good match for your care needs',
          availability_schedule: []
        };
      }).filter(Boolean) as Caregiver[];
      
      console.log('Loaded caregiver assignments:', realCaregivers.length);

      const finalCaregivers = showOnlyBestMatch 
        ? realCaregivers.slice(0, 1) 
        : realCaregivers;

      await trackEngagement('caregiver_matches_view', {
        data_source: 'unified_assignments',
        assignment_count: finalCaregivers.length,
        view_context: showOnlyBestMatch ? 'dashboard_widget' : 'matching_page',
        caregiver_names: finalCaregivers.map(c => c.full_name),
        assignment_types: assignments.map(a => a.assignment_type),
        match_scores: assignments.map(a => a.match_score)
      });
      
      setCaregivers(finalCaregivers);
    } catch (error) {
      console.error("Error loading caregivers:", error);
      setError(error instanceof Error ? error.message : "Unknown error loading caregivers");
      setCaregivers([]);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [user?.id, trackEngagement, showOnlyBestMatch]);
  
  useEffect(() => {
    if (user) {
      console.log('useCaregiverMatches effect triggered for user:', user.id);
      const timer = setTimeout(() => {
        loadCaregivers();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [user, loadCaregivers]);

  return {
    caregivers,
    isLoading,
    dataLoaded: caregivers.length > 0,
    error
  };
};
