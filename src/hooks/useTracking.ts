
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
  | 'podcast_playback_toggle'
  | 'podcast_subscribe_click'
  | 'training_enrollment_click'
  | 'training_module_start'
  
  // Feature Interactions
  | 'filter_toggle_click'
  | 'filter_change'
  | 'profile_view'
  | 'message_send'
  | 'feature_upvote'
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
  
  /**
   * Rate limit in milliseconds to prevent duplicate tracking events
   */
  rateLimit?: number;
}

// Use a WeakMap to track processing state by element
// This helps prevent duplicate events from the same DOM element
const processingElements = new WeakMap();

// Create a map to track last event times for rate limiting
// Use a global variable to maintain state across hook instances
const lastEventTimeMap: Record<string, number> = {};

// Create a map to store in-progress promises to prevent duplicate calls
const trackingPromisesMap: Record<string, Promise<any>> = {};

/**
 * Hook for tracking user engagement across the platform
 */
export function useTracking(options: TrackingOptions = {}) {
  const { user, isProfileComplete } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Default rate limit of 3000ms (3 seconds)
  const rateLimit = options.rateLimit ?? 3000;
  
  /**
   * Track a user engagement event
   * 
   * @param actionType The type of action being tracked
   * @param additionalData Optional additional data to store with the tracking event
   * @param featureName Optional feature name to override the default
   * @returns Promise that resolves when tracking is complete
   */
  const trackEngagement = async (
    actionType: TrackingActionType, 
    additionalData = {}, 
    featureName?: string
  ) => {
    // Skip tracking if disabled
    if (options.disabled) {
      console.log('[Tracking disabled]', actionType, additionalData);
      return;
    }
    
    // Create a unique key for this exact event
    const userId = user?.id || 'anonymous';
    const eventKey = `${userId}-${actionType}-${JSON.stringify(additionalData)}`;
    const now = Date.now();
    const lastEventTime = lastEventTimeMap[eventKey] || 0;
    
    // Implement strict rate limiting to prevent duplicate events
    if (now - lastEventTime < rateLimit) {
      console.log(`[Tracking] Skipping duplicate event (rate limited): ${actionType}`);
      return Promise.resolve(); // Return a resolved promise to maintain interface
    }
    
    // Check if there's already an identical tracking event in progress
    if (trackingPromisesMap[eventKey]) {
      console.log(`[Tracking] Reusing in-progress tracking for: ${actionType}`);
      return trackingPromisesMap[eventKey]; // Return the existing promise
    }
    
    // Update the last event time
    lastEventTimeMap[eventKey] = now;
    
    // Create the tracking promise and store it in the map
    const trackingPromise = (async () => {
      try {
        setIsLoading(true);
        console.log(`[Tracking] Tracking event: ${actionType}`, additionalData);
        
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
        
        // Determine the feature name based on the action type
        let resolvedFeatureName = featureName;
        
        if (!resolvedFeatureName) {
          // Map action types to their corresponding features
          if (actionType.includes('podcast')) {
            resolvedFeatureName = 'podcast';
          } else if (actionType.includes('training')) {
            resolvedFeatureName = 'professional_training';
          } else if (actionType.includes('dashboard_family')) {
            resolvedFeatureName = 'family_dashboard';
          } else if (actionType.includes('dashboard_professional')) {
            resolvedFeatureName = 'professional_dashboard';
          } else if (actionType.includes('dashboard')) {
            resolvedFeatureName = 'dashboard';
          } else {
            // Default fallback
            resolvedFeatureName = 'caregiver_matching';
          }
        }
        
        // Record the tracking event in Supabase - ONE INSERT OPERATION ONLY
        const { error } = await supabase.from('cta_engagement_tracking').insert({
          user_id: user?.id || null,
          action_type: actionType,
          session_id: sessionId,
          feature_name: resolvedFeatureName,
          additional_data: enhancedData
        });
        
        if (error) {
          console.error("[Tracking Error]:", error);
          throw error;
        } else {
          console.log(`[Tracking Success] ${actionType} for ${user?.id || 'anonymous user'}`);
        }
      } catch (error) {
        console.error("[Tracking Error]:", error);
        throw error;
      } finally {
        setIsLoading(false);
        
        // Remove this promise from the map
        setTimeout(() => {
          delete trackingPromisesMap[eventKey];
        }, 1000); // Clean up after 1 second
      }
    })();
    
    // Store the promise
    trackingPromisesMap[eventKey] = trackingPromise;
    
    return trackingPromise;
  };
  
  /**
   * Helper to check if an element is currently being processed
   * @param element The DOM element to check
   * @returns Whether the element is being processed
   */
  const isElementProcessing = (element: HTMLElement | null): boolean => {
    if (!element) return false;
    return processingElements.get(element) === true;
  };
  
  /**
   * Mark an element as being processed to prevent duplicate events
   * @param element The DOM element to mark
   */
  const markElementProcessing = (element: HTMLElement | null, isProcessing: boolean = true): void => {
    if (!element) return;
    if (isProcessing) {
      processingElements.set(element, true);
    } else {
      processingElements.delete(element);
    }
  };
  
  return {
    trackEngagement,
    isLoading,
    isElementProcessing,
    markElementProcessing
  };
}
