

## Plan: Fix Professional Schedule Context, Correct Names, and Remove "Unknown" Fallbacks

### Confirmed Issues (verified in code and database)

1. **Stale hook bug**: `useCarePlanShifts` stores `initialFilters` in state once at mount and never re-syncs when the parent component passes a new `carePlanId`. Switching care plans in the Profile Hub does not reload shifts.
2. **Bad database data**: 2 rows in `daily_care_logs` for the Peltier care plan (`4848aec5-edb0-4e4a-b8e8-5684c609e6d6`) have `client_name = "User1 Family Family Family"`. The correct family name from `profiles` is **Chanua Johnson**.
3. **Missing caregiver/family fallback**: When FK joins return NULL due to RLS, the calendar shows "Unassigned" instead of resolving names through the existing RPC functions.

### Changes

#### 1. Fix stale filters in `src/hooks/useCarePlanShifts.tsx`
- Add a `useRef` to track the previous `carePlanId`
- Add a `useEffect` that updates internal `filters` state whenever `initialFilters.carePlanId` changes from the parent
- This ensures switching from "Care plan for Mum" to "Peltier's Care Plan 2025" triggers a fresh data fetch with the correct plan ID

#### 2. Add family name fallback in `src/hooks/useCarePlanShifts.tsx`
- When the FK join for `family_profile` returns NULL (RLS), collect missing `family_id` values
- Call `get_professional_accessible_family_profiles` RPC to resolve family names (same pattern already used for caregiver fallback)
- Use the resolved name in the `familyName` field of each shift

#### 3. Improve log display in `src/components/professional/ProfessionalCalendar.tsx`
- In the daily log rows (line 292), when `log.client_name` contains a suspicious pattern like "Family Family", prefer the family name from the matched shift data or the care plan context instead
- This ensures even old logs with bad `client_name` display correctly in the calendar

#### 4. Fix bad data in `daily_care_logs` table
- Update the 2 existing Peltier rows from `"User1 Family Family Family"` to `"Chanua Johnson"` using the Supabase insert/update tool

### Files Modified

| File | Change |
|------|--------|
| `src/hooks/useCarePlanShifts.tsx` | Sync filters on carePlanId change; add family name RPC fallback |
| `src/components/professional/ProfessionalCalendar.tsx` | Resolve log display name from shift/plan context when client_name is bad |
| DB: `daily_care_logs` | Update 2 rows: client_name from "User1 Family Family Family" to "Chanua Johnson" |

### Expected Result
- Switching care plans refreshes the schedule immediately with the correct shifts, family name, and caregiver names
- Peltier's schedule shows **Chanua Johnson** as the family and the correct assigned caregiver (e.g., Angela Newton Collymore)
- "You" still shows only for Tricia's own shifts
- No more "Unassigned" or "Unknown" labels for team members who are on the care plan
- Old daily logs for Peltier display "Chanua Johnson" instead of the bad stored value

