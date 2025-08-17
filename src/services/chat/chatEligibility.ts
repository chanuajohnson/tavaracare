import { supabase } from "@/integrations/supabase/client";

/**
 * Simplified Tinder-style chat eligibility based on user journey progress.
 * If user has completed foundation steps 1-3 and has matches, they can chat.
 * 
 * Journey-based rules:
 * - Complete foundation steps 1-3 (profile, assessment, story)
 * - Have caregiver matches available
 * - Single "Chat" button that system decides type internally
 */
export async function checkChatEligibilityForFamily(): Promise<boolean> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const currentUserId = authData?.user?.id;
    if (!currentUserId) return false;

    // Check foundation steps completion
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone_number, address, care_recipient_name, relationship')
      .eq('id', currentUserId)
      .maybeSingle();

    // Step 1: Profile completion
    const profileComplete = profile && 
      profile.full_name && 
      profile.phone_number && 
      profile.address && 
      profile.care_recipient_name && 
      profile.relationship;

    if (!profileComplete) {
      console.debug('[chatEligibility] not eligible: profile incomplete');
      return false;
    }

    // Step 2: Care assessment
    const { data: careAssessment } = await supabase
      .from('care_needs_family')
      .select('id')
      .eq('profile_id', currentUserId)
      .maybeSingle();

    if (!careAssessment) {
      console.debug('[chatEligibility] not eligible: no care assessment');
      return false;
    }

    // Step 3: Care recipient story
    const { data: careRecipient } = await supabase
      .from('care_recipient_profiles')
      .select('id, full_name')
      .eq('user_id', currentUserId)
      .maybeSingle();

    if (!careRecipient?.full_name) {
      console.debug('[chatEligibility] not eligible: no care recipient story');
      return false;
    }

    console.debug('[chatEligibility] eligible: journey steps 1-3 completed');
    return true;

  } catch (e) {
    console.warn("[chatEligibility] eligibility check failed", e);
    return false;
  }
}

/**
 * Determines if a specific caregiver relationship should use direct live chat
 * vs guided TAV chat based on existing relationship history.
 */
export async function shouldUseLiveChatForCaregiver(caregiverId: string): Promise<boolean> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const currentUserId = authData?.user?.id;
    if (!currentUserId) return false;

    // Check if they have an established relationship (assignment or accepted request)
    const { data: assignments } = await supabase
      .from("caregiver_assignments")
      .select("id")
      .eq("caregiver_id", caregiverId)
      .eq("family_user_id", currentUserId)
      .eq("is_active", true)
      .limit(1);

    const { data: requests } = await supabase
      .from("caregiver_chat_requests")
      .select("id")
      .eq("caregiver_id", caregiverId)
      .eq("family_user_id", currentUserId)
      .eq("status", "accepted")
      .limit(1);

    const hasEstablishedRelationship = (assignments && assignments.length > 0) || 
                                      (requests && requests.length > 0);

    console.debug('[chatEligibility] relationship check', { 
      caregiverId, 
      hasEstablishedRelationship 
    });

    return hasEstablishedRelationship;

  } catch (e) {
    console.warn("[chatEligibility] relationship check failed", e);
    return false;
  }
}
