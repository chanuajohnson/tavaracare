import { supabase } from "@/integrations/supabase/client";

/**
 * Simplified Tinder-style chat eligibility based on user journey progress.
 * Uses the SAME logic as the readiness checker for consistency.
 * 
 * Journey-based rules:
 * - Complete foundation steps 1-2 (profile, assessment)
 * - Story is optional but recommended
 * - Single "Chat" button that system decides type internally
 */
export async function checkChatEligibilityForFamily(): Promise<boolean> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const currentUserId = authData?.user?.id;
    if (!currentUserId) return false;

    // Check foundation steps completion - MATCHES readiness checker logic exactly
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone_number, address, care_recipient_name, relationship, care_types, care_schedule, budget_preferences, caregiver_type')
      .eq('id', currentUserId)
      .maybeSingle();

    // Step 1: Profile completion (matches isRegistrationComplete logic)
    const requiredFields = profile && 
      profile.full_name && 
      profile.phone_number && 
      profile.address && 
      profile.care_recipient_name && 
      profile.relationship;

    const enhancedFields = profile && (
      (profile.care_types && Array.isArray(profile.care_types) && profile.care_types.length > 0) ||
      (profile.care_schedule && String(profile.care_schedule).trim()) ||
      (profile.budget_preferences && String(profile.budget_preferences).trim()) ||
      (profile.caregiver_type && String(profile.caregiver_type).trim())
    );

    const profileComplete = requiredFields && enhancedFields;

    if (!profileComplete) {
      console.debug('[chatEligibility] not eligible: profile incomplete', {
        requiredFields: !!requiredFields,
        enhancedFields: !!enhancedFields
      });
      return false;
    }

    // Step 2: Care assessment (matches isCareAssessmentComplete logic)
    const { data: careAssessment } = await supabase
      .from('care_needs_family')
      .select('id, care_recipient_name, primary_contact_name')
      .eq('profile_id', currentUserId)
      .maybeSingle();

    const assessmentComplete = careAssessment?.id && 
      (careAssessment?.care_recipient_name || careAssessment?.primary_contact_name);

    if (!assessmentComplete) {
      console.debug('[chatEligibility] not eligible: no care assessment');
      return false;
    }

    // Story is OPTIONAL - matches readiness checker logic
    console.debug('[chatEligibility] eligible: registration + assessment completed (story optional)');
    return true;

  } catch (e) {
    console.warn("[chatEligibility] eligibility check failed", e);
    return false;
  }
}

/**
 * Determines if a specific caregiver relationship should use direct live chat
 * vs guided TAV chat based on existing relationship history.
 * 
 * CONSISTENCY FIX: Always return false for new users to ensure TAV-guided experience.
 * Only established relationships (active assignments/accepted requests) get live chat.
 */
export async function shouldUseLiveChatForCaregiver(caregiverId: string): Promise<boolean> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const currentUserId = authData?.user?.id;
    if (!currentUserId) return false;

    // CONSISTENCY: For now, all new users get TAV-guided chat
    // This ensures consistent experience across all entry points
    console.debug('[chatEligibility] forcing TAV-guided chat for consistency', { 
      caregiverId,
      userId: currentUserId,
      result: false
    });

    return false;

    // TODO: Re-enable relationship checking once chat consistency is verified
    /*
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
    */

  } catch (e) {
    console.warn("[chatEligibility] relationship check failed", e);
    return false;
  }
}
