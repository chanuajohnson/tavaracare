

## Plan

Two things bundled together.

---

### Part 1 — Fix: caregiver labor line item ignores the picker

**Root cause** (confirmed from your uploaded quote PDF):

Your quote showed exactly 2 lines:
1. `Daily Care SOP — One-Time Activation · $199` ← the one you ticked ✓
2. `Standard Weekly Care — Caregiver (40 hrs/wk) · $1400` ← **never in the picker, always added**

Anna's data isn't hardcoded and there's no legacy leak. The other 3 approved services (`Active Care Management`, `Care Readiness Assessment`, `Caregiver Matching & Placement`) were correctly excluded. 

The issue is in `DocumentGenerationMenu.tsx` lines 147–160: whenever the `careRate` prop is present on the admin checklist page, a caregiver-labor line item is built from `careRate × weeklyHours` and **unconditionally appended** to the final PDF payload, regardless of what the admin did in the "Include on document" picker. So clicking **None** → ticking only SOP still leaves the $1400 caregiver line in the PDF.

#### The fix

Add the caregiver-labor line to the picker as a synthetic row, so the admin can toggle it exactly like any other line.

**File:** `src/components/admin/care-plans/DocumentGenerationMenu.tsx`

1. Compute a synthetic caregiver-labor item (id: `"__caregiver_labor__"`) from `careRate` + `weeklyHours` once, memoized, alongside the fetched `approvedLineItems`.
2. Merge it into the combined list shown in the dropdown (appears at the top with a subtle divider-style label "Caregiver labor").
3. Default it to **checked** (preserves today's behavior for admins who don't touch the picker).
4. In `getData()`, drop the unconditional caregiver-line block — instead filter the combined list by `selectedItemIds` and send only checked items to the PDF.
5. **Select all** / **None** toggles operate on the combined list (caregiver labor included), so "None → tick only $199" now truly yields a $199-only quote.

#### Acceptance test (Anna's case, from your screenshot)

1. Open Anna's onboarding checklist → **Documents** dropdown
2. List now shows 5 rows: `Caregiver Labor (40 hrs × $35/hr weekly) · $1400/wk` + the 4 approved services
3. Click **None** → tick only `Daily Care SOP — One-Time · $199 one-time`
4. Footer reads *"1 of 5 services included"*
5. Click **Generate Quote** → PDF shows **only** the $199 SOP line · subtotal $199 · total $199
6. Re-open dropdown fresh (no interaction) → click Generate Quote → PDF matches today's output exactly (all 5 lines, $1599 total as in your screenshot)

#### Files touched

| File | Change |
|---|---|
| `src/components/admin/care-plans/DocumentGenerationMenu.tsx` | Merge caregiver-labor into the picker; remove unconditional injection in `getData()` |

**Untouched:** `invoiceService.ts`, `DocumentsTab.tsx` (family-side path, separate code), onboarding sections, SOP entitlement work, migrations.

---

### Part 2 — Care Environment pricing fix (Option B + C, as you greenlit)

Level 3 **Full Care Environment Reset** becomes a **monthly coordination retainer, quoted per household** — making the ladder read:

| Level | Price | Billing Type |
|---|---|---|
| L1 Care Readiness Assessment | $0 (waived, was $199) | one_time |
| L2 Guided Home Reset | $499 | one_time |
| **L3 Full Care Environment Reset** | **Custom — quoted per household** | **monthly** |

#### Database change (one migration)

```sql
UPDATE public.billable_service_items
SET
  billing_type = 'monthly',
  unit_price = NULL,
  description = 'Ongoing monthly coordination retainer for sustained care environment support — recurring pest control coordination, contractor management, seasonal deep cleaning oversight, and evolving environmental needs. Quoted per household based on home size and scope of ongoing needs. Admin sets the monthly retainer amount per family. Contractor costs (cleaning services, pest treatments, etc.) are separate and billed directly to the family.'
WHERE label = 'Full Care Environment Reset';
```

Setting `unit_price = NULL` forces admin to use the **override price** field per-family when activating this SKU — which is exactly what "quoted per household" means in our existing UI. Admin's workflow: tick it → "Family approved" → type the custom monthly retainer (e.g., $150/mo, $250/mo) in override → save. Flows through documents/unit-economics with that override.

#### UI change — card copy

**File:** `src/components/admin/onboarding/CareEnvironmentIntroCard.tsx` (lines 23–30)

Update L3 entry to:
```ts
{
  level: "Level 3",
  name: "Full Care Environment Reset",
  price: "Custom / month",
  originalPrice: null,
  description:
    "Ongoing monthly coordination retainer for households needing sustained care environment support — recurring pest control, seasonal deep cleaning, contractor management, and evolving needs. Retainer amount is quoted per household based on home size and scope. Contractor costs are separate and billed directly to the family.",
},
```

Also update the explainer paragraph below the grid (around line 127) to reinforce the ladder: *"L1 waived · L2 one-time coordination · L3 monthly ongoing coordination."*

#### Acceptance test

1. Family or admin opens onboarding → Care Environment section → L3 card now reads **"Custom / month"** (not "Custom" one-time)
2. Admin activates L3 for a family → override-price field is empty (DB now has NULL unit_price) → admin types `200` (as in $200/mo) → saves
3. Generate Invoice → PDF line item: `Full Care Environment Reset · $200 (monthly)`
4. Unit Economics per-client row shows $200/mo under service revenue
5. Memory updated: `mem://features/care-environment-support` reflects new L3 positioning

#### Files touched

| File | Change |
|---|---|
| `supabase/migrations/<ts>_l3_care_environment_monthly_retainer.sql` | **NEW** — UPDATE as above |
| `src/components/admin/onboarding/CareEnvironmentIntroCard.tsx` | L3 card copy + explainer paragraph |
| `.lovable/memory/features/care-environment-support.md` | Reflect new L3 = monthly retainer |

**Untouched:** `ServiceSelectionBlock`, catalog-reader code, documents, unit-economics (all already handle `monthly` billing_type and NULL unit_price via override).

---

### Order of execution

1. **Part 1 first** (unblocks your immediate pain — Anna's document picker actually working)
2. **Part 2 second** (independent, no cross-dependency)

### Out of scope
- Changing L1 or L2 pricing (confirmed stable)
- Per-family auto-quoting logic for L3 (admin types override, as with any custom SKU)
- Migrating existing L3 selections (none in production based on fresh SKU status)

