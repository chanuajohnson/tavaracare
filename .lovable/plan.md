
## Plan: Unlock Subscription + Add Documents to Family Care Plans

### Problem 1: Subscription "Coming Soon" blocking families
In `src/pages/subscription/SubscriptionPage.tsx` line 639, the PayPal button has `isComingSoon={true}`. This shows a "Coming Soon" button instead of a functional subscribe button. Also remove the `ComingSoonBanner` component rendered on line 566.

**Fix**: Change `isComingSoon={true}` to `isComingSoon={false}` and remove the `<ComingSoonBanner />` call.

### Problem 2: Documents dropdown missing from family care plan view
The `DocumentGenerationMenu` was only wired into the **admin** pages (`AdminFamilyCarePlansPage.tsx` and `AdminOnboardingChecklistPage.tsx`). The family-facing `CarePlanDetailPage.tsx` at `/family/care-management/:id` has no Documents dropdown at all.

**Fix**: Add `DocumentGenerationMenu` to the `CarePlanHeader` area of `src/pages/family/care-management/CarePlanDetailPage.tsx`, passing the family name, care plan title, and care plan ID. This gives families the same Quote/Invoice/Receipt generation capability from their own care plan view.

### Files Changed

1. **`src/pages/subscription/SubscriptionPage.tsx`**
   - Line 639: `isComingSoon={true}` to `isComingSoon={false}`
   - Line 566: Remove `<ComingSoonBanner />`
   - Lines 490-499: Remove `ComingSoonBanner` component definition (cleanup)

2. **`src/pages/family/care-management/CarePlanDetailPage.tsx`**
   - Import `DocumentGenerationMenu`
   - Add it next to `CarePlanHeader` with family name from auth user and care plan data
