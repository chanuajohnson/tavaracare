import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface EnhancedMatchData {
  overall_score: number;
  care_types_score: number;
  schedule_score: number;
  experience_score: number;
  location_score: number;
  match_explanation: string;
  care_match_details: string;
  schedule_match_details: string;
  location_match_details: string;
  experience_match_details: string;
}

export interface UnifiedMatch {
  id: string;
  full_name: string;
  avatar_url: string | null;
  location: string | null;
  care_types: string[] | null;
  years_of_experience: string | null;
  match_score: number;
  shift_compatibility_score?: number;
  match_explanation?: string;
  assignment_type?: 'automatic' | 'manual' | 'care_team';
  assignment_id?: string;
  is_premium: boolean;
  enhanced_match_data?: EnhancedMatchData;
}

export interface UnifiedAssignment {
  id: string;
  assignment_type: 'automatic' | 'manual' | 'care_team';
  family_user_id: string;
  family_name: string;
  caregiver_id: string;
  match_score: number;
  shift_compatibility_score?: number;
  match_explanation?: string;
  status: string;
  created_at: string;
  care_plan_id?: string;
  care_plan_title?: string;
  notes?: string;
}

export const useUnifiedMatches = (userRole: 'family' | 'professional', showOnlyBestMatch: boolean = true) => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<UnifiedMatch[]>([]);
  const [assignments, setAssignments] = useState<UnifiedAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMatches = useCallback(async () => {
    if (!user?.id) {
      console.log('useUnifiedMatches: No user ID found');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('useUnifiedMatches: Loading matches for user:', user.id, 'role:', userRole);

      if (userRole === 'family') {
        // For families: get their assigned caregivers with manual join
        console.log('useUnifiedMatches: Fetching assignments for family user:', user.id);
        
        const { data: assignmentData, error: assignmentError } = await supabase
          .from('caregiver_assignments')
          .select('*')
          .eq('family_user_id', user.id)
          .eq('is_active', true)
          .order('assignment_type', { ascending: true })
          .order('match_score', { ascending: false });

        console.log('useUnifiedMatches: Assignment query result:', { assignmentData, assignmentError });
        
        if (assignmentError) {
          console.error('useUnifiedMatches: Assignment query error:', assignmentError);
          throw assignmentError;
        }

        if (!assignmentData || assignmentData.length === 0) {
          console.log('useUnifiedMatches: No assignments found for family user:', user.id);
          console.log('useUnifiedMatches: Triggering automatic assignment creation...');
          
          // Trigger automatic assignment creation
          try {
            const { data, error } = await supabase.functions.invoke('automatic-caregiver-assignment', {
              body: { familyUserId: user.id }
            });
            
            if (error) {
              console.error('useUnifiedMatches: Error triggering automatic assignment:', error);
            } else {
              console.log('useUnifiedMatches: Automatic assignment response:', data);
              // Retry loading matches after creating assignments
              if (data?.success && data?.assignments?.length > 0) {
                setTimeout(() => loadMatches(), 1000);
                return;
              }
            }
          } catch (error) {
            console.error('useUnifiedMatches: Failed to trigger automatic assignment:', error);
          }
          
          setMatches([]);
          setIsLoading(false);
          return;
        }

        // Get caregiver profiles for the assignments
        const caregiverIds = assignmentData.map(a => a.caregiver_id);
        console.log('useUnifiedMatches: Fetching caregiver profiles for IDs:', caregiverIds);
        
        if (caregiverIds.length > 0) {
          const { data: caregiverProfiles, error: profileError } = await supabase
            .from('profiles')
            .select(`
              id,
              full_name,
              avatar_url,
              location,
              professional_type,
              years_of_experience,
              certifications,
              specialized_care,
              care_types,
              care_schedule,
              custom_schedule,
              bio,
              hourly_rate,
              expected_rate,
              work_type,
              background_check,
              legally_authorized,
              commute_mode,
              additional_notes,
              care_services,
              languages,
              availability,
              license_number,
              other_certification,
              phone_number,
              address
            `)
            .in('id', caregiverIds)
            .eq('role', 'professional');

          console.log('useUnifiedMatches: Caregiver profiles query result:', { 
            caregiverProfiles: caregiverProfiles?.length || 0, 
            profileError,
            fetchedIds: caregiverProfiles?.map(p => p.id),
            sampleProfile: caregiverProfiles?.[0]
          });
          
          if (profileError) {
            console.error('Error fetching caregiver profiles:', profileError);
          }

          // Create map of caregiver profiles for quick lookup
          const caregiverProfileMap = new Map(
            (caregiverProfiles || []).map(profile => [profile.id, profile])
          );

          // Transform assignments into matches with enhanced caregiver data
          const processedMatches = assignmentData.map((assignment: any) => {
            const caregiverProfile = caregiverProfileMap.get(assignment.caregiver_id);
            
            // Log assignment and caregiver profile mapping
            console.log('useUnifiedMatches: Processing assignment:', {
              assignment_id: assignment.id,
              caregiver_id: assignment.caregiver_id,
              has_profile: !!caregiverProfile,
              profile_preview: caregiverProfile ? {
                id: caregiverProfile.id,
                name: caregiverProfile.full_name,
                professional_type: caregiverProfile.professional_type,
                hourly_rate: caregiverProfile.hourly_rate,
                expected_rate: caregiverProfile.expected_rate,
                care_services: caregiverProfile.care_services
              } : null
            });
            
            // Use enhanced match data if available
            const enhancedMatchData = assignment.enhanced_match_data;
            
            if (enhancedMatchData) {
              try {
                const parsedEnhanced = typeof enhancedMatchData === 'string' 
                  ? JSON.parse(enhancedMatchData) 
                  : enhancedMatchData;
                
                console.log('useUnifiedMatches: Enhanced match data for', assignment.caregiver_id, ':', parsedEnhanced);
              } catch (err) {
                console.warn('Could not parse enhanced match data:', err);
              }
            }

            const caregiver = caregiverProfile;
            
            // If no caregiver profile found, create a minimal fallback
            if (!caregiver) {
              console.warn('useUnifiedMatches: No caregiver profile found for ID:', assignment.caregiver_id);
              return {
                id: assignment.caregiver_id,
                full_name: 'Professional Caregiver',
                avatar_url: null,
                location: 'Trinidad and Tobago',
                care_types: ['General Care'],
                years_of_experience: 'Experience not specified',
                match_score: assignment.match_score || 85,
                shift_compatibility_score: assignment.shift_compatibility_score,
                match_explanation: assignment.match_explanation || 'Good match based on care needs and caregiver specialization',
                assignment_type: assignment.assignment_type,
                assignment_id: assignment.id,
                is_premium: true,
                enhanced_match_data: enhancedMatchData
              };
            }

            // Log the detailed caregiver data for debugging
            console.log('useUnifiedMatches: Full caregiver data for', caregiver.full_name, ':', {
              id: caregiver.id,
              full_name: caregiver.full_name,
              professional_type: caregiver.professional_type,
              years_of_experience: caregiver.years_of_experience,
              hourly_rate: caregiver.hourly_rate,
              expected_rate: caregiver.expected_rate,
              care_types: caregiver.care_types,
              care_services: caregiver.care_services,
              care_schedule: caregiver.care_schedule,
              commute_mode: caregiver.commute_mode,
              location: caregiver.location,
              certifications: caregiver.certifications,
              background_check: caregiver.background_check,
              languages: caregiver.languages
            });

            // Format rate properly - check both hourly_rate and expected_rate
            const formatRateValue = (rate: any) => {
              if (!rate) return undefined;
              if (typeof rate === 'string') {
                const match = rate.match(/(\d+)/);
                return match ? parseInt(match[1]) : undefined;
              }
              return typeof rate === 'number' ? rate : undefined;
            };

            const finalRate = formatRateValue(caregiver.hourly_rate) || formatRateValue(caregiver.expected_rate);
            
            // Transform professional type for better display
            const getDisplayProfessionalType = (type: string | null | undefined) => {
              if (!type) return null;
              switch (type.toLowerCase()) {
                case 'gapp': return 'GAPP Certified';
                case 'nurse': return 'Registered Nurse';
                case 'cna': return 'Certified Nursing Assistant';
                case 'aide': return 'Professional Care Aide';
                default: return type;
              }
            };

            // Get primary care services for display
            const getPrimaryCareServices = (services: string[] | null | undefined, types: string[] | null | undefined) => {
              const primaryServices = services || types || [];
              if (!primaryServices || primaryServices.length === 0) return ['General Care'];
              return primaryServices;
            };
            
            return {
              id: caregiver.id,
              full_name: caregiver.full_name,
              avatar_url: caregiver.avatar_url,
              location: caregiver.location || 'Trinidad and Tobago',
              care_types: getPrimaryCareServices(caregiver.care_services, caregiver.care_types),
              years_of_experience: caregiver.years_of_experience || 'Experience not specified',
              match_score: assignment.match_score || 85,
              shift_compatibility_score: assignment.shift_compatibility_score,
              match_explanation: assignment.match_explanation || 'Good match based on care needs and caregiver specialization',
              assignment_type: assignment.assignment_type,
              assignment_id: assignment.id,
              is_premium: true,
              enhanced_match_data: enhancedMatchData,
              
              // Extended professional information
              professional_type: getDisplayProfessionalType(caregiver.professional_type),
              certifications: caregiver.certifications || [],
              specialized_care: caregiver.care_services || caregiver.specialized_care || [],
              hourly_rate: finalRate,
              work_type: caregiver.work_type,
              care_schedule: caregiver.care_schedule,
              custom_schedule: caregiver.custom_schedule,
              bio: caregiver.bio,
              languages: caregiver.languages || [],
              background_check: caregiver.background_check || false,
              insurance_coverage: caregiver.legally_authorized || false,
              transportation_available: !!caregiver.commute_mode,
              commute_mode: caregiver.commute_mode,
              additional_notes: caregiver.additional_notes
            };
          });

          console.log('useUnifiedMatches: Processed matches:', processedMatches);
          const finalMatches = showOnlyBestMatch ? processedMatches.slice(0, 1) : processedMatches;
          console.log('useUnifiedMatches: Final matches to display:', finalMatches);
          setMatches(finalMatches);
        }

      } else if (userRole === 'professional') {
        // For professionals: get their assignments with manual joins
        const { data: assignmentData, error: assignmentError } = await supabase
          .from('caregiver_assignments')
          .select('*')
          .eq('caregiver_id', user.id)
          .eq('is_active', true)
          .order('assignment_type', { ascending: true })
          .order('created_at', { ascending: false });

        if (assignmentError) throw assignmentError;

        // Get family profiles for the assignments
        const familyIds = assignmentData?.map(a => a.family_user_id) || [];
        const { data: familyProfiles } = await supabase
          .from('profiles')
          .select('id, full_name, care_recipient_name')
          .in('id', familyIds);

        // Get care plans for assignments that have them
        const carePlanIds = assignmentData?.filter(a => a.care_plan_id).map(a => a.care_plan_id) || [];
        const { data: carePlans } = carePlanIds.length > 0 ? await supabase
          .from('care_plans')
          .select('id, title')
          .in('id', carePlanIds) : { data: [] };

        // Transform to assignments
        const processedAssignments: UnifiedAssignment[] = (assignmentData || []).map((assignment: any) => {
          const family = familyProfiles?.find(f => f.id === assignment.family_user_id);
          const carePlan = carePlans?.find(cp => cp.id === assignment.care_plan_id);
          
          return {
            id: assignment.id,
            assignment_type: assignment.assignment_type as 'automatic' | 'manual' | 'care_team',
            family_user_id: assignment.family_user_id,
            family_name: family?.full_name || 'Unknown Family',
            caregiver_id: user.id,
            match_score: assignment.match_score,
            shift_compatibility_score: assignment.shift_compatibility_score,
            match_explanation: assignment.match_explanation,
            status: assignment.status,
            created_at: assignment.created_at,
            care_plan_id: assignment.care_plan_id,
            care_plan_title: carePlan?.title,
            notes: assignment.notes
          };
        });

        setAssignments(processedAssignments);
      }

    } catch (error: any) {
      console.error('Error loading unified matches:', error);
      setError(error instanceof Error ? error.message : 'Failed to load matches');
      toast.error('Failed to load matches. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, userRole, showOnlyBestMatch]);

  // Create assignment using unified function
  const createAssignment = useCallback(async (
    familyUserId: string,
    caregiverId: string,
    assignmentType: 'automatic' | 'manual' | 'care_team',
    adminOverrideScore?: number,
    reason?: string,
    notes?: string,
    carePlanId?: string
  ) => {
    try {
      const { data: assignmentId, error } = await supabase.rpc('create_unified_assignment', {
        target_family_user_id: familyUserId,
        target_caregiver_id: caregiverId,
        assignment_type_param: assignmentType,
        admin_override_score_param: adminOverrideScore,
        assignment_reason_param: reason,
        assignment_notes_param: notes,
        care_plan_id_param: carePlanId
      });

      if (error) throw error;

      toast.success('Assignment created successfully');
      loadMatches(); // Refresh data
      return assignmentId;
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error('Failed to create assignment');
      throw error;
    }
  }, [loadMatches]);

  // Calculate match score using unified function
  const calculateMatchScore = useCallback(async (familyUserId: string, caregiverId: string) => {
    try {
      const { data, error } = await supabase.rpc('calculate_unified_match_score', {
        target_family_user_id: familyUserId,
        target_caregiver_id: caregiverId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error calculating match score:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  return {
    matches,
    assignments,
    isLoading,
    error,
    createAssignment,
    calculateMatchScore,
    refresh: loadMatches
  };
};