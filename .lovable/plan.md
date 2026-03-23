

## Add Matching Requirements to Registration Forms + Update Admin Reports

### Overview
Add a "Matching Requirements / Deal Breakers" section to both Professional and Family registration forms, persist it via a new `matching_requirements` column on `profiles`, and display it in the Admin User Detail Modal reports tab. Also ensure care urgency is visible in the reports tab.

### Changes

#### 1. Database migration
- Add `matching_requirements text NULL` column to `profiles` table
- Update the `update_user_profile(profile_data jsonb)` RPC function (the one-param version used by registration forms) to include `matching_requirements = COALESCE(profile_data->>'matching_requirements', matching_requirements)` in its UPDATE statement
- Also update the two-param `update_user_profile(user_id_param, profile_data)` RPC to include the same field

#### 2. Professional Registration (`src/pages/registration/ProfessionalRegistration.tsx`)
- Add `matchingRequirements` state variable (string, default `''`)
- Add new Card section **before** the "Additional Information" card (before line 1000) titled **"Matching Preferences & Requirements"** with:
  - Checkboxes: "Only match me with families in my preferred location area", "I prefer female care recipients only", "I prefer male care recipients only", "I require families with reliable transportation/parking"
  - Free-text Textarea: "Any other deal breakers or hard requirements for matching?"
  - Selected checkboxes get prepended to the free-text value as a combined string
- In `profileData` object (line ~454): add `matching_requirements` combining checkbox selections + free text
- In `fetchCompleteProfileData`: populate `matchingRequirements` from `profileData.matching_requirements`
- In `setFormValue`: add case for `matching_requirements`

#### 3. Family Registration (`src/pages/registration/FamilyRegistration.tsx`)
- Add `matchingRequirements` state variable (string, default `''`)
- Add new Card section **before** the "Additional Information" card (before line 1228) titled **"Caregiver Requirements & Deal Breakers"** with:
  - Checkboxes: "Caregiver must have own transportation", "Caregiver must be in my area", "I prefer a female caregiver", "I prefer a male caregiver", "Caregiver must have specific certifications"
  - Free-text Textarea: "Any other deal breakers or hard requirements?"
- In `profileData` object (line ~538): add `matching_requirements`
- In `fetchExistingProfileData`: populate from `profile.matching_requirements`
- In `setFormValue`: add case for `matching_requirements`

#### 4. Admin User Detail Modal (`src/components/admin/UserDetailModal.tsx`)
- **Reports tab — Profile Information card** (~line 657): Add `<div><strong>Matching Requirements:</strong> {comprehensiveData.profile.matching_requirements || 'None specified'}</div>`
- **Reports tab — Family Profile Details card** (~line 684): Add `<div><strong>Care Urgency:</strong> ...</div>` with formatted urgency label
- **Reports tab — Profile Information card**: Also show `care_urgency` for family users
- **Profile tab**: Add matching requirements display below the existing profile info (for both family and professional users)

### Files Changed

| Action | Target | Description |
|--------|--------|-------------|
| Migrate | `profiles` table | Add `matching_requirements` text column |
| Migrate | Both `update_user_profile` functions | Add `matching_requirements` field handling |
| Modify | `ProfessionalRegistration.tsx` | Add matching preferences section with checkboxes + free text |
| Modify | `FamilyRegistration.tsx` | Add caregiver requirements section with checkboxes + free text |
| Modify | `UserDetailModal.tsx` | Display matching requirements + care urgency in reports tab |

