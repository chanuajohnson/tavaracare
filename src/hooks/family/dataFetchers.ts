
import { supabase } from '@/integrations/supabase/client';
import { FamilyProfileData, CareAssessmentData, CareRecipientData } from './types';

export const fetchFamilyProfile = async (userId: string): Promise<FamilyProfileData | null> => {
  try {
    console.log('🔍 Fetching family profile for user:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .eq('role', 'family')
      .maybeSingle();

    if (error) {
      console.error('❌ Error fetching family profile:', error);
      throw error;
    }

    console.log('✅ Family profile fetched:', data);
    return data;
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
