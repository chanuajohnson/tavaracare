
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { 
  CareTeamMember, 
  CareTeamMemberDto, 
  CareTeamMemberInput,
  CareTeamMemberWithProfile, 
  ProfessionalDetails 
} from "@/types/careTypes";

// Adapter to convert DB format to domain model
const adaptCareTeamMemberFromDb = (dbMember: CareTeamMemberDto): CareTeamMember => ({
  id: dbMember.id!,
  carePlanId: dbMember.care_plan_id,
  familyId: dbMember.family_id,
  caregiverId: dbMember.caregiver_id,
  role: dbMember.role || 'caregiver',
  status: dbMember.status || 'invited',
  notes: dbMember.notes,
  createdAt: dbMember.created_at || new Date().toISOString(),
  updatedAt: dbMember.updated_at || new Date().toISOString()
});

// Adapter to convert domain model to DB format
const adaptCareTeamMemberToDb = (member: CareTeamMemberInput): CareTeamMemberDto => ({
  care_plan_id: member.carePlanId,
  family_id: member.familyId,
  caregiver_id: member.caregiverId,
  role: member.role,
  status: member.status,
  notes: member.notes
});

export const fetchCareTeamMembers = async (carePlanId: string): Promise<CareTeamMemberWithProfile[]> => {
  try {
    console.log(`Fetching care team members for care plan: ${carePlanId}`);
    
    const { data, error } = await supabase
      .from('care_team_members')
      .select(`
        *,
        profiles:profiles(
          full_name,
          professional_type,
          avatar_url
        )
      `)
      .eq('care_plan_id', carePlanId);
    
    if (error) {
      console.error("Error fetching care team members:", error);
      throw error;
    }
    
    console.log(`Retrieved ${data?.length || 0} care team members`);
    
    // Transform the data to match the CareTeamMemberWithProfile interface
    return (data || []).map(member => {
      const baseTeamMember = adaptCareTeamMemberFromDb(member as CareTeamMemberDto);
      
      // Add profile information
      return {
        ...baseTeamMember,
        professionalDetails: member.profiles as ProfessionalDetails
      };
    });
  } catch (error) {
    console.error("Failed to fetch care team members:", error);
    toast.error("Failed to load care team members");
    return [];
  }
};

export const addCareTeamMember = async (member: CareTeamMemberInput): Promise<CareTeamMemberWithProfile | null> => {
  try {
    const dbMember = adaptCareTeamMemberToDb(member);
    
    const { data, error } = await supabase
      .from('care_team_members')
      .insert([dbMember])
      .select(`
        *,
        profiles:profiles(
          full_name,
          professional_type,
          avatar_url
        )
      `)
      .single();
    
    if (error) {
      console.error("Error adding care team member:", error);
      throw error;
    }
    
    if (!data) {
      throw new Error("No data returned after adding care team member");
    }
    
    const baseTeamMember = adaptCareTeamMemberFromDb(data as CareTeamMemberDto);
    
    return {
      ...baseTeamMember,
      professionalDetails: data.profiles as ProfessionalDetails
    };
  } catch (error) {
    console.error("Failed to add care team member:", error);
    toast.error("Failed to add team member");
    return null;
  }
};

export const updateCareTeamMemberStatus = async (
  memberId: string, 
  status: 'invited' | 'active' | 'declined' | 'removed'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('care_team_members')
      .update({ status })
      .eq('id', memberId);
    
    if (error) {
      console.error("Error updating care team member status:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Failed to update care team member status:", error);
    toast.error("Failed to update team member status");
    return false;
  }
};

export const removeCareTeamMember = async (memberId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('care_team_members')
      .delete()
      .eq('id', memberId);
    
    if (error) {
      console.error("Error removing care team member:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Failed to remove care team member:", error);
    toast.error("Failed to remove team member");
    return false;
  }
};
