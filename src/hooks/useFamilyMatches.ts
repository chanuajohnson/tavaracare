import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useTracking } from "@/hooks/useTracking";
import { InteractionHistoryService, InteractionStatus, UserReadinessStatus } from "@/services/interactionHistoryService";

interface Family {
  id: string;
  full_name: string;
  avatar_url: string | null;
  location: string | null;
  care_types: string[] | null;
  special_needs: string[] | null;
  care_schedule: string | null;
  match_score: number;
  is_premium: boolean;
  distance: number;
  budget_preferences?: string | null;
  shift_compatibility_score: number; // Made required
  match_explanation: string; // Made required
  schedule_overlap_details: string; // Made required
  interaction_status: InteractionStatus; // Made required
  readiness_status: UserReadinessStatus; // Made required
}

interface ProfessionalScheduleData {
  care_schedule?: string;
  care_types?: string[] | null;
}

const MOCK_FAMILIES: Family[] = [{
  id: "1",
  full_name: "Garcia Family",
  avatar_url: null,
  location: "Port of Spain",
  care_types: ["Elderly Care", "Companionship"],
  special_needs: ["Alzheimer's", "Mobility Assistance"],
  care_schedule: "mon_fri_8am_4pm,weekday_evening_6pm_8am",
  match_score: 95,
  is_premium: false,
  distance: 3.2,
  budget_preferences: "$15-25/hr",
  shift_compatibility_score: 90,
  match_explanation: "Excellent schedule match",
  schedule_overlap_details: "Direct overlap: weekdays and evenings",
  interaction_status: { hasInteracted: false },
  readiness_status: { isReady: true, completionPercentage: 100, currentStep: 7, totalSteps: 7, hasBasicProfile: true }
}, {
  id: "2",
  full_name: "Wilson Family",
  avatar_url: null,
  location: "San Fernando",
  care_types: ["Special Needs", "Medical Support"],
  special_needs: ["Autism Care", "Medication Management"],
  care_schedule: "24_7_care,live_in_care",
  match_score: 89,
  is_premium: true,
  distance: 15.7,
  budget_preferences: "$25-35/hr",
  shift_compatibility_score: 95,
  match_explanation: "Perfect for 24/7 care needs",
  schedule_overlap_details: "Full-time availability matches",
  interaction_status: { hasInteracted: false },
  readiness_status: { isReady: true, completionPercentage: 100, currentStep: 7, totalSteps: 7, hasBasicProfile: true }
}, {
  id: "3",
  full_name: "Thomas Family",
  avatar_url: null,
  location: "Arima",
  care_types: ["Child Care", "Housekeeping"],
  special_needs: ["Early Childhood Development", "Meal Preparation"],
  care_schedule: "sat_sun_6am_6pm,flexible",
  match_score: 82,
  is_premium: false,
  distance: 8.5,
  budget_preferences: "$20-30/hr",
  shift_compatibility_score: 75,
  match_explanation: "Good weekend availability match",
  schedule_overlap_details: "Weekend overlap with flexibility",
  interaction_status: { hasInteracted: false },
  readiness_status: { isReady: true, completionPercentage: 100, currentStep: 7, totalSteps: 7, hasBasicProfile: true }
}];

// Shift compatibility scoring algorithm (mirrored from useCaregiverMatches)
const calculateShiftCompatibility = (professionalSchedule: string[], familySchedule: string[]): number => {
  if (!professionalSchedule || professionalSchedule.length === 0) return 50;
  if (!familySchedule || familySchedule.length === 0) return 30;
  
  let compatibilityScore = 0;
  let totalPossibleMatches = familySchedule.length;
  
  // Direct matches get full points
  const directMatches = familySchedule.filter(shift => professionalSchedule.includes(shift));
  compatibilityScore += directMatches.length * 100;
  
  // Flexible professionals get bonus points for any family need
  if (professionalSchedule.includes('flexible') || professionalSchedule.includes('24_7_care')) {
    compatibilityScore += familySchedule.length * 75;
  }
  
  // Live-in care matches most family needs
  if (professionalSchedule.includes('live_in_care')) {
    compatibilityScore += familySchedule.length * 85;
  }
  
  // Check for overlapping time periods
  const weekdayFamily = familySchedule.some(s => s.includes('mon_fri') || s.includes('weekday'));
  const weekendFamily = familySchedule.some(s => s.includes('sat_sun') || s.includes('weekend'));
  const eveningFamily = familySchedule.some(s => s.includes('evening') || s.includes('pm_'));
  
  const weekdayProfessional = professionalSchedule.some(s => s.includes('mon_fri') || s.includes('weekday'));
  const weekendProfessional = professionalSchedule.some(s => s.includes('sat_sun') || s.includes('weekend'));
  const eveningProfessional = professionalSchedule.some(s => s.includes('evening') || s.includes('pm_'));
  
  // Partial matches for overlapping periods
  if (weekdayFamily && weekdayProfessional) compatibilityScore += 60;
  if (weekendFamily && weekendProfessional) compatibilityScore += 60;
  if (eveningFamily && eveningProfessional) compatibilityScore += 70;
  
  // Calculate final percentage
  const maxScore = totalPossibleMatches * 100;
  return Math.min(100, Math.round((compatibilityScore / maxScore) * 100));
};

// Generate match explanation based on compatibility
const generateMatchExplanation = (
  shiftScore: number, 
  professionalSchedule: string[], 
  familySchedule: string[]
): string => {
  if (shiftScore >= 90) {
    return "Excellent schedule match - your availability perfectly aligns with this family's needs";
  } else if (shiftScore >= 75) {
    return "Great schedule compatibility - most of this family's preferred times are covered";
  } else if (shiftScore >= 60) {
    return "Good availability overlap - some schedule coordination may be needed";
  } else if (shiftScore >= 40) {
    return "Partial schedule match - flexibility required from both parties";
  } else {
    return "Limited schedule overlap - significant coordination needed";
  }
};

// Generate schedule overlap details
const generateScheduleOverlapDetails = (
  professionalSchedule: string[], 
  familySchedule: string[]
): string => {
  const directMatches = familySchedule.filter(shift => professionalSchedule.includes(shift));
  if (directMatches.length > 0) {
    return `Direct overlap: ${directMatches.join(', ')}`;
  }
  
  const weekdayOverlap = familySchedule.some(s => s.includes('weekday')) && 
                        professionalSchedule.some(s => s.includes('weekday'));
  const weekendOverlap = familySchedule.some(s => s.includes('weekend')) && 
                        professionalSchedule.some(s => s.includes('weekend'));
  
  if (weekdayOverlap && weekendOverlap) {
    return "Overlap: Weekdays and weekends";
  } else if (weekdayOverlap) {
    return "Overlap: Weekday availability";
  } else if (weekendOverlap) {
    return "Overlap: Weekend availability";
  }
  
  return "Limited overlap - coordination needed";
};

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

export const useFamilyMatches = (showOnlyBestMatch: boolean = false) => {
  const { user } = useAuth();
  const [families, setFamilies] = useState<Family[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { trackEngagement } = useTracking();
  
  const loadingRef = useRef(false);
  const processedFamiliesRef = useRef<Family[] | null>(null);

  const loadFamilies = useCallback(async () => {
    if (loadingRef.current || !user) {
      return;
    }
    
    console.log('[useFamilyMatches] Starting enhanced family match load for professional:', user.id);
    loadingRef.current = true;
    
    try {
      setIsLoading(true);
      setError(null);

      // Check professional's own readiness first
      const professionalReadiness = await InteractionHistoryService.checkUserReadiness(user.id, 'professional');
      console.log('[useFamilyMatches] Professional readiness:', professionalReadiness);

      if (!professionalReadiness.isReady) {
        console.log('[useFamilyMatches] Professional not ready for matching:', professionalReadiness.reason);
        setFamilies([]);
        setError(`Profile incomplete: ${professionalReadiness.reason}`);
        await trackEngagement('family_matches_view', { 
          data_source: 'none',
          professional_not_ready: true,
          readiness_reason: professionalReadiness.reason,
          completion_percentage: professionalReadiness.completionPercentage
        });
        return;
      }

      // If we already have processed families for this session, use them
      if (processedFamiliesRef.current) {
        const finalFamilies = showOnlyBestMatch 
          ? processedFamiliesRef.current.slice(0, 1) 
          : processedFamiliesRef.current;
        setFamilies(finalFamilies);
        setIsLoading(false);
        loadingRef.current = false;
        return;
      }

      // Fetch professional's care schedule and preferences
      let professionalScheduleData: { care_schedule?: string; care_types?: string[] | null; } = {};
      try {
        const { data: professionalProfile, error: profileError } = await supabase
          .from('profiles')
          .select('care_schedule, care_types')
          .eq('id', user.id)
          .maybeSingle();
        
        if (!profileError && professionalProfile) {
          professionalScheduleData = professionalProfile;
        }
      } catch (profileErr) {
        console.warn("[useFamilyMatches] Could not fetch professional profile for schedule matching:", profileErr);
      }

      // Parse professional's care schedule
      const professionalCareSchedule = parseCareSchedule(professionalScheduleData.care_schedule);
      console.log('[useFamilyMatches] Professional care schedule:', professionalCareSchedule);

      // Try to fetch real family data first
      const { data: familyUsers, error: familyError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'family')
        .not('full_name', 'is', null) // Only get families with names
        .limit(showOnlyBestMatch ? 10 : 20); // Get more to filter
      
      if (familyError) {
        console.warn("[useFamilyMatches] Error fetching family users:", familyError);
      }

      let candidateFamilies: Family[] = [];
      
      if (familyUsers && familyUsers.length > 0) {
        console.log(`[useFamilyMatches] Found ${familyUsers.length} potential family users`);

        // Process each family with interaction and readiness checks
        const familyProcessingPromises = familyUsers.map(async (family) => {
          try {
            // Check interaction status
            const interactionStatus = await InteractionHistoryService.checkProfessionalFamilyInteraction(
              user.id, 
              family.id
            );

            // Check family readiness
            const readinessStatus = await InteractionHistoryService.checkUserReadiness(
              family.id, 
              'family'
            );

            // Skip families we've already interacted with or who aren't ready
            if (interactionStatus.hasInteracted) {
              console.log(`[useFamilyMatches] Skipping family ${family.id} - already interacted:`, interactionStatus);
              return null;
            }

            if (!readinessStatus.isReady) {
              console.log(`[useFamilyMatches] Skipping family ${family.id} - not ready:`, readinessStatus.reason);
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
            
            const hash = hashCode(family.id + user.id);
            const baseMatchScore = 75 + (hash % 25);
            const isPremium = (hash % 10) < 3;
            
            let careTypes: string[] = ['General Care'];
            if (family.care_types) {
              if (typeof family.care_types === 'string') {
                try {
                  careTypes = JSON.parse(family.care_types);
                } catch {
                  careTypes = [family.care_types];
                }
              } else if (Array.isArray(family.care_types)) {
                careTypes = family.care_types;
              }
            }

            // Parse family's care schedule
            const familySchedule = parseCareSchedule(family.care_schedule);
            
            // Calculate shift compatibility
            const shiftCompatibility = calculateShiftCompatibility(professionalCareSchedule, familySchedule);
            const matchExplanation = generateMatchExplanation(shiftCompatibility, professionalCareSchedule, familySchedule);
            const scheduleOverlapDetails = generateScheduleOverlapDetails(professionalCareSchedule, familySchedule);
            
            // Blend base match score with shift compatibility
            const finalMatchScore = Math.round((baseMatchScore * 0.6) + (shiftCompatibility * 0.4));
            
            return {
              id: family.id,
              full_name: family.full_name || `${family.care_recipient_name || ''} Family`,
              avatar_url: family.avatar_url,
              location: family.location || 'Trinidad and Tobago',
              care_types: careTypes,
              special_needs: family.special_needs || [],
              care_schedule: family.care_schedule || 'Weekdays',
              match_score: finalMatchScore,
              is_premium: isPremium,
              distance: parseFloat((Math.random() * 19 + 1).toFixed(1)),
              budget_preferences: family.budget_preferences || '$15-30/hr',
              shift_compatibility_score: shiftCompatibility,
              match_explanation: matchExplanation,
              schedule_overlap_details: scheduleOverlapDetails,
              interaction_status: interactionStatus,
              readiness_status: readinessStatus
            } as Family;
          } catch (error) {
            console.error(`[useFamilyMatches] Error processing family ${family.id}:`, error);
            return null;
          }
        });

        const processedResults = await Promise.all(familyProcessingPromises);
        candidateFamilies = processedResults.filter((family): family is Family => family !== null);
        
        console.log(`[useFamilyMatches] Processed ${candidateFamilies.length} ready families from ${familyUsers.length} total`);
      }

      // If no ready families found, use enhanced mock data as fallback
      if (candidateFamilies.length === 0) {
        console.log("[useFamilyMatches] No ready families found, using enhanced mock data");
        
        // Process mock families with interaction checks
        const mockProcessingPromises = MOCK_FAMILIES.map(async (family) => {
          const interactionStatus = await InteractionHistoryService.checkProfessionalFamilyInteraction(
            user.id, 
            family.id
          );
          
          // Skip mock families we've interacted with
          if (interactionStatus.hasInteracted) {
            return null;
          }

          const familySchedule = parseCareSchedule(family.care_schedule);
          const shiftCompatibility = calculateShiftCompatibility(professionalCareSchedule, familySchedule);
          const matchExplanation = generateMatchExplanation(shiftCompatibility, professionalCareSchedule, familySchedule);
          const scheduleOverlapDetails = generateScheduleOverlapDetails(professionalCareSchedule, familySchedule);
          
          return {
            ...family,
            shift_compatibility_score: shiftCompatibility,
            match_explanation: matchExplanation,
            schedule_overlap_details: scheduleOverlapDetails,
            match_score: Math.round((family.match_score + shiftCompatibility) / 2),
            interaction_status: interactionStatus,
            readiness_status: {
              isReady: true,
              completionPercentage: 100,
              currentStep: 7,
              totalSteps: 7,
              hasBasicProfile: true
            }
          };
        });

        const mockResults = await Promise.all(mockProcessingPromises);
        candidateFamilies = mockResults.filter((family): family is Family => family !== null);
      }

      // Sort by final match score (which includes compatibility) descending
      candidateFamilies.sort((a, b) => b.match_score - a.match_score);
      
      // Cache the processed families
      processedFamiliesRef.current = candidateFamilies;
      
      console.log(`[useFamilyMatches] Final ready families with no prior interaction:`, candidateFamilies.length);

      let finalFamilies: Family[];
      if (showOnlyBestMatch) {
        finalFamilies = candidateFamilies.slice(0, 1);
      } else {
        finalFamilies = candidateFamilies;
      }

      await trackEngagement('family_matches_view', {
        data_source: familyUsers?.length > 0 ? 'real_data' : 'mock_data',
        ready_family_count: finalFamilies.length,
        excluded_interaction_count: (familyUsers?.length || MOCK_FAMILIES.length) - candidateFamilies.length,
        view_context: showOnlyBestMatch ? 'dashboard_widget' : 'matching_page',
        professional_readiness: professionalReadiness,
        shift_compatibility_enabled: true,
        professional_schedule_items: professionalCareSchedule.length
      });
      
      setFamilies(finalFamilies);
    } catch (error) {
      console.error("[useFamilyMatches] Error loading families:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      setFamilies([]);
      
      await trackEngagement('family_matches_view', {
        data_source: 'error',
        error: error instanceof Error ? error.message : "Unknown error",
        view_context: showOnlyBestMatch ? 'dashboard_widget' : 'matching_page'
      });
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [user?.id, trackEngagement, showOnlyBestMatch]);
  
  useEffect(() => {
    if (user) {
      console.log('[useFamilyMatches] Enhanced effect triggered for professional:', user.id);
      const timer = setTimeout(() => {
        loadFamilies();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [user, loadFamilies]);

  return {
    families,
    isLoading,
    dataLoaded: families.length > 0,
    error
  };
};
