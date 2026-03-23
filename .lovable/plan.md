

## Add "Incomplete Fields" Smart Nudge for Family Users

### Problem
There's no nudge template that dynamically identifies which specific fields a family left blank and explains why each is critical for matching. The existing templates are generic ("complete your profile") without telling the user exactly what's missing.

### Approach
Add a **"Smart Completion Nudge"** feature to the UserNudgeTab that:
1. Analyzes the user's `comprehensiveData` (profile + care assessment) to detect blank fields
2. Generates a personalized WhatsApp message listing exactly what's missing and why each matters for caregiver matching
3. Available as a special "smart nudge" button alongside existing templates

### Changes

#### 1. Pass `comprehensiveData` to UserNudgeTab
Currently the nudge tab only receives basic user info and journey progress. We need to also pass the full profile and care assessment data so it can detect blank fields.

- **`UserDetailModal.tsx`**: Pass `comprehensiveData` as a new prop to `<UserNudgeTab />`
- **`UserNudgeTab.tsx`**: Accept new `comprehensiveData` prop

#### 2. Add blank field detection logic (`UserNudgeTab.tsx`)
Create a `getIncompleteFields()` function that checks the user's profile and care assessment for critical blank fields:

**Profile fields checked:**
- `phone_number` → "Your phone number (so we can reach you quickly)"
- `address` / `location` → "Your location (to find caregivers near you)"
- `care_recipient_name` → "Care recipient's name"
- `relationship` → "Your relationship to the care recipient"
- `care_types` → "Types of care needed (critical for matching)"
- `care_schedule` → "Preferred care schedule/hours"
- `budget_preferences` → "Budget range (helps us find the right fit)"
- `care_urgency` → "How soon you need care (helps us prioritize)"
- `matching_requirements` → "Any deal breakers or requirements"

**Care assessment fields checked (from `comprehensiveData.careNeeds`):**
- `preferred_days` → "Preferred days for care"
- `preferred_time_start` / `preferred_time_end` → "Preferred care times"
- `weekday_coverage` (if "none") → "Weekday coverage needs"
- `weekend_coverage` (if "no") → "Weekend coverage needs"
- `cultural_preferences` → "Cultural preferences"
- `additional_notes` → "Additional care notes"

#### 3. Add "Smart Completion Nudge" UI section
Add a highlighted card at the top of the nudge tab (when incomplete fields are detected) showing:
- Count of missing fields with a warning badge
- A "Generate Smart Nudge" button that creates a personalized WhatsApp message like:

> Hi [Name]! 💙 Chan from Tavara Care.
>
> We're actively working on finding the right caregiver match for you, but we noticed a few important details are still missing from your profile:
>
> ❌ Preferred care schedule — helps us match availability
> ❌ Budget range — ensures we recommend the right fit
> ❌ Preferred days/times — critical for scheduling
>
> These details are essential for us to source and match you with the best caregiver. The more complete your profile, the faster and more accurate your match will be!
>
> 🔗 Update your profile: https://tavaracare.lovable.app/dashboard/family
> 🔗 Complete care assessment: https://tavaracare.lovable.app/family/care-assessment?mode=edit
>
> Questions? Just reply here!
> — Chan, Tavara Care 💙

- The message is dynamically built from actual missing fields
- Opens WhatsApp with the pre-filled message (same as existing nudge flow)
- Logs to `admin_communications` like other nudges

#### 4. Insert a new nudge template for manual use
Insert a "Profile Completion - Missing Fields" template into `nudge_templates` (stage: `incomplete_fields`, role: `family`) with a generic version of the message for cases where admin wants to use the template selector instead.

### Files Changed

| Action | Target | Description |
|--------|--------|-------------|
| Modify | `UserDetailModal.tsx` | Pass `comprehensiveData` to `UserNudgeTab` |
| Modify | `UserNudgeTab.tsx` | Add `comprehensiveData` prop, blank field detection, smart nudge UI |
| Migrate | `nudge_templates` (database) | Insert generic "Profile Completion - Missing Fields" template |

