

## Add "Care Urgency" Question to Family Registration + Display in Admin

### Problem
Neither the Family Registration nor Care Assessment asks families **how soon they need care**. The database already has a `care_urgency` enum (`immediate`, `within_week`, `within_month`, `flexible`) and a column on `user_journey_progress`, but nothing populates it. Admin has no way to prioritize families by urgency.

### Changes

#### 1. Add urgency question to Family Registration (`src/pages/registration/FamilyRegistration.tsx`)
- Add a new field in Step 4 (Care Schedule step) asking: **"How soon do you need care to begin?"**
- Options: Immediately / Within a week / Within a month / I'm flexible
- Maps to enum values: `immediate`, `within_week`, `within_month`, `flexible`
- Save to `user_journey_progress.urgency` on form submission

#### 2. Add urgency column to profiles table (database migration)
- Add `care_urgency` column to `profiles` table (type: `care_urgency` enum, nullable)
- This makes it queryable alongside other profile data without joining `user_journey_progress`
- Update the registration save logic to write to `profiles.care_urgency`

#### 3. Display urgency in Admin User Detail Modal
- Show urgency as a colored badge in the admin user journey modal header area
- `immediate` = red badge, `within_week` = amber, `within_month` = blue, `flexible` = gray
- Also show in the Admin Scheduling Queue so admin can prioritize

#### 4. Display urgency in Admin Scheduling Queue (`src/components/admin/AdminSchedulingQueue.tsx`)
- Add an "Urgency" column showing the family's care urgency level with color coding
- Helps admin prioritize which families to schedule first

### Files Changed

| Action | Target | Description |
|--------|--------|-------------|
| Migrate | `profiles` table | Add `care_urgency` column using existing enum |
| Modify | `src/pages/registration/FamilyRegistration.tsx` | Add "How soon do you need care?" radio group in Step 4, save to profile |
| Modify | `src/components/admin/AdminSchedulingQueue.tsx` | Show urgency badge in queue |
| Modify | Admin user detail component | Show urgency badge in family user modal |

