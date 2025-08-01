-- COMPREHENSIVE RLS INFINITE RECURSION FIX
-- Updates all RLS policies across 26+ tables to use JWT metadata instead of profiles table references
-- This prevents infinite recursion when accessing care plan data and other resources

-- admin_availability_slots
DROP POLICY IF EXISTS "Admins can manage all availability slots" ON public.admin_availability_slots;
CREATE POLICY "Admins can manage all availability slots" ON public.admin_availability_slots
FOR ALL USING (COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', 'family') = 'admin');

-- admin_blocked_dates  
DROP POLICY IF EXISTS "Admin can view blocked dates" ON public.admin_blocked_dates;
CREATE POLICY "Admin can view blocked dates" ON public.admin_blocked_dates
FOR ALL USING (COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', 'family') = 'admin');

-- admin_communications
DROP POLICY IF EXISTS "Admins can manage communications" ON public.admin_communications;
CREATE POLICY "Admins can manage communications" ON public.admin_communications
FOR ALL USING (COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', 'family') = 'admin');

-- admin_match_interventions
DROP POLICY IF EXISTS "Admins can manage all match interventions" ON public.admin_match_interventions;
CREATE POLICY "Admins can manage all match interventions" ON public.admin_match_interventions
FOR ALL USING (COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', 'family') = 'admin');

-- admin_visit_config
DROP POLICY IF EXISTS "Admin can view visit config" ON public.admin_visit_config;
DROP POLICY IF EXISTS "Admin can update visit config" ON public.admin_visit_config;
CREATE POLICY "Admin can view visit config" ON public.admin_visit_config
FOR SELECT USING (COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', 'family') = 'admin');
CREATE POLICY "Admin can update visit config" ON public.admin_visit_config
FOR UPDATE USING (COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', 'family') = 'admin');

-- analytics_aggregations
DROP POLICY IF EXISTS "Admins can access all analytics aggregations" ON public.analytics_aggregations;
CREATE POLICY "Admins can access all analytics aggregations" ON public.analytics_aggregations
FOR ALL USING (COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', 'family') = 'admin');

-- automatic_assignments
DROP POLICY IF EXISTS "Admins can view all automatic assignments" ON public.automatic_assignments;
DROP POLICY IF EXISTS "Only system can create automatic assignments" ON public.automatic_assignments;
CREATE POLICY "Admins can view all automatic assignments" ON public.automatic_assignments
FOR ALL USING (COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', 'family') = 'admin');
CREATE POLICY "Only system can create automatic assignments" ON public.automatic_assignments
FOR INSERT WITH CHECK (COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', 'family') = 'admin');

-- care_team_members
DROP POLICY IF EXISTS "Care team members are viewable by involved users and admins" ON public.care_team_members;
CREATE POLICY "Care team members are viewable by involved users and admins" ON public.care_team_members
FOR SELECT USING (
  (family_id = auth.uid()) OR 
  (caregiver_id = auth.uid()) OR 
  (COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', 'family') = 'admin')
);

-- cta_engagement_tracking
DROP POLICY IF EXISTS "Users can view their own engagements" ON public.cta_engagement_tracking;
CREATE POLICY "Users can view their own engagements" ON public.cta_engagement_tracking
FOR SELECT USING (
  (auth.uid() = user_id) OR 
  (COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', 'family') = 'admin')
);

-- customer_health_scores
DROP POLICY IF EXISTS "Admins can access all health scores" ON public.customer_health_scores;
CREATE POLICY "Admins can access all health scores" ON public.customer_health_scores
FOR ALL USING (COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', 'family') = 'admin');

-- Fix tables that might exist but weren't shown in schema
-- feature_interest_tracking (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'feature_interest_tracking') THEN
        DROP POLICY IF EXISTS "Admins can access all feature interest tracking" ON public.feature_interest_tracking;
        CREATE POLICY "Admins can access all feature interest tracking" ON public.feature_interest_tracking
        FOR ALL USING (COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', 'family') = 'admin');
    END IF;
END $$;

-- feedback_sentiment_history (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'feedback_sentiment_history') THEN
        DROP POLICY IF EXISTS "Admins can access all feedback sentiment history" ON public.feedback_sentiment_history;
        CREATE POLICY "Admins can access all feedback sentiment history" ON public.feedback_sentiment_history
        FOR ALL USING (COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', 'family') = 'admin');
    END IF;
END $$;

-- hero_videos (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'hero_videos') THEN
        DROP POLICY IF EXISTS "Admins can manage hero videos" ON public.hero_videos;
        CREATE POLICY "Admins can manage hero videos" ON public.hero_videos
        FOR ALL USING (COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', 'family') = 'admin');
    END IF;
END $$;

-- journey_analytics (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'journey_analytics') THEN
        DROP POLICY IF EXISTS "Admins can access all journey analytics" ON public.journey_analytics;
        CREATE POLICY "Admins can access all journey analytics" ON public.journey_analytics
        FOR ALL USING (COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', 'family') = 'admin');
    END IF;
END $$;

-- manual_caregiver_assignments (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'manual_caregiver_assignments') THEN
        DROP POLICY IF EXISTS "Admins can manage manual assignments" ON public.manual_caregiver_assignments;
        CREATE POLICY "Admins can manage manual assignments" ON public.manual_caregiver_assignments
        FOR ALL USING (COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', 'family') = 'admin');
    END IF;
END $$;

-- session_analytics (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'session_analytics') THEN
        DROP POLICY IF EXISTS "Admins can access all session analytics" ON public.session_analytics;
        CREATE POLICY "Admins can access all session analytics" ON public.session_analytics
        FOR ALL USING (COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', 'family') = 'admin');
    END IF;
END $$;

-- support_requests (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'support_requests') THEN
        DROP POLICY IF EXISTS "Admins can access all support requests" ON public.support_requests;
        CREATE POLICY "Admins can access all support requests" ON public.support_requests
        FOR ALL USING (COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', 'family') = 'admin');
    END IF;
END $$;

-- user_cohorts (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_cohorts') THEN
        DROP POLICY IF EXISTS "Admins can access all user cohorts" ON public.user_cohorts;
        CREATE POLICY "Admins can access all user cohorts" ON public.user_cohorts
        FOR ALL USING (COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', 'family') = 'admin');
    END IF;
END $$;

-- user_events (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_events') THEN
        DROP POLICY IF EXISTS "Admins can access all user events" ON public.user_events;
        CREATE POLICY "Admins can access all user events" ON public.user_events
        FOR ALL USING (COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', 'family') = 'admin');
    END IF;
END $$;

-- user_feedback (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_feedback') THEN
        DROP POLICY IF EXISTS "Admins can access all user feedback" ON public.user_feedback;
        CREATE POLICY "Admins can access all user feedback" ON public.user_feedback
        FOR ALL USING (COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', 'family') = 'admin');
    END IF;
END $$;

-- user_journey_funnels (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_journey_funnels') THEN
        DROP POLICY IF EXISTS "Admins can access all user journey funnels" ON public.user_journey_funnels;
        CREATE POLICY "Admins can access all user journey funnels" ON public.user_journey_funnels
        FOR ALL USING (COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', 'family') = 'admin');
    END IF;
END $$;

-- visit_bookings (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'visit_bookings') THEN
        DROP POLICY IF EXISTS "Admins can access all visit bookings" ON public.visit_bookings;
        CREATE POLICY "Admins can access all visit bookings" ON public.visit_bookings
        FOR ALL USING (COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', 'family') = 'admin');
    END IF;
END $$;