

## Fix: Incorrect Field Attribution in Smart Nudge + Missing Schedule Fields

### The Problem (You're Right)

The care assessment form does **NOT** have fields for "Preferred days" or "Preferred times." These fields (`preferred_days`, `preferred_time_start`, `preferred_time_end`) exist as columns in the `care_needs_family` database table but **are never shown in the form UI**. There's no way for a user to fill them in.

Meanwhile, the **family registration form** already has a `care_schedule` field (mornings, afternoons, evenings, etc.) which covers scheduling preferences.

So the current smart nudge is wrong in two ways:
1. It tells the user to go to the care assessment to fill in schedule fields that **don't exist on that form**
2. It flags `preferred_days`/`preferred_time_start`/`preferred_time_end` as missing when there's no UI to fill them

### What's Actually Missing for Ana Maria

**Profile Registration** (`/registration/family?mode=edit`):
- Care urgency
- Matching requirements (deal breakers)

**Care Assessment** (`/family/care-assessment?mode=edit`):
- Cultural preferences
- Additional notes

That's it. The schedule/days/times are **not** something the user can fill in on either form currently.

### Fix

#### 1. Remove false "preferred_days" and "preferred_time" checks from `UserNudgeTab.tsx`
Remove the checks for `preferred_days`, `preferred_time_start`, and `preferred_time_end` from the smart nudge detection logic since these fields don't exist on the care assessment form. Users cannot fill them in.

#### 2. Ensure `care_schedule` from profile registration is checked instead
If `care_schedule` is null/empty on the profile, flag it under "Profile Registration" (not care assessment) since that's where the scheduling dropdown lives.

#### 3. Correct the WhatsApp message grouping
The generated nudge message should only list fields under the form where they can actually be filled in.

### Corrected Missing Fields for Ana Maria's Nudge

**📝 Profile Registration** (`/registration/family?mode=edit`):
- ❌ How urgently you need care
- ❌ Any deal breakers or requirements for matching

**📋 Care Assessment** (`/family/care-assessment?mode=edit`):
- ❌ Cultural preferences
- ❌ Additional care notes

### Files Changed

| Action | Target | Description |
|--------|--------|-------------|
| Modify | `src/components/admin/UserNudgeTab.tsx` | Remove `preferred_days`/`preferred_time_start`/`preferred_time_end` checks; add `care_schedule` check under profile source instead |

