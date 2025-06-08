
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

      // Use mock caregivers immediately to prevent UI waiting
      const initialCaregivers = showOnlyBestMatch 
        ? MOCK_CAREGIVERS.slice(0, 1) 
        : MOCK_CAREGIVERS;
      setCaregivers(initialCaregivers);

      // Try to fetch real professional data
      const { data: professionalUsers, error: professionalError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'professional')
        .limit(showOnlyBestMatch ? 1 : 10);
      
      if (professionalError) {
        console.warn("Error fetching professional users:", professionalError);
        // Continue with mock data, don't show error to user
        await trackEngagement('caregiver_matches_view', { 
          data_source: 'mock_data_fallback',
          caregiver_count: initialCaregivers.length,
          view_context: showOnlyBestMatch ? 'dashboard_widget' : 'matching_page',
          error: professionalError.message
        });
        setDataLoaded(true);
        return;
      }

      if (!professionalUsers || professionalUsers.length === 0) {
        console.log("No professional users found, using mock data");
        await trackEngagement('caregiver_matches_view', { 
          data_source: 'mock_data',
          caregiver_count: initialCaregivers.length,
          view_context: showOnlyBestMatch ? 'dashboard_widget' : 'matching_page',
        });
        setDataLoaded(true);
        return;
      }

      // Process real caregiver data
      const realCaregivers: Caregiver[] = professionalUsers.map(professional => {
        const matchScore = Math.floor(Math.random() * (99 - 65) + 65);
        return {
          id: professional.id,
          full_name: professional.full_name || 'Professional Caregiver',
          avatar_url: professional.avatar_url,
          location: professional.location || 'Port of Spain',
          care_types: professional.care_types || ['General Care'],
          years_of_experience: professional.years_of_experience || '2+ years',
          match_score: matchScore,
          is_premium: false
        };
      });
      
      console.log("Loaded real professional users:", realCaregivers.length);

      let finalCaregivers: Caregiver[];
      if (showOnlyBestMatch) {
        finalCaregivers = realCaregivers.length > 0 
          ? [realCaregivers.sort((a, b) => b.match_score - a.match_score)[0]]
          : MOCK_CAREGIVERS.slice(0, 1);
      } else {
        finalCaregivers = realCaregivers.length > 0 ? realCaregivers : MOCK_CAREGIVERS;
      }

      await trackEngagement('caregiver_matches_view', {
        data_source: realCaregivers.length > 0 ? 'real_data' : 'mock_data',
        real_caregiver_count: realCaregivers.length > 0 ? finalCaregivers.length : 0,
        mock_caregiver_count: realCaregivers.length > 0 ? 0 : finalCaregivers.length,
        view_context: showOnlyBestMatch ? 'dashboard_widget' : 'matching_page',
      });
      
      setCaregivers(finalCaregivers);
      setDataLoaded(true);
    } catch (error) {
      console.error("Error loading caregivers:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      // Don't show toast error, use fallback data instead
      const fallbackCaregivers = showOnlyBestMatch 
        ? MOCK_CAREGIVERS.slice(0, 1) 
        : MOCK_CAREGIVERS;
      setCaregivers(fallbackCaregivers);
      setDataLoaded(true);
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
