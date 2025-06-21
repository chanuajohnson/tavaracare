
import { supabase } from '@/lib/supabase';

export interface InteractionStatus {
  hasInteracted: boolean;
  chatRequestStatus?: 'pending' | 'accepted' | 'declined';
  lastInteraction?: string;
  interactionType?: 'chat_request' | 'chat_session' | 'video_call';
}

export interface UserReadinessStatus {
  isReady: boolean;
  completionPercentage: number;
  currentStep: number;
  totalSteps: number;
  hasBasicProfile: boolean;
  reason?: string;
}

export class InteractionHistoryService {
  // Check if a professional has already interacted with a family user
  static async checkProfessionalFamilyInteraction(
    professionalId: string, 
    familyUserId: string
  ): Promise<InteractionStatus> {
    try {
      // Check for existing chat requests from professional to family
      const { data: chatRequests, error: requestError } = await supabase
        .from('family_chat_requests')
        .select('*')
        .eq('professional_id', professionalId)
        .eq('family_user_id', familyUserId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (requestError) {
        console.error('[InteractionHistory] Error checking chat requests:', requestError);
        return { hasInteracted: false };
      }

      if (chatRequests && chatRequests.length > 0) {
        const latestRequest = chatRequests[0];
        return {
          hasInteracted: true,
          chatRequestStatus: latestRequest.status as 'pending' | 'accepted' | 'declined',
          lastInteraction: latestRequest.created_at,
          interactionType: 'chat_request'
        };
      }

      // Check for existing chat sessions (accepted chats)
      const { data: chatSessions, error: sessionError } = await supabase
        .from('family_chat_sessions')
        .select('*')
        .eq('professional_id', professionalId)
        .eq('family_user_id', familyUserId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (sessionError) {
        console.error('[InteractionHistory] Error checking chat sessions:', sessionError);
      }

      if (chatSessions && chatSessions.length > 0) {
        return {
          hasInteracted: true,
          chatRequestStatus: 'accepted',
          lastInteraction: chatSessions[0].created_at,
          interactionType: 'chat_session'
        };
      }

      return { hasInteracted: false };
    } catch (error) {
      console.error('[InteractionHistory] Error in checkProfessionalFamilyInteraction:', error);
      return { hasInteracted: false };
    }
  }

  // Check if a family user has already interacted with a caregiver
  static async checkFamilyCaregiverInteraction(
    familyUserId: string,
    caregiverId: string
  ): Promise<InteractionStatus> {
    try {
      // Check for existing chat requests from family to caregiver
      const { data: chatRequests, error: requestError } = await supabase
        .from('caregiver_chat_requests')
        .select('*')
        .eq('family_user_id', familyUserId)
        .eq('caregiver_id', caregiverId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (requestError) {
        console.error('[InteractionHistory] Error checking caregiver chat requests:', requestError);
        return { hasInteracted: false };
      }

      if (chatRequests && chatRequests.length > 0) {
        const latestRequest = chatRequests[0];
        return {
          hasInteracted: true,
          chatRequestStatus: latestRequest.status as 'pending' | 'accepted' | 'declined',
          lastInteraction: latestRequest.created_at,
          interactionType: 'chat_request'
        };
      }

      // Check for existing caregiver chat sessions
      const { data: chatSessions, error: sessionError } = await supabase
        .from('caregiver_chat_sessions')
        .select('*')
        .eq('family_user_id', familyUserId)
        .eq('caregiver_id', caregiverId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (sessionError) {
        console.error('[InteractionHistory] Error checking caregiver chat sessions:', sessionError);
      }

      if (chatSessions && chatSessions.length > 0) {
        return {
          hasInteracted: true,
          chatRequestStatus: 'accepted',
          lastInteraction: chatSessions[0].created_at,
          interactionType: 'chat_session'
        };
      }

      return { hasInteracted: false };
    } catch (error) {
      console.error('[InteractionHistory] Error in checkFamilyCaregiverInteraction:', error);
      return { hasInteracted: false };
    }
  }

  // Check user readiness status (both family and professional)
  static async checkUserReadiness(userId: string, userRole: 'family' | 'professional'): Promise<UserReadinessStatus> {
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError || !profile) {
        return {
          isReady: false,
          completionPercentage: 0,
          currentStep: 0,
          totalSteps: userRole === 'family' ? 7 : 5,
          hasBasicProfile: false,
          reason: 'Profile not found'
        };
      }

      // Check basic profile completeness
      const hasBasicProfile = !!(profile.full_name && profile.phone_number && profile.address);
      
      if (!hasBasicProfile) {
        return {
          isReady: false,
          completionPercentage: 0,
          currentStep: 1,
          totalSteps: userRole === 'family' ? 7 : 5,
          hasBasicProfile: false,
          reason: 'Basic profile incomplete (name, phone, address required)'
        };
      }

      // Get journey progress
      const { data: journeyProgress, error: journeyError } = await supabase
        .from('user_journey_progress')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (journeyError) {
        console.error('[InteractionHistory] Error checking journey progress:', journeyError);
      }

      const currentStep = journeyProgress?.current_step || 1;
      const totalSteps = journeyProgress?.total_steps || (userRole === 'family' ? 7 : 5);
      const completionPercentage = journeyProgress?.completion_percentage || 0;

      // Determine readiness based on role and progress
      let isReady = false;
      let reason = '';

      if (userRole === 'professional') {
        // Professionals need to be at step 2+ with >20% completion
        isReady = currentStep >= 2 && completionPercentage >= 20;
        if (!isReady) {
          reason = `Professional needs step 2+ and >20% completion (currently step ${currentStep}, ${completionPercentage}%)`;
        }
      } else if (userRole === 'family') {
        // Family users need basic profile and some progress
        isReady = hasBasicProfile && completionPercentage >= 10;
        if (!isReady) {
          reason = `Family needs basic profile and >10% completion (currently ${completionPercentage}%)`;
        }
      }

      return {
        isReady,
        completionPercentage,
        currentStep,
        totalSteps,
        hasBasicProfile,
        reason: isReady ? undefined : reason
      };
    } catch (error) {
      console.error('[InteractionHistory] Error in checkUserReadiness:', error);
      return {
        isReady: false,
        completionPercentage: 0,
        currentStep: 0,
        totalSteps: userRole === 'family' ? 7 : 5,
        hasBasicProfile: false,
        reason: 'Error checking readiness'
      };
    }
  }

  // Get all interactions for a user (for debugging/admin)
  static async getUserInteractions(userId: string, userRole: 'family' | 'professional') {
    try {
      const interactions = [];

      if (userRole === 'professional') {
        // Get chat requests sent by this professional
        const { data: sentRequests } = await supabase
          .from('family_chat_requests')
          .select('*')
          .eq('professional_id', userId)
          .order('created_at', { ascending: false });

        if (sentRequests) {
          interactions.push(...sentRequests.map(req => ({
            type: 'chat_request_sent',
            target: req.family_user_id,
            status: req.status,
            date: req.created_at
          })));
        }

        // Get chat sessions as professional
        const { data: sessions } = await supabase
          .from('family_chat_sessions')
          .select('*')
          .eq('professional_id', userId)
          .order('created_at', { ascending: false });

        if (sessions) {
          interactions.push(...sessions.map(session => ({
            type: 'chat_session',
            target: session.family_user_id,
            status: 'active',
            date: session.created_at
          })));
        }
      } else {
        // Get chat requests sent to this family user
        const { data: receivedRequests } = await supabase
          .from('family_chat_requests')
          .select('*')
          .eq('family_user_id', userId)
          .order('created_at', { ascending: false });

        if (receivedRequests) {
          interactions.push(...receivedRequests.map(req => ({
            type: 'chat_request_received',
            target: req.professional_id,
            status: req.status,
            date: req.created_at
          })));
        }

        // Get caregiver chat requests sent by this family user
        const { data: caregiverRequests } = await supabase
          .from('caregiver_chat_requests')
          .select('*')
          .eq('family_user_id', userId)
          .order('created_at', { ascending: false });

        if (caregiverRequests) {
          interactions.push(...caregiverRequests.map(req => ({
            type: 'caregiver_chat_request_sent',
            target: req.caregiver_id,
            status: req.status,
            date: req.created_at
          })));
        }
      }

      return interactions;
    } catch (error) {
      console.error('[InteractionHistory] Error getting user interactions:', error);
      return [];
    }
  }
}
