

## Plan: Add Quick "Mark as Passed" Button and Fix Screening Progress Display

### Problem Summary

1. **"Unassigned" still showing** — The RLS migration was just applied. The data is correct (both shifts have valid caregiver IDs, both are active team members). This should resolve on page refresh. No code change needed.

2. **Screening shows "Not Started" despite all voice sessions being "Reviewed"** — The voice screening sessions (`screening_sessions` table) and the formal screening record (`professional_screening` table) are separate systems. Completing all voice sessions does not auto-create a `professional_screening` record with `status = 'passed'`. The admin must manually mark the screening as passed, but currently the only way to do this is through the "Schedule" button which opens a full interview form — not intuitive.

### Changes

#### 1. Add "Mark as Passed" quick action to ProfessionalScreeningPanel

| File | Change |
|------|--------|
| `src/components/admin/ProfessionalScreeningPanel.tsx` | Add a green "Mark as Passed" button next to each professional in the Pending Screenings list. Clicking it will: (a) insert/update a `professional_screening` record with `status: 'passed'`, `screening_type: 'head_nurse_interview'`; (b) update the profile with `screening_cleared: true` and `onboarding_stage: 'cleared'`; (c) show a success toast and refresh the list. This reuses the existing `handleSaveScreening` logic but skips the dialog. |

#### 2. Auto-sync: When all screening sessions are "reviewed", show accurate status

| File | Change |
|------|--------|
| `src/components/admin/ProfessionalScreeningPanel.tsx` | In `fetchProfessionals`, cross-check `screening_sessions` table. If a professional has no `professional_screening` record but all their screening sessions are `reviewed` or `completed`, display their status as "Sessions Reviewed" (amber badge) instead of "Not Started", and show a prominent "Approve & Mark Passed" button. |

### How it will work for the admin

In the Pending Screenings section, each professional will show:
- Current status badge (e.g., "Sessions Reviewed" or "Not Started")
- A green **"Mark as Passed"** button — one click to approve
- The existing "Schedule" button for the full interview form (if needed)

### No changes needed for "Unassigned"

The database confirms both shifts have valid caregiver assignments and both professionals are active team members. The RLS policy `professionals_can_view_care_plan_teammates` was successfully applied. Refreshing the professional calendar page should now show the correct caregiver names.

