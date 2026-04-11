

## Plan: Fix Date Editing + Add Post-Onboarding Summary Header

### Problem 1: Dates show wrong day and can't be changed
The stored date string `"2026-04-11"` is parsed with `new Date("2026-04-11")` which treats it as UTC midnight. In Trinidad (UTC-4), this displays as April 10th. The same bug affects the Calendar's `selected` prop, so the calendar highlights the wrong day and re-selecting appears broken.

### Problem 2: No high-level summary at top of Post-Onboarding section
The admin and family need to see key info at a glance: rate tier, subscription plan, start date.

---

### Changes

**File: `src/pages/admin/AdminOnboardingChecklistPage.tsx`**

1. **Fix date parsing** -- Create a helper `parseLocalDate(dateStr)` that splits `"YYYY-MM-DD"` into parts and constructs `new Date(yyyy, mm-1, dd)` (local timezone). Use it in both `format()` display (line 278) and Calendar `selected` prop (line 285).

2. **Close popover after date selection** -- Wrap the Popover in a controlled state (`open`/`onOpenChange`) and set `open = false` after a date is selected, so the calendar dismisses and the new date shows immediately.

3. **Add summary header inside Post-Onboarding section** -- When `section.id === "post_onboarding"`, render a summary card at the top of the section content showing:
   - **Rate**: $35/hr (Standard tier) -- static for now
   - **Plan**: Tavara Family Care Plan (weekly)
   - **Start Date**: pulled from `checkedItems["post_onboarding_3_date"]` if set, otherwise "Not set"
   - Styled as a compact info grid with a subtle background

**File: `src/pages/family/FamilyOnboardingChecklistPage.tsx`**

4. **Fix date display parsing** -- Same `parseLocalDate` helper for the read-only date badges (line ~178) so family sees correct dates.

5. **Add same summary header** (read-only) at top of Post-Onboarding section on family view, pulling start date from `checkedItems["post_onboarding_3_date"]`.

---

### Summary Header Design

```text
┌─────────────────────────────────────────────────┐
│  💙 Your Care Summary                           │
│                                                 │
│  Rate: $35/hr (Standard)                        │
│  Plan: Tavara Family Care Plan (weekly)         │
│  Start Date: April 13, 2026                     │
└─────────────────────────────────────────────────┘
```

Compact, bg-blue-50 styled card. On admin side, start date auto-updates when item 3's date is changed.

### Files Modified

| File | Changes |
|------|---------|
| `src/pages/admin/AdminOnboardingChecklistPage.tsx` | Fix date parsing, auto-close popover, add summary header |
| `src/pages/family/FamilyOnboardingChecklistPage.tsx` | Fix date parsing, add read-only summary header |

