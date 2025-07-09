
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
    
    console.log('Loading real caregivers for user:', user.id);
    loadingRef.current = true;
    
    try {
      setIsLoading(true);
      setError(null);

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

      // Fetch available professionals AND check for admin overrides
      const [professionalUsersResult, adminOverridesResult] = await Promise.all([
        // Get professionals marked as available for matching
        supabase
          .from('profiles')
          .select('*')
          .eq('role', 'professional')
          .eq('available_for_matching', true)
          .not('full_name', 'is', null)
          .limit(showOnlyBestMatch ? 5 : 15), // Fetch more to account for overrides
        
        // Get admin-assigned caregivers for this family (overrides availability)
        supabase
          .from('admin_match_interventions')
          .select(`
            caregiver_id,
            admin_match_score,
            intervention_type,
            reason,
            caregiver:profiles!admin_match_interventions_caregiver_id_fkey(*)
          `)
          .eq('family_user_id', user.id)
          .eq('status', 'active')
      ]);

      const { data: professionalUsers, error: professionalError } = professionalUsersResult;
      const { data: adminOverrides, error: overrideError } = adminOverridesResult;
      
      if (professionalError) {
        console.error("Error fetching professional users:", professionalError);
        setError("Unable to load caregiver matches. Please try again.");
        return;
      }

      if (overrideError) {
        console.warn("Error fetching admin overrides:", overrideError);
      }

      // Merge available professionals with admin overrides
      const allProfessionals = [...(professionalUsers || [])];
      const adminOverrideIds = new Set();
      
      // Add admin-assigned caregivers (even if not available_for_matching)
      if (adminOverrides && adminOverrides.length > 0) {
        console.log('Admin overrides found:', adminOverrides.length);
        adminOverrides.forEach(override => {
          if (override.caregiver && override.caregiver.full_name) {
            // Add to set to track admin interventions
            adminOverrideIds.add(override.caregiver_id);
            // Add to professionals list if not already there
            if (!allProfessionals.some(p => p.id === override.caregiver_id)) {
              allProfessionals.push(override.caregiver);
            }
          }
        });
      }

      if (!allProfessionals || allProfessionals.length === 0) {
        console.log("No professional users found in database");
        setError("No caregivers are currently available. Please check back later.");
        setCaregivers([]);
        await trackEngagement('caregiver_matches_view', { 
          data_source: 'real_data',
          caregiver_count: 0,
          view_context: showOnlyBestMatch ? 'dashboard_widget' : 'matching_page',
          error: 'no_professionals_found',
          admin_overrides_count: adminOverrides?.length || 0
        });
        return;
      }

      // Process real caregiver data with admin overrides
      const realCaregivers: Caregiver[] = allProfessionals.map((professional) => {
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
        
        // Check if this professional has admin override
        const adminOverride = adminOverrides?.find(o => o.caregiver_id === professional.id);
        const isAdminOverride = adminOverrideIds.has(professional.id);
        
        // Use admin match score if available, otherwise calculate normally
        const finalMatchScore = adminOverride?.admin_match_score || 
          Math.round((baseMatchScore * 0.6) + (shiftCompatibility * 0.4));
        
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
      
      realCaregivers.sort((a, b) => b.match_score - a.match_score);
      processedCaregiversRef.current = realCaregivers;
      
      console.log("Loaded real professional users:", realCaregivers.length);

      const finalCaregivers = showOnlyBestMatch 
        ? realCaregivers.slice(0, 1) 
        : realCaregivers;

      await trackEngagement('caregiver_matches_view', {
        data_source: 'real_data_only',
        real_caregiver_count: finalCaregivers.length,
        view_context: showOnlyBestMatch ? 'dashboard_widget' : 'matching_page',
        caregiver_names: finalCaregivers.map(c => c.full_name),
        shift_compatibility_enabled: true,
        family_schedule_items: familyCareSchedule.length,
        admin_overrides_count: adminOverrides?.length || 0,
        available_professionals_count: professionalUsers?.length || 0,
        total_professionals_shown: finalCaregivers.length,
        admin_override_ids: Array.from(adminOverrideIds)
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
