
import { useTracking } from "@/hooks/useTracking";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

interface DashboardTrackerProps {
  /**
   * The type of dashboard being tracked
   */
  dashboardType: 'family' | 'professional' | 'community' | 'admin';
}

/**
 * Component to track dashboard visits with user context
 */
export const DashboardTracker = ({ dashboardType }: DashboardTrackerProps) => {
  const { trackEngagement } = useTracking();
  const { user, isProfileComplete } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const trackingAttempted = useRef(false);
  
  useEffect(() => {
    setIsMounted(true);
    
    const trackDashboardView = async () => {
      if (!isMounted || !user || trackingAttempted.current) return;
      
      try {
        trackingAttempted.current = true;
        const actionType = `${dashboardType}_dashboard_view`;
        
        await trackEngagement(actionType as any, {
          user_status: isProfileComplete ? 'complete_profile' : 'incomplete_profile',
          path: window.location.pathname,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error(`Error tracking dashboard view for ${dashboardType}:`, error);
        // Continue execution even if tracking fails
      }
    };
    
    // Delay tracking to avoid blocking UI rendering
    const trackingTimer = setTimeout(() => {
      if (user && isMounted) {
        trackDashboardView().catch(err => {
          console.error("Tracking error in delayed execution:", err);
        });
      }
    }, 1000);
    
    return () => {
      setIsMounted(false);
      clearTimeout(trackingTimer);
    };
  }, [dashboardType, user?.id, isProfileComplete, trackEngagement, user]);
  
  return null; // This component doesn't render anything
};
