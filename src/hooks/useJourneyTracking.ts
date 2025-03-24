
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
  | 'admin_dashboard_visit'
  | 'admin_section_view'
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
 * Updated to be more robust with error handling and fallbacks
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
    if (disabled) {
      console.log(`Journey tracking disabled for ${journeyStage}`);
      return;
    }
    
    const trackJourneyStage = async () => {
      try {
        // Skip if we need to track only once and already tracked
        if (trackOnce) {
          try {
            const trackedStages = JSON.parse(sessionStorage.getItem('tracked_journey_stages') || '{}');
            if (trackedStages[journeyStage]) {
              console.log(`Journey stage ${journeyStage} already tracked this session`);
              return;
            }
          } catch (parseError) {
            console.error("Error parsing tracked stages from sessionStorage:", parseError);
            // Continue with tracking if we can't determine if it was already tracked
          }
        }
        
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
        
        // Track the journey stage with fallback handling
        try {
          await trackEngagement('user_journey_progress', enhancedData);
          console.log(`Successfully tracked journey stage: ${journeyStage}`);
          
          // If we're tracking once per session, mark this stage as tracked
          if (trackOnce) {
            try {
              const trackedStages = JSON.parse(sessionStorage.getItem('tracked_journey_stages') || '{}');
              trackedStages[journeyStage] = Date.now();
              sessionStorage.setItem('tracked_journey_stages', JSON.stringify(trackedStages));
            } catch (storageError) {
              console.error("Error updating tracked stages in sessionStorage:", storageError);
              // Non-critical error, can continue
            }
          }
        } catch (trackingError) {
          console.error(`Error in trackEngagement for ${journeyStage}:`, trackingError);
          // We don't re-throw here to avoid breaking the component
        }
      } catch (error) {
        console.error(`Error during journey tracking for ${journeyStage}:`, error);
        // Catching outer errors to ensure component doesn't break
      }
    };
    
    // Set session start time if not already set
    if (!sessionStorage.getItem('session_start')) {
      try {
        sessionStorage.setItem('session_start', Date.now().toString());
      } catch (storageError) {
        console.error("Error setting session_start in sessionStorage:", storageError);
        // Non-critical error, can continue
      }
    }
    
    // Delay tracking slightly to avoid blocking rendering
    const trackingTimer = setTimeout(() => {
      trackJourneyStage().catch(err => {
        console.error("Uncaught tracking error:", err);
        // Final error catch to ensure component doesn't break
      });
    }, 500);
    
    return () => {
      clearTimeout(trackingTimer);
    };
  }, [journeyStage, user?.id, isProfileComplete, additionalData, trackEngagement, user, location.pathname, trackOnce, disabled]);
  
  // No return value needed, this hook is just for side effects
}
