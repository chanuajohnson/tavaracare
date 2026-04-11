

## Plan: Professional Terms & Conditions, Family Assignment Link, and Professional Report

### What This Covers

Based on your requirements, there are 4 major additions:

1. **Terms & Conditions section** in the professional onboarding checklist -- critical employment terms the nurse must acknowledge
2. **"Select Family" dropdown** on the Professional tab (below Select Professional) to link the professional to their assigned family
3. **Professional PDF Report** (Download Report button) -- mirrors the family report, includes T&C acknowledgment status
4. **Synced Care Summary** -- the professional's post-onboarding summary card pulls family data (start date, plan) when a family is linked

---

### 1. New "Terms & Conditions of Engagement" Section

Added to `professionalOnboardingSections.ts` as a new section (before Post-Onboarding Summary), with these checklist items:

- Professional acknowledges they are hired through Tavara Care, not directly by the family
- Professional understands they are part of a caregiver rotation pool for seamless coverage
- Professional agrees to a 30-day probationary/orientation period
- Professional confirms payment is made weekly by Tavara (every Friday)
- Professional understands payment processing may take up to 3 business days
- Professional acknowledges NIS contributions are covered by Tavara
- Professional agrees to Tavara's attendance, punctuality, and cancellation policies
- Professional confirms they have reviewed and accepted these terms (digital approval)

This section acts as the digital signature/approval -- checking the final item means the nurse has agreed to all terms.

### 2. "Select Family" Dropdown on Professional Tab

In `AdminOnboardingChecklistPage.tsx`, below the "Select Professional" dropdown, add a "Select Family" dropdown that:
- Shows all family profiles (reuses the already-loaded `families` list)
- Stores the selected family ID in `profCheckedItems` as `assigned_family_id`
- Persists to `professional_onboarding_checklists` with the rest of the checked items
- When set, the Post-Onboarding Care Summary card pulls the family's start date and other details from the linked family's onboarding checklist

### 3. Professional PDF Report Generation

A `generateProfessionalReport()` function (mirrors `generateFamilyReport`) that produces a one-page landscape A4 PDF containing:
- **Header**: "TAVARA.CARE -- Professional Onboarding Report" with professional name and assigned family
- **Care Summary**: Rate, Plan, Start Date, Payment Terms
- **Onboarding Progress**: All 11 sections with completion counts
- **Terms & Conditions Status**: Clear indication of whether all T&C items were acknowledged (with timestamp if available)
- **Key Dates**: Introduction, Meeting, Start dates
- **Notes**: Up to 8 most recent notes
- **Footer**: Source URL and page indicator

A "Download Report" button added to the Professional tab toolbar.

### 4. Synced Care Summary

The `CareSummaryHeader` on the professional side will accept the assigned family's checklist data to display:
- Start Date from the family's `post_onboarding_3_date`
- Assigned Family name
- Same rate/payment info

---

### Files Modified

| File | Changes |
|------|---------|
| `src/components/admin/onboarding/professionalOnboardingSections.ts` | Add "Terms & Conditions of Engagement" section (8 items) before post_onboarding |
| `src/pages/admin/AdminOnboardingChecklistPage.tsx` | Add family selector on Professional tab, add `generateProfessionalReport()`, wire Download Report button, sync Care Summary with family data |

### Technical Details

- The assigned family ID is stored as `assigned_family_id` inside `profCheckedItems` (same JSON blob that's already persisted to Supabase)
- When a family is selected on the Professional tab, we fetch that family's onboarding checklist to pull their start date for the Care Summary
- The professional report includes a dedicated "Terms & Conditions" section showing each T&C item with a check/uncheck indicator
- The `profCheckedItems` type will need to accept `string` values (like the family side) to support `assigned_family_id` and date fields

