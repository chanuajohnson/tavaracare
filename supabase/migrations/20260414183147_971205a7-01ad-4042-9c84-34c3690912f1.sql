
-- Insert Family Care subscription plan ($499/week)
INSERT INTO subscription_plans (id, name, price, duration_days, description)
VALUES (
  gen_random_uuid(),
  'Family Care',
  499.00,
  7,
  'Active care coordination with dedicated management support — weekly billing'
);

-- Link Chanua Johnson to the Family Care plan
INSERT INTO user_subscriptions (user_id, plan_id, status, start_date, end_date, payment_method)
SELECT 
  '7d850934-a44f-4348-944b-ae7182dca237'::uuid,
  sp.id,
  'active',
  now(),
  now() + interval '1 year',
  'manual'
FROM subscription_plans sp
WHERE sp.name = 'Family Care' AND sp.price = 499.00
LIMIT 1;
