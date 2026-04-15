-- Update Active Care Management category to core_plan
UPDATE public.billable_service_items 
SET category = 'core_plan' 
WHERE id = '0f9bec68-1b2a-4c3d-8e5f-6a7b8c9d0e1f';

-- Update Premium Care Management category to core_plan
UPDATE public.billable_service_items 
SET category = 'core_plan' 
WHERE id = '52f6c507-3d4e-5f6a-7b8c-9d0e1f2a3b4c';