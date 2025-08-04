
import { supabase } from '@/integrations/supabase/client';
import { FamilyProfileData, CareAssessmentData, CareRecipientData } from './types';

export const fetchFamilyProfile = async (userId: string): Promise<FamilyProfileData | null> => {
  try {
    console.log('🔍 Fetching family profile for user:', userId);
    

    // Use secure function to bypass RLS recursion issues
    const { data, error } = await supabase
      .rpc('get_user_profile_secure', { target_user_id: userId })

      .maybeSingle();

    if (error) {
      console.error('❌ Error fetching family profile:', error);
      throw error;
    }


    // Filter to only family role profiles
    if (data && data.role === 'family') {
      console.log('✅ Family profile fetched:', data);
      return data;
    } else {
      console.log('⚠️ No family profile found for user:', userId);
      return null;
    }

  } catch (error) {
    console.error('❌ Failed to fetch family profile:', error);
    return null;
  }
};

export const fetchCareAssessment = async (userId: string): Promise<CareAssessmentData | null> => {
  try {
    console.log('🔍 Fetching care assessment for user:', userId);
    
    const { data, error } = await supabase
      .from('care_needs_family')
      .select('*')
      .eq('profile_id', userId)
      .maybeSingle();

    if (error) {
      console.error('❌ Error fetching care assessment:', error);
      throw error;
    }

    console.log('✅ Care assessment fetched:', data);
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch care assessment:', error);
    return null;
  }
};

export const fetchCareRecipientProfile = async (userId: string): Promise<CareRecipientData | null> => {
  try {
    console.log('🔍 Fetching care recipient profile for user:', userId);
    
    const { data, error } = await supabase
      .from('care_recipient_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('❌ Error fetching care recipient profile:', error);
      throw error;
    }

    console.log('✅ Care recipient profile fetched:', data);
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch care recipient profile:', error);
    return null;
  }
};
