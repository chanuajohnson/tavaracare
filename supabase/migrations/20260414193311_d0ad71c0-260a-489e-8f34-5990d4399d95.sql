-- 1. Add admin RLS policy on user_subscriptions so admins can see all subscriptions
CREATE POLICY "Admins can view all subscriptions"
ON public.user_subscriptions FOR SELECT
TO authenticated
USING (public.is_current_user_admin());

-- 2. Create subscription for Ana Maria Aimey linking to Family Care plan
INSERT INTO user_subscriptions (user_id, plan_id, status, start_date, end_date, payment_method)
SELECT '9874b53e-ea23-4ccb-abed-ddbb0367edf5'::uuid, sp.id, 'active', now(), now() + interval '1 year', 'manual'
FROM subscription_plans sp WHERE sp.name = 'Family Care' AND sp.price = 499.00 LIMIT 1;