

## Plan: Add Caregiver Rate to Approved Services + Bank Details & Payment Terms on Documents

### Changes

**1. `src/components/admin/onboarding/ServiceCommencementConfirmation.tsx`**
- Accept new optional props: `careRate` (string like "$35/hr (Legacy)") and `weeklyHours` (number)
- When provided, inject a synthetic "Caregiver — Weekly Nursing" line into the approved services list showing the weekly rate (e.g., "Standard Weekly Care — Nursing (40 hrs/wk)" → $1,400.00 weekly)
- This appears alongside the existing approved services (Active Care Management, etc.)

**2. `src/pages/admin/AdminOnboardingChecklistPage.tsx`**
- Pass `careRate={checkedItems["care_rate"]}` and `weeklyHours={selectedCaregiverWeeklyHours}` to the `ServiceCommencementConfirmation` component

**3. `src/services/care-plans/invoiceService.ts`**
- Add bank details section to Quote, Invoice, and Receipt templates:
  ```
  Bank: First Citizens Bank, Point Lisas
  Account: 2991223
  Name: Chanua Johnson
  Type: Savings
  ```
- Add payment instruction note: "Complete transactions by Thursday to ensure Friday receipt. Send screenshot of payment/bank transfer via WhatsApp or email to confirm."
- Update `TERMS_AND_CONDITIONS` to include late payment penalty language (already has "5% fee after 3 business days" — will make more prominent and add bank transfer confirmation requirement)

**4. `src/components/admin/onboarding/BillingSummaryCard.tsx`**
- Add a small bank details reference card at the bottom of the billing summary for easy admin/family access

### Result for Ana Maria
The Service Commencement Confirmation will show:
- Active Care Management — Discounted — ~~$699.00~~ $499.00 weekly
- **Standard Weekly Care — Nursing (40 hrs/wk) — $1,400.00 weekly** ← NEW
- Caregiver Matching & Placement — Waived — $0.00 one-time
- Care Assessment & Setup — Waived — $0.00 one-time

Quotes/Invoices will include bank details and payment deadline disclaimers.

### Files Modified
1. `src/components/admin/onboarding/ServiceCommencementConfirmation.tsx`
2. `src/pages/admin/AdminOnboardingChecklistPage.tsx`
3. `src/services/care-plans/invoiceService.ts`
4. `src/components/admin/onboarding/BillingSummaryCard.tsx`

