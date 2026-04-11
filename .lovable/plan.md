

## Plan: Align Rate Tier Descriptions Across All Surfaces

### Problem
The Family Dashboard rate info card, Family Registration budget dropdown, and Admin Nudge Tab all show outdated, simplified rate tier descriptions that don't match the corrected definitions already established in `RateTierReferenceCard.tsx` and the onboarding section definitions.

### What Changes

| File | Change |
|------|--------|
| `src/components/family/FamilyDashboard.tsx` (lines 141-143) | Update the 3 rate lines to match corrected tier definitions |
| `src/pages/registration/FamilyRegistration.tsx` (lines 1212-1214) | Update budget dropdown options to match corrected tiers |
| `src/components/admin/UserNudgeTab.tsx` (lines 336-338) | Already correct -- no change needed |

### Updated Rate Text (Family Dashboard card)

- **$35/hr -- Standard:** GAPP-certified personal care, medication admin & logging, vitals monitoring, basic daily dietary meal prep, daily care documentation, specialized care (dementia, palliative, post-surgical)
- **$40/hr -- Full Service:** Everything in Standard + specialist-directed meal prep (holidays & special occasions), complex medical needs (wound/catheter/oxygen care), overnight/live-in shifts, advanced certifications (RN, LPN)
- **$45+/hr -- Premium:** Everything in Full Service + care plan change management, disease progression support, multi-specialist coordination, 24/7 on-call, advanced palliative/end-of-life care, family training & transition planning

### Updated Budget Dropdown (Family Registration)

- $35/hour -- Standard (GAPP-certified personal care, medication admin, vitals, daily documentation)
- $40/hour -- Full Service (Standard + specialist meal prep, complex medical, overnight/live-in)
- $45+/hour -- Premium (Full Service + care plan management, disease progression, 24/7 on-call)

### Files NOT changed
- `RateTierReferenceCard.tsx` -- already correct
- `professionalOnboardingSections.ts` -- already correct
- `onboardingSections.ts` -- already correct
- `UserNudgeTab.tsx` -- already correct

