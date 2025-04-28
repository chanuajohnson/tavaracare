
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import { toast } from 'sonner';
import { CarePlan } from '@/types/carePlan';

// Define the types for care team members and shifts
interface CareTeamMember {
  id: string;
  display_name: string;
  role: string;
  status: string;
  notes?: string;
  caregiver_id: string;
  care_plan_id: string;
  created_at: string;
}

interface CareShift {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start_time: string;
  end_time: string;
  status: 'open' | 'completed' | 'cancelled' | 'assigned';
  caregiver_id?: string;
  family_id: string;
  care_plan_id?: string;
  created_at: string;
}

export const useCareAssignments = () => {
  const { user } = useAuth();
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [careTeamMembers, setCareTeamMembers] = useState<CareTeamMember[]>([]);
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
          .select('*')
          .in('care_plan_id', planIds);

        if (membersError) throw new Error(membersError.message);
        setCareTeamMembers(membersData as CareTeamMember[]);

        // Fetch care shifts
        const { data: shiftsData, error: shiftsError } = await supabase
          .from('care_shifts')
          .select('*')
          .in('care_plan_id', planIds);

        if (shiftsError) throw new Error(shiftsError.message);
        setCareShifts(shiftsData as CareShift[]);

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
  }, [user]);

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
