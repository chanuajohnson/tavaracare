import React from 'react';
import { UserJourneyTracker } from './UserJourneyTracker';
import { PageViewTracker } from './PageViewTracker';
import { DashboardTracker } from './DashboardTracker';

/**
 * Example component demonstrating how to use various trackers
 * This is for demonstration purposes only and should not be used directly
 */
export const JourneyTrackingExample = () => {
  // This component is just an example of how to use the trackers
  // in different parts of your application
  
  return (
    <div>
      {/* Track landing page with journey stage */}
      <PageViewTracker 
        actionType="landing_page_view"
        journeyStage="discovery" 
      />
      
      {/* For tracking specific journey stages (key user actions) */}
      <UserJourneyTracker 
        journeyStage="feature_discovery" 
        additionalData={{ feature: "caregiver_matching" }}
      />
      
      {/* For tracking first-time experiences (only once per session) */}
      <UserJourneyTracker 
        journeyStage="first_login_experience" 
        trackOnce={true}
      />
      
      {/* For dashboard visits with user context */}
      <DashboardTracker dashboardType="professional" />
      
      {/* Other components would go here */}
    </div>
  );
};

/**
 * EXAMPLES OF JOURNEY STAGE TRACKING IN DIFFERENT COMPONENTS:
 * 
 * 1. On landing page:
 * <UserJourneyTracker journeyStage="first_visit" />
 * 
 * 2. On signup page:
 * <UserJourneyTracker journeyStage="authentication" />
 * 
 * 3. On first profile creation:
 * <UserJourneyTracker journeyStage="profile_creation" />
 * 
 * 4. On features page:
 * <UserJourneyTracker journeyStage="feature_discovery" />
 * 
 * 5. On matching page:
 * <UserJourneyTracker journeyStage="matching_exploration" />
 * 
 * 6. On subscription page:
 * <UserJourneyTracker journeyStage="subscription_consideration" />
 * 
 * 7. On successful subscription:
 * <UserJourneyTracker journeyStage="subscription_conversion" />
 * 
 * 8. For returning users:
 * <UserJourneyTracker journeyStage="return_visit" />
 */
