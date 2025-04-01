
import React from 'react';
import { Button } from '@/components/ui/button';
import { useTracking } from '@/hooks/useTracking';
import { useNavigate } from 'react-router-dom';

interface SubscriptionTrackingButtonProps {
  /**
   * The action to perform when clicked
   */
  action: 'upgrade' | 'view_plans' | 'learn_more';
  
  /**
   * The feature being accessed
   */
  featureType: string;
  
  /**
   * The plan being considered
   */
  planId?: string;
  
  /**
   * Where to navigate after click
   */
  navigateTo: string;
  
  /**
   * State to pass to the navigation
   */
  navigationState?: Record<string, any>;
  
  /**
   * Children to render inside the button
   */
  children: React.ReactNode;
  
  /**
   * Button variant
   */
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

export const SubscriptionTrackingButton = ({
  action,
  featureType,
  planId,
  navigateTo,
  navigationState,
  children,
  variant = "default",
  className,
  ...props
}: SubscriptionTrackingButtonProps) => {
  const { trackEngagement } = useTracking();
  const navigate = useNavigate();
  
  const handleClick = async () => {
    // Track the engagement
    await trackEngagement('subscription_cta_click', {
      action,
      feature: featureType,
      plan: planId,
      source: window.location.pathname
    });
    
    // Navigate to the specified location with state
    navigate(navigateTo, { state: navigationState });
  };
  
  return (
    <Button
      variant={variant}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  );
};
