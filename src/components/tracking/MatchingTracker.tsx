
import { useEffect, useState, useRef } from "react";
import { useTracking } from "@/hooks/useTracking";
import { useAuth } from "@/components/providers/AuthProvider";

interface MatchingTrackerProps {
  /**
   * The type of matching page being tracked
   */
  matchingType: 'family' | 'caregiver';
  
  /**
   * Additional data to include with the tracking event
   */
  additionalData?: Record<string, any>;
}

/**
 * Component to track matching page visits
 */
export const MatchingTracker = ({ matchingType, additionalData = {} }: MatchingTrackerProps) => {
  const { trackEngagement } = useTracking();
  const { user, isProfileComplete } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const trackingAttempted = useRef(false);
  
  useEffect(() => {
    setIsMounted(true);
    
    const trackMatchingPageView = async () => {
      if (!isMounted || !user || trackingAttempted.current) return;
      
      try {
        trackingAttempted.current = true;
        const actionType = `${matchingType}_matching_page_view`;
        
        // Note: caregiver tracking will be disabled in the useTracking hook
        await trackEngagement(actionType as any, {
          ...additionalData,
          user_status: isProfileComplete ? 'complete_profile' : 'incomplete_profile',
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error(`Error tracking matching page view for ${matchingType}:`, error);
        // Continue execution even if tracking fails
      }
    };
    
    // Delay tracking to avoid blocking UI rendering
    const trackingTimer = setTimeout(() => {
      if (user && isMounted) {
        trackMatchingPageView().catch(err => {
          console.error("Tracking error in delayed execution:", err);
        });
      }
    }, 1000);
    
    return () => {
      setIsMounted(false);
      clearTimeout(trackingTimer);
    };
  }, [matchingType, user?.id, isProfileComplete, additionalData, trackEngagement, user]);
  
  return null; // This component doesn't render anything
};
