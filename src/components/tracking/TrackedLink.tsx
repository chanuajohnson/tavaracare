
import { ReactNode } from "react";
import { Link, LinkProps } from "react-router-dom";
import { useTracking, TrackingActionType } from "@/hooks/useTracking";

interface TrackedLinkProps extends LinkProps {
  /**
   * The action type to track when this link is clicked
   */
  trackingAction: TrackingActionType;
  
  /**
   * Additional data to include with the tracking event
   */
  trackingData?: Record<string, any>;
  
  /**
   * Children to render inside the link
   */
  children: ReactNode;
}

/**
 * Link component that automatically tracks click events
 */
export const TrackedLink = ({ 
  trackingAction, 
  trackingData = {}, 
  onClick,
  children,
  to,
  ...props 
}: TrackedLinkProps) => {
  const { trackEngagement } = useTracking();
  
  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Call the original onClick handler if provided
    if (onClick) {
      onClick(e);
    }
    
    try {
      // Track the link click (after the original handler to not delay navigation)
      await trackEngagement(trackingAction, {
        ...trackingData,
        destination: to.toString()
      }).catch(err => {
        console.error("Error in tracked link:", err);
      });
    } catch (error) {
      console.error(`Error tracking link click for action ${trackingAction}:`, error);
      // Continue execution even if tracking fails
    }
  };
  
  return (
    <Link
      to={to}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
};
