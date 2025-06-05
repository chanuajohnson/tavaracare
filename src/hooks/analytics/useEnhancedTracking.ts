
import { useEffect, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { analyticsService } from '@/services/analytics/analyticsService';
import { v4 as uuidv4 } from 'uuid';

interface TrackingOptions {
  sessionId?: string;
  userId?: string;
  additionalData?: Record<string, any>;
}

export const useEnhancedTracking = (options: TrackingOptions = {}) => {
  const { user } = useAuth();
  
  // Get or create session ID
  const sessionId = options.sessionId || (() => {
    const stored = sessionStorage.getItem('analytics_session_id');
    if (stored) return stored;
    
    const newSessionId = uuidv4();
    sessionStorage.setItem('analytics_session_id', newSessionId);
    return newSessionId;
  })();

  // Initialize session tracking
  useEffect(() => {
    const startSession = async () => {
      try {
        await analyticsService.trackSession({
          session_id: sessionId,
          user_id: user?.id,
          device_type: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
          browser: navigator.userAgent.split(' ').slice(-1)[0],
          referrer: document.referrer || undefined,
          session_data: {
            ...options.additionalData,
            viewport: {
              width: window.innerWidth,
              height: window.innerHeight
            },
            timestamp: new Date().toISOString()
          }
        });
      } catch (error) {
        console.error('Error starting session tracking:', error);
      }
    };

    startSession();

    // Track page views
    let pageViews = 0;
    let interactions = 0;

    const trackPageView = () => {
      pageViews++;
      analyticsService.updateSession(sessionId, { page_views: pageViews });
    };

    const trackInteraction = () => {
      interactions++;
      analyticsService.updateSession(sessionId, { interactions_count: interactions });
    };

    // Track interactions
    const interactionEvents = ['click', 'scroll', 'keydown'];
    interactionEvents.forEach(event => {
      document.addEventListener(event, trackInteraction);
    });

    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        analyticsService.updateSession(sessionId, {
          ended_at: new Date().toISOString(),
          exit_page: window.location.pathname
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleVisibilityChange);

    // Initial page view
    trackPageView();

    return () => {
      interactionEvents.forEach(event => {
        document.removeEventListener(event, trackInteraction);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleVisibilityChange);
    };
  }, [sessionId, user?.id, options.additionalData]);

  // Funnel tracking functions
  const trackFunnelStage = useCallback(async (
    funnelName: string,
    stageName: string,
    stageOrder: number,
    additionalData?: Record<string, any>
  ) => {
    try {
      await analyticsService.trackFunnelStage({
        user_id: user?.id,
        session_id: sessionId,
        funnel_name: funnelName,
        stage_name: stageName,
        stage_order: stageOrder,
        additional_data: additionalData
      });
    } catch (error) {
      console.error('Error tracking funnel stage:', error);
    }
  }, [sessionId, user?.id]);

  const trackGoalCompletion = useCallback(async (
    goalType: string,
    goalName: string,
    value?: number,
    conversionPath: string[] = [],
    additionalData?: Record<string, any>
  ) => {
    try {
      await analyticsService.trackGoalCompletion({
        user_id: user?.id,
        session_id: sessionId,
        goal_type: goalType,
        goal_name: goalName,
        value,
        conversion_path: conversionPath,
        additional_data: additionalData
      });

      // Update session goal completions
      await analyticsService.updateSession(sessionId, {
        goal_completions: 1 // This would need to be incremented properly
      });
    } catch (error) {
      console.error('Error tracking goal completion:', error);
    }
  }, [sessionId, user?.id]);

  return {
    sessionId,
    trackFunnelStage,
    trackGoalCompletion
  };
};
