UPDATE public.subscription_plans
SET price_weekly = 499, price_monthly = 1799
WHERE slug = 'care' AND audience = 'family';