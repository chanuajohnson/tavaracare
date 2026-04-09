

## Slim WhatsApp Message + Family Log Viewer with Feedback

### What Changes

#### 1. Shorten WhatsApp Message
Replace the full 34-item checklist dump with a brief handoff summary:
- Nurse name, client, date, shift, completion % (e.g. "34/34 tasks")
- Only list incomplete items (if any) and handoff notes
- Include a deep link to the care plan's Shift Reports tab: `https://tavaracare.lovable.app/family/care-management/{carePlanId}?tab=shift-reports`
- This link lets the incoming nurse (and family/admin) view the full log online

#### 2. Add `care_plan_id` and `family_id` to `daily_care_logs`
The table currently has no link to which care plan or family a log belongs to. Adding these columns enables the family-side query.

**Migration:**
```sql
ALTER TABLE public.daily_care_logs 
  ADD COLUMN care_plan_id uuid REFERENCES care_plans(id),
  ADD COLUMN family_id uuid REFERENCES profiles(id);
```

Update the save logic in `DailyChecklist.tsx` to include `care_plan_id` and `family_id` from the selected assignment.

#### 3. RLS Policy for Family Access
Add a policy so families can read logs linked to their care plans:
```sql
CREATE POLICY "Families can view logs for their care plans"
  ON public.daily_care_logs FOR SELECT TO authenticated
  USING (family_id = auth.uid());
```

#### 4. Family-Side: Daily Care Logs Viewer Tab
Add a new component `DailyCareLogsTab` shown in the care plan's existing "Shift Reports" tab (or as a new sub-section within the Schedule tab). This component:
- Queries `daily_care_logs` where `care_plan_id` matches the current plan
- Displays logs in a date-sorted list: nurse name, date, shift, completion %, expandable checklist details
- Each log shows a "View Details" expandable section with the full checklist data from JSONB
- Includes a **feedback textarea** per log where the family can leave a comment

#### 5. Family Feedback on Logs
Add a `daily_care_log_feedback` table:
```sql
CREATE TABLE public.daily_care_log_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id uuid REFERENCES daily_care_logs(id) ON DELETE CASCADE NOT NULL,
  family_id uuid REFERENCES profiles(id) NOT NULL,
  comment text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.daily_care_log_feedback ENABLE ROW LEVEL SECURITY;
-- Family can insert/read their own feedback
CREATE POLICY "Families manage own feedback" ON public.daily_care_log_feedback
  FOR ALL TO authenticated USING (family_id = auth.uid()) WITH CHECK (family_id = auth.uid());
-- Professionals can read feedback on their logs
CREATE POLICY "Professionals read feedback on own logs" ON public.daily_care_log_feedback
  FOR SELECT TO authenticated
  USING (log_id IN (SELECT id FROM daily_care_logs WHERE professional_id = auth.uid()));
```

The family can type a comment under any log and submit it. Nurses see feedback on their logs from the professional side.

### Files Changed

| File | Change |
|------|--------|
| New migration | Add `care_plan_id`, `family_id` columns to `daily_care_logs`; create `daily_care_log_feedback` table with RLS |
| `src/components/professional/DailyChecklist.tsx` | Save `care_plan_id` and `family_id` with log; shorten WhatsApp message to brief summary + care plan link |
| `src/components/care-plan/DailyCareLogsTab.tsx` | **New** -- family-facing log viewer with expandable checklist details and feedback form |
| `src/pages/family/care-management/CarePlanDetailPage.tsx` | Add "Daily Logs" tab using `DailyCareLogsTab` |

### WhatsApp Message (New Format)
```text
📋 *SHIFT HANDOFF*
👤 Tricia Cumm → 🏠 Peltier Family
📅 2026-04-09 | ⏰ 8:00 AM – 4:00 PM
✅ 34/34 tasks completed (100%)

📝 Notes: Test 1

🔗 View full log & care plan:
https://tavaracare.lovable.app/family/care-management/{carePlanId}?tab=daily-logs

— Tavara Care
```

If there are incomplete items, they're listed briefly (just task names, no per-section breakdown).

