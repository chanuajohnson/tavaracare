
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { 
  fetchCarePlanById, 
  fetchCareTeamMembers,
  fetchCareShifts,
  removeCareTeamMember,
  deleteCareShift,
  type CarePlan,
  type CareTeamMemberWithProfile,
  type CareShift,
} from "@/services/care-plans";

// Define the Professional type
interface Professional {
  id: string;
  full_name: string | null;
  professional_type: string | null;
  avatar_url: string | null;
}

interface UseCarePlanDataProps {
  carePlanId: string;
  userId: string;
}

export const useCarePlanData = ({ carePlanId, userId }: UseCarePlanDataProps) => {
  // Initialize all state with proper default values
  const [loading, setLoading] = useState(true);
  const [carePlan, setCarePlan] = useState<CarePlan | null>(null);
  const [careTeamMembers, setCareTeamMembers] = useState<CareTeamMemberWithProfile[]>([]);
  const [careShifts, setCareShifts] = useState<CareShift[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only proceed if we have both userId and carePlanId
    if (!userId || !carePlanId) {
      console.log('[useCarePlanData] Missing required parameters:', { userId, carePlanId });
      setLoading(false);
      return;
    }

    // Clear any previous errors
    setError(null);
    loadData();
  }, [userId, carePlanId]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log(`[useCarePlanData] Starting loadData for carePlanId: ${carePlanId} and userId: ${userId}`);
      
      await Promise.all([
        loadCarePlan(),
        loadCareTeamMembers(),
        loadCareShifts(),
        loadProfessionals(),
      ]);
      
      console.log(`[useCarePlanData] Completed loadData for carePlanId: ${carePlanId}`);
    } catch (error) {
      console.error('[useCarePlanData] Error in loadData:', error);
      setError('Failed to load care plan data');
      toast.error("Failed to load care plan data");
    } finally {
      setLoading(false);
    }
  };

  const loadCarePlan = async () => {
    try {
      console.log(`[useCarePlanData] Loading care plan for id: ${carePlanId}`);
      const plan = await fetchCarePlanById(carePlanId);
      console.log('[useCarePlanData] Fetched care plan:', plan);
      
      if (plan) {
        setCarePlan(plan);
      } else {
        console.warn(`[useCarePlanData] No care plan found with id: ${carePlanId}`);
        setError('Care plan not found');
      }
    } catch (error) {
      console.error('[useCarePlanData] Error loading care plan:', error);
      setError('Failed to load care plan details');
      throw error;
    }
  };

  const loadCareTeamMembers = async () => {
    try {
      console.log(`[useCarePlanData] Loading care team members for plan id: ${carePlanId}`);
      const members = await fetchCareTeamMembers(carePlanId);
      console.log(`[useCarePlanData] Fetched ${members.length} care team members:`, members);
      
      setCareTeamMembers(members);
    } catch (error) {
      console.error('[useCarePlanData] Error loading care team members:', error);
      toast.error("Failed to load care team members");
      throw error;
    }
  };

  const loadCareShifts = async () => {
    try {
      console.log(`[useCarePlanData] Loading care shifts for plan id: ${carePlanId}`);
      const shifts = await fetchCareShifts(carePlanId);
      console.log(`[useCarePlanData] Fetched ${shifts.length} care shifts`);
      
      setCareShifts(shifts);
    } catch (error) {
      console.error('[useCarePlanData] Error loading care shifts:', error);
      toast.error("Failed to load care shifts");
      throw error;
    }
  };

  const loadProfessionals = async () => {
    try {
      console.log('[useCarePlanData] Loading all professionals');
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, professional_type, avatar_url')
        .eq('role', 'professional');

      if (error) throw error;
      console.log(`[useCarePlanData] Fetched ${data?.length || 0} professionals`);
      
      setProfessionals(data || []);
    } catch (error) {
      console.error('[useCarePlanData] Error loading professionals:', error);
      toast.error("Failed to load available professionals");
      throw error;
    }
  };

  const handleRemoveTeamMember = async (memberId: string) => {
    try {
      console.log(`[useCarePlanData] Removing team member with id: ${memberId}`);
      const success = await removeCareTeamMember(memberId);
      if (success) {
        await loadCareTeamMembers();
        toast.success("Team member removed successfully");
      }
    } catch (error) {
      console.error('[useCarePlanData] Error removing team member:', error);
      toast.error("Failed to remove team member");
    }
  };

  const handleDeleteShift = async (shiftId: string) => {
    try {
      const confirmed = window.confirm("Are you sure you want to delete this shift?");
      if (confirmed) {
        console.log(`[useCarePlanData] Deleting care shift with id: ${shiftId}`);
        await deleteCareShift(shiftId);
        await loadCareShifts();
        toast.success("Shift deleted successfully");
      }
    } catch (error) {
      console.error('[useCarePlanData] Error deleting care shift:', error);
      toast.error("Failed to delete care shift");
    }
  };

  return {
    loading,
    error,
    carePlan,
    careTeamMembers,
    careShifts,
    professionals,
    handleRemoveTeamMember,
    handleDeleteShift,
    reloadCareTeamMembers: loadCareTeamMembers,
    reloadCareShifts: loadCareShifts,
  };
};
