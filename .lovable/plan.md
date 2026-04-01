

## Fix: Legacy Story "Failed to save" 409 Error on Edit

### Root Cause

The `FamilyStoryPage.tsx` upsert at line 272-294 does **not** specify `onConflict: 'user_id'`. When editing an existing story:

1. The upsert sends data **without the `id` field** (the primary key)
2. Supabase generates a new UUID for `id`
3. The INSERT succeeds on the PK check but hits the **unique constraint on `user_id`** → **409 Conflict**
4. The user sees "Failed to save story"
5. On page reload the original data is still there (nothing was lost)

The success toast the user sees afterward is likely from a retry or a second render cycle — the data was never actually updated.

### User's Data Status

User `9874b53e-ea23-4ccb-abed-ddbb0367edf5` **does have a legacy story** (record ID `aba5d2ae-291e-4d28-a3d9-8da2c7934a01`). It contains full data for Carol Glenn-Aimey including personality traits, life story, career info, etc. **Nothing has been lost.**

### Fix (1 file, 1 line change)

**File: `src/pages/family/FamilyStoryPage.tsx`** (line ~274)

Change the upsert call to specify the conflict column:

```typescript
// Before
.upsert({
  user_id: user.id,
  ...fields
})

// After
.upsert({
  user_id: user.id,
  ...fields
}, {
  onConflict: 'user_id'
})
```

This tells Supabase: "If a row with this `user_id` already exists, update it instead of trying to insert a new one." The 409 error will be eliminated and edits will save correctly.

### Why This Is Safe

- The `care_recipient_profiles` table has a `UNIQUE (user_id)` constraint, so `onConflict: 'user_id'` is valid
- RLS policies already allow users to update their own rows (`auth.uid() = user_id`)
- No other files need changes — this is the only place that writes to `care_recipient_profiles`

