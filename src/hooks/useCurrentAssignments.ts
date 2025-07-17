import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';

export interface CurrentAssignment {
  id: string;
  type: 'manual' | 'care_team' | 'automatic';
  familyId: string;
  familyName: string;
  carePlanId?: string;
  carePlanTitle?: string;
  assignmentDate: string;
  status: string;
  matchScore?: number;
  notes?: string;
}

export const useCurrentAssignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<CurrentAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchAssignments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch manual assignments from admin_match_interventions
        const { data: manualMatches, error: manualError } = await supabase
          .from('admin_match_interventions')
          .select(`
            id,
            family_user_id,
            admin_match_score,
            created_at,
            status,
            notes,
            profiles!admin_match_interventions_family_user_id_fkey (
              id,
              full_name
            )
          `)
          .eq('caregiver_id', user.id)
          .eq('status', 'active');

        if (manualError) throw manualError;

        // Fetch care team assignments
        const { data: careTeamAssignments, error: careTeamError } = await supabase
          .from('care_team_members')
          .select(`
            id,
            family_id,
            created_at,
            status,
            notes,
            care_plan_id,
            profiles!care_team_members_family_id_fkey (
              id,
              full_name
            ),
            care_plans!care_team_members_care_plan_id_fkey (
              id,
              title
            )
          `)
          .eq('caregiver_id', user.id)
          .eq('status', 'active');

        if (careTeamError) throw careTeamError;

        // Fetch automatic assignments
        const { data: automaticAssignments, error: automaticError } = await supabase
          .from('automatic_assignments')
          .select(`
            id,
            family_user_id,
            match_score,
            created_at,
            is_active,
            match_explanation,
            profiles!automatic_assignments_family_user_id_fkey (
              id,
              full_name
            )
          `)
          .eq('caregiver_id', user.id)
          .eq('is_active', true);

        if (automaticError) throw automaticError;

        // Transform and combine all assignments
        const allAssignments: CurrentAssignment[] = [];

        console.log('Raw query results:', {
          manualMatches,
          careTeamAssignments,
          automaticAssignments
        });

        // Add manual matches (highest priority)
        manualMatches?.forEach(match => {
          console.log('Processing manual match:', match);
          if (match.profiles) {
            allAssignments.push({
              id: match.id,
              type: 'manual',
              familyId: match.family_user_id,
              familyName: match.profiles.full_name || 'Unknown Family',
              assignmentDate: match.created_at,
              status: match.status,
              matchScore: match.admin_match_score,
              notes: match.notes
            });
          } else {
            console.warn('Manual match missing profiles:', match);
          }
        });

        // Add care team assignments
        careTeamAssignments?.forEach(assignment => {
          console.log('Processing care team assignment:', assignment);
          if (assignment.profiles) {
            allAssignments.push({
              id: assignment.id,
              type: 'care_team',
              familyId: assignment.family_id,
              familyName: assignment.profiles.full_name || 'Unknown Family',
              carePlanId: assignment.care_plan_id,
              carePlanTitle: assignment.care_plans?.title,
              assignmentDate: assignment.created_at,
              status: assignment.status,
              notes: assignment.notes
            });
          } else {
            console.warn('Care team assignment missing profiles:', assignment);
          }
        });

        // Add automatic assignments (lowest priority)
        automaticAssignments?.forEach(assignment => {
          console.log('Processing automatic assignment:', assignment);
          if (assignment.profiles) {
            allAssignments.push({
              id: assignment.id,
              type: 'automatic',
              familyId: assignment.family_user_id,
              familyName: assignment.profiles.full_name || 'Unknown Family',
              assignmentDate: assignment.created_at,
              status: 'active',
              matchScore: assignment.match_score,
              notes: assignment.match_explanation
            });
          } else {
            console.warn('Automatic assignment missing profiles:', assignment);
          }
        });

        // Sort by priority (manual > care_team > automatic) and then by date
        allAssignments.sort((a, b) => {
          const priorityOrder = { manual: 1, care_team: 2, automatic: 3 };
          if (priorityOrder[a.type] !== priorityOrder[b.type]) {
            return priorityOrder[a.type] - priorityOrder[b.type];
          }
          return new Date(b.assignmentDate).getTime() - new Date(a.assignmentDate).getTime();
        });

        console.log('Final assignments array:', allAssignments);
        setAssignments(allAssignments);
      } catch (error) {
        console.error('Error fetching current assignments:', error);
        setError('Failed to load current assignments');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();

    // Set up real-time subscriptions for updates
    const manualMatchesSubscription = supabase
      .channel('manual_matches_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'admin_match_interventions', filter: `caregiver_id=eq.${user.id}` },
        () => fetchAssignments()
      )
      .subscribe();

    const careTeamSubscription = supabase
      .channel('care_team_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'care_team_members', filter: `caregiver_id=eq.${user.id}` },
        () => fetchAssignments()
      )
      .subscribe();

    const automaticSubscription = supabase
      .channel('automatic_assignments_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'automatic_assignments', filter: `caregiver_id=eq.${user.id}` },
        () => fetchAssignments()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(manualMatchesSubscription);
      supabase.removeChannel(careTeamSubscription);
      supabase.removeChannel(automaticSubscription);
    };
  }, [user?.id]);

  return { assignments, loading, error };
};