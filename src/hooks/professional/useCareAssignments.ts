
import { useState, useEffect } from 'react';
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { CarePlan } from "@/types/carePlan";
import { CareShift, CareTeamMemberWithProfile } from "@/types/careTypes";
import { adaptCarePlanFromDb } from "@/services/care-plans/carePlanService";
import { adaptCareShiftFromDb } from "@/services/care-plans/careShiftService";
import { adaptCareTeamMemberFromDb } from "@/services/care-plans/careTeamService";

export const useCareAssignments = () => {
  const { user } = useAuth();
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [careTeamMembers, setCareTeamMembers] = useState<CareTeamMemberWithProfile[]>([]);
  const [careShifts, setCareShifts] = useState<CareShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  
  // Fetch care team memberships for the current professional
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    const fetchCareAssignments = async () => {
      try {
        setLoading(true);
        
        // Step 1: Get all care team memberships for the current user
        const { data: teamMemberships, error: membershipError } = await supabase
          .from('care_team_members')
          .select(`
            *,
            profiles!caregiver_id(
              full_name,
              professional_type,
              avatar_url
            )
          `)
          .eq('caregiver_id', user.id);
          
        if (membershipError) throw membershipError;
        
        // Step 2: Extract care plan IDs from memberships
        const carePlanIds = teamMemberships?.map(membership => membership.care_plan_id) || [];
        
        if (carePlanIds.length === 0) {
          setLoading(false);
          return;
        }
        
        // Step 3: Fetch care plans based on the IDs
        const { data: plansData, error: plansError } = await supabase
          .from('care_plans')
          .select('*')
          .in('id', carePlanIds);
          
        if (plansError) throw plansError;
        
        // Step 4: Fetch all team members for these care plans
        const { data: allTeamMembers, error: teamError } = await supabase
          .from('care_team_members')
          .select(`
            *,
            profiles!caregiver_id(
              full_name,
              professional_type,
              avatar_url
            )
          `)
          .in('care_plan_id', carePlanIds);
          
        if (teamError) throw teamError;
        
        // Step 5: Fetch shifts for these care plans
        const { data: shiftsData, error: shiftsError } = await supabase
          .from('care_shifts')
          .select('*')
          .in('care_plan_id', carePlanIds)
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true });
          
        if (shiftsError) throw shiftsError;
        
        // Process and set the data
        const adaptedPlans = plansData.map(plan => adaptCarePlanFromDb(plan));
        setCarePlans(adaptedPlans);
        
        const adaptedTeamMembers = allTeamMembers.map(member => ({
          ...adaptCareTeamMemberFromDb(member),
          professionalDetails: {
            full_name: member.profiles?.full_name,
            professional_type: member.profiles?.professional_type,
            avatar_url: member.profiles?.avatar_url
          }
        }));
        setCareTeamMembers(adaptedTeamMembers);
        
        const adaptedShifts = shiftsData.map(shift => adaptCareShiftFromDb(shift));
        setCareShifts(adaptedShifts);
        
        // Set the first care plan as selected by default if no selection exists
        if (!selectedPlanId && adaptedPlans.length > 0) {
          setSelectedPlanId(adaptedPlans[0].id);
        }
        
      } catch (err: any) {
        console.error("Error fetching care assignments:", err);
        setError(err.message || "Failed to load care assignments");
        toast.error("Failed to load care assignments");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCareAssignments();
    
    // Set up real-time subscription for care plan updates
    const careMembersSubscription = supabase
      .channel('care_assignments_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'care_team_members',
          filter: `caregiver_id=eq.${user.id}`
        },
        () => {
          console.log("Care team membership changes detected, refreshing data");
          fetchCareAssignments();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(careMembersSubscription);
    };
  }, [user]);

  return {
    carePlans,
    careTeamMembers,
    careShifts,
    loading,
    error,
    selectedPlanId,
    setSelectedPlanId,
  };
};
