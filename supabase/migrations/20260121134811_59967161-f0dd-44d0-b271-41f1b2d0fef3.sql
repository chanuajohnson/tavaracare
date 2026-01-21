-- Update Health Wise Pharmacy flyer counts (10 of each variant placed on 2026-01-21)

-- Update Variant A location (pharmacy_health_wise_pharmacy)
UPDATE flyer_locations 
SET flyers_count = 10, 
    placed_date = '2026-01-21',
    updated_at = NOW()
WHERE id = '2110eabf-537a-4763-937f-406b038ea03e';

-- Update Variant B location (wellness_health_wise_pharmacy)
UPDATE flyer_locations 
SET flyers_count = 10, 
    placed_date = '2026-01-21',
    updated_at = NOW()
WHERE id = '832f2a6e-cdd6-4ea6-88a3-258d8ce67905';