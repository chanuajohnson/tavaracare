## Plan: Fix Remaining Issues — BillingSummary, Quote PDF, FAQ Redirect, Care Plan Display

### Issues Found

1. **BillingSummaryCard not visible** on admin onboarding checklist for Ana Maria — it renders only in `post_onboarding` section but the `showFamilyData` gate requires the professional's linked family. Need to verify `familyCarePlanId` is being resolved for Ana Maria's family.
2. **Care Plan Review & Setup not showing core_plan items** — The `serviceCategory: "core_plan"` is set correctly in `onboardingSections.ts`, and `ServiceSelectionBlock` filters by category. The issue is likely that Ana Maria's service selections were created BEFORE the category was updated from `weekly_addon` to `core_plan` in the database. The DB migration updated the `billable_service_items` category, so the filter should now work — but if the catalog query returns 0 items with `category = 'core_plan'`, the block shows nothing. Need to verify the migration actually ran.
3. **Quote PDF shows $40/hr and $699 instead of Ana Maria's $35/hr and $499** and her wavered items — `buildDefaultCareBillingData()` in `invoiceService.ts` hardcodes `nurseRate = 40` and `subscriptionRate = 699` as base line items. The `additionalLineItems` from `DocumentGenerationMenu` (which DO have discount labels) are APPENDED as extra items, creating duplicates. Fix: when `additionalLineItems` are provided, use ONLY those instead of also including hardcoded base items.
4. **FAQ redirects admin users to dashboard** — `AuthProvider.tsx` line 228 only skips redirect for `/admin/*` paths. When an admin visits `/support/faq`, `initialRedirectionDoneRef.current` is false, so it triggers `handlePostLoginRedirection()` which sends them to the admin dashboard. Fix: add public pages like `/faq`, `/support/faq`, `/about`, `/features` to the skip list.
5. **FAQ category filters return "No results"** — When user selects "Care Matching & Services" filter and searches "rates", no FAQs match because no FAQ content contains the word "rates" while also being in that category. The FAQ content needs updating with rate-related items.
6. **Ana Maria's rate shows $40/hr** — `CareSummaryHeader` defaults to `$40/hr (Standard)` when `checkedItems["care_rate"]` is empty. Ana Maria's checklist likely doesn't have `care_rate` set. The admin needs to manually set it, OR the system should read it from the care plan data.

---

### File Changes

**1. `src/services/care-plans/invoiceService.ts` — Fix duplicate line items**

In `buildDefaultCareBillingData()` (line 419): when `additionalLineItems` are provided AND no explicit `lineItems` override, use `additionalLineItems` AS the line items instead of appending them to hardcoded defaults. This ensures Ana Maria's quote shows her actual $499 override with the `[Discounted from $699.00]` label, and her actual caregiver rate.

```typescript
// If service selections are provided, use them as the primary line items
const baseLineItems: BillingLineItem[] = overrides.lineItems || 
  (overrides.additionalLineItems && overrides.additionalLineItems.length > 0 
    ? [] // Don't add hardcoded defaults when we have real service data
    : [
        { description: 'Standard Weekly Care — Nursing (40 hrs/wk)', hoursPerWeek: 40, ratePerHour: 40, amount: 1600 },
        { description: 'Active Care Management — Care Coordination', amount: 699, note: '(weekly)' },
      ]);
```

Also recalculate subtotal/total from the actual items when using `additionalLineItems`.

**2. `src/components/providers/AuthProvider.tsx` — Fix FAQ redirect for admin**

Add public pages to the redirect skip list (line 228):

```typescript
const publicPages = ['/faq', '/support/faq', '/about', '/features', '/privacy-policy', '/errands', '/onboarding-guide'];
const isOnPublicPage = publicPages.some(p => location.pathname === p) || location.pathname.startsWith('/urgent-');
const isOnAdminPage = location.pathname.startsWith('/admin/');

// Add isOnPublicPage to shouldSkipRedirect
```

**3. `src/pages/support/FAQPage.tsx` — Add rate/pricing FAQs and fix category tagging**

Add new FAQ items covering:

- "What are the caregiver hourly rates?" (category: "Care Matching & Services") — Standard $40/hr, Full Service $45/hr, Premium $50+/hr
- "How does care plan pricing work?" (category: "Care Management") — Active Care Management $699/week, Premium $899/week
- "Are there discounts for early adopters or legacy families?" (category: "Subscription & Pricing") — Legacy rates honored

**4. `src/pages/admin/AdminOnboardingChecklistPage.tsx` — Dynamic rate from care plan**

Update `CareSummaryHeader` to also accept an optional `careRate` prop that can be passed from the care plan's service selections (reading the caregiver hourly rate from the assignment or care team data). If `checkedItems["care_rate"]` is empty but we know the family's rate from their service data, show that.

**5. `src/components/admin/onboarding/BillingSummaryCard.tsx` — Ensure rendering**

Add a debug log when `items.length === 0` to help diagnose why it's not showing. Also check that the component renders even when only `core_plan` category items exist (the current grouping logic should handle this).

---

### How Ana Maria's Quote Will Look After Fix

```text
DESCRIPTION                                              HOURS    RATE      AMOUNT
Active Care Management — Care Coordination               —        —         $499.00
  [Discounted from $699.00] (weekly)
Standard Weekly Care — Nursing (40 hrs/wk)              40 hrs/wk $35.00/hr $1,400.00
Caregiver Matching & Placement [WAIVED — value: $299]   —        —         $0.00
Care Assessment & Setup [WAIVED — value: $499]          —        —         $0.00

                                              Subtotal:  $1,899.00
                                           Total (TTD):  $1,899.00
```

### Files Modified

1. `src/services/care-plans/invoiceService.ts` — Use service selections as primary line items
2. `src/components/providers/AuthProvider.tsx` — Skip redirect on public pages for admin users
3. `src/pages/support/FAQPage.tsx` — Add rate/pricing FAQs, fix category coverage
4. `src/pages/admin/AdminOnboardingChecklistPage.tsx` — Dynamic care rate fallback
5. `src/components/admin/onboarding/BillingSummaryCard.tsx` — Debug visibility issue