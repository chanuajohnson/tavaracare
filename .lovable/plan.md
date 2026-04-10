

## Replace Family Name Input with Family Dropdown & Fix Quick Links to Show Family's Data

### Problem
The "View Registration", "View Care Assessment", and "View Legacy Story" links currently navigate to blank forms because those pages load data for the **logged-in user** (the admin), not the selected family. The family name field is also a free-text input instead of a dropdown of actual registered families.

### Solution

#### 1. Replace text input with family dropdown (like AdminFamilyCarePlansPage)
**File**: `src/pages/admin/AdminOnboardingChecklistPage.tsx`

- Import `supabase`, `useAuth`, `Select/SelectContent/SelectItem/SelectTrigger/SelectValue`
- Fetch families from `profiles` table where `role = 'family'` on mount (same pattern as `AdminFamilyCarePlansPage.tsx`)
- Replace the `<Input>` for family name with a `<Select>` dropdown showing all family names
- Store `selectedFamilyId` (UUID) and derive `familyName` from the selected family's `full_name`
- localStorage persistence still keyed by family name

#### 2. Build inline read-only admin views for family data
Rather than linking to the family-facing pages (which always load the logged-in user's data), fetch and display the selected family's submissions **inline** within the "Review Client Submissions" collapsible section.

When a family is selected from the dropdown, fetch:
- **Registration data**: from `profiles` table (care_recipient_name, relationship, care_types, special_needs, care_schedule, etc.)
- **Care Assessment**: from `care_needs_family` table where `profile_id = selectedFamilyId`
- **Legacy Story**: from `care_recipient_profiles` table where `user_id = selectedFamilyId`

Display each as a read-only summary card inside the "Review Client Submissions" section, replacing the external link buttons. Each card shows key fields in a clean, scannable format.

#### 3. Keep "Edit" links that open the family-facing pages
After each inline summary, show an "Edit" button that opens the corresponding page in a new tab. These pages will still load the admin's own context, but the admin can reference the inline data while on the call with the family and note edits needed.

### Files Changed

| File | Change |
|------|--------|
| `src/pages/admin/AdminOnboardingChecklistPage.tsx` | Replace text input with family dropdown, fetch family data (profiles, care_needs_family, care_recipient_profiles), display inline read-only summaries in the Review section |

### Technical Details
- Reuses the same Supabase query pattern from `AdminFamilyCarePlansPage.tsx` for loading families
- Three additional queries when a family is selected (profiles, care_needs_family, care_recipient_profiles)
- No changes to routing, no changes to family-facing pages
- Section links become inline data displays with the fetched family information
- All existing checklist functionality (checkboxes, progress, localStorage, SOP) preserved

