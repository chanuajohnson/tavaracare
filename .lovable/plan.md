

## Fix: Daily Care Logs Not Showing for Family

### Root Cause
Tricia Cumm created 2 logs for April 9th **before** the migration that added `care_plan_id` and `family_id` columns. Both logs have these values as `NULL`:

| Log ID | Client | care_plan_id | family_id |
|--------|--------|-------------|-----------|
| `e933...` | User1 Family | NULL | NULL |
| `217b...` | User1 Family | NULL | NULL |

The `DailyCareLogsTab` queries `WHERE care_plan_id = '4848aec5-...'`, so it finds nothing and shows "No Daily Logs Yet."

### Fix (2 parts)

#### 1. Backfill existing logs (Database migration)
Run a migration to update the 2 existing logs with the correct `care_plan_id` and `family_id`:
```sql
UPDATE daily_care_logs 
SET care_plan_id = '4848aec5-edb0-4e4a-b8e8-5684c609e6d6',
    family_id = '7d850934-a44f-4348-944b-ae7182dca237'
WHERE professional_id = '56922ef7-6278-4f3f-b48c-fe309cd80ec9'
  AND care_plan_id IS NULL;
```

#### 2. Make DailyCareLogsTab more resilient
Update `DailyCareLogsTab.tsx` to also query logs where `care_plan_id` is NULL but the `professional_id` matches a care team member of this care plan. This prevents future orphaned logs from being invisible. Alternatively, ensure the save path in `DailyChecklist.tsx` always populates `care_plan_id` (which it now does via `selectedCarePlanId`).

### Files Changed

| File | Change |
|------|--------|
| New migration | Backfill `care_plan_id` and `family_id` on existing logs |
| `src/components/care-plan/DailyCareLogsTab.tsx` | Add fallback query for logs by care team professional IDs when `care_plan_id` is NULL |

### Result
After this fix, the Peltier family will immediately see Tricia's 2 logs under the "Daily Logs" tab, with full checklist details and feedback form.

