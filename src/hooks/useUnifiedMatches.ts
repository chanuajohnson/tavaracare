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
        
        const { data: caregiverProfiles, error: profileError } = await supabase
          .from('profiles')
          .select(`
            id, 
            full_name, 
            avatar_url, 
            location, 
            care_types, 
            years_of_experience,
            professional_type,
            certifications,
            specialized_care,
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
            availability
          `)
          .in('id', caregiverIds)
          .eq('role', 'professional');

        console.log('useUnifiedMatches: Caregiver profiles query result:', { caregiverProfiles, profileError });
        
        if (profileError) {
          console.error('useUnifiedMatches: Profile query error:', profileError);
          throw profileError;
        }

        // Transform assignment data to match format and fetch enhanced scoring
        const processedMatches: UnifiedMatch[] = await Promise.all(
          (assignmentData || []).map(async (assignment: any) => {
            const caregiver = caregiverProfiles?.find(p => p.id === assignment.caregiver_id);
            const hash = Math.abs(assignment.id.split('').reduce((a: number, b: string) => (a << 5) - a + b.charCodeAt(0), 0));
            
            console.log('useUnifiedMatches: Processing assignment:', assignment.id, 'caregiver:', caregiver);
            
            // Try to get enhanced match data
            let enhancedMatchData: EnhancedMatchData | undefined;
            try {
              const { data: enhancedData, error: enhancedError } = await supabase.rpc('calculate_unified_match_score', {
                target_family_user_id: user.id,
                target_caregiver_id: assignment.caregiver_id
              });
              
              if (!enhancedError && enhancedData && typeof enhancedData === 'object') {
                const data = enhancedData as any;
                enhancedMatchData = {
                  overall_score: data.overall_score || assignment.match_score,
                  care_types_score: data.care_types_score || 0,
                  schedule_score: data.schedule_score || 0,
                  experience_score: data.experience_score || 0,
                  location_score: data.location_score || 0,
                  match_explanation: data.match_explanation || assignment.match_explanation || '',
                  care_match_details: data.care_match_details || '',
                  schedule_match_details: data.schedule_match_details || '',
                  location_match_details: data.location_match_details || '',
                  experience_match_details: data.experience_match_details || ''
                };
                console.log('useUnifiedMatches: Enhanced match data for caregiver:', assignment.caregiver_id, enhancedMatchData);
              }
            } catch (enhancedError) {
              console.warn('useUnifiedMatches: Failed to get enhanced match data for caregiver:', assignment.caregiver_id, enhancedError);
            }
            
            // Log the caregiver data for debugging
            console.log('useUnifiedMatches: Caregiver data for', caregiver?.full_name, ':', {
              id: caregiver?.id,
              full_name: caregiver?.full_name,
              professional_type: caregiver?.professional_type,
              years_of_experience: caregiver?.years_of_experience,
              hourly_rate: caregiver?.hourly_rate,
              expected_rate: caregiver?.expected_rate,
              care_types: caregiver?.care_types,
              care_services: caregiver?.care_services,
              care_schedule: caregiver?.care_schedule,
              commute_mode: caregiver?.commute_mode,
              location: caregiver?.location
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

            const finalRate = formatRateValue(caregiver?.hourly_rate) || formatRateValue(caregiver?.expected_rate);
            
            return {
              id: caregiver?.id || assignment.caregiver_id,
              full_name: caregiver?.full_name || 'Professional Caregiver',
              avatar_url: caregiver?.avatar_url || null,
              location: caregiver?.location || 'Trinidad and Tobago',
              care_types: caregiver?.care_services || caregiver?.care_types || ['General Care'],
              years_of_experience: caregiver?.years_of_experience || 'Experience not specified',
              match_score: assignment.match_score,
              shift_compatibility_score: assignment.shift_compatibility_score,
              match_explanation: assignment.match_explanation,
              assignment_type: assignment.assignment_type as 'automatic' | 'manual' | 'care_team',
              assignment_id: assignment.id,
              is_premium: (hash % 10) < 3, // 30% chance
              enhanced_match_data: enhancedMatchData,
              // Extended professional information
              professional_type: caregiver?.professional_type,
              certifications: caregiver?.certifications,
              specialized_care: caregiver?.care_services || caregiver?.specialized_care,
              hourly_rate: finalRate,
              work_type: caregiver?.work_type,
              care_schedule: caregiver?.care_schedule,
              custom_schedule: caregiver?.custom_schedule,
              bio: caregiver?.bio,
              languages: caregiver?.languages,
              background_check: caregiver?.background_check,
              insurance_coverage: caregiver?.legally_authorized,
              transportation_available: !!caregiver?.commute_mode,
              commute_mode: caregiver?.commute_mode,
              additional_notes: caregiver?.additional_notes
            };
          })
        );

        console.log('useUnifiedMatches: Processed matches:', processedMatches);
        const finalMatches = showOnlyBestMatch ? processedMatches.slice(0, 1) : processedMatches;
        console.log('useUnifiedMatches: Final matches to display:', finalMatches);
        setMatches(finalMatches);

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

    } catch (error) {
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