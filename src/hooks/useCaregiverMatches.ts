
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useTracking } from "@/hooks/useTracking";
import { InteractionHistoryService, InteractionStatus, UserReadinessStatus } from "@/services/interactionHistoryService";

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
  interaction_status?: InteractionStatus;
  readiness_status?: UserReadinessStatus;
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
    
    console.log('[useCaregiverMatches] Starting enhanced caregiver loading for family user:', user.id);
    loadingRef.current = true;
    
    try {
      setIsLoading(true);
      setError(null);

      // Check family's own readiness first
      const familyReadiness = await InteractionHistoryService.checkUserReadiness(user.id, 'family');
      console.log('[useCaregiverMatches] Family readiness:', familyReadiness);

      if (!familyReadiness.isReady) {
        console.log('[useCaregiverMatches] Family not ready for matching:', familyReadiness.reason);
        setCaregivers([]);
        setError(`Profile incomplete: ${familyReadiness.reason}`);
        await trackEngagement('caregiver_matches_view', { 
          data_source: 'none',
          family_not_ready: true,
          readiness_reason: familyReadiness.reason,
          completion_percentage: familyReadiness.completionPercentage
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
        console.warn("[useCaregiverMatches] Could not fetch family profile for schedule matching:", profileErr);
      }

      // Parse family's care schedule
      const familyCareSchedule = parseCareSchedule(familyScheduleData.care_schedule);
      console.log('[useCaregiverMatches] Family care schedule:', familyCareSchedule);

      // Fetch ONLY real professional data
      const { data: professionalUsers, error: professionalError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'professional')
        .not('full_name', 'is', null) // Ensure they have a name
        .limit(showOnlyBestMatch ? 10 : 20); // Get more to filter
      
      if (professionalError) {
        console.error("[useCaregiverMatches] Error fetching professional users:", professionalError);
        setError("Unable to load caregiver matches. Please try again.");
        return;
      }

      if (!professionalUsers || professionalUsers.length === 0) {
        console.log("[useCaregiverMatches] No professional users found in database");
        setError("No caregivers are currently available. Please check back later.");
        setCaregivers([]);
        await trackEngagement('caregiver_matches_view', { 
          data_source: 'real_data',
          caregiver_count: 0,
          view_context: showOnlyBestMatch ? 'dashboard_widget' : 'matching_page',
          error: 'no_professionals_found'
        });
        return;
      }

      console.log(`[useCaregiverMatches] Found ${professionalUsers.length} potential caregivers`);

      // Process each caregiver with interaction and readiness checks
      const caregiverProcessingPromises = professionalUsers.map(async (professional) => {
        try {
          // Check interaction status
          const interactionStatus = await InteractionHistoryService.checkFamilyCaregiverInteraction(
            user.id, 
            professional.id
          );

          // Check caregiver readiness
          const readinessStatus = await InteractionHistoryService.checkUserReadiness(
            professional.id, 
            'professional'
          );

          // Skip caregivers we've already interacted with or who aren't ready
          if (interactionStatus.hasInteracted) {
            console.log(`[useCaregiverMatches] Skipping caregiver ${professional.id} - already interacted:`, interactionStatus);
            return null;
          }

          if (!readinessStatus.isReady) {
            console.log(`[useCaregiverMatches] Skipping caregiver ${professional.id} - not ready:`, readinessStatus.reason);
            return null;
          }

          // Generate match data
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
            availability_schedule: professionalSchedule,
            interaction_status: interactionStatus,
            readiness_status: readinessStatus
          } as Caregiver;
        } catch (error) {
          console.error(`[useCaregiverMatches] Error processing caregiver ${professional.id}:`, error);
          return null;
        }
      });

      const processedResults = await Promise.all(caregiverProcessingPromises);
      const readyCaregivers = processedResults.filter((caregiver): caregiver is Caregiver => caregiver !== null);
      
      readyCaregivers.sort((a, b) => b.match_score - a.match_score);
      processedCaregiversRef.current = readyCaregivers;
      
      console.log(`[useCaregiverMatches] Processed ${readyCaregivers.length} ready caregivers from ${professionalUsers.length} total`);

      const finalCaregivers = showOnlyBestMatch 
        ? readyCaregivers.slice(0, 1) 
        : readyCaregivers;

      await trackEngagement('caregiver_matches_view', {
        data_source: 'real_data_only',
        ready_caregiver_count: finalCaregivers.length,
        excluded_interaction_count: professionalUsers.length - readyCaregivers.length,
        view_context: showOnlyBestMatch ? 'dashboard_widget' : 'matching_page',
        family_readiness: familyReadiness,
        shift_compatibility_enabled: true,
        family_schedule_items: familyCareSchedule.length
      });
      
      setCaregivers(finalCaregivers);
    } catch (error) {
      console.error("[useCaregiverMatches] Error loading caregivers:", error);
      setError(error instanceof Error ? error.message : "Unknown error loading caregivers");
      setCaregivers([]);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [user?.id, trackEngagement, showOnlyBestMatch]);
  
  useEffect(() => {
    if (user) {
      console.log('[useCaregiverMatches] Enhanced effect triggered for user:', user.id);
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
