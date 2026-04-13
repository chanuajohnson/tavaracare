
## Plan: Fix Professional Schedule Context, Correct Names, and Remove “Unknown” Fallbacks

### What I found

1. **Care plan switching bug is real in code**
   - `src/hooks/useCarePlanShifts.tsx` stores `initialFilters` in local state once and never re-syncs them when `carePlanId` changes.
   - Result: when you switch from “Care plan for Mum” to “Peltier’s Care Plan 2025,” the schedule can keep showing the previous plan’s shifts, family name, and caregiver.

2. **The wrong family label in daily logs is also real in the database**
   - For Tricia’s `daily_care_logs` on the Peltier plan, the records currently store:
     - `care_plan_id = 4848aec5-edb0-4e4a-b8e8-5684c609e6d6`
     - `client_name = "User1 Family Family Family"`
   - So even after the navigation fix, the green checklist/log row can still show the wrong family name because the UI is reading the saved `client_name` directly.

3. **The selected Peltier plan has different assigned caregiver data than “Care plan for Mum”**
   - Tricia is assigned to both plans.
   - The Peltier care plan belongs to **Chanua Johnson**.
   - Recent Peltier shifts in the database are assigned to **Angela Newton Collymore** on the dates I checked.
   - So the schedule needs to show the caregiver actually assigned to that specific shift/plan, not the previous plan’s caregiver.

4. **“Unknown/Unassigned” is coming from UI fallback behavior**
   - In `src/components/professional/ProfessionalCalendar.tsx`, the caregiver display uses:
     - `shift.caregiverDetails?.full_name || 'Unassigned'`
   - If the joined caregiver profile is missing, the UI does not try a second local lookup from the selected plan’s team members before falling back.

### Implementation

#### 1. Fix the stale schedule hook
Update `src/hooks/useCarePlanShifts.tsx` so it reacts whenever `carePlanId`, `startDate`, or `endDate` changes.

Planned change:
- Add a sync effect that updates internal filters when incoming props change, or remove the duplicated internal filter state entirely and derive directly from props.
- This ensures switching from one care plan to another immediately reloads the correct shifts, family, and caregiver names.

#### 2. Strengthen caregiver name resolution in the professional schedule
Update `src/components/professional/ProfessionalCalendar.tsx` so caregiver names never show as “Unknown/Unassigned” when that caregiver is part of the selected care plan.

Planned change:
- Add a resolver like:
  - first use `shift.caregiverDetails`
  - then fall back to the selected care plan’s `care_team_members`
  - then, only if truly absent, show “Unassigned”
- Keep “You” only when `shift.caregiverId === user.id`
- For other assigned shifts, show the real caregiver name such as Angela Newton.

#### 3. Keep family context tied to the selected care plan everywhere
Update the schedule/log presentation so the visible care context comes from the selected care plan instead of stale or free-text values.

Planned change:
- In `ProfessionalCalendar`, prefer plan-linked family context (`familyName`, `carePlanTitle`) over any older log text.
- Ensure Peltier displays **Chanua Johnson / Peltier’s Care Plan 2025**, not the “Care plan for Mum” family.

#### 4. Fix daily checklist/log family naming for professionals
Update `src/components/professional/DailyChecklist.tsx` and `src/components/professional/ProfessionalCalendar.tsx`.

Planned change:
- When saving a daily care log, stop relying on stale selected text for `client_name`.
- Derive the display name from the selected assignment/care plan family record.
- When rendering existing logs in the professional calendar, if `client_name` is bad or generic, resolve the family name from `care_plan_id` / `family_id` instead of blindly displaying the stored string.

#### 5. Clean up the bad existing Peltier log labels
Because the wrong `client_name` values are already saved in `daily_care_logs`, code changes alone will not fix those old rows.

Required follow-up in implementation mode:
- Add a database migration or controlled data-fix statement to normalize existing `daily_care_logs.client_name` values for affected rows.
- Specifically update Peltier-linked logs from `"User1 Family Family Family"` to the correct family name for that care plan.

### Files to update

- `src/hooks/useCarePlanShifts.tsx`
- `src/components/professional/ProfessionalCalendar.tsx`
- `src/components/professional/DailyChecklist.tsx`

Likely one database migration/data-fix for:
- `daily_care_logs.client_name`

### Technical details

```text
Current bug flow
Profile Hub switches selectedCarePlanId
  -> ProfessionalCalendar receives new carePlanId
  -> useCarePlanShifts keeps old internal filters
  -> old plan shifts remain visible
  -> Denise / old family still appear

Second issue
Daily log row reads stored client_name
  -> existing bad value in DB = "User1 Family Family Family"
  -> wrong family label still shows even on correct plan
```

```text
Planned display resolution order
Caregiver name:
1. shift.caregiverDetails.full_name
2. selected care plan team member full_name by caregiverId
3. "Unassigned" only if no caregiver assigned

Family/log label:
1. family from selected care plan / family_id
2. valid saved client_name
3. safe fallback
```

### Expected result after implementation

- Switching from **Care plan for Mum** to **Peltier’s Care Plan 2025** will refresh the schedule correctly.
- Peltier will show the correct family context: **Chanua Johnson**.
- Shift cards will show the actual assigned caregiver for that plan/shift, such as **Angela Newton**, or **You** only when the shift belongs to Tricia.
- The professional view will stop showing unnecessary **Unknown** / **Unassigned** labels for assigned team members.
- Existing mislabeled daily logs for Peltier will display the correct family name after the data fix.
