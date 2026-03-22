

## Add "Deal Breakers / Matching Requirements" to Professional & Family Registration

### Problem
Professionals like Daniella can only specify a preferred location but have no way to state hard requirements like "only match me with families in San Fernando" or "only female patients." Similarly, families can't specify "must have a car" or "must be mature/experienced." These deal breakers are critical for preventing bad matches.

### Approach
Add a new **"Matching Requirements"** section to both registration forms with a free-text field plus common checkbox options. Store in a new `matching_requirements` text column on the `profiles` table. This keeps it simple — admin can review these requirements when making matches, and the matching algorithm can eventually parse them.

### Changes

#### 1. Database migration — add `matching_requirements` column
Add a `matching_requirements` text column (nullable) to `profiles` for both roles. This stores free-text deal breakers.

```sql
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS matching_requirements text NULL;
```

#### 2. Professional Registration (`src/pages/registration/ProfessionalRegistration.tsx`)
- Add `matchingRequirements` state variable
- Add a new card section before "Additional Information" titled **"Matching Preferences & Requirements"** with:
  - Common checkboxes: "Only match me with families in my preferred location area", "I prefer female care recipients only", "I prefer male care recipients only", "I require families with reliable transportation/parking"
  - Free-text textarea: "Any other deal breakers or hard requirements for matching?"
- Save to `matching_requirements` in profileData on submit
- Pre-populate in edit mode from existing profile data

#### 3. Family Registration (`src/pages/registration/FamilyRegistration.tsx`)
- Add `matchingRequirements` state variable
- Add a new card section before "Additional Notes" titled **"Caregiver Requirements & Deal Breakers"** with:
  - Common checkboxes: "Caregiver must have own transportation", "Caregiver must be in my area", "I prefer a female caregiver", "I prefer a male caregiver", "Caregiver must have specific certifications"
  - Free-text textarea: "Any other deal breakers or hard requirements?"
- Save to `matching_requirements` in profileData on submit
- Pre-populate in edit mode

#### 4. Update `update_user_profile` RPC function
Add `matching_requirements` field handling to the existing `update_user_profile` database function so it gets persisted.

#### 5. Admin visibility
Update `UserDetailModal.tsx` to display `matching_requirements` in the profile details so admin can see deal breakers when making matches.

### Files Changed

| Action | Target | Description |
|--------|--------|-------------|
| Migrate | `profiles` table | Add `matching_requirements` text column |
| Migrate | `update_user_profile` function | Add matching_requirements to the update function |
| Modify | `ProfessionalRegistration.tsx` | Add "Matching Preferences" section with checkboxes + free text |
| Modify | `FamilyRegistration.tsx` | Add "Caregiver Requirements" section with checkboxes + free text |
| Modify | `UserDetailModal.tsx` | Display matching requirements in admin view |

