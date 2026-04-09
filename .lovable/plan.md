

## Fix Duplicate Daily Care Logs: View, Delete, and Prevent Duplicates

### Changes

#### 1. Database Migration
- Add unique constraint on `daily_care_logs(professional_id, care_plan_id, shift_date)` to prevent future duplicates
- Add DELETE RLS policy so professionals can delete their own logs (`professional_id = auth.uid()`)

#### 2. Data Fix (via insert tool)
- Delete the older duplicate log `217b03cc-8e96-4514-9e77-952b5c8c654d` (keeping `e9331b4f...`)

#### 3. `src/components/professional/ProfessionalCalendar.tsx`
Replace the current "N logs recorded" badge + single edit button with a per-log list:
- Each log shown as a row: client name, created time, View/Edit button, Delete button
- Delete button opens a confirmation dialog (AlertDialog)
- After delete, re-fetch logs from DB
- Keep "New Checklist" button for dates with no logs

#### 4. `src/components/professional/DailyChecklist.tsx`
The existing `fetchExistingLog` effect (line 152) already checks for existing logs by `professional_id + client_name + shift_date` and switches to edit mode. This will be enhanced to also match on `care_plan_id` (via `selectedCarePlanId`) for more precise dedup. The DB unique constraint acts as the final safety net.

### Files Changed

| File | Change |
|------|--------|
| New migration | Unique constraint + DELETE RLS policy |
| Data operation | Delete log `217b03cc...` |
| `ProfessionalCalendar.tsx` | Per-log rows with delete buttons and confirmation |
| `DailyChecklist.tsx` | Add `care_plan_id` to existing-log lookup query |

