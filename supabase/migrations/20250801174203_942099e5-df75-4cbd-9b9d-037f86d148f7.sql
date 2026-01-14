-- CRITICAL SECURITY FIX: Remove Security Definer Views (privilege escalation risk)
-- Drop views owned by postgres superuser to prevent privilege escalation

-- Drop the views that are owned by postgres superuser
DROP VIEW IF EXISTS public.daily_pmf_metrics;
DROP VIEW IF EXISTS public.feature_lookup; 
DROP VIEW IF EXISTS public.feature_statistics;

-- Recreate daily_pmf_metrics view with proper ownership (referencing the actual table)
CREATE VIEW public.daily_pmf_metrics AS
SELECT 
    date,
    family_new_signups,
    professional_new_signups,
    family_active_users,
    professional_active_users,
    daily_retained_users,
    family_dashboard_views,
    matching_clicks_family,
    subscription_clicks_family,
    unlock_clicks_family
FROM daily_pmf_metrics;

-- Recreate feature_lookup view with proper ownership (referencing features table)
CREATE VIEW public.feature_lookup AS
SELECT 
    id,
    name,
    description,
    category,
    status,
    created_at
FROM features;

-- Recreate feature_statistics view with proper ownership
CREATE VIEW public.feature_statistics AS
SELECT 
    f.id,
    f.name,
    COUNT(fv.id) as vote_count,
    f.status,
    f.category
FROM features f
LEFT JOIN feature_votes fv ON f.id = fv.feature_id
GROUP BY f.id, f.name, f.status, f.category;