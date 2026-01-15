
import { supabase } from '@/lib/supabase';
import { ProfessionalDocument, CareTeamAssignment, ProfileData } from './types';

export const fetchProfileData = async (userId: string): Promise<ProfileData | null> => {
  console.log('🔍 Fetching profile data for userId (using secure function):', userId);
  
  try {
    // Use the secure function to bypass RLS recursion
    const { data: profilesData, error: profileError } = await supabase
      .rpc('get_user_profile_secure', { target_user_id: userId });

    if (profileError) {
      console.error('❌ Profile fetch error:', profileError);
      throw profileError;
    }

    // The RPC returns an array, get the first item
    const profile = profilesData && profilesData.length > 0 ? profilesData[0] : null;

    console.log('👤 Profile data fetched via secure function:', {
      hasProfile: !!profile,
      professionalType: profile?.professional_type,
      yearsExperience: profile?.years_of_experience,
      certificationsArray: profile?.certifications,
      certificationsCount: profile?.certifications?.length || 0,
      careScheduleArray: profile?.care_schedule,
      careScheduleLength: profile?.care_schedule?.length || 0
    });

    return profile;
  } catch (error) {
    console.error('❌ Secure profile fetch failed, trying fallback:', error);
    
    // Fallback to direct table access (in case function fails)
    const { data: profile, error: fallbackError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (fallbackError) {
      console.error('❌ Fallback profile fetch error:', fallbackError);
      throw fallbackError;
    }

    console.log('👤 Profile data fetched via fallback:', {
      hasProfile: !!profile,
      professionalType: profile?.professional_type,
      yearsExperience: profile?.years_of_experience
    });

    return profile;
  }
};

export const fetchDocuments = async (userId: string): Promise<ProfessionalDocument[]> => {
  console.log('📄 Fetching documents for userId:', userId);
  
  const { data: documentsData, error: documentsError } = await supabase
    .from('professional_documents')
    .select('*')
    .eq('user_id', userId);

  if (documentsError) {
    console.error('❌ Documents fetch error:', documentsError);
    throw documentsError;
  }

  const documents = documentsData || [];
  console.log('📄 Documents data fetched:', {
    documentsCount: documents.length,
    documents: documents.map(d => ({ type: d.document_type, name: d.file_name }))
  });

  return documents;
};

export const fetchAssignments = async (userId: string): Promise<CareTeamAssignment[]> => {
  console.log('💼 Fetching assignments for userId:', userId);
  
  const { data: assignmentsData, error: assignmentsError } = await supabase
    .from('care_team_members')
    .select('*')
    .eq('caregiver_id', userId);

  if (assignmentsError) {
    console.error('❌ Assignments fetch error:', assignmentsError);
    throw assignmentsError;
  }

  const assignments = assignmentsData || [];
  console.log('💼 Assignments data fetched:', {
    assignmentsCount: assignments.length,
    assignments: assignments.map(a => ({ id: a.id, status: a.status, role: a.role }))
  });

  return assignments;
};
