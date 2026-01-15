import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ComprehensiveUserData {
  profile: any;
  careNeeds?: any;
  careRecipient?: any;
  chatbotResponses: any[];
  registrationComplete: boolean;
  assessmentComplete: boolean;
  lastUpdated: string;
}

export const useComprehensiveUserData = (userId: string, userRole?: string) => {
  const [data, setData] = useState<ComprehensiveUserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComprehensiveData = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching comprehensive data for user:', userId, 'role:', userRole);

      // Get profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Get chatbot responses for this user
      const { data: chatbotResponses, error: chatbotError } = await supabase
        .from('chatbot_responses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (chatbotError) {
        console.warn('Could not fetch chatbot responses:', chatbotError);
      }

      let careNeeds = null;
      let careRecipient = null;
      let registrationComplete = false;
      let assessmentComplete = false;

      // Family-specific data
      if (profile.role === 'family') {
        // Get care needs assessment
        const { data: careNeedsData, error: careNeedsError } = await supabase
          .from('care_needs_family')
          .select('*')
          .eq('profile_id', userId)
          .maybeSingle();

        if (careNeedsError && careNeedsError.code !== 'PGRST116') {
          console.warn('Could not fetch care needs:', careNeedsError);
        } else {
          careNeeds = careNeedsData;
          assessmentComplete = !!careNeedsData;
        }

        // Get care recipient profile
        const { data: careRecipientData, error: careRecipientError } = await supabase
          .from('care_recipient_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (careRecipientError && careRecipientError.code !== 'PGRST116') {
          console.warn('Could not fetch care recipient:', careRecipientError);
        } else {
          careRecipient = careRecipientData;
        }

        // Check if basic registration is complete for families
        registrationComplete = !!(
          profile.full_name && 
          profile.phone_number && 
          profile.address &&
          profile.care_recipient_name &&
          profile.relationship
        );
      }

      // Professional-specific checks
      if (profile.role === 'professional') {
        registrationComplete = !!(
          profile.full_name &&
          profile.phone_number &&
          profile.address &&
          profile.bio &&
          profile.years_of_experience
        );
        
        // For professionals, assessment complete means they have certifications or bio
        assessmentComplete = !!(
          profile.certifications?.length > 0 ||
          profile.bio ||
          profile.years_of_experience
        );
      }

      const comprehensiveData: ComprehensiveUserData = {
        profile,
        careNeeds,
        careRecipient,
        chatbotResponses: chatbotResponses || [],
        registrationComplete,
        assessmentComplete,
        lastUpdated: new Date().toISOString()
      };

      console.log('✅ Comprehensive data fetched:', {
        hasProfile: !!profile,
        hasCareNeeds: !!careNeeds,
        hasCareRecipient: !!careRecipient,
        chatbotResponsesCount: chatbotResponses?.length || 0,
        registrationComplete,
        assessmentComplete
      });

      setData(comprehensiveData);
    } catch (err: any) {
      console.error('❌ Error fetching comprehensive data:', err);
      setError(err.message);
      toast.error('Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComprehensiveData();
  }, [userId, userRole]);

  return {
    data,
    loading,
    error,
    refetch: fetchComprehensiveData
  };
};