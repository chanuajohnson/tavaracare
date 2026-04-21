ALTER TABLE public.billable_service_items
  ALTER COLUMN unit_price DROP NOT NULL;

UPDATE public.billable_service_items
SET
  billing_type = 'monthly',
  unit_price = NULL,
  description = 'Ongoing monthly coordination retainer for sustained care environment support — recurring pest control coordination, contractor management, seasonal deep cleaning oversight, and evolving environmental needs. Quoted per household based on home size and scope of ongoing needs. Admin sets the monthly retainer amount per family. Contractor costs (cleaning services, pest treatments, etc.) are separate and billed directly to the family.'
WHERE label = 'Full Care Environment Reset';