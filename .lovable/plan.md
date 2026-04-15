
Root cause found: the quote you generated from `/admin/onboarding-checklist` is still wrong because that screen renders `DocumentGenerationMenu` without a `carePlanId`.

What this means:
- In `src/components/admin/care-plans/DocumentGenerationMenu.tsx`, the approved service fetch only runs when `carePlanId` exists.
- On the onboarding checklist page, the component is currently passed:
  - `familyName`
  - `careRate`
  - `weeklyHours`
  - `hideWaivedItems`
- But it is not passed `familyCarePlanId`, even though that page already loads it.
- Result: `approvedLineItems` stays empty, so only the hardcoded caregiver labor line item is sent into the quote. That is why Anna still shows $1400 only and not the $499 Active Care Management line.

Plan to fix:
1. Update `src/pages/admin/AdminOnboardingChecklistPage.tsx`
   - Pass `carePlanId={familyCarePlanId || undefined}` into `DocumentGenerationMenu`.
   - Keep `hideWaivedItems` enabled for Anna so only the $1400 caregiver item and the $499 Active Care Management item show.
   - Leave other families unchanged.

2. Keep `src/components/admin/care-plans/DocumentGenerationMenu.tsx` logic as the fetch source
   - Once `carePlanId` is passed, it will fetch the approved `care_plan_service_selections`.
   - That will populate the subscription item from the real approved data instead of showing only labor.

3. Preserve `src/services/care-plans/invoiceService.ts` behavior already added
   - It already detects the care-management service from approved selections.
   - It already converts that into a proper line item and includes it in subtotal/total.
   - It already keeps the “Includes:” text separate from the pricing row.

Expected result for Anna after this fix:
- Standard Weekly Care — Caregiver (40 hrs/wk) → $1400.00
- Active Care Management — Care Coordination → $499.00
- Total → $1899.00
- No waived $0 items shown for Anna
- The subscription details remain as a note, not a conflicting price box

Files to update:
- `src/pages/admin/AdminOnboardingChecklistPage.tsx`

Optional safety improvement I would also include while implementing:
- Add a tiny guard in the billing documents area when no `familyCarePlanId` exists, so admins immediately see why approved services would not appear instead of silently generating an incomplete quote.

Why I’m confident this is the exact issue:
- `AdminFamilyCarePlansPage.tsx` already passes `carePlanId={plan.id}` to `DocumentGenerationMenu`.
- `AdminOnboardingChecklistPage.tsx` does not.
- The onboarding checklist page already loads `familyCarePlanId` earlier in the file, so the missing prop is the broken link in the chain.
