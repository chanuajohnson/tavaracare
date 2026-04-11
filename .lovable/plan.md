

## Plan: Fix Assignment Failure, Improve Report, Update T&C Items

### 3 issues to address:

---

### 1. Remove the "payment processing may take up to 3 business days" T&C item + Add Wi-Fi access item

**File**: `src/components/admin/onboarding/onboardingSections.ts`

- Delete item at index 4: `"Family acknowledges that payment processing may take up to 3 business days to clear"`
- Add new item: `"Family agrees to provide Wi-Fi access (if available) to the caregiver for platform use — medication logging, care documentation, and shift tracking"`
- Net result: still 8 items in `family_terms`

---

### 2. Fix "Failed to create assignment" error

**Root cause**: The `create_unified_assignment` RPC function logs to `admin_communications` with `message_type = assignment_type_param || '_assignment_created'` (e.g. `'manual_assignment_created'`). But the `admin_communications` table has a CHECK constraint that only allows `'email'`, `'whatsapp'`, or `'custom'`.

**Fix**: Database migration to either:
- Update the CHECK constraint on `admin_communications.message_type` to include the assignment-related types, OR
- Change the RPC to use `'custom'` as the `message_type` (simpler, no schema change needed)

I'll go with updating the RPC function to use `'custom'` as the message_type, keeping the actual type info in the `custom_message` field. This is the safer, non-breaking approach.

---

### 3. Redesign the onboarding report to be informative (past-tense, agreement-focused)

**Current problem**: The report lists raw checklist item text like "Review existing care plan details" — it reads like a to-do list, not a record of what was covered and agreed to. The user wants it to serve as a baseline agreement record between Tavara and the family/professional.

**Approach**: Transform each checklist item into a past-tense, outcome-focused statement when rendering in the PDF. Instead of listing the raw item text, use a mapping that converts each section's items into "what was agreed/covered" language.

For example:
- "Review existing care plan details (if already created by family)" → "✓ Existing care plan details were reviewed and confirmed"
- "Care plan types (Scheduled Care, On-Demand)" → "✓ Care plan type confirmed: Scheduled weekly care"
- "How family adds medications" → "✓ Family was shown how to add and manage medications"
- "Family acknowledges they are engaging care services through Tavara Care..." → "✓ Agreed: Care services engaged through Tavara Care, not direct hire"

**Implementation**: 
- Create a `reportItemMapping` object in the report generation code that maps `sectionId_itemIndex` to a more informative, past-tense description
- For T&C items specifically, prefix with "Agreed:" or "Acknowledged:" 
- For review/training items, prefix with "Covered:" or "Demonstrated:"
- Keep unchecked items with "○ Pending:" prefix
- Apply the same treatment to the professional report

**One page concern**: The user asked if one page is unreasonable. With ~99 items, even at 6.5pt in 2 columns, it's tight. I'll implement smart compression:
- Group completed sections as a single line ("✓ Pre-Call Preparation — all 6 items covered") when ALL items are checked
- Only expand sections that have unchecked items or are T&C sections (always expanded)
- T&C and Rates sections always show individual items since those are the agreement-critical ones
- This dramatically reduces line count while keeping the important detail

**File**: `src/pages/admin/AdminOnboardingChecklistPage.tsx` — rewrite `generateFamilyReport()` and `generateProfessionalReport()` functions

---

### Files Modified

| File | Change |
|------|--------|
| `src/components/admin/onboarding/onboardingSections.ts` | Remove "3 business days" item, add Wi-Fi access item |
| `src/pages/admin/AdminOnboardingChecklistPage.tsx` | Redesign both PDF report generators with past-tense agreement language and smart compression |
| Database migration | Fix `create_unified_assignment` RPC to use valid `message_type` value |

