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
  match_score: number;
  avatar_url?: string | null;
  full_name?: string | null;            // not displayed (privacy), still useful
  location?: string | null;

  // 🔽 used by DashboardCaregiverMatches
  years_of_experience?: string | null;
  hourly_rate?: string | null;
  care_schedule?: string | null;
  professional_type?: string | null;
  care_types?: string[];                // ensure array
  shift_compatibility_score?: number;
  match_explanation?: string | null;
  is_premium?: boolean;
  assignment_type?: 'automatic' | 'manual' | 'care_team';
  assignment_id?: string;
  enhanced_match_data?: EnhancedMatchData;
  // Extended professional information
  certifications?: string[];
  specialized_care?: string[];
  expected_rate?: string | number;
  work_type?: string;
  custom_schedule?: string;
  bio?: string;
  languages?: string[];
  background_check?: boolean;
  insurance_coverage?: boolean;
  transportation_available?: boolean;
  commute_mode?: string;
  additional_notes?: string;
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
        // For families: get their assigned caregivers from both assignment tables
        console.log('useUnifiedMatches: Fetching assignments for family user:', user.id);
        
        // Query caregiver_assignments table
        const { data: caregiverAssignmentData, error: caregiverAssignmentError } = await supabase
          .from('caregiver_assignments')
          .select('*')
          .eq('family_user_id', user.id)
          .eq('is_active', true)
          .order('assignment_type', { ascending: true })
          .order('match_score', { ascending: false });

        // Query manual_caregiver_assignments table 
        const { data: manualAssignmentData, error: manualAssignmentError } = await supabase
          .from('manual_caregiver_assignments')
          .select('*')
          .eq('family_user_id', user.id)
          .eq('is_active', true)
          .order('match_score', { ascending: false });

        console.log('useUnifiedMatches: Assignment query results:', { 
          caregiverAssignmentData, 
          caregiverAssignmentError,
          manualAssignmentData,
          manualAssignmentError
        });
        
        if (caregiverAssignmentError) {
          console.error('useUnifiedMatches: Caregiver assignment query error:', caregiverAssignmentError);
          throw caregiverAssignmentError;
        }
        
        if (manualAssignmentError) {
          console.error('useUnifiedMatches: Manual assignment query error:', manualAssignmentError);
          throw manualAssignmentError;
        }

        // Combine and normalize assignment data
        const combinedAssignments = [
          ...(caregiverAssignmentData || []),
          ...(manualAssignmentData || []).map(manual => ({
            ...manual,
            assignment_type: 'manual' as const,
            shift_compatibility_score: undefined, // manual assignments don't have this field
            match_explanation: manual.assignment_reason || 'Manual assignment by administrator'
          }))
        ];

        const assignmentData = combinedAssignments;
        console.log('useUnifiedMatches: Combined assignments:', assignmentData);
        
        if (!assignmentData || assignmentData.length === 0) {
          console.log('useUnifiedMatches: No assignments found for family user:', user.id);
          console.log('useUnifiedMatches: Triggering automatic assignment creation...');
          
          // Trigger automatic assignment creation
          console.log('useUnifiedMatches: Attempting to trigger automatic assignment for user:', user.id);
          try {
            const functionCall = await supabase.functions.invoke('automatic-caregiver-assignment', {
              body: { familyUserId: user.id }
            });
            
            console.log('useUnifiedMatches: Edge function response:', functionCall);
            
            if (functionCall.error) {
              console.error('useUnifiedMatches: Edge function error:', functionCall.error);
              setError(`Failed to create assignments: ${functionCall.error.message}`);
              toast.error('Failed to create caregiver assignments. Please contact support.');
            } else {
              console.log('useUnifiedMatches: Edge function data:', functionCall.data);
              
              if (functionCall.data?.success) {
                console.log('useUnifiedMatches: Assignment creation successful, retrying in 2 seconds...');
                // Retry loading matches after creating assignments
                setTimeout(() => {
                  console.log('useUnifiedMatches: Retrying to load matches after assignment creation...');
                  loadMatches();
                }, 2000);
                return;
              } else {
                console.warn('useUnifiedMatches: Assignment creation was not successful:', functionCall.data);
                setError(functionCall.data?.message || 'No suitable caregivers found');
              }
            }
          } catch (error) {
            console.error('useUnifiedMatches: Exception during automatic assignment trigger:', error);
            setError(`System error while creating assignments: ${error.message}`);
            toast.error('System error while creating caregiver assignments. Please try again.');
          }
          
          setMatches([]);
          setIsLoading(false);
          return;
        }

        // Get caregiver profiles for the assignments
        const caregiverIds = assignmentData.map(a => a.caregiver_id);
        console.log('useUnifiedMatches: Fetching caregiver profiles for IDs:', caregiverIds);
        
        if (caregiverIds.length > 0) {
          console.log('useUnifiedMatches: Querying profiles for caregiver IDs:', caregiverIds);
          
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
              address,
              role
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

          // Build map of caregiver profiles for quick lookup
          const caregiverProfileMap = new Map(
            (caregiverProfiles || []).map(profile => [profile.id, profile])
          );

          // NEW: Fallback to SECURITY DEFINER RPC for RLS-safe public fields
          const missingIds = caregiverIds.filter(id => !caregiverProfileMap.has(id));
          if (missingIds.length) {
            console.log('useUnifiedMatches: Falling back to RPC for missing professional profiles:', missingIds);
            const { data: publicProfiles, error: rpcErr } = await supabase
              .rpc('get_public_professional_profiles', { ids: missingIds });

            if (rpcErr) {
              console.warn('[useUnifiedMatches] RPC get_public_professional_profiles error:', rpcErr);
            } else {
              console.log('[useUnifiedMatches] RPC returned profiles count:', publicProfiles?.length || 0);
              (publicProfiles || []).forEach((p: any) => caregiverProfileMap.set(p.id, p));
            }
          }

          // Transform assignments into matches with enhanced caregiver data
          const processedMatches = assignmentData.map((assignment: any) => {
            const caregiver = caregiverProfileMap.get(assignment.caregiver_id);
            
            // Log assignment and caregiver profile mapping
            console.log('useUnifiedMatches: Processing assignment:', {
              assignment_id: assignment.id,
              caregiver_id: assignment.caregiver_id,
              has_profile: !!caregiver,
              profile_preview: caregiver ? {
                id: caregiver.id,
                name: caregiver.full_name,
                professional_type: caregiver.professional_type,
                hourly_rate: caregiver.hourly_rate,
                expected_rate: caregiver.expected_rate,
                care_services: caregiver.care_services
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

            // If no caregiver profile found even after RPC, create a minimal fallback
            if (!caregiver) {
              console.warn('useUnifiedMatches: No caregiver profile found for ID (after RPC):', assignment.caregiver_id);
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
            const getPrimaryCareServices = (services: string[] | null | undefined, types: string[] | null | undefined) => {
              const primaryServices = services || types || [];
              if (!primaryServices || primaryServices.length === 0) return ['General Care'];
              return primaryServices;
            };
            
            return {
              id: caregiver.id,
              full_name: caregiver.full_name,
              avatar_url: caregiver.avatar_url,
              location: caregiver?.location ?? null,
              care_types: Array.isArray(caregiver?.care_types) ? caregiver.care_types : [],
              years_of_experience: caregiver?.years_of_experience ?? null,
              match_score: assignment.match_score || 85,
              shift_compatibility_score: assignment.shift_compatibility_score,
              match_explanation: assignment.match_explanation || 'Good match based on care needs and caregiver specialization',
              assignment_type: assignment.assignment_type,
              assignment_id: assignment.id,
              is_premium: true,
              enhanced_match_data: enhancedMatchData,
              
              // Extended professional information (may be undefined for RPC-fetched but UI handles gracefully)
              professional_type: getDisplayProfessionalType(caregiver.professional_type),
              certifications: caregiver.certifications || [],
              specialized_care: caregiver.care_services || caregiver.specialized_care || [],
              hourly_rate: caregiver?.hourly_rate ?? caregiver?.expected_rate ?? null,
              work_type: caregiver.work_type,
              care_schedule: caregiver?.care_schedule ?? null,
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
          
          // TEMP DEBUG — remove after
          console.table(
            processedMatches.slice(0, 1).map(m => ({
              id: m.id,
              years_of_experience: m.years_of_experience,
              hourly_rate: m.hourly_rate,
              care_schedule: m.care_schedule,
              care_types: Array.isArray(m.care_types) ? m.care_types.join('|') : m.care_types,
            }))
          );
          
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
      console.error('Error stack:', error.stack);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load matches';
      setError(errorMessage);
      toast.error(`Failed to load matches: ${errorMessage}`);
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
