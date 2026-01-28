
## Fix Health Wise Pharmacy Category Mismatch

### Problem
The Variant B location entry for Health Wise Pharmacy was incorrectly assigned to the "wellness" category instead of "pharmacy". This causes the analytics dashboard to show the same physical location split across two different categories.

### Root Cause
When the two location entries were created:
- Variant A was correctly set to category `pharmacy`
- Variant B was mistakenly set to category `wellness` (likely because the code started with "wellness_")

### Solution
Update the Variant B entry to use the correct "pharmacy" category.

### Database Change
```sql
UPDATE flyer_locations 
SET category = 'pharmacy',
    updated_at = NOW()
WHERE id = '832f2a6e-cdd6-4ea6-88a3-258d8ce67905';
```

### Result After Fix
| Location | Variant | Category | Scans |
|----------|---------|----------|-------|
| Health Wise Pharmacy | A | pharmacy | 2 |
| Health Wise Pharmacy | B | pharmacy | 1 |

The "Performance by Category" section will then show:
- **Pharmacies**: 2 locations, 3 scans (combined)
- Health & Wellness Shops: 0 locations, 0 scans

### Note on Location Codes
The location code `wellness_health_wise_pharmacy` will remain unchanged since it's already encoded in the QR codes that were printed. Only the `category` field (used for analytics grouping) will be corrected.
