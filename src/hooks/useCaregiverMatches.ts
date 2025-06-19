import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useTracking } from "@/hooks/useTracking";
import { toast } from "sonner";

interface Caregiver {
  id: string;
  full_name: string;
  first_name?: string;
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

const MOCK_CAREGIVERS: Caregiver[] = [{
  id: "1",
  full_name: "Maria Santos",
  first_name: "Maria",
  avatar_url: null,
  location: "Port of Spain",
  care_types: ["Elderly Care", "Companionship"],
  years_of_experience: "5+ years",
  match_score: 95,
  is_premium: false,
  availability_schedule: ["mon_fri_8am_4pm", "weekday_evening_6pm_8am"]
}, {
  id: "2", 
  full_name: "James Mitchell",
  first_name: "James",
  avatar_url: null,
  location: "San Fernando",
  care_types: ["Special Needs", "Medical Support"],
  years_of_experience: "8+ years",
  match_score: 89,
  is_premium: true,
  availability_schedule: ["24_7_care", "live_in_care"]
}, {
  id: "3",
  full_name: "Sarah Johnson",
  first_name: "Sarah",
  avatar_url: null,
  location: "Arima",
  care_types: ["Child Care", "Housekeeping"],
  years_of_experience: "3+ years", 
  match_score: 82,
  is_premium: false,
  availability_schedule: ["sat_sun_6am_6pm", "flexible"]
}];

// Shift compatibility scoring algorithm
const calculateShiftCompatibility = (familySchedule: string[], caregiverSchedule: string[]): number => {
  if (!familySchedule || familySchedule.length === 0) return 50; // Neutral score if no family schedule
  if (!caregiverSchedule || caregiverSchedule.length === 0) return 30; // Lower score if caregiver has no schedule
  
  let compatibilityScore = 0;
  let totalPossibleMatches = familySchedule.length;
  
  // Direct matches get full points
  const directMatches = familySchedule.filter(shift => caregiverSchedule.includes(shift));
  compatibilityScore += directMatches.length * 100;
  
  // Flexible caregivers get bonus points for any family need
  if (caregiverSchedule.includes('flexible') || caregiverSchedule.includes('24_7_care')) {
    compatibilityScore += familySchedule.length * 75;
  }
  
  // Live-in care matches most family needs
  if (caregiverSchedule.includes('live_in_care')) {
    compatibilityScore += familySchedule.length * 85;
  }
  
  // Check for overlapping time periods
  const weekdayFamily = familySchedule.some(s => s.includes('mon_fri') || s.includes('weekday'));
  const weekendFamily = familySchedule.some(s => s.includes('sat_sun') || s.includes('weekend'));
  const eveningFamily = familySchedule.some(s => s.includes('evening') || s.includes('pm_'));
  
  const weekdayCaregiver = caregiverSchedule.some(s => s.includes('mon_fri') || s.includes('weekday'));
  const weekendCaregiver = caregiverSchedule.some(s => s.includes('sat_sun') || s.includes('weekend'));
  const eveningCaregiver = caregiverSchedule.some(s => s.includes('evening') || s.includes('pm_'));
  
  // Partial matches for overlapping periods
  if (weekdayFamily && weekdayCaregiver) compatibilityScore += 60;
  if (weekendFamily && weekendCaregiver) compatibilityScore += 60;
  if (eveningFamily && eveningCaregiver) compatibilityScore += 70;
  
  // Calculate final percentage
  const maxScore = totalPossibleMatches * 100;
  return Math.min(100, Math.round((compatibilityScore / maxScore) * 100));
};

// Generate match explanation based on compatibility
const generateMatchExplanation = (
  shiftScore: number, 
  familySchedule: string[], 
  caregiverSchedule: string[]
): string => {
  if (shiftScore >= 90) {
    return "Excellent schedule match - this caregiver's availability perfectly aligns with your needs";
  } else if (shiftScore >= 75) {
    return "Great schedule compatibility - most of your preferred times are covered";
  } else if (shiftScore >= 60) {
    return "Good availability overlap - some schedule coordination may be needed";
  } else if (shiftScore >= 40) {
    return "Partial schedule match - flexibility required from both parties";
  } else {
    return "Limited schedule overlap - significant coordination needed";
  }
};

// Parse care schedule string into array
const parseCareSchedule = (scheduleString: string | null | undefined): string[] => {
  if (!scheduleString) return [];
  
  // Handle both comma-separated strings and potential JSON arrays
  try {
    // Try parsing as JSON first
    const parsed = JSON.parse(scheduleString);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Fall back to comma-separated parsing
    return scheduleString.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }
};

export const useCaregiverMatches = (showOnlyBestMatch: boolean = true) => {
  const { user } = useAuth();
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { trackEngagement } = useTracking();
  
  // Use ref to prevent multiple simultaneous requests only
  const loadingRef = useRef(false);
  // Cache processed caregivers to prevent regeneration
  const processedCaregiversRef = useRef<Caregiver[] | null>(null);

  const loadCaregivers = useCallback(async () => {
    // Only prevent multiple simultaneous calls, not legitimate reloads
    if (loadingRef.current || !user) {
      return;
    }
    
    console.log('Starting caregiver load for user:', user.id);
    loadingRef.current = true;
    
    try {
      setIsLoading(true);
      setError(null);

      // If we already have processed caregivers for this session, use them
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

      // Try to fetch real professional data first
      const { data: professionalUsers, error: professionalError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'professional')
        .limit(showOnlyBestMatch ? 3 : 10);
      
      if (professionalError) {
        console.warn("Error fetching professional users:", professionalError);
        // Fall back to mock data on error with enhanced compatibility scoring
        const enhancedMockCaregivers = MOCK_CAREGIVERS.map(caregiver => {
          const caregiverSchedule = caregiver.availability_schedule || [];
          const shiftCompatibility = calculateShiftCompatibility(familyCareSchedule, caregiverSchedule);
          const matchExplanation = generateMatchExplanation(shiftCompatibility, familyCareSchedule, caregiverSchedule);
          
          return {
            ...caregiver,
            shift_compatibility_score: shiftCompatibility,
            match_explanation: matchExplanation,
            match_score: Math.round((caregiver.match_score + shiftCompatibility) / 2) // Blend original score with compatibility
          };
        });

        // Sort by combined match score
        enhancedMockCaregivers.sort((a, b) => b.match_score - a.match_score);
        
        const fallbackCaregivers = showOnlyBestMatch 
          ? enhancedMockCaregivers.slice(0, 1) 
          : enhancedMockCaregivers;
        processedCaregiversRef.current = enhancedMockCaregivers; // Cache full list
        setCaregivers(fallbackCaregivers);
        await trackEngagement('caregiver_matches_view', { 
          data_source: 'mock_data_fallback',
          caregiver_count: fallbackCaregivers.length,
          view_context: showOnlyBestMatch ? 'dashboard_widget' : 'matching_page',
          error: professionalError.message,
          shift_compatibility_enabled: true
        });
        return;
      }

      if (!professionalUsers || professionalUsers.length === 0) {
        console.log("No professional users found, using enhanced mock data");
        const enhancedMockCaregivers = MOCK_CAREGIVERS.map(caregiver => {
          const caregiverSchedule = caregiver.availability_schedule || [];
          const shiftCompatibility = calculateShiftCompatibility(familyCareSchedule, caregiverSchedule);
          const matchExplanation = generateMatchExplanation(shiftCompatibility, familyCareSchedule, caregiverSchedule);
          
          return {
            ...caregiver,
            shift_compatibility_score: shiftCompatibility,
            match_explanation: matchExplanation,
            match_score: Math.round((caregiver.match_score + shiftCompatibility) / 2)
          };
        });

        enhancedMockCaregivers.sort((a, b) => b.match_score - a.match_score);
        
        const fallbackCaregivers = showOnlyBestMatch 
          ? enhancedMockCaregivers.slice(0, 1) 
          : enhancedMockCaregivers;
        processedCaregiversRef.current = enhancedMockCaregivers; // Cache full list
        setCaregivers(fallbackCaregivers);
        await trackEngagement('caregiver_matches_view', { 
          data_source: 'mock_data',
          caregiver_count: fallbackCaregivers.length,
          view_context: showOnlyBestMatch ? 'dashboard_widget' : 'matching_page',
          shift_compatibility_enabled: true
        });
        return;
      }

      // Process real caregiver data with enhanced compatibility scoring
      const realCaregivers: Caregiver[] = professionalUsers.map((professional, index) => {
        // Use consistent hash-based scoring instead of random
        const hashCode = (str: string) => {
          let hash = 0;
          for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
          }
          return Math.abs(hash);
        };
        
        const hash = hashCode(professional.id + user.id);
        const baseMatchScore = 75 + (hash % 25); // Score between 75-99
        const isPremium = (hash % 10) < 3; // 30% chance of premium
        
        // Parse care_types if it's a string, otherwise use as array or default
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
        const matchExplanation = generateMatchExplanation(shiftCompatibility, familyCareSchedule, professionalSchedule);
        
        // Blend base match score with shift compatibility (weighted 60% base, 40% compatibility)
        const finalMatchScore = Math.round((baseMatchScore * 0.6) + (shiftCompatibility * 0.4));
        
        return {
          id: professional.id,
          full_name: professional.full_name || 'Professional Caregiver',
          first_name: professional.full_name?.split(' ')[0] || 'Professional',
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
      
      // Sort by final match score (which includes compatibility) descending
      realCaregivers.sort((a, b) => b.match_score - a.match_score);
      
      // Cache the processed caregivers
      processedCaregiversRef.current = realCaregivers;
      
      console.log("Loaded real professional users with shift compatibility:", realCaregivers.length);

      let finalCaregivers: Caregiver[];
      if (showOnlyBestMatch) {
        finalCaregivers = realCaregivers.slice(0, 1);
      } else {
        finalCaregivers = realCaregivers;
      }

      await trackEngagement('caregiver_matches_view', {
        data_source: 'real_data',
        real_caregiver_count: finalCaregivers.length,
        mock_caregiver_count: 0,
        view_context: showOnlyBestMatch ? 'dashboard_widget' : 'matching_page',
        caregiver_names: finalCaregivers.map(c => c.full_name),
        shift_compatibility_enabled: true,
        family_schedule_items: familyCareSchedule.length
      });
      
      setCaregivers(finalCaregivers);
    } catch (error) {
      console.error("Error loading caregivers:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      
      // Use fallback data on error with compatibility scoring
      const enhancedMockCaregivers = MOCK_CAREGIVERS.map(caregiver => {
        const caregiverSchedule = caregiver.availability_schedule || [];
        const shiftCompatibility = calculateShiftCompatibility([], caregiverSchedule); // No family schedule available
        const matchExplanation = generateMatchExplanation(shiftCompatibility, [], caregiverSchedule);
        
        return {
          ...caregiver,
          shift_compatibility_score: shiftCompatibility,
          match_explanation: matchExplanation
        };
      });
      
      const fallbackCaregivers = showOnlyBestMatch 
        ? enhancedMockCaregivers.slice(0, 1) 
        : enhancedMockCaregivers;
      processedCaregiversRef.current = enhancedMockCaregivers; // Cache full list
      setCaregivers(fallbackCaregivers);
      
      await trackEngagement('caregiver_matches_view', {
        data_source: 'mock_data_error_fallback',
        caregiver_count: fallbackCaregivers.length,
        view_context: showOnlyBestMatch ? 'dashboard_widget' : 'matching_page',
        error: error instanceof Error ? error.message : "Unknown error",
        shift_compatibility_enabled: true
      });
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [user?.id, trackEngagement, showOnlyBestMatch]);
  
  useEffect(() => {
    if (user) {
      console.log('useCaregiverMatches effect triggered for user:', user.id);
      // Small delay to prevent rapid successive calls
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
