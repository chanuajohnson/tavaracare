

## Fix: Professional Dashboard Not Showing Available Families

### Root Cause

The `useFamilyMatches` hook (used by `DashboardFamilyMatches` and `ProfessionalFamilyMatchModal`) queries the `profiles` table directly with `supabase.from('profiles').select('*').eq('role', 'family').eq('available_for_matching', true)`. RLS blocks professional users from reading family profile rows, so the query returns 0 results and the empty state ("No families available right now") is shown -- even though 2 families are marked available in admin.

Meanwhile, the `ProfessionalFamilyAwarenessBanner` uses the `get_unmatched_family_count()` RPC (security definer, bypasses RLS) and should be working. If it returns 0, it's because the updated RPC now also checks `available_for_matching = true` AND checks for no active assignments -- which is correct behavior. Need to verify this is showing.

### Fix

**File: `src/hooks/useFamilyMatches.ts`**

Replace the direct `profiles` table query with the existing `get_public_family_profiles` RPC (security definer, already returns only safe columns for available families). This is the same RPC used by `/urgent-families`.

Changes:
- Replace `supabase.from('profiles').select('*').eq('role', 'family').eq('available_for_matching', true)` with `supabase.rpc('get_public_family_profiles')`
- Map the RPC response fields (`full_name`, `location`, `care_types`, `care_urgency`, `care_schedule`, `diagnosed_conditions`, `chronic_illness_type`) to the `Family` interface
- Keep the admin manual matches query as-is (it uses a join that should work for the assigned professional)
- Keep all shift compatibility scoring logic intact
- The RPC already filters by `available_for_matching = true`, so no extra filter needed

This ensures professionals see the same 2 available families that appear on `/urgent-families`.

### Files Changed

| Action | Target | Description |
|--------|--------|-------------|
| Modify | `src/hooks/useFamilyMatches.ts` | Switch from direct `profiles` table query to `get_public_family_profiles` RPC to bypass RLS |

