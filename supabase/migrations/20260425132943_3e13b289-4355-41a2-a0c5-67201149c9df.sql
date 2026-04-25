UPDATE public.billable_service_items
SET unit_price = 350.00,
    description = 'Approved support for one secondary task per day for an additional household member (e.g. light meal assistance, medication reminder, or shower guidance). Billed weekly. Beyond a single daily task, a re-assessment is required.'
WHERE id = '0fd30345-f9c1-4f16-828d-1f4a27375ab7';

UPDATE public.billable_service_items
SET unit_price = 0.00,
    description = 'Custom quote — requires consultation with the assigned caregiver. Standard support for a secondary household member can effectively double the caregiver''s workload, so care payments may need to roughly double. Quoted only after the caregiver agrees and the secondary person''s specific needs are reviewed; a re-assessment or additional caregiver may be recommended.'
WHERE id = '5e4729cc-58e5-4ee6-a28f-b2d847f8b9ca';

UPDATE public.billable_service_items
SET unit_price = 0.00,
    description = 'Custom quote — high-need support for a secondary household member is not absorbed under a single caregiver. A formal re-assessment and a dedicated additional caregiver are recommended. Pricing set after consultation.'
WHERE id = '3c1e1cf7-6350-413e-ab62-76fa1fed85b1';