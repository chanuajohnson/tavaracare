

## Plan: Fix Three Professional Schedule Issues

### Issue 1: "Unassigned" Still Showing for Denise's Shifts
The RLS policy `professionals_can_view_care_plan_teammates` is correctly created. Both Tricia (56922ef7) and Denise (24fe4121) are active on the same care plan (3d634783). The DB confirms Denise's name is properly stored.

**Root cause**: The Supabase PostgREST schema cache may not have refreshed after the RLS policy was added. Additionally, the current approach relies on a foreign key join (`profiles!care_shifts_caregiver_id_fkey`) which can silently return NULL when RLS blocks access.

**Fix**: Add a fallback in `useCarePlanShifts.tsx` — when the joined `profiles` data is NULL but `caregiver_id` exists, make a secondary RPC call to fetch teammate names. This ensures names always resolve even if the FK join fails due to RLS timing.

Alternatively (simpler): modify the hook to fetch caregiver profiles separately using a direct query after getting shifts, which avoids the FK join RLS issue entirely.

### Issue 2: Update Family Name from "User1 Family Family Family" to Correct Name
**Data fix** using the Supabase insert tool (UPDATE):
- Profile ID: `7d850934-a44f-4348-944b-ae7182dca237`
- Update `full_name` from "User1 Family Family Family" to "Chanua Johnson" (or "Peltier Family" — need to confirm which name format)

### Issue 3: Tricia's Shifts Don't Show Which Care Plan/Family
Currently `ProfessionalCalendar.tsx` displays shift title, time, and caregiver name but NOT the care plan or family name. Since Tricia is on multiple care plans, she needs to know which family/plan each shift belongs to.

**Fix in `ProfessionalCalendar.tsx`**: 
- Fetch the care plan title and family name alongside shifts (the `care_shifts` table has `care_plan_id` and `family_id`)
- Display a small label like "Peltier's Care Plan 2025" or the family name above each shift card
- Add this info to both the inline shift list and the detail dialog

### Files to Modify

| File | Change |
|------|--------|
| **Data update (Supabase)** | Update `profiles.full_name` for `7d850934` to the correct family name |
| `src/hooks/useCarePlanShifts.tsx` | Add care plan title + family profile join to the shift query; add fallback for caregiver name resolution |
| `src/components/professional/ProfessionalCalendar.tsx` | Display care plan title and family name on each shift card |

### Question: Family Name
The family profile currently says "User1 Family Family Family." You mentioned both "Peltier Family" and "Chanua Johnson." Should the `full_name` be set to "Chanua Johnson" (the person's real name) or "Peltier Family" (the family label)?

