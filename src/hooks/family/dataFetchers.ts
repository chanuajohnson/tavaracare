
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
      console.error('❌ Error details:', error.message, error.code);
      return null;
    }

    console.log('✅ Family profile fetched:', data);
    if (data) {
      console.log('✅ Family profile key fields:', {
        id: data.id,
        full_name: data.full_name,
        first_name: data.first_name,
        last_name: data.last_name,
        phone_number: data.phone_number,
        address: data.address,
        care_recipient_name: data.care_recipient_name,
        relationship: data.relationship,
        role: data.role
      });
    }
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
      console.error('❌ Error details:', error.message, error.code);
      return null;
    }

    console.log('✅ Care assessment fetched:', data);
    if (data) {
      console.log('✅ Care assessment key fields:', {
        id: data.id,
        profile_id: data.profile_id,
        care_recipient_name: data.care_recipient_name,
        primary_contact_name: data.primary_contact_name
      });
    }
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
      console.error('❌ Error details:', error.message, error.code);
      return null;
    }

    console.log('✅ Care recipient profile fetched:', data);
    if (data) {
      console.log('✅ Care recipient key fields:', {
        id: data.id,
        user_id: data.user_id,
        full_name: data.full_name,
        birth_year: data.birth_year
      });
    }
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch care recipient profile:', error);
    return null;
  }
};
