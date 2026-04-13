
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
          avatar_url,
          phone_number
        )
      `)
      .eq('care_plan_id', planId);

    if (error) {
      console.error("Supabase error fetching care team members:", error);
      throw error;
    }

    console.log(`Retrieved ${data?.length || 0} care team members for plan ID ${planId}:`, data);

    // Collect caregiver IDs where the FK join returned NULL (RLS blocking)
    const missingProfileIds: string[] = [];
    (data || []).forEach((member: any) => {
      if (!member) return;
      const profileData = member.profiles;
      const hasName = typeof profileData === 'object' && profileData !== null && profileData.full_name;
      if (!hasName && member.caregiver_id) {
        missingProfileIds.push(member.caregiver_id);
      }
    });

    // RPC fallback for missing profiles
    let rpcFallbackMap: Record<string, any> = {};
    const uniqueMissing = [...new Set(missingProfileIds)];
    if (uniqueMissing.length > 0) {
      console.log("FK join returned NULL for care team member profiles, fetching via RPC fallback:", uniqueMissing);
      try {
        const { data: rpcProfiles } = await supabase
          .rpc('get_public_professional_profiles', { ids: uniqueMissing });
        if (rpcProfiles) {
          rpcProfiles.forEach((p: any) => {
            rpcFallbackMap[p.id] = {
              full_name: p.full_name || 'Unknown Professional',
              professional_type: p.professional_type || 'Care Professional',
              avatar_url: p.avatar_url || null,
              phone_number: null
            };
          });
        }
      } catch (rpcErr) {
        console.error("RPC fallback for care team member profiles failed:", rpcErr);
      }
    }

    // More detailed transformation with validation
    return (data || []).map(member => {
      if (!member) {
        console.warn("Received null or undefined member in data array");
        return null;
      }
      
      // Safely access profile data with fallbacks, then RPC fallback
      const rawProfile = member.profiles;
      const hasValidProfile = rawProfile && typeof rawProfile === 'object' && (rawProfile as any).full_name;
      const profileData = hasValidProfile ? rawProfile : (member.caregiver_id ? rpcFallbackMap[member.caregiver_id] : null) || {};
      const fullName = typeof profileData === 'object' && profileData !== null 
        ? (profileData as any).full_name || 'Unknown Professional' 
        : 'Unknown Professional';
      const professionalType = typeof profileData === 'object' && profileData !== null 
        ? (profileData as any).professional_type || 'Care Professional' 
        : 'Care Professional';
      const avatarUrl = typeof profileData === 'object' && profileData !== null 
        ? (profileData as any).avatar_url 
        : null;
      const phoneNumber = typeof profileData === 'object' && profileData !== null 
        ? (profileData as any).phone_number 
        : null;
      
      return {
        ...adaptCareTeamMemberFromDb(member as CareTeamMemberDto),
        professionalDetails: {
          full_name: fullName,
          professional_type: professionalType,
          avatar_url: avatarUrl,
          phone_number: phoneNumber
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
/**
 * Fetches care team members for a specific care plan using the SECURITY DEFINER RPC.
 * This allows professionals to see their teammates even when RLS blocks the direct join.
 */
export const fetchCareTeamMembersViaRPC = async (planId: string): Promise<CareTeamMemberWithProfile[]> => {
  try {
    console.log(`Fetching care team members via RPC for plan ID: ${planId}`);
    
    const { data, error } = await supabase
      .rpc('get_professional_care_plan_team_members', { plan_id: planId });

    if (error) {
      console.error("RPC error fetching care team members:", error);
      throw error;
    }

    console.log(`RPC returned ${data?.length || 0} care team members for plan ID ${planId}`);

    return (data || []).map((member: any) => ({
      id: member.id,
      carePlanId: planId,
      familyId: '',
      caregiverId: member.caregiver_id,
      role: member.role || 'caregiver',
      status: member.status || 'active',
      createdAt: '',
      updatedAt: '',
      professionalDetails: {
        full_name: member.full_name || 'Unknown Professional',
        professional_type: member.professional_type || 'Care Professional',
        avatar_url: member.avatar_url || null,
        phone_number: member.phone_number || null,
      }
    })) as CareTeamMemberWithProfile[];
  } catch (error) {
    console.error("Error fetching care team members via RPC:", error);
    // Fall back to normal fetch
    return fetchCareTeamMembers(planId);
  }
};

