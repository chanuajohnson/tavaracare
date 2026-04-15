

## Plan: Subscription Selection → Onboarding Flow Integration

### Problem
1. The subscription page uses `PayPalSubscribeButton` — clicking "Subscribe" tries to initiate PayPal payment. Instead, selecting a plan should save it as the family's chosen care coordination plan, flowing into their onboarding checklist, billing summary, unit economics, and documents.

2. The "Care Plan Review & Setup" onboarding card has `serviceCategory: "care_change"`, so it only shows escalation items. It should also show the core plan selections (Active Care Management / Premium Care Management) so the admin can check off which plan the family is on.

### Changes

**1. `src/pages/subscription/SubscriptionPage.tsx`**
- Remove `PayPalSubscribeButton` from the card footer for family plans
- Replace with a simple "Select Plan" button that:
  - Saves the selection to `user_subscriptions` or the family's care plan service selections in `care_plan_service_selections`
  - Shows a confirmation toast
  - Navigates back to dashboard
- The "basic" plan keeps its current "Get Started Free" button behavior
- For care/premium plans, the button text becomes "Select This Plan" instead of "Subscribe with PayPal"
- Selection writes the corresponding `billable_service_items` entry (Active Care Management or Premium Care Management) into `care_plan_service_selections` for the family's active care plan

**2. `src/components/admin/onboarding/onboardingSections.ts`**
- Change the `care_plan` section's `serviceCategory` from `"care_change"` to `"core_plan"` (new category)
- This ensures the Care Plan Review & Setup card shows only the core plan items

**3. Database: Update `billable_service_items` categories**
- Update Active Care Management (id `0f9bec68...`) category from `weekly_addon` to `core_plan`
- Update Premium Care Management (id `52f6c507...`) category from `premium_support` to `core_plan`
- This groups both plans under a dedicated category that the Care Plan Review card can filter on

**4. `src/components/admin/onboarding/BillingSummaryCard.tsx`**
- Ensure the "Core Plan" grouping pulls items with category `core_plan` (already structured for this in the recent update — just needs the category alignment)

### Flow After Changes

```text
Family visits /subscription
  → Clicks "Select This Plan" on Active Care Management ($699/week)
  → System finds family's active care plan
  → Upserts selection in care_plan_service_selections for the Active Care Management billable item
  → Toast: "Active Care Management selected for your care plan"
  → Redirects to dashboard

Admin opens /admin/onboarding-checklist for this family
  → "Care Plan Review & Setup" card shows ServiceSelectionBlock filtered to core_plan
  → Active Care Management appears checked (selected by family or admin)
  → Shows in BillingSummaryCard under "Core Plan"
  → Shows in post-onboarding summary
  → Flows to unit economics, quotes, invoices
```

### Files Modified
1. `src/pages/subscription/SubscriptionPage.tsx` — replace PayPal button with plan selection logic
2. `src/components/admin/onboarding/onboardingSections.ts` — change care_plan serviceCategory to `core_plan`
3. Database update: change category for Active/Premium Care Management items to `core_plan`

