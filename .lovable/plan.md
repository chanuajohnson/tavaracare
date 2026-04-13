

## Plan: Fix "Unknown" Caregiver Names in Family Care Plan Schedule

### Problem
The `ShiftCalendar.tsx` component (family-side care plan view at `/family/care-management/...`) shows "Unknown" for caregiver names like Denise Narcis. The professional profile hub schedule shows names correctly because `useCarePlanShifts.tsx` already has an RPC fallback. But the family-side schedule gets names from `careTeamMembers`, which are fetched by `fetchCareTeamMembers()` in `src/services/care-plans/team/fetchServices.ts`. That function joins `profiles:caregiver_id` directly — when RLS blocks the join, `profiles` returns null, and the fallback is "Unknown Professional".

### Root Cause
`fetchServices.ts` has two functions (`fetchCareTeamMembers` and `fetchAllCareTeamMembersForProfessional`) that both do:
```
profiles:caregiver_id (full_name, ...)
```
When RLS blocks this, `member.profiles` is null. The code falls back to `'Unknown Professional'` without trying any RPC resolution.

### Fix: Add RPC Fallback to `fetchServices.ts`

**File**: `src/services/care-plans/team/fetchServices.ts`

In both `fetchCareTeamMembers` and `fetchAllCareTeamMembersForProfessional`:

1. After the initial query, collect `caregiver_id` values where `member.profiles` is null or has no `full_name`
2. Call `get_public_professional_profiles` RPC with those IDs (same pattern already used in `useCarePlanShifts.tsx` and `resolveCaregiveNames.ts`)
3. Use the RPC results to populate `professionalDetails` before returning

This is a single-file change. No new files, no database changes, no schema modifications.

### Why This Fixes It
- Denise Narcis's profile is blocked by RLS for the current user's direct query
- The `get_public_professional_profiles` RPC is a `SECURITY DEFINER` function that bypasses RLS and returns name/avatar/type for any professional ID
- After this fix, `careTeamMembers` passed to `ShiftCalendar.tsx` will have correct names, fixing the family care management schedule view

### Files to Update
| File | Change |
|------|--------|
| `src/services/care-plans/team/fetchServices.ts` | Add RPC fallback for missing profiles in both fetch functions |

### Expected Result
- Family care plan schedule at `/family/care-management/...` shows "Denise Narcis" instead of "Unknown"
- All other components consuming `careTeamMembers` (filter dropdowns, WhatsApp sharing, emergency shift modal) also get correct names
- Professional profile hub schedule continues working as before
