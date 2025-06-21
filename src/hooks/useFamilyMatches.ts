
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';

interface FamilyMatch {
  id: string;
  full_name: string;
  avatar_url?: string;
  care_recipient_name?: string;
  address?: string;
  care_schedule?: string | string[];
  care_types?: string[];
  match_percentage?: number;
  video_available?: boolean; // Add video availability to family matches
}

export const useFamilyMatches = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<FamilyMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // For professionals, fetch family profiles that might be interested
        const { data: familyProfiles, error: fetchError } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            avatar_url,
            care_recipient_name,
            address,
            care_schedule,
            care_types,
            video_available
          `)
          .eq('role', 'family')
          .not('care_recipient_name', 'is', null)
          .limit(10);

        if (fetchError) {
          throw fetchError;
        }

        // Transform data and add mock match percentages
        const transformedMatches = (familyProfiles || []).map((profile) => ({
          ...profile,
          match_percentage: Math.floor(Math.random() * 20) + 80, // Mock 80-100% match
        }));

        setMatches(transformedMatches);
        setError(null);
      } catch (err) {
        console.error('Error fetching family matches:', err);
        setError('Failed to load family matches');
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [user?.id]);

  return {
    matches,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      fetchMatches();
    }
  };
};
