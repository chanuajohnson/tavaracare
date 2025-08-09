import { supabase } from "@/integrations/supabase/client";

/**
 * Determine whether the current family user should open the LIVE chat modal
 * with the given caregiver instead of the legacy moderated chat.
 *
 * Rules (any true → eligible):
 *  A) There is an accepted caregiver_chat_request for this pair
 *  B) There is an active caregiver_assignment for this pair
 *  C) There is already a chat session today for this pair
 */
export async function checkLiveChatEligibilityForFamily(caregiverId: string) {
  try {
    // 1) Check accepted requests
    const { data: requests } = await supabase
      .from("caregiver_chat_requests")
      .select("id")
      .eq("caregiver_id", caregiverId)
      .eq("status", "accepted");

    if (requests && requests.length > 0) return true;

    // 2) Check active assignments
    const { data: assignments } = await supabase
      .from("caregiver_assignments")
      .select("id")
      .eq("caregiver_id", caregiverId)
      .eq("is_active", true);

    if (assignments && assignments.length > 0) return true;

    // 3) Check existing session for today
    const today = new Date().toISOString().split("T")[0];
    const { data: session } = await supabase
      .from("caregiver_chat_sessions")
      .select("id")
      .eq("caregiver_id", caregiverId)
      .eq("session_date", today)
      .maybeSingle();

    if (session?.id) return true;
  } catch (e) {
    console.warn("[chatEligibility] eligibility check failed", e);
  }
  return false;
}
