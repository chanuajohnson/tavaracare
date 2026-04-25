# Lifecycle Cost — Copy, Pricing & Terminology Fixes

## 1. Save terminology rule to memory (Core)
Save a new memory rule so this stays consistent across all surfaces:

**Tavara terminology — DO use:**
- "Care payments" (never "wages", "payroll to caregiver", "salary")
- "Subscription fees" (never "platform fees" in family-facing copy)
- "Care Coordination & Management Platform" (never agency, employer, staffing service)
- "Caregiver disbursement" / "coordinates disbursement" for Tavara's payment-handling role

**Tavara terminology — DO NOT use:**
- "wages" / "wage" in family-facing copy → use **care payments**
- "payroll" in family-facing copy → use **care payment records**
- "employee", "staff", "our caregivers as employees" → caregivers are engaged directly by families; Tavara coordinates

This will be added as a Core rule in `mem://index.md` and a detailed memory at `mem://legal/tavara-terminology-glossary`.

---

## 2. Lifecycle billing rhythm copy (`LifecycleCostPage.tsx` line ~158 + `lifecycleScenarios.ts` header comment)

**Old:**
> Day 0 = mandatory setup fees only. Day 5 (Friday of week 1) = first partial-week wages + first week of subscription. Weeks 2–13 settle into the stable weekly rhythm shown below.

**New:**
> **Billing rhythm:** Day 0 = mandatory setup fees only. Day 5 (Friday of Week 1) = **first full week of care payments + first week of subscription fees**. Weeks 2–13 settle into the stable weekly rhythm shown below; any optional add-ons bill on the same weekly cadence. All figures in **TTD**; USD shown in brackets at indicative rate.

Also update the header comment block in `src/utils/lifecycleScenarios.ts` to use "care payments" instead of "wages".

> Note: confirm with you — "first **full** week" not "first **partial** week"? (the user said "first full week care payments"). Plan assumes **full week** based on the new wording.

---

## 3. Rename internal `wages` field → `carePayments` (cosmetic in UI, keep field name internally to avoid breakage; just relabel where users see it)

- `LifecycleTimeline.tsx` line 27: `Wages: e.wages` → `'Care Payments': e.wages`
- `lifecycleScenarios.ts` Day-0 note: `'Setup bundle only — no care payments or subscription billed yet'`
- All other user-visible "wage/wages" strings in this feature → "care payments"

(TS field `wages` stays as-is internally — purely a label change to avoid risky refactor.)

---

## 4. Week 5 event — clarify what "Care Plan Adjustment fee absorbed" means

Current copy is cryptic. Replace in `ScenarioComparisonGrid.tsx` (~line 55) and `lifecycleScenarios.ts` line 186:

**New label:** `Wk 5 reality check: Care Plan Adjustment`
**New explanation:** *"Mid-stream care plan changes (revised schedule, new shift, added task scope) carry a one-time TTD $149 coordination fee. Shown here so families see how evolving needs are absorbed into the plan — never a surprise."*

---

## 5. Optional Services row — add explanatory notes (`OptionalServicesRow.tsx`)

Add a small description line under each item. Specifically:

| Item | Note to add |
|---|---|
| **NIS Employer Registration Support** (one-time) | *"One-time setup of your NIS employer file. **Does not include** ongoing NIS employee + employer contribution coordination — that is part of your active subscription plan."* |
| **Daily Care SOP — One-Time Activation** | *"One-time fee that activates your real-time visibility into the caregiver's daily logs, GAPP-standard shift checklists, and handoff records on your dashboard."* |
| **Guided Home Reset** (one-time) | *"One-time coordination fee for Tavara to plan + manage your decluttering, light organization, sanitization, and basic hazard removal — creating a safer, more manageable workspace for the caregiver. Contractors execute the physical work and are billed separately. Tavara is not a maid or cleaning service — we coordinate the reset."* |
| **Medication Management Support** ($99/wk) | *"Weekly fee for nurse-administered medication tracking with real-time visibility on your dashboard. Add or drop anytime — changes apply next billing cycle."* |
| **Daily Care SOP + Monitoring** ($149/wk) | *"Weekly fee for documented SOP execution + monitoring visible on your dashboard. Pairs with the one-time SOP Activation."* |
| **Meal Support Upgrade** ($75/wk) | *"Weekly fee that upgrades meal coordination — Tavara manages the meal-care layer of the caregiver's day."* |
| **Light/Standard/High-Need Secondary Support** | *"Weekly fee when the caregiver supports a second household member (e.g., spouse). Compensates the caregiver fairly for the added care load. Add or drop weekly — changes apply next billing cycle."* |

---

## 6. Secondary Support repricing — fix unfair caregiver compensation

Current values **misrepresent** what a caregiver should earn for supporting a second person. Fix in **two places**:

### 6a. `src/utils/lifecycleScenarios.ts` `DEFAULT_PRICING` (lines 86–88)
| Tier | Old | New |
|---|---|---|
| `addon_secondary_light` | $150/wk | **$350/wk** |
| `addon_secondary_standard` | $250/wk | **$650/wk** *(close to the caregiver's own weekly rate — fair for serving 2 people at standard level)* |
| `addon_secondary_high` | $400/wk | **Custom quote** (no fixed price — triggers re-assessment or recommendation of an additional caregiver) |

### 6b. Database migration — update `billable_services` table
Migration file targeting the rows from `supabase/migrations/20260415143315_…sql`:

```sql
UPDATE public.billable_services SET price = 350.00
  WHERE name = 'Light Secondary Support';
UPDATE public.billable_services SET price = 650.00
  WHERE name = 'Standard Secondary Support';
-- High-Need: convert to custom-quote (price 0, with flag/description change)
UPDATE public.billable_services
  SET price = 0,
      description = 'High-need secondary support — pricing is custom. Triggers a care re-assessment and may recommend an additional dedicated caregiver. Contact your Care Administrator for a quote.'
  WHERE name = 'High-Need Secondary Support';
```

### 6c. UI handling for "custom quote"
- `OptionalServicesRow.tsx`: when `addon_secondary_high` amount is 0 → render badge "Custom quote" instead of "$X/wk", with the explanation note.
- `LifecycleCostBuilder.tsx` line 118 area: same — show "Custom — re-assessment required" in the secondary dropdown for High-Need.

> Confirm with you — Standard at **$650/wk** is the user's "close to their weekly wage" guidance (a $40/hr × 8h × 5d caregiver earns $1,600/wk; $650 is ~40% of that, fair for adding a 2nd standard care recipient). The user said "should be closer to their weekly wage" — should it be **higher** (e.g., $800–$1,000/wk)? Plan defaults to **$650** but flag for confirmation.

---

## 7. Files to edit

1. `mem://index.md` — add Core terminology rule
2. `mem://legal/tavara-terminology-glossary` — new memory file
3. `src/utils/lifecycleScenarios.ts` — pricing constants + comment + Wk 5 note + Day 0 note
4. `src/pages/admin/LifecycleCostPage.tsx` — billing rhythm copy block
5. `src/components/admin/lifecycle/LifecycleTimeline.tsx` — chart label
6. `src/components/admin/lifecycle/ScenarioComparisonGrid.tsx` — Wk 5 event label + explanation
7. `src/components/admin/lifecycle/OptionalServicesRow.tsx` — per-item explanatory notes + custom-quote handling for High-Need Secondary
8. `src/components/admin/lifecycle/LifecycleCostBuilder.tsx` (line ~118) — High-Need dropdown label
9. **New SQL migration** updating `billable_services` rows (Light → 350, Standard → 650, High-Need → custom)

---

## 8. Open questions before implementing

1. **"First full week" vs "first partial week"** on Day 5 — the user said "first full week care payments." Confirm: bill **a full 5-day week of care payments** on Friday of Week 1, even though only ~5 days have elapsed since Day 0? (Plan assumes yes.)
2. **Standard Secondary Support price** — $650/wk is ~40% of a standard caregiver's weekly take. Bump to $800/wk or keep at $650?
3. **Regenerate PDF/PPTX artifacts (v3)** after these changes? (Reply "regen artifacts" if yes — otherwise plan only updates the live admin page.)

Reply with answers + approval and I'll implement in one pass.