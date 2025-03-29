
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/components/providers/AuthProvider";

export type TrackingActionType = 
  // Page Views
  | 'landing_page_view'
  | 'auth_page_view'
  | 'dashboard_view'
  | 'family_dashboard_view'
  | 'professional_dashboard_view'
  | 'community_dashboard_view'
  | 'admin_dashboard_view'
  | 'caregiver_matching_page_view'
  | 'family_matching_page_view'
  | 'registration_page_view'
  | 'subscription_page_view'
  | 'features_page_view'
  | 'profile_page_view'
  
  // Authentication Actions
  | 'auth_login_attempt'
  | 'auth_signup_attempt'
  | 'auth_login_success'
  | 'auth_signup_success'
  | 'auth_logout'
  | 'auth_password_reset_request'
  
  // CTA Clicks
  | 'caregiver_matching_cta_click'
  | 'family_matching_cta_click'
  | 'premium_matching_cta_click'
  | 'subscription_cta_click'
  | 'complete_profile_cta_click'
  | 'unlock_profile_click'
  | 'view_all_matches_click'
  
  // Feature Interactions
  | 'filter_toggle_click'
  | 'filter_change'
  | 'profile_view'
  | 'message_send'
  | 'feature_upvote'
  | 'training_module_start'
  | 'training_module_complete'
  | 'lesson_complete'
  
  // Navigation
  | 'navigation_click'
  | 'breadcrumb_click'
  
  // Other
  | string; // Allow custom action types

export interface TrackingOptions {
  /**
   * Whether to disable tracking. Useful for testing environments.
   */
  disabled?: boolean;
}

// List of action types related to caregiver matching that should be disabled
const DISABLED_CAREGIVER_MATCHING_ACTIONS = [
  'caregiver_matching_page_view',
  'caregiver_matching_cta_click',
  'premium_matching_cta_click',
  'unlock_profile_click'
];

/**
 * Check if an action is related to caregiver matching
 */
const isCaregiverMatchingAction = (actionType: string): boolean => {
  // Check if action is in the disabled list
  if (DISABLED_CAREGIVER_MATCHING_ACTIONS.includes(actionType)) {
    return true;
  }
  
  // Check if action contains caregiver_matching in the name
  return actionType.includes('caregiver_matching');
};

/**
 * Hook for tracking user engagement across the platform
 */
export function useTracking(options: TrackingOptions = {}) {
  const { user, isProfileComplete } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  /**
   * Track a user engagement event
   * 
   * @param actionType The type of action being tracked
   * @param additionalData Optional additional data to store with the tracking event
   * @returns Promise that resolves when tracking is complete
   */
  const trackEngagement = async (actionType: TrackingActionType, additionalData = {}) => {
    // Skip tracking if disabled in options
    if (options.disabled) {
      console.log('[Tracking disabled by options]', actionType, additionalData);
      return;
    }
    
    // Skip tracking for caregiver matching related events
    if (isCaregiverMatchingAction(actionType)) {
      console.log('[Tracking disabled for caregiver matching]', actionType, additionalData);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Get or create a session ID to track anonymous users
      const sessionId = localStorage.getItem('session_id') || uuidv4();
      
      // Store the session ID if it's new
      if (!localStorage.getItem('session_id')) {
        localStorage.setItem('session_id', sessionId);
      }
      
      // Add user role to additional data if user is logged in
      const enhancedData = {
        ...additionalData,
        user_role: user?.role || 'anonymous',
        user_profile_complete: isProfileComplete || false,
      };
      
      // Record the tracking event in Supabase
      const { error } = await supabase.from('cta_engagement_tracking').insert({
        user_id: user?.id || null,
        action_type: actionType,
        session_id: sessionId,
        additional_data: enhancedData
      });
      
      if (error) {
        console.error("Error tracking engagement:", error);
      }
    } catch (error) {
      console.error("Error in trackEngagement:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    trackEngagement,
    isLoading
  };
}
