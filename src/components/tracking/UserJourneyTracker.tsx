
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
      // Skip if we've already tracked this journey stage and trackOnce is true
      if (trackOnce) {
        const trackedStages = JSON.parse(sessionStorage.getItem('tracked_journey_stages') || '{}');
        if (trackedStages[journeyStage]) {
          console.log(`Journey stage ${journeyStage} already tracked this session`);
          return;
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
      if (isMounted) {
        trackJourneyStage().catch(err => {
          console.error("Tracking error:", err);
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
