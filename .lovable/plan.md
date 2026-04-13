

## Plan: Fix Professional Schedule - Show Caregiver Names and Add Action Buttons

### Changes

#### 1. Database Migration
Add RLS policy so professionals can view profiles of teammates on the same care plan:

```sql
CREATE POLICY "professionals_can_view_care_plan_teammates"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM care_team_members ctm1
      JOIN care_team_members ctm2 ON ctm2.care_plan_id = ctm1.care_plan_id
      WHERE ctm1.caregiver_id = auth.uid()
        AND ctm1.status = 'active'
        AND ctm2.caregiver_id = profiles.id
        AND ctm2.status = 'active'
    )
  );
```

This resolves the "Unassigned" fallback by letting professionals read teammate profiles.

#### 2. Update `ProfessionalCalendar.tsx` — Add action buttons to shift detail dialog

Add Log Hours, Edit, and Delete buttons to the dialog at lines 412-463, matching `ShiftCalendar.tsx` pattern:

- **Log Hours** button on all shifts assigned to the current user — opens the `WorkLogForm` in a dialog
- **Edit** button on the user's own shifts only
- **Delete** button on the user's own shifts only
- Import `WorkLogForm` and add state for work log dialog (selected shift, open/close)
- Wire the Log Hours button to open the work log form pre-filled with the shift's date, caregiver, and care plan info

### Files to modify

| File | Change |
|------|--------|
| **Migration** | Add `professionals_can_view_care_plan_teammates` SELECT policy on `profiles` |
| `src/components/professional/ProfessionalCalendar.tsx` | Add action buttons (Log Hours, Edit, Delete) to shift detail dialog; import WorkLogForm; add work log dialog state |

