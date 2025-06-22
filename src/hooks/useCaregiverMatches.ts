import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useTracking } from "@/hooks/useTracking";
import { toast } from "sonner";
import { getReadyProfessionalUsers, checkCurrentUserReadiness } from "@/services/userReadinessService";

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
    
    console.log('Loading ready caregivers for user:', user.id);
    loadingRef.current = true;
    
    try {
      setIsLoading(true);
      setError(null);

      // Check if current family user is ready for matching
      const currentUserReadiness = await checkCurrentUserReadiness(user.id);
      if (!currentUserReadiness.isReady) {
        console.log('Current family user not ready for matching:', currentUserReadiness.missingFields);
        setError(`Please complete your profile to see caregiver matches. Missing: ${currentUserReadiness.missingFields.join(', ')}`);
        setCaregivers([]);
        await trackEngagement('caregiver_matches_view', { 
          data_source: 'filtered_out',
          caregiver_count: 0,
          view_context: showOnlyBestMatch ? 'dashboard_widget' : 'matching_page',
          error: 'family_profile_incomplete',
          missing_fields: currentUserReadiness.missingFields
        });
        return;
      }

      // If we already have processed caregivers, use them
      if (processedCaregiversRef.current) {
        const finalCaregivers = showOnlyBestMatch 
          ? processedCaregiversRef.current.slice(0, 1) 
          : processedCaregiversRef.current;
        setCaregivers(finalCaregivers);
        setIsLoading(false);
        loadingRef.current = false;
        return;
      }

      // Fetch family's care schedule and preferences
      let familyScheduleData: FamilyScheduleData = {};
      try {
        const { data: familyProfile, error: profileError } = await supabase
          .from('profiles')
          .select('care_schedule, care_types, special_needs')
          .eq('id', user.id)
          .maybeSingle();
        
        if (!profileError && familyProfile) {
          familyScheduleData = familyProfile;
        }
      } catch (profileErr) {
        console.warn("Could not fetch family profile for schedule matching:", profileErr);
      }

      // Parse family's care schedule
      const familyCareSchedule = parseCareSchedule(familyScheduleData.care_schedule);
      console.log('Family care schedule:', familyCareSchedule);

      // Fetch ONLY ready professional users
      const professionalUsers = await getReadyProfessionalUsers(showOnlyBestMatch ? 3 : 10);
      
      if (!professionalUsers || professionalUsers.length === 0) {
        console.log("No ready professional users found");
        setError("No qualified caregivers are currently available. Please check back later.");
        setCaregivers([]);
        await trackEngagement('caregiver_matches_view', { 
          data_source: 'ready_professionals',
          caregiver_count: 0,
          view_context: showOnlyBestMatch ? 'dashboard_widget' : 'matching_page',
          error: 'no_ready_professionals_found'
        });
        return;
      }

      // Process ready caregiver data ONLY
      const readyCaregivers: Caregiver[] = professionalUsers.map((professional) => {
        // Use consistent hash-based scoring for repeatability
        const hashCode = (str: string) => {
          let hash = 0;
          for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
          }
          return Math.abs(hash);
        };
        
        const hash = hashCode(professional.id + user.id);
        const baseMatchScore = 75 + (hash % 25); // Score between 75-99
        const isPremium = (hash % 10) < 3; // 30% chance of premium
        
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

        // Parse professional's availability schedule
        const professionalSchedule = parseCareSchedule(professional.care_schedule);
        
        // Calculate shift compatibility
        const shiftCompatibility = calculateShiftCompatibility(familyCareSchedule, professionalSchedule);
        const matchExplanation = generateMatchExplanation(shiftCompatibility);
        
        // Blend base match score with shift compatibility
        const finalMatchScore = Math.round((baseMatchScore * 0.6) + (shiftCompatibility * 0.4));
        
        return {
          id: professional.id, // Real UUID from database
          full_name: professional.full_name || 'Professional Caregiver',
          avatar_url: professional.avatar_url,
          location: professional.location || 'Trinidad and Tobago',
          care_types: careTypes,
          years_of_experience: professional.years_of_experience || '2+ years',
          match_score: finalMatchScore,
          is_premium: isPremium,
          shift_compatibility_score: shiftCompatibility,
          match_explanation: matchExplanation,
          availability_schedule: professionalSchedule
        };
      });
      
      readyCaregivers.sort((a, b) => b.match_score - a.match_score);
      processedCaregiversRef.current = readyCaregivers;
      
      console.log("Loaded ready professional users:", readyCaregivers.length);

      const finalCaregivers = showOnlyBestMatch 
        ? readyCaregivers.slice(0, 1) 
        : readyCaregivers;

      await trackEngagement('caregiver_matches_view', {
        data_source: 'ready_professionals_only',
        ready_caregiver_count: finalCaregivers.length,
        view_context: showOnlyBestMatch ? 'dashboard_widget' : 'matching_page',
        caregiver_names: finalCaregivers.map(c => c.full_name),
        shift_compatibility_enabled: true,
        family_schedule_items: familyCareSchedule.length,
        current_user_readiness: currentUserReadiness.completionPercentage
      });
      
      setCaregivers(finalCaregivers);
    } catch (error) {
      console.error("Error loading ready caregivers:", error);
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
