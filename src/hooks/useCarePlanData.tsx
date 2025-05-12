
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
  const [loading, setLoading] = useState(true);
  const [carePlan, setCarePlan] = useState<CarePlan | null>(null);
  const [careTeamMembers, setCareTeamMembers] = useState<CareTeamMemberWithProfile[]>([]);
  const [careShifts, setCareShifts] = useState<CareShift[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);

  useEffect(() => {
    if (userId && carePlanId) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [userId, carePlanId]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Add logging to trace execution flow
      console.log(`Starting loadData for carePlanId: ${carePlanId} and userId: ${userId}`);
      
      await Promise.all([
        loadCarePlan(),
        loadCareTeamMembers(),
        loadCareShifts(),
        loadProfessionals(),
      ]);
      
      console.log(`Completed loadData for carePlanId: ${carePlanId}`);
    } catch (error) {
      console.error("Error in loadData:", error);
      toast.error("Failed to load care plan data");
    } finally {
      setLoading(false);
    }
  };

  const loadCarePlan = async () => {
    try {
      console.log(`Loading care plan for id: ${carePlanId}`);
      const plan = await fetchCarePlanById(carePlanId);
      console.log("Fetched care plan:", plan);
      
      if (plan) {
        setCarePlan(plan);
      } else {
        console.warn(`No care plan found with id: ${carePlanId}`);
      }
    } catch (error) {
      console.error("Error loading care plan:", error);
      toast.error("Failed to load care plan details");
    }
  };

  const loadCareTeamMembers = async () => {
    try {
      console.log(`Loading care team members for plan id: ${carePlanId}`);
      const members = await fetchCareTeamMembers(carePlanId);
      console.log(`Fetched ${members.length} care team members:`, members);
      
      setCareTeamMembers(members);
    } catch (error) {
      console.error("Error loading care team members:", error);
      toast.error("Failed to load care team members");
    }
  };

  const loadCareShifts = async () => {
    try {
      console.log(`Loading care shifts for plan id: ${carePlanId}`);
      const shifts = await fetchCareShifts(carePlanId);
      console.log(`Fetched ${shifts.length} care shifts`);
      
      setCareShifts(shifts);
    } catch (error) {
      console.error("Error loading care shifts:", error);
      toast.error("Failed to load care shifts");
    }
  };

  const loadProfessionals = async () => {
    try {
      console.log("Loading all professionals");
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, professional_type, avatar_url')
        .eq('role', 'professional');

      if (error) throw error;
      console.log(`Fetched ${data?.length || 0} professionals`);
      
      setProfessionals(data || []);
    } catch (error) {
      console.error("Error loading professionals:", error);
      toast.error("Failed to load available professionals");
    }
  };

  const handleRemoveTeamMember = async (memberId: string) => {
    try {
      console.log(`Removing team member with id: ${memberId}`);
      const success = await removeCareTeamMember(memberId);
      if (success) {
        loadCareTeamMembers();
        toast.success("Team member removed successfully");
      }
    } catch (error) {
      console.error("Error removing team member:", error);
      toast.error("Failed to remove team member");
    }
  };

  const handleDeleteShift = async (shiftId: string) => {
    try {
      const confirmed = window.confirm("Are you sure you want to delete this shift?");
      if (confirmed) {
        console.log(`Deleting care shift with id: ${shiftId}`);
        await deleteCareShift(shiftId);
        loadCareShifts();
      }
    } catch (error) {
      console.error("Error deleting care shift:", error);
      toast.error("Failed to delete care shift");
    }
  };

  return {
    loading,
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
