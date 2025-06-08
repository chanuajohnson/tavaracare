
import { useState, useEffect, useCallback } from "react";
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
  const { trackEngagement } = useTracking();

  const loadCaregivers = useCallback(async () => {
    if (!user || dataLoaded) return;
    
    try {
      setIsLoading(true);

      // First use mock caregivers immediately to prevent UI waiting
      const initialCaregivers = showOnlyBestMatch 
        ? MOCK_CAREGIVERS.slice(0, 1) 
        : MOCK_CAREGIVERS;
      setCaregivers(initialCaregivers);

      const { data: professionalUsers, error: professionalError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'professional');
      
      if (professionalError) {
        console.error("Error fetching professional users:", professionalError);
        toast.error("Failed to load caregiver matches");
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
        // Show only the best match (1 caregiver)
        finalCaregivers = realCaregivers.length > 0 
          ? [realCaregivers.sort((a, b) => b.match_score - a.match_score)[0]]
          : MOCK_CAREGIVERS.slice(0, 1);
      } else {
        // Show multiple caregivers
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
      toast.error("Error loading caregiver matches");
      setDataLoaded(true);
    } finally {
      setIsLoading(false);
    }
  }, [user, trackEngagement, dataLoaded, showOnlyBestMatch]);
  
  useEffect(() => {
    if (user && !dataLoaded) {
      const timer = setTimeout(() => {
        loadCaregivers();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [user, dataLoaded, loadCaregivers]);

  return {
    caregivers,
    isLoading,
    dataLoaded
  };
};
