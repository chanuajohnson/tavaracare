
import { useEffect } from "react";
import { useTracking } from "./useTracking";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocation } from "react-router-dom";

type JourneyStage = 
  | 'first_visit'
  | 'authentication'
  | 'profile_creation'
  | 'feature_discovery'
  | 'matching_exploration'
  | 'subscription_consideration'
  | 'active_usage'
  | 'return_visit'
  | string;

interface UseJourneyTrackingOptions {
  /**
   * The current stage in the user journey
   */
  journeyStage: JourneyStage;
  
  /**
   * Additional data to include with the tracking event
   */
  additionalData?: Record<string, any>;
  
  /**
   * Whether to track this journey point only once per session
   */
  trackOnce?: boolean;
  
  /**
   * Whether to disable tracking (for development/testing)
   */
  disabled?: boolean;
}

/**
 * Hook to easily track user journey stages from any component
 */
export function useJourneyTracking({
  journeyStage,
  additionalData = {},
  trackOnce = false,
  disabled = false
}: UseJourneyTrackingOptions) {
  const { trackEngagement } = useTracking();
  const { user, isProfileComplete } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    if (disabled) return;
    
    const trackJourneyStage = async () => {
      // Skip if we need to track only once and already tracked
      if (trackOnce) {
        const trackedStages = JSON.parse(sessionStorage.getItem('tracked_journey_stages') || '{}');
        if (trackedStages[journeyStage]) {
          console.log(`Journey stage ${journeyStage} already tracked this session`);
          return;
        }
      }
      
      try {
        // Create an enhanced data object with useful context
        const enhancedData = {
          ...additionalData,
          journey_stage: journeyStage,
          path: location.pathname,
          is_authenticated: !!user,
          profile_status: isProfileComplete ? 'complete' : 'incomplete',
          user_role: user?.role || 'anonymous',
          referrer: document.referrer || 'direct',
          timestamp: new Date().toISOString(),
          session_duration: sessionStorage.getItem('session_start') 
            ? Math.floor((Date.now() - Number(sessionStorage.getItem('session_start'))) / 1000)
            : 0
        };
        
        // Track the journey stage
        await trackEngagement('user_journey_progress', enhancedData);
        
        // If we're tracking once per session, mark this stage as tracked
        if (trackOnce) {
          const trackedStages = JSON.parse(sessionStorage.getItem('tracked_journey_stages') || '{}');
          trackedStages[journeyStage] = Date.now();
          sessionStorage.setItem('tracked_journey_stages', JSON.stringify(trackedStages));
        }
      } catch (error) {
        console.error(`Error tracking journey stage ${journeyStage}:`, error);
      }
    };
    
    // Set session start time if not already set
    if (!sessionStorage.getItem('session_start')) {
      sessionStorage.setItem('session_start', Date.now().toString());
    }
    
    // Delay tracking slightly to avoid blocking rendering
    const trackingTimer = setTimeout(() => {
      trackJourneyStage();
    }, 500);
    
    return () => {
      clearTimeout(trackingTimer);
    };
  }, [journeyStage, user?.id, isProfileComplete, additionalData, trackEngagement, user, location.pathname, trackOnce, disabled]);
  
  // No return value needed, this hook is just for side effects
}
