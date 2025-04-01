
import { ButtonHTMLAttributes, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { useTracking, TrackingActionType } from "@/hooks/useTracking";

interface TrackableButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The action type to track when this button is clicked
   */
  trackingAction: TrackingActionType;
  
  /**
   * Additional data to include with the tracking event
   */
  trackingData?: Record<string, any>;
  
  /**
   * Variant for the underlying Button component
   */
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  
  /**
   * Size for the underlying Button component
   */
  size?: "default" | "sm" | "lg" | "icon";
  
  /**
   * Children to render inside the button
   */
  children: React.ReactNode;
}

/**
 * Button component that automatically tracks click events
 */
export const TrackableButton = forwardRef<HTMLButtonElement, TrackableButtonProps>(
  ({ trackingAction, trackingData = {}, onClick, ...props }, ref) => {
    const { trackEngagement } = useTracking();
    
    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      // Track the button click
      await trackEngagement(trackingAction, trackingData);
      
      // Call the original onClick handler if provided
      if (onClick) {
        onClick(e);
      }
    };
    
    return (
      <Button
        ref={ref}
        onClick={handleClick}
        {...props}
      />
    );
  }
);

TrackableButton.displayName = "TrackableButton";
