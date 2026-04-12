

## Plan: Sync Family Journey Progress to `user_journey_progress` Table

### Problem

The admin dashboard Journey tab and TAV widget both show **stale** progress (67%, 10 of 15 steps) because they read from the `user_journey_progress` database table via `useStoredJourneyProgress`. This table is never updated for family users after our recent journey logic changes (optional step exclusion, active care detection).

The family dashboard calculates progress dynamically in `useEnhancedJourneyProgress`, but the admin and TAV still read from the stored table, creating a mismatch.

Additionally, `useEnhancedJourneyProgress` itself prefers stored progress over calculated progress (lines 840-844), which can cause the family dashboard to also show stale data if the stored value is non-zero.

### Root Cause

- `calculate_and_update_journey_progress` RPC is only called from `ProfessionalRegistration.tsx` -- never for family users
- No mechanism syncs the dynamically calculated family progress back to `user_journey_progress`
- The family dashboard hook prefers stale stored data over fresh calculated data

### Changes

| File | Change |
|------|--------|
| `src/hooks/useEnhancedJourneyProgress.ts` | **Lines 840-844**: Change priority so `calculatedPercentage` is always used as the primary source (it is the freshest). Remove the logic that defers to `storedProgress.completionPercentage`. |
| `src/hooks/useEnhancedJourneyProgress.ts` | **After step calculation (~line 850)**: Add an effect that calls `calculate_and_update_journey_progress` RPC (or does an upsert to `user_journey_progress`) whenever `calculatedPercentage` changes, so the stored table stays in sync. This ensures the admin dashboard and TAV automatically get fresh data. |
| `src/components/tav/hooks/useFamilyProgress.ts` | **Lines 257-259**: Same fix -- use `enhancedData.completionPercentage` as primary instead of deferring to `storedProgress.completionPercentage`. The stored value will now be kept in sync by the effect above, so both sources will agree. |

### Sync Mechanism Detail

After steps are calculated in `useEnhancedJourneyProgress`, add a `useEffect` that:
1. Calls `supabase.rpc('calculate_and_update_journey_progress', { target_user_id: user.id })` when the calculated percentage differs from stored
2. Debounces to avoid excessive calls (only sync once per mount or when completion changes)
3. Only runs for authenticated, non-anonymous family users

### Result

- Admin Journey tab will show the same progress as the family dashboard (100% for families with active care)
- TAV widget will show consistent progress
- The `user_journey_progress` table stays current as families progress through their journey
- All three surfaces (family dashboard, admin modal, TAV) will be consistent

