
import { useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";

interface UserJourneyTrackerProps {
  journeyStage: string;
  additionalData?: Record<string, any>;
}

/**
 * Component that tracks user journey stages and sends data to Zapier via the user_events table
 */
export const UserJourneyTracker = ({ 
  journeyStage, 
  additionalData = {} 
}: UserJourneyTrackerProps) => {
  const { user } = useAuth();
  
  useEffect(() => {
    const trackJourneyPoint = async () => {
      if (!user) return;
      
      try {
        // Insert the event into the user_events table, which will trigger the Zapier webhook
        const { error } = await supabase
          .from('user_events')
          .insert([
            { 
              user_id: user.id, 
              event_type: journeyStage,
              additional_data: {
                ...additionalData,
                timestamp: new Date().toISOString(),
                user_email: user.email,
                path: window.location.pathname,
                source: 'journey_tracker'
              }
            }
          ]);
        
        if (error) {
          console.error("Error logging user journey event:", error);
        } else {
          console.log("User journey event logged successfully:", journeyStage);
        }
      } catch (err) {
        console.error("Failed to track user journey:", err);
      }
    };
    
    trackJourneyPoint();
  }, [journeyStage, user, additionalData]);
  
  // This is a tracking component that doesn't render anything visible
  return null;
};
