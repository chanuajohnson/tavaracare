

## Fix Smart Completion Nudge to Be Truly Specific

### Problem
The Smart Completion Nudge exists but has two issues:
1. **False positives**: `weekday_coverage = 'none'` and `weekend_coverage = 'no'` are valid answers (the user explicitly said they don't need coverage), but the code flags them as missing fields
2. **Missing preview**: The nudge card shows which fields are missing, but the generated WhatsApp message could be more specific about what exactly to fill in and where
3. **No loading guard**: If `comprehensiveData` hasn't loaded yet when the Nudge tab renders, `incompleteFields` will be empty and the smart nudge won't appear

### Actual blank fields for user `9874b53e` (Ana Maria Aimey)
**Profile**: `care_urgency` (null), `matching_requirements` (null)
**Assessment**: `preferred_days` (null), `preferred_time_start` (null), `preferred_time_end` (null), `cultural_preferences` (null), `additional_notes` (null)
**NOT missing**: `weekday_coverage` ('none') and `weekend_coverage` ('no') — these are valid selections

### Changes

#### 1. Fix false positive detection in `UserNudgeTab.tsx`
- Remove `weekday_coverage === 'none'` check — "none" is a valid answer meaning no weekday coverage needed
- Remove `weekend_coverage === 'no'` check — "no" is a valid answer meaning no weekend coverage needed
- Only flag these if they are `null` or `undefined` (truly never answered)

#### 2. Add loading state for smart nudge
- When `comprehensiveData` is null/loading, show a skeleton or "Analyzing profile..." state instead of hiding the smart nudge card entirely
- This prevents the confusing case where the card appears after a delay

#### 3. Make the WhatsApp message more actionable
- Group missing fields by where to fix them (profile registration vs care assessment)
- Add specific field names so the user knows exactly what to complete
- Include direct links to the specific registration/assessment pages

### Files Changed

| Action | Target | Description |
|--------|--------|-------------|
| Modify | `src/components/admin/UserNudgeTab.tsx` | Fix false positive weekday/weekend checks, add loading state, improve message specificity |

