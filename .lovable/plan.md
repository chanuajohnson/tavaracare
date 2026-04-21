## Plan: Add "NIS Employer Registration Support" SKU + answer the pricing question

Two small asks bundled together.

---

### Part A — New one-time SKU: `NIS Employer Registration Support — $349`

#### Where it goes

In the **"Rates, Care Changes & Escalation"** section on `/admin/onboarding-checklist` (section id `rates_and_changes`, `serviceCategory: "care_change"`). It will appear in the existing **Approved Service Components** panel right alongside:

- Care Plan Adjustment Fee · $149 one-time
- Basic Escalation Support · $100 one-time
- Urgent Escalation Support · $200 one-time
- Emergency Stabilization / Rapid Response · $300 one-time
- **→ NIS Employer Registration Support · $349 one-time**  *(new)*

No new UI components needed — the existing `ServiceSelectionBlock` already renders every row in this category with: checkbox · "Family approved" toggle · override price · internal notes · approved badge. Because it's in the billable catalog, it automatically flows into:


| Surface                                     | How it gets there                                                                                                                                     |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Approved Service Components (admin)         | `ServiceSelectionBlock` reads all `is_active=true` rows where `category='care_change'`                                                                |
| Family billable details (read-only view)    | Same block with `readOnly compact` on family checklist page                                                                                           |
| Quote / Invoice / Receipt PDFs              | `DocumentsTab` → `buildBillingData` → `invoiceService` already pipes `care_plan_service_selections` into line items (`visible_in_quote/invoice=true`) |
| Service revenue breakdown in Unit Economics | `useUnitEconomics` already aggregates every selection where `billable_service_items.visible_in_unit_economics=true`                                   |
| New per-document picker dropdown            | Already generic — new SKU shows up as a checkable row                                                                                                 |


#### Database change — one migration

```sql
INSERT INTO public.billable_service_items (
  label,
  description,
  category,
  billing_type,
  unit_price,
  default_quantity,
  sort_order,
  is_active,
  visible_in_quote,
  visible_in_invoice,
  visible_in_unit_economics
) VALUES (
  'NIS Employer Registration Support',
  'Administrative support to register the family as an employer for caregiver NIS compliance, including forms, document collection guidance, authorization handling, and submission coordination. Of course, this is something you can absolutely handle on your own.
But we’re here to coordinate and support you through it — because it truly takes a village to care.

And knowing that, we offer this as an option to make the process a bit lighter for you. NIS contributions themselves are not included and remain payable by the family as the registered employer.',
  'care_change',
  'one_time',
  349.00,
  1,
  8.4,   -- right after Emergency Stabilization (8.3)
  true,
  true,
  true,
  true
);
```

#### Checklist-item copy (text bullets under section description)

Append two bullets to the existing `rates_and_changes` items array in `src/components/admin/onboarding/onboardingSections.ts` (line ~238):

```
"NIS Employer Registration Support — $349 one-time optional administrative coordination to register the family as the employer for NIS purposes (forms, documents, authorizations, submission). NIS contributions themselves remain separate and are the family's responsibility."
"Tavara does not employ the caregiver — the family is the employer of record for NIS purposes. Tavara coordinates and supports the registration process. Of course, this is something you can absolutely handle on your own.
But we’re here to coordinate and support you through it — because it truly takes a village to care.

And knowing that, we offer this as an option to make the process a bit lighter for you."
```

Plus update the **helper text** at line 223 to stay calm and non-alarmist:

> *"Changes in scope, complexity, schedule, or service level may require a care adjustment and will always be discussed before taking effect. Optional one-time administrative support is available to coordinate NIS employer registration."*

#### WhatsApp nudge template (admin side)

Add a new template to `src/services/admin/nudgeTemplates.ts` (or equivalent) under the family-stage bucket, keyed `nis_employer_registration_support`, using your "softer version" copy exactly as written, with the $349 fee and the NIS-contribution disclaimer inline. Admin picks it from the nudge dropdown, sends via central WA number.

#### Files touched


| File                                                                      | Change                                                            |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `supabase/migrations/<ts>_add_nis_employer_registration_sku.sql`          | **NEW** — single INSERT as above                                  |
| `src/components/admin/onboarding/onboardingSections.ts`                   | Append 2 bullets to `rates_and_changes.items`; soften helper text |
| `src/services/admin/nudgeTemplates.ts` (or wherever nudge templates live) | Add `nis_employer_registration_support` template                  |


**Untouched:** `ServiceSelectionBlock`, `DocumentsTab`, `invoiceService`, `useUnitEconomics`, `DocumentGenerationMenu`, `App.tsx`, AuthProvider, registration, chat flow — everything else inherits the new SKU automatically.

#### Acceptance test

1. Admin opens a family's `/admin/onboarding-checklist` → scroll to **Rates, Care Changes & Escalation**
2. Approved Service Components list now shows 5 rows, with **NIS Employer Registration Support · $349 one-time** at the bottom
3. Tick it → tick **Family approved** → Save → row persists with green "Approved" badge
4. Open **Documents** dropdown → "NIS Employer Registration Support" appears as a checkable line item
5. Clear all → tick only this row → Generate Quote → PDF shows the $349 line item + description text, with the NIS-contributions disclaimer visible
6. Navigate to `/admin/unit-economics` for the current month → expand this client's row → $349 appears in the service revenue breakdown once invoiced
7. Family logs in → `/family/onboarding-checklist` → Rates section → sees the SKU as a read-only row with helper text *"This service supports the registration process only. NIS contributions themselves are not included and remain payable by the family as the registered employer."*
8. Admin opens nudge panel → new **NIS Employer Registration Support** template available → sends via central WA number

---

### Part B — Answer: why is Guided Home Reset ($499) cheaper than Full Care Environment Reset?

Short answer: the current copy in `CareEnvironmentIntroCard.tsx` describes them as **different scopes**, not different tiers of the same thing.


| Level                              | Price                                                                 | What it actually covers today                                                                                                                                                                                                                                                                                      |
| ---------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| L1 Care Readiness Assessment       | $0 (waived, was $199)                                                 | One-time walkthrough + plan                                                                                                                                                                                                                                                                                        |
| L2 **Guided Home Reset**           | **$499 flat**                                                         | One-time coordination fee for the initial reset — covers Tavara's hands-on coordination until completion. **External contractor costs are quoted separately and billed directly to the family.** So $499 is *not* the total cost of resetting the home; it's Tavara's coordination fee on top of contractor bills. |
| L3 **Full Care Environment Reset** | **Custom (shown as $399 one-time in the DB, but Card says "Custom")** | Described in the card as *"ongoing environment support — recurring pest control, seasonal deep cleaning, contractor management."* That's an ongoing coordination relationship, not a one-time job.                                                                                                                 |


**So two things are off and worth fixing in a follow-up:**

1. **Price mismatch:** DB has `Full Care Environment Reset = $399 one-time` (from migration `20260418224128`), but the family-facing card says **"Custom"**. Pick one: either make it `custom` pricing (null + flag) or commit to $399 in both places.
2. **Positioning inversion:** if L3 is truly *ongoing*, a one-time fee < L2's coordination fee is confusing. Either:
  - **Option A** — Reprice L3 higher than $499 (e.g., $699 one-time setup + monthly retainer), OR
  - **Option B** — Change L3 `billing_type` from `one_time` to `monthly` with a clear retainer price (e.g., $199/mo ongoing coordination, separate from contractor costs), OR
  - **Option C** — Leave L3 as "Custom — quoted per household" and remove the $399 from DB so admins always override per case.

I'd recommend **Option B + C combined**: monthly ongoing retainer for L3, with the specific number quoted per household. This makes the ladder make sense: L1 waived · L2 $499 one-time coordination · L3 monthly ongoing coordination. Happy to ship this as a separate focused task — just tell me which option and I'll migrate + update the card copy.

### Out of scope for Part A

- Auto-expiring the NIS support (one-time admin task, no recurring window needed)
- Building a dedicated "NIS registration walkthrough" UI for families (the admin handles it manually per the nudge template)
- Changes to L1/L2/L3 Care Environment pricing — covered in Part B recommendation, separate approval