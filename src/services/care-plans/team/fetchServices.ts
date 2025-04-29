
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { adaptCareTeamMemberFromDb, CareTeamMemberDto, CareTeamMemberWithProfile } from "./types";

/**
 * Fetches care team members for a specific care plan
 */
export const fetchCareTeamMembers = async (planId: string): Promise<CareTeamMemberWithProfile[]> => {
  try {
    console.log(`Fetching care team members for plan ID: ${planId}`);
    
    // Use explicit column naming to avoid ambiguity with profiles
    const { data, error } = await supabase
      .from('care_team_members')
      .select(`
        id, 
        care_plan_id, 
        family_id, 
        caregiver_id, 
        role, 
        status, 
        notes, 
        created_at, 
        updated_at,
        profiles:caregiver_id (
          id,
          full_name,
          professional_type,
          avatar_url
        )
      `)
      .eq('care_plan_id', planId);

    if (error) {
      console.error("Supabase error fetching care team members:", error);
      throw error;
    }

    console.log(`Retrieved ${data?.length || 0} care team members for plan ID ${planId}:`, data);

    // More detailed transformation with validation
    return (data || []).map(member => {
      // Validate member data
      if (!member) {
        console.warn("Received null or undefined member in data array");
        return null;
      }
      
      // Safely access profile data with fallbacks
      const profileData = member.profiles || {};
      const fullName = typeof profileData === 'object' && profileData !== null 
        ? (profileData as any).full_name || 'Unknown Professional' 
        : 'Unknown Professional';
      const professionalType = typeof profileData === 'object' && profileData !== null 
        ? (profileData as any).professional_type || 'Care Professional' 
        : 'Care Professional';
      const avatarUrl = typeof profileData === 'object' && profileData !== null 
        ? (profileData as any).avatar_url 
        : null;
      
      return {
        ...adaptCareTeamMemberFromDb(member as CareTeamMemberDto),
        professionalDetails: {
          full_name: fullName,
          professional_type: professionalType,
          avatar_url: avatarUrl
        }
      };
    }).filter(Boolean) as CareTeamMemberWithProfile[];
  } catch (error) {
    console.error("Error fetching care team members:", error);
    toast.error("Failed to load care team members");
    return [];
  }
};

/**
 * Fetches all care team members across all care plans a professional is assigned to
 */
export const fetchAllCareTeamMembersForProfessional = async (professionalId: string): Promise<CareTeamMemberWithProfile[]> => {
  try {
    console.log(`Fetching all care team members for professional ID: ${professionalId}`);
    
    // First, get all care plans this professional is a member of
    const { data: userAssignments, error: assignmentError } = await supabase
      .from('care_team_members')
      .select('care_plan_id')
      .eq('caregiver_id', professionalId)
      .not('care_plan_id', 'is', null);
    
    if (assignmentError) {
      console.error("Error fetching professional's care plan assignments:", assignmentError);
      throw assignmentError;
    }
    
    console.log(`Professional is assigned to ${userAssignments?.length || 0} care plans:`, userAssignments);
    
    if (!userAssignments || userAssignments.length === 0) {
      return [];
    }
    
    // Extract care plan IDs
    const carePlanIds = userAssignments
      .map(assignment => assignment.care_plan_id)
      .filter(id => id !== null && id !== undefined);
    
    console.log("Care plan IDs to fetch team members for:", carePlanIds);
    
    if (carePlanIds.length === 0) {
      return [];
    }
    
    // Now fetch all team members for these care plans
    const { data: allTeamMembers, error: teamMembersError } = await supabase
      .from('care_team_members')
      .select(`
        id, 
        care_plan_id, 
        family_id, 
        caregiver_id, 
        role, 
        status, 
        notes, 
        created_at, 
        updated_at,
        profiles:caregiver_id (
          id,
          full_name,
          professional_type,
          avatar_url
        )
      `)
      .in('care_plan_id', carePlanIds);
    
    if (teamMembersError) {
      console.error("Error fetching all care team members:", teamMembersError);
      throw teamMembersError;
    }
    
    console.log(`Retrieved ${allTeamMembers?.length || 0} total care team members:`, allTeamMembers);
    
    // Improved transformation with validation
    return (allTeamMembers || []).map(member => {
      if (!member) {
        console.warn("Received null or undefined member in data array");
        return null;
      }
      
      // Safely access profile data with fallbacks
      const profileData = member.profiles || {};
      const fullName = typeof profileData === 'object' && profileData !== null 
        ? (profileData as any).full_name || 'Unknown Professional' 
        : 'Unknown Professional';
      const professionalType = typeof profileData === 'object' && profileData !== null 
        ? (profileData as any).professional_type || 'Care Professional' 
        : 'Care Professional';
      const avatarUrl = typeof profileData === 'object' && profileData !== null 
        ? (profileData as any).avatar_url 
        : null;
      
      return {
        ...adaptCareTeamMemberFromDb(member as CareTeamMemberDto),
        professionalDetails: {
          full_name: fullName,
          professional_type: professionalType,
          avatar_url: avatarUrl
        }
      };
    }).filter(Boolean) as CareTeamMemberWithProfile[];
  } catch (error) {
    console.error("Error fetching all care team members:", error);
    toast.error("Failed to load care team members");
    return [];
  }
};
