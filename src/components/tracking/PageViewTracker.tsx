
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useTracking, TrackingActionType } from "@/hooks/useTracking";
import { useAuth } from "@/components/providers/AuthProvider";

interface PageViewTrackerProps {
  /**
   * The action type to use for tracking this page view
   */
  actionType: TrackingActionType;
  
  /**
   * Additional data to include with the tracking event
   */
  additionalData?: Record<string, any>;
  
  /**
   * If true, will re-track the page view on URL changes within the same page
   */
  trackPathChanges?: boolean;
  
  /**
   * Journey stage associated with this page view (optional)
   */
  journeyStage?: string;
}

/**
 * Component to track page views automatically
 */
export const PageViewTracker = ({ 
  actionType, 
  additionalData = {}, 
  trackPathChanges = false,
  journeyStage
}: PageViewTrackerProps) => {
  const { trackEngagement } = useTracking();
  const { user, isProfileComplete } = useAuth();
  const location = useLocation();
  const previousPath = useRef<string | null>(null);
  
  useEffect(() => {
    // Skip if we're tracking path changes and the path hasn't changed
    if (trackPathChanges && previousPath.current === location.pathname + location.search) {
      return;
    }
    
    // Track the page view
    const trackPageView = async () => {
      try {
        // Store visit sequence in session storage to determine navigation flow
        let visitHistory: Array<{path: string, timestamp: number}> = [];
        try {
          visitHistory = JSON.parse(sessionStorage.getItem('visit_history') || '[]');
        } catch (e) {
          console.log('[PageViewTracker] Could not read visit history from sessionStorage');
        }
        
        visitHistory.push({
          path: location.pathname,
          timestamp: Date.now()
        });
        
        try {
          sessionStorage.setItem('visit_history', JSON.stringify(visitHistory.slice(-10))); // Keep last 10 pages
        } catch (e) {
          console.log('[PageViewTracker] Could not save visit history to sessionStorage');
        }
        
        // Calculate time on previous page if available
        let timeOnPreviousPage = null;
        if (visitHistory.length > 1) {
          const previousVisit = visitHistory[visitHistory.length - 2];
          timeOnPreviousPage = Math.floor((Date.now() - previousVisit.timestamp) / 1000);
        }
        
        // Determine if this is a return visit to the page
        const isReturnVisit = visitHistory.slice(0, -1).some(visit => visit.path === location.pathname);
        
        console.log('[PageViewTracker] Tracking page view:', { 
          actionType, 
          path: location.pathname,
          search: location.search,
          hasAdditionalData: Object.keys(additionalData).length > 0
        });
        
        await trackEngagement(actionType, {
          ...additionalData,
          path: location.pathname,
          search: location.search,
          referrer: document.referrer,
          journey_stage: journeyStage || 'navigation',
          is_return_visit: isReturnVisit,
          visit_count: visitHistory.length,
          time_on_previous_page: timeOnPreviousPage,
          user_status: user ? (isProfileComplete ? 'complete_profile' : 'incomplete_profile') : 'anonymous'
        });
        
        // Update previous path
        previousPath.current = location.pathname + location.search;
      } catch (error) {
        console.error('[PageViewTracker] Error tracking page view:', error);
      }
    };
    
    trackPageView();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackPathChanges ? location.pathname + location.search : null]);
  
  return null; // This component doesn't render anything
};
