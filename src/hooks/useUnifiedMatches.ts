import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (userRole === 'family') {
        // For families: get their assigned caregivers
        const { data: assignmentData, error: assignmentError } = await supabase
          .from('caregiver_assignments')
          .select(`
            id,
            assignment_type,
            match_score,
            shift_compatibility_score,
            match_explanation,
            status,
            created_at,
            care_plan_id,
            notes,
            caregiver_id,
            profiles!inner(
              id,
              full_name,
              avatar_url,
              location,
              care_types,
              years_of_experience
            )
          `)
          .eq('family_user_id', user.id)
          .eq('is_active', true)
          .order('assignment_type', { ascending: true }) // manual first, then care_team, then automatic
          .order('match_score', { ascending: false });

        if (assignmentError) throw assignmentError;

        // Transform assignment data to match format
        const processedMatches: UnifiedMatch[] = (assignmentData || []).map((assignment: any) => {
          const caregiver = assignment.profiles;
          const hash = Math.abs(assignment.id.split('').reduce((a: number, b: string) => (a << 5) - a + b.charCodeAt(0), 0));
          
          return {
            id: caregiver.id,
            full_name: caregiver.full_name || 'Professional Caregiver',
            avatar_url: caregiver.avatar_url,
            location: caregiver.location || 'Trinidad and Tobago',
            care_types: caregiver.care_types || ['General Care'],
            years_of_experience: caregiver.years_of_experience || '2+ years',
            match_score: assignment.match_score,
            shift_compatibility_score: assignment.shift_compatibility_score,
            match_explanation: assignment.match_explanation,
            assignment_type: assignment.assignment_type as 'automatic' | 'manual' | 'care_team',
            assignment_id: assignment.id,
            is_premium: (hash % 10) < 3 // 30% chance
          };
        });

        const finalMatches = showOnlyBestMatch ? processedMatches.slice(0, 1) : processedMatches;
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