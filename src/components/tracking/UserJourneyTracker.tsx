
import { useEffect, useState, useRef } from "react";
import { useTracking } from "@/hooks/useTracking";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocation } from "react-router-dom";

export type UserJourneyStage = 
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
  | string; // Allow custom journey stages

interface UserJourneyTrackerProps {
  /**
   * The current stage in the user journey
   */
  journeyStage: UserJourneyStage;
  
  /**
   * Additional data to include with the tracking event
   */
  additionalData?: Record<string, any>;
  
  /**
   * Whether to track this journey point only once per session
   */
  trackOnce?: boolean;
}

/**
 * Component to track user journey stages
 * Use this component on key pages to track where users are in their journey
 * Enhanced with better error handling and fallbacks
 */
export const UserJourneyTracker = ({ 
  journeyStage, 
  additionalData = {},
  trackOnce = false
}: UserJourneyTrackerProps) => {
  const { trackEngagement } = useTracking();
  const { user, isProfileComplete } = useAuth();
  const location = useLocation();
  const [isMounted, setIsMounted] = useState(false);
  const trackingAttempted = useRef(false);
  
  useEffect(() => {
    setIsMounted(true);
    
    const trackJourneyStage = async () => {
      try {
        // Skip if we've already tracked this journey stage and trackOnce is true
        if (trackOnce) {
          try {
            const trackedStages = JSON.parse(sessionStorage.getItem('tracked_journey_stages') || '{}');
            if (trackedStages[journeyStage]) {
              console.log(`Journey stage ${journeyStage} already tracked this session`);
              return;
            }
          } catch (parseError) {
            console.error("Error parsing tracked stages from sessionStorage:", parseError);
            // Continue if we can't determine if it was already tracked
          }
        }
        
        if (!isMounted || trackingAttempted.current) return;
        
        try {
          trackingAttempted.current = true;
          
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
          // Non-critical error, don't re-throw
        }
      } catch (error) {
        console.error(`Error in tracking journey stage ${journeyStage}:`, error);
        // Ensure component doesn't break
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
      if (isMounted) {
        trackJourneyStage().catch(err => {
          console.error("Uncaught tracking error:", err);
          // Final catch to ensure component doesn't break
        });
      }
    }, 500);
    
    return () => {
      clearTimeout(trackingTimer);
      setIsMounted(false);
    };
  }, [journeyStage, user?.id, isProfileComplete, additionalData, trackEngagement, user, location.pathname, trackOnce]);
  
  // Reset tracking attempted if journey stage changes
  useEffect(() => {
    trackingAttempted.current = false;
  }, [journeyStage]);
  
  return null; // This component doesn't render anything
};
