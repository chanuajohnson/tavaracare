
## Fix Quick Access: Legacy Story is hidden because the dashboard is mixing two different progress systems

### What’s actually wrong

I checked the current code and the issue is real:

- `FamilyShortcutMenuBar` is reading the wrong family step numbers from `useEnhancedJourneyProgress`.
- In `useEnhancedJourneyProgress`, the family UI steps are:
  - `1` = Profile
  - `2` = Care Assessment
  - `3` = Legacy Story
  - `4` = Caregiver Matches
  - `7` = Get Started with Care / Scheduling

But the Quick Access bar currently maps:
- `registrationStep` to `2`
- `careAssessmentStep` to `4`
- `caregiverMatchesStep` to `7`

So the wrong buttons are being driven by the wrong steps.

There is also a second bug:
- `useEnhancedJourneyProgress` merges `user_journey_progress` into the family steps by array index (`index + 1`) and overwrites the real completion state.
- For the current family record I checked, there is **no row in `care_recipient_profiles`**, so Legacy Story is actually incomplete.
- That means the story CTA should show, but the stored progress merge is falsely marking it complete.

### Plan

#### 1. Fix the source of truth in `useEnhancedJourneyProgress.ts`
- Stop letting stored progress override family step-level completion.
- Keep stored progress only for high-level metrics if needed, like percentage.
- Use the real family data-driven steps for `completed` / `accessible` on the dashboard.

This avoids the current mismatch where admin-style stored progress hides customer-facing actions incorrectly.

#### 2. Fix step mappings in `FamilyShortcutMenuBar.tsx`
Update Quick Access to use the actual family step ids:
- Profile = step `1`
- Assessment = step `2`
- Legacy Story = step `3`
- Matches = step `4`
- Scheduling = step `7`

Then update button logic to match the journey:
- **Schedule Care**: show when matches exist and no visit is scheduled
- **Share Loved One’s Story**: show whenever step 3 is incomplete
- **Edit Profile**: show only when profile step is completed
- **Edit Assessment**: show only when assessment step is completed
- **Care Management**: only after scheduling is actually complete

#### 3. Add a safety fallback for the story CTA
- Use `careRecipient` from `useEnhancedJourneyProgress` as a direct backup check.
- If there is no `care_recipient_profiles` record, force the Legacy Story CTA to show even if stored progress is stale.

That will prevent this from disappearing again because of progress-sync drift.

### Files to update
- `src/hooks/useEnhancedJourneyProgress.ts`
- `src/components/family/FamilyShortcutMenuBar.tsx`

### Expected result
After this fix, the family dashboard Quick Access should correctly show:
- `Schedule Care`
- `Share Loved One’s Story`
- then the edit buttons that actually apply

And it will reflect the customer’s real state, not an incorrect stored-progress interpretation.
