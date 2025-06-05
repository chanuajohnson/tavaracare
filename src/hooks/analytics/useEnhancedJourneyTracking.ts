
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useEnhancedTracking } from './useEnhancedTracking';
import { useAuth } from '@/components/providers/AuthProvider';

interface JourneyStage {
  route: string;
  funnel: string;
  stage: string;
  order: number;
}

const journeyStages: JourneyStage[] = [
  // Registration funnel
  { route: '/auth', funnel: 'registration', stage: 'auth_page_view', order: 1 },
  { route: '/registration', funnel: 'registration', stage: 'registration_start', order: 2 },
  { route: '/registration/family', funnel: 'registration', stage: 'family_registration', order: 3 },
  { route: '/registration/professional', funnel: 'registration', stage: 'professional_registration', order: 3 },
  { route: '/registration/community', funnel: 'registration', stage: 'community_registration', order: 3 },
  
  // Onboarding funnel
  { route: '/dashboard', funnel: 'onboarding', stage: 'dashboard_first_visit', order: 1 },
  { route: '/dashboard/family', funnel: 'onboarding', stage: 'family_dashboard_visit', order: 2 },
  { route: '/dashboard/professional', funnel: 'onboarding', stage: 'professional_dashboard_visit', order: 2 },
  { route: '/dashboard/community', funnel: 'onboarding', stage: 'community_dashboard_visit', order: 2 },
  
  // Care plan creation funnel
  { route: '/family/care-management', funnel: 'careplan_creation', stage: 'care_management_view', order: 1 },
  { route: '/family/care-management/create', funnel: 'careplan_creation', stage: 'create_care_plan_start', order: 2 },
  { route: '/family/care-management/plan', funnel: 'careplan_creation', stage: 'care_plan_details', order: 3 },
  
  // Subscription funnel
  { route: '/subscription', funnel: 'subscription', stage: 'subscription_page_view', order: 1 },
  { route: '/subscription/features', funnel: 'subscription', stage: 'features_exploration', order: 2 },
];

export const useEnhancedJourneyTracking = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { trackFunnelStage, trackGoalCompletion } = useEnhancedTracking();

  useEffect(() => {
    const currentPath = location.pathname;
    
    // Find matching journey stage
    const matchingStage = journeyStages.find(stage => 
      currentPath.startsWith(stage.route) || currentPath === stage.route
    );

    if (matchingStage) {
      trackFunnelStage(
        matchingStage.funnel,
        matchingStage.stage,
        matchingStage.order,
        {
          path: currentPath,
          userRole: user?.role,
          timestamp: new Date().toISOString()
        }
      );
    }

    // Track specific goals based on routes
    if (currentPath === '/dashboard' && user) {
      trackGoalCompletion(
        'onboarding',
        'dashboard_access',
        1,
        ['auth', 'registration', 'dashboard'],
        { userRole: user.role }
      );
    }

    if (currentPath.includes('/care-management/plan/') && user?.role === 'family') {
      trackGoalCompletion(
        'care_management',
        'care_plan_created',
        1,
        ['dashboard', 'care_management', 'create_plan', 'plan_details'],
        { userRole: user.role }
      );
    }
  }, [location.pathname, user, trackFunnelStage, trackGoalCompletion]);

  return { trackFunnelStage, trackGoalCompletion };
};
