
import { supabase } from '@/lib/supabase';
import { ProfessionalDocument, CareTeamAssignment, ProfileData, ProfessionalReference, ProfessionalScreening } from './types';

export const fetchProfileData = async (userId: string): Promise<ProfileData | null> => {
  console.log('🔍 Fetching profile data for userId (using secure function):', userId);
  
  try {
    const { data: profilesData, error: profileError } = await supabase
      .rpc('get_user_profile_secure', { target_user_id: userId });

    if (profileError) {
      console.error('❌ Profile fetch error:', profileError);
      throw profileError;
    }

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

export const fetchReferences = async (userId: string): Promise<ProfessionalReference[]> => {
  console.log('📋 Fetching references for userId:', userId);
  
  const { data, error } = await supabase
    .from('professional_references')
    .select('*')
    .eq('professional_id', userId);

  if (error) {
    console.error('❌ References fetch error:', error);
    return [];
  }

  const references = (data || []) as unknown as ProfessionalReference[];
  console.log('📋 References data fetched:', {
    count: references.length,
    statuses: references.map(r => r.status)
  });

  return references;
};

export const fetchScreenings = async (userId: string): Promise<ProfessionalScreening[]> => {
  console.log('🩺 Fetching screenings for userId:', userId);
  
  const { data, error } = await supabase
    .from('professional_screening')
    .select('*')
    .eq('professional_id', userId);

  if (error) {
    console.error('❌ Screenings fetch error:', error);
    return [];
  }

  const screenings = (data || []) as unknown as ProfessionalScreening[];
  console.log('🩺 Screenings data fetched:', {
    count: screenings.length,
    statuses: screenings.map(s => ({ type: s.screening_type, status: s.status }))
  });

  return screenings;
};

export const fetchScreeningSessions = async (userId: string) => {
  const { data, error } = await supabase
    .from('screening_sessions')
    .select('id, status, template_id')
    .eq('professional_id', userId);

  if (error) {
    console.error('❌ Screening sessions fetch error:', error);
    return [];
  }

  return data || [];
};
