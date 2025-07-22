import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';

export interface AdminProfile {
  id: string;
  created_at: string;
  updated_at: string;
  role: 'family' | 'professional' | 'community' | 'admin';
  full_name: string | null;
  avatar_url: string | null;
  phone_number: string | null;
  address: string | null;
  location: string | null;
  professional_type: string | null;
  years_of_experience: string | null;
  care_types: string[] | null;
  specialized_care: string[] | null;
  available_for_matching: boolean;
  email: string | null;
}

export const useAdminProfiles = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use the new security definer function
      const { data, error } = await supabase
        .rpc('admin_get_all_profiles_secure');

      if (error) {
        throw error;
      }

      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching admin profiles:', error);
      setError('Failed to load user profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [user?.id]);

  return { profiles, loading, error, refetch: fetchProfiles };
};