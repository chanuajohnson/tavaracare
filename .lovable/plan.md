

## Plan: Discount Transparency, Legacy Rate Support, FAQ Route Fix, and Care Summary Updates

This plan addresses all the issues found during the verification walkthrough.

---

### Issue Summary

1. **"Tavara Family Care Plan (weekly)" still displayed** in Care Summary headers across admin, family, and professional onboarding checklists and PDFs — should say "Active Care Management (weekly)"
2. **$35/hr still hardcoded** in admin Care Summary header and PDF generation — should be dynamic (Ana Maria keeps $35, new default is $40)
3. **BillingSummaryCard not showing on family onboarding checklist post-onboarding** — it IS rendered but only when `familyCarePlanId` exists; need to verify it renders for the family tab
4. **No discount/waiver transparency** — when `override_price` differs from `unit_price`, the UI should show the original price struck through and a "Discounted" or "Waived" badge
5. **FAQ page 404** — route is `/faq` but user navigated to `/support/faq`; need to add `/support/faq` as an alias route
6. **Unit Economics** should respect `override_price` for Ana Maria (already does via line 309 in useUnitEconomics.ts) but the subscription revenue function uses hardcoded $699/$899 instead of reading the actual override_price from service selections
7. **Payment note** — "Weekly (due every Friday)" should add a note about making transactions Thursday to ensure timely arrival

---

### File Changes

**1. `src/pages/admin/AdminOnboardingChecklistPage.tsx`**

- **CareSummaryHeader** (lines 102-155): Replace hardcoded `$35/hr (Standard)` and `Tavara Family Care Plan (weekly)` with dynamic values read from `checkedItems` (care_rate, billing_cadence). Add payment timing note: "Complete transactions by Thursday to ensure Friday receipt."
- **PDF generation** (lines 430-435, 550-557): Replace `$35/hr` and `Tavara Family Care Plan (weekly)` with `Active Care Management (weekly)` and dynamic rate from checkedItems

**2. `src/pages/family/FamilyOnboardingChecklistPage.tsx`**

- **CareSummaryHeader** (line 39): Change `Tavara Family Care Plan (weekly/monthly)` to `Active Care Management (weekly/monthly)`
- Add payment timing note beneath "Weekly (due every Friday)"

**3. `src/pages/professional/ProfessionalOnboardingChecklistPage.tsx`**

- Update `Tavara Family Care Plan (weekly)` reference (line 134) to `Active Care Management (weekly)`

**4. `src/components/admin/onboarding/BillingSummaryCard.tsx` — Discount/Waiver Transparency**

- **ServiceRow**: When `override_price` is set and differs from `unit_price`:
  - If override_price is 0: show "Waived" badge + original price struck through
  - If override_price < unit_price: show "Discounted" badge + original price struck through + effective price
- This automatically handles Ana Maria's case: her Active Care Management at $499 (override of $699), and waived Caregiver Matching ($0 override of $299) and Care Assessment ($0 override of $499)

**5. `src/components/admin/onboarding/ServiceCommencementConfirmation.tsx`**

- Add similar discount/waiver display: show original price struck through when effective_price differs from the billable item's unit_price
- Need to also fetch `unit_price` from the join so we can compare

**6. `src/components/routing/AppRoutes.tsx`**

- Add route alias: `<Route path="/support/faq" element={<FAQPage />} />` alongside existing `/faq` route

**7. `src/hooks/admin/useUnitEconomics.ts`**

- The service revenue calculation (lines 301-330) already correctly uses `override_price ?? unit_price`, so Ana Maria's discounted $499 and waived items will flow through correctly
- The `getWeeklySubscriptionRevenue` function (line 78-86) is only used for the legacy `user_subscriptions` table fallback. Since service selections already capture the actual revenue, no change needed here — the service breakdown already reflects correct amounts

**8. `src/components/admin/care-plans/DocumentGenerationMenu.tsx`**

- Quote/invoice line items already use `override_price ?? unit_price` (line 69) — add visual indication of discount in the PDF: show original price with strikethrough and "Discounted" label when override differs

---

### How Ana Maria's Data Will Display After Changes

**Care Plan Commercial Summary (BillingSummaryCard):**
```text
CORE PLAN
Active Care Management ✓   ~~$699.00~~ $499.00 Per week [Discounted]

ONE-TIME FEES
Caregiver Matching & Placement ✓   ~~$299.00~~ $0.00 One-time [Waived]
Care Assessment & Setup ✓          ~~$499.00~~ $0.00 One-time [Waived]

One-Time Total: $0.00

Projected Totals
Projected Weekly Total: $499.00/wk
Projected One-Time Total: $0.00
Projected Monthly Recurring: $2,160.67/mo
```

**Care Summary Header:**
```text
Rate: $35/hr (Standard)  |  Plan: Active Care Management (weekly)  |  Start Date: April 13, 2026
Payment: Weekly (due every Friday) — Complete transactions by Thursday to ensure timely receipt
```

**Unit Economics:** Service breakdown will show "Active Care Management — $499/wk × N weeks" (already works via override_price)

---

### Files Modified
1. `src/pages/admin/AdminOnboardingChecklistPage.tsx` — dynamic rate/plan in header + PDFs
2. `src/pages/family/FamilyOnboardingChecklistPage.tsx` — plan name + payment note
3. `src/pages/professional/ProfessionalOnboardingChecklistPage.tsx` — plan name
4. `src/components/admin/onboarding/BillingSummaryCard.tsx` — discount/waiver badges
5. `src/components/admin/onboarding/ServiceCommencementConfirmation.tsx` — discount display
6. `src/components/routing/AppRoutes.tsx` — `/support/faq` route alias
7. `src/components/admin/care-plans/DocumentGenerationMenu.tsx` — discount labels in PDFs

