

## Filter Family Matches by `available_for_matching` + Real-Time Toggle Sync

### Problem

Family users see ALL assigned caregivers regardless of admin availability toggle. The `useUnifiedMatches` hook fetches assignments where `is_active = true` but never checks the caregiver's `available_for_matching` status. Similarly, `FamilyMatchNotification` shows all active assignments without filtering.

When admin toggles a caregiver to "Unavailable", the family dashboard should immediately reflect that — hiding unavailable caregivers from their matches.

### Changes

#### 1. `src/hooks/useUnifiedMatches.ts`

**Profile query** (line 248-278): Add `available_for_matching` to the select fields.

**Filter after profile join** (after line 311): After building the `caregiverProfileMap`, filter out assignments where the caregiver's `available_for_matching` is `false`:

```
const availableAssignments = assignmentData.filter(a => {
  const profile = caregiverProfileMap.get(a.caregiver_id);
  return profile?.available_for_matching !== false;
});
```

Use `availableAssignments` instead of `assignmentData` for the `processedMatches` map.

**Real-time subscription** (after line 562): Add a Supabase real-time channel listening to `profiles` table changes on `available_for_matching` column. When a caregiver's availability changes, call `loadMatches()` to refresh:

```
const channel = supabase.channel('caregiver-availability')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'profiles',
    filter: 'role=eq.professional'
  }, () => loadMatches())
  .subscribe();
```

Clean up on unmount.

#### 2. `src/components/family/FamilyMatchNotification.tsx`

**Profile query** (line 46-49): Add `available_for_matching` to the select, then filter profiles where `available_for_matching` is true before building the notification text. If no available caregivers remain, don't show the banner.

**Real-time channel** (existing subscription around line 80-100): Add a second channel listening to `profiles` updates for professionals, triggering `fetchMatches()` when availability changes.

### Files Changed

| Action | File | Description |
|--------|------|-------------|
| Modify | `src/hooks/useUnifiedMatches.ts` | Filter matches by `available_for_matching`, add real-time subscription for profile changes |
| Modify | `src/components/family/FamilyMatchNotification.tsx` | Filter notification by availability, add real-time sync |

### Result

- Only Tricia Cumm and Carlene Williams (marked available) show in Ana Maria's matches
- When admin toggles availability, family dashboard updates in real-time
- Notification banner count reflects only available caregivers

