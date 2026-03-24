

## Fix: Urgent Families Page Not Showing Families

### Problem
The `/urgent-families` page queries families by `care_urgency` ("immediate" or "within_week") but does NOT check `available_for_matching`. Meanwhile, the admin dashboard already has the toggle for families (it shows for both professional and family roles), but no families have been toggled on yet.

The caregiver page works because it filters by `available_for_matching = true`. The families page needs the same filter.

### Fix

**File: `src/pages/UrgentFamiliesPage.tsx`**
- Add `.eq("available_for_matching", true)` to the query
- Remove the `care_urgency` filter requirement — a family should appear if the admin marks them as available, regardless of urgency level (the urgency badge can still display if the data exists)
- This aligns with how `/urgent-caregivers` works: admin toggles control visibility

Updated query:
```ts
const { data, error } = await supabase
  .from("profiles")
  .select("id, full_name, location, address, care_types, care_urgency, care_recipient_name, care_schedule")
  .eq("role", "family")
  .eq("available_for_matching", true)
  .order("updated_at", { ascending: false });
```

This way, you control which families appear on the page by toggling the same "Available for Matching" switch in the admin dashboard that you already use for caregivers.

### Files Changed

| Action | Target | Description |
|--------|--------|-------------|
| Modify | `src/pages/UrgentFamiliesPage.tsx` | Filter by `available_for_matching = true` instead of (or in addition to) `care_urgency` |

