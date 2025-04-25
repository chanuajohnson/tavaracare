
import { useState, useEffect } from "react";
import { toast } from "sonner";
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
      await Promise.all([
        loadCarePlan(),
        loadCareTeamMembers(),
        loadCareShifts(),
        loadProfessionals(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadCarePlan = async () => {
    try {
      const plan = await fetchCarePlanById(carePlanId);
      if (plan) {
        setCarePlan(plan);
      }
    } catch (error) {
      console.error("Error loading care plan:", error);
      toast.error("Failed to load care plan details");
    }
  };

  const loadCareTeamMembers = async () => {
    try {
      const members = await fetchCareTeamMembers(carePlanId);
      setCareTeamMembers(members);
    } catch (error) {
      console.error("Error loading care team members:", error);
      toast.error("Failed to load care team members");
    }
  };

  const loadCareShifts = async () => {
    try {
      const shifts = await fetchCareShifts(carePlanId);
      setCareShifts(shifts);
    } catch (error) {
      console.error("Error loading care shifts:", error);
      toast.error("Failed to load care shifts");
    }
  };

  const loadProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, professional_type, avatar_url')
        .eq('role', 'professional');

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error("Error loading professionals:", error);
      toast.error("Failed to load available professionals");
    }
  };

  const handleRemoveTeamMember = async (memberId: string) => {
    try {
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
