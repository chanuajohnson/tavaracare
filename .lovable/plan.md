## Goals
Fix three issues on generated Quote, Invoice, and Receipt PDFs.

## Changes

### 1. Use real care plan title (instead of hardcoded "Care Services")
**File:** `src/pages/admin/AdminOnboardingChecklistPage.tsx`
- Extend the `care_plans` query (~line 1565) to also `select` `title`.
- Add a `familyCarePlanTitle` state and set it alongside `familyCarePlanId` from the chosen `bestPlan.title`.
- Pass it into `<DocumentGenerationMenu carePlanTitle={familyCarePlanTitle || 'Care Plan'} />` (line 1921), replacing the hardcoded `"Care Services"`.

This way the receipt's "Care Plan: ..." row shows the actual care plan name (e.g. Chanua Johnson's care plan title from the DB) on Quote, Invoice, and Receipt.

### 2. Correct phone number
**File:** `src/services/care-plans/invoiceService.ts` (line 76)
- Change `phone: '+1 (868) 123-4567'` → `phone: '(868) 786-5357'` (the central Tavara WhatsApp number 18687865357).

Applies to both header block and the footer line that uses `COMPANY_INFO.phone`.

### 3. Remove email from footer
**File:** `src/services/care-plans/invoiceService.ts` (line 244)
- Footer currently renders: `${COMPANY_INFO.name} · ${COMPANY_INFO.email} · ${COMPANY_INFO.phone}`
- Change to: `${COMPANY_INFO.name} · ${COMPANY_INFO.phone}`
- Header email block (line 108) is left intact — user only asked to remove from the footer.

## Out of scope
- No changes to invoice/quote/receipt layouts, line items, signatures, or terms.
- No DB schema or RLS changes.

## Verification
- Generate Quote, Invoice, and Receipt for the Chanua Johnson family from `/admin/onboarding-checklist`.
- Confirm header phone reads `(868) 786-5357`, footer shows only name + phone (no email), and the "Care Plan:" row shows the actual care plan title from the DB.