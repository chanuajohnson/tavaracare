

## Plan: Add Family Terms & Conditions Section + Update Billing Document Descriptions

### Two changes:

**1. Add "Terms & Conditions of Engagement" section to the family onboarding checklist**

New section in `onboardingSections.ts`, placed just before `post_onboarding`. Items tailored to the family's perspective:

- Family acknowledges they are engaging care services through Tavara Care, not hiring the caregiver directly
- Family understands the assigned caregiver is part of Tavara's rotation pool for seamless coverage
- Family confirms they are subscribing to the Family Care Plan (weekly) — refer to quotation for full pricing details
- Family understands payment is due weekly (every Friday) as per the billing terms
- Family acknowledges that payment processing may take up to 3 business days to clear
- Family acknowledges NIS (National Insurance) contributions for the caregiver are covered by Tavara
- Family understands rate adjustments may apply if care needs change, with prior notice
- Family confirms they have reviewed the quotation and accepted all terms (digital approval)

**2. Update billing line item description from "Nursing Care (Standard Tier)" to "Standard Weekly Care"**

In `invoiceService.ts` `buildDefaultCareBillingData()`, change the first line item description from `"Nursing Care (Standard Tier)"` to `"Standard Weekly Care — Nursing (40 hrs/wk)"` to make it explicitly clear this is the weekly care plan. This change flows through to all generated Quotes, Invoices, and Receipts automatically since they all use the same data builder.

### Files Modified

| File | Change |
|------|--------|
| `src/components/admin/onboarding/onboardingSections.ts` | Add "Terms & Conditions of Engagement" section (8 items) before `post_onboarding` |
| `src/services/care-plans/invoiceService.ts` | Update line item description to "Standard Weekly Care — Nursing (40 hrs/wk)" |

