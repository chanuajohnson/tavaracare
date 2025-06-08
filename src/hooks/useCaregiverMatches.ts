
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
}

const MOCK_CAREGIVERS: Caregiver[] = [{
  id: "1",
  full_name: "Maria Santos",
  avatar_url: null,
  location: "Port of Spain",
  care_types: ["Elderly Care", "Companionship"],
  years_of_experience: "5+ years",
  match_score: 95,
  is_premium: false
}, {
  id: "2", 
  full_name: "James Mitchell",
  avatar_url: null,
  location: "San Fernando",
  care_types: ["Special Needs", "Medical Support"],
  years_of_experience: "8+ years",
  match_score: 89,
  is_premium: true
}, {
  id: "3",
  full_name: "Sarah Johnson",
  avatar_url: null,
  location: "Arima",
  care_types: ["Child Care", "Housekeeping"],
  years_of_experience: "3+ years", 
  match_score: 82,
  is_premium: false
}];

export const useCaregiverMatches = (showOnlyBestMatch: boolean = true) => {
  const { user } = useAuth();
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { trackEngagement } = useTracking();
  
  // Use refs to prevent multiple simultaneous requests
  const loadingRef = useRef(false);
  const userIdRef = useRef<string | null>(null);

  const loadCaregivers = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (loadingRef.current || !user || dataLoaded || userIdRef.current === user.id) {
      return;
    }
    
    console.log('Starting caregiver load for user:', user.id);
    loadingRef.current = true;
    userIdRef.current = user.id;
    
    try {
      setIsLoading(true);
      setError(null);

      // Try to fetch real professional data first
      const { data: professionalUsers, error: professionalError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'professional')
        .limit(showOnlyBestMatch ? 3 : 10); // Get more to ensure we have data after filtering
      
      if (professionalError) {
        console.warn("Error fetching professional users:", professionalError);
        // Fall back to mock data on error
        const fallbackCaregivers = showOnlyBestMatch 
          ? MOCK_CAREGIVERS.slice(0, 1) 
          : MOCK_CAREGIVERS;
        setCaregivers(fallbackCaregivers);
        await trackEngagement('caregiver_matches_view', { 
          data_source: 'mock_data_fallback',
          caregiver_count: fallbackCaregivers.length,
          view_context: showOnlyBestMatch ? 'dashboard_widget' : 'matching_page',
          error: professionalError.message
        });
        setDataLoaded(true);
        return;
      }

      if (!professionalUsers || professionalUsers.length === 0) {
        console.log("No professional users found, using mock data");
        const fallbackCaregivers = showOnlyBestMatch 
          ? MOCK_CAREGIVERS.slice(0, 1) 
          : MOCK_CAREGIVERS;
        setCaregivers(fallbackCaregivers);
        await trackEngagement('caregiver_matches_view', { 
          data_source: 'mock_data',
          caregiver_count: fallbackCaregivers.length,
          view_context: showOnlyBestMatch ? 'dashboard_widget' : 'matching_page',
        });
        setDataLoaded(true);
        return;
      }

      // Process real caregiver data
      const realCaregivers: Caregiver[] = professionalUsers.map((professional, index) => {
        // Generate match scores in descending order for better presentation
        const matchScore = Math.floor(Math.random() * (99 - 75) + 75) - (index * 2);
        
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
        
        return {
          id: professional.id,
          full_name: professional.full_name || 'Professional Caregiver',
          avatar_url: professional.avatar_url,
          location: professional.location || 'Trinidad and Tobago',
          care_types: careTypes,
          years_of_experience: professional.years_of_experience || '2+ years',
          match_score: Math.max(matchScore, 70), // Ensure minimum 70% match
          is_premium: Math.random() > 0.7 // 30% chance of premium
        };
      });
      
      // Sort by match score descending
      realCaregivers.sort((a, b) => b.match_score - a.match_score);
      
      console.log("Loaded real professional users:", realCaregivers.length);

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
        caregiver_names: finalCaregivers.map(c => c.full_name)
      });
      
      setCaregivers(finalCaregivers);
      setDataLoaded(true);
    } catch (error) {
      console.error("Error loading caregivers:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      
      // Use fallback data on error
      const fallbackCaregivers = showOnlyBestMatch 
        ? MOCK_CAREGIVERS.slice(0, 1) 
        : MOCK_CAREGIVERS;
      setCaregivers(fallbackCaregivers);
      setDataLoaded(true);
      
      await trackEngagement('caregiver_matches_view', {
        data_source: 'mock_data_error_fallback',
        caregiver_count: fallbackCaregivers.length,
        view_context: showOnlyBestMatch ? 'dashboard_widget' : 'matching_page',
        error: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [user?.id, trackEngagement, dataLoaded, showOnlyBestMatch]);
  
  useEffect(() => {
    // Reset state when user changes
    if (user?.id !== userIdRef.current) {
      setDataLoaded(false);
      setCaregivers([]);
      setError(null);
      userIdRef.current = null;
    }

    if (user && !dataLoaded && !loadingRef.current) {
      // Small delay to prevent rapid successive calls
      const timer = setTimeout(() => {
        loadCaregivers();
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [user, loadCaregivers, dataLoaded]);

  return {
    caregivers,
    isLoading,
    dataLoaded,
    error
  };
};
