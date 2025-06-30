
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getLocationLabel } from '@/constants/locations';

interface FamilyMatch {
  id: string;
  fullName: string;
  careRecipientName: string;
  location: string;
  careTypes: string[];
  specialNeeds: string[];
  careSchedule: string;
  budgetPreferences: string;
  relationship: string;
  avatarUrl?: string;
  matchScore?: number;
}

export const useFamilyMatches = () => {
  const [families, setFamilies] = useState<FamilyMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFamilyMatches = async () => {
      try {
        setLoading(true);
        
        const { data: familyProfiles, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'family')
          .not('full_name', 'is', null);

        if (fetchError) {
          console.error('Error fetching family profiles:', fetchError);
          throw fetchError;
        }

        if (!familyProfiles || familyProfiles.length === 0) {
          console.log('No family profiles found');
          setFamilies([]);
          return;
        }

        console.log('Raw family profiles:', familyProfiles);

        const processedFamilies = familyProfiles.map((family) => {
          // Use standardized location field first, then fallback to address, then generic location
          const locationValue = family.location || family.address || 'Trinidad and Tobago';
          const displayLocation = family.location ? getLocationLabel(family.location) : locationValue;
          
          return {
            id: family.id,
            fullName: family.full_name || 'Family User',
            careRecipientName: family.care_recipient_name || 'Care Recipient',
            location: displayLocation,
            careTypes: Array.isArray(family.care_types) ? family.care_types : [],
            specialNeeds: Array.isArray(family.special_needs) ? family.special_needs : [],
            careSchedule: family.care_schedule || '',
            budgetPreferences: family.budget_preferences || '',
            relationship: family.relationship || '',
            avatarUrl: family.avatar_url,
            matchScore: 85 // Default match score
          };
        });

        console.log('Processed families for matching:', processedFamilies);
        setFamilies(processedFamilies);
        
      } catch (err: any) {
        console.error('Error in fetchFamilyMatches:', err);
        setError(err.message || 'Failed to fetch family matches');
      } finally {
        setLoading(false);
      }
    };

    fetchFamilyMatches();
  }, []);

  return { families, loading, error };
};
