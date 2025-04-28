
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { toast } from 'sonner';
import { CarePlan } from '@/types/carePlan';
import { CareTeamMemberWithProfile, CareShift } from '@/types/careTypes';

export const useCareAssignments = () => {
  const { user } = useAuth();
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [careTeamMembers, setCareTeamMembers] = useState<CareTeamMemberWithProfile[]>([]);
  const [careShifts, setCareShifts] = useState<CareShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // Fetch care plans the professional is assigned to
  useEffect(() => {
    const fetchCareAssignments = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        // Get care team memberships for this professional
        const { data: teamData, error: teamError } = await supabase
          .from('care_team_members')
          .select('care_plan_id')
          .eq('caregiver_id', user.id);

        if (teamError) throw new Error(teamError.message);

        if (!teamData || teamData.length === 0) {
          setCarePlans([]);
          setLoading(false);
          return;
        }

        // Get the care plans for these memberships
        const planIds = teamData.map(item => item.care_plan_id);
        const { data: plansData, error: plansError } = await supabase
          .from('care_plans')
          .select('*')
          .in('id', planIds);

        if (plansError) throw new Error(plansError.message);

        // Format care plans
        const formattedPlans = plansData.map(plan => ({
          id: plan.id,
          title: plan.title,
          description: plan.description,
          status: plan.status as 'active' | 'completed' | 'cancelled',
          familyId: plan.family_id,
          metadata: plan.metadata,
          createdAt: plan.created_at,
          updatedAt: plan.updated_at
        }));

        setCarePlans(formattedPlans);

        // Set the default selected plan if available
        if (formattedPlans.length > 0 && !selectedPlanId) {
          setSelectedPlanId(formattedPlans[0].id);
        }

        // Fetch team members
        const { data: membersData, error: membersError } = await supabase
          .from('care_team_members')
          .select(`
            *,
            profiles:caregiver_id (
              full_name,
              professional_type,
              avatar_url
            )
          `)
          .in('care_plan_id', planIds);

        if (membersError) throw new Error(membersError.message);
        
        // Transform to CareTeamMemberWithProfile format
        const formattedTeamMembers = membersData.map(member => ({
          id: member.id,
          carePlanId: member.care_plan_id,
          familyId: member.family_id,
          caregiverId: member.caregiver_id,
          role: member.role || 'caregiver',
          status: member.status || 'invited',
          notes: member.notes,
          createdAt: member.created_at || new Date().toISOString(),
          updatedAt: member.updated_at || new Date().toISOString(),
          professionalDetails: {
            full_name: member.profiles?.full_name,
            professional_type: member.profiles?.professional_type,
            avatar_url: member.profiles?.avatar_url
          }
        }));
        
        setCareTeamMembers(formattedTeamMembers);

        // Fetch care shifts
        const { data: shiftsData, error: shiftsError } = await supabase
          .from('care_shifts')
          .select('*')
          .in('care_plan_id', planIds);

        if (shiftsError) throw new Error(shiftsError.message);
        
        // Transform to CareShift format
        const formattedShifts = shiftsData.map(shift => ({
          id: shift.id,
          carePlanId: shift.care_plan_id,
          familyId: shift.family_id,
          caregiverId: shift.caregiver_id,
          title: shift.title,
          description: shift.description,
          location: shift.location,
          status: shift.status || 'open',
          startTime: shift.start_time,
          endTime: shift.end_time,
          recurringPattern: shift.recurring_pattern,
          recurrenceRule: shift.recurrence_rule,
          createdAt: shift.created_at || new Date().toISOString(),
          updatedAt: shift.updated_at || new Date().toISOString(),
          googleCalendarEventId: shift.google_calendar_event_id
        }));
        
        setCareShifts(formattedShifts);

      } catch (err) {
        const error = err as Error;
        console.error("Error fetching care assignments:", error);
        setError(error.message);
        toast.error("Failed to load care assignments");
      } finally {
        setLoading(false);
      }
    };

    fetchCareAssignments();
  }, [user, selectedPlanId]);

  return {
    carePlans,
    careTeamMembers,
    careShifts,
    loading,
    error,
    selectedPlanId,
    setSelectedPlanId
  };
};
