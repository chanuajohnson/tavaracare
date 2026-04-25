# Reprice Secondary Household Support Add-ons

## Scope
Update the three secondary support rows in `billable_service_items` to fairly compensate caregivers, and ensure the lifecycle UI surfaces the new prices and the "Custom Quote" status without breaking the builder math.

---

## 1. Database changes (`billable_service_items`)

Run a data update (insert tool, not migration — schema unchanged) on these 3 rows by ID:

| Row | Current | New |
|---|---|---|
| **Light Secondary Support** (`0fd30345…`) | $150/wk | **$350/wk** — description: *"Approved support for one secondary task per day for an additional household member (e.g. light meal assistance, medication reminder, or shower guidance). Billed weekly. Beyond a single daily task, a re-assessment is required."* |
| **Standard Secondary Support** (`5e4729cc…`) | $250/wk | **$0 (custom-quote)** — description: *"Custom quote — requires consultation with the assigned caregiver. Standard support for a secondary household member can effectively double the caregiver's workload, so care payments may need to roughly double. Quoted only after the caregiver agrees and the secondary person's specific needs are reviewed; a re-assessment or additional caregiver may be recommended."* |
| **High-Need Secondary Support** (`3c1e1cf7…`) | $400/wk | **$0 (custom-quote)** — description: *"Custom quote — high-need support for a secondary household member is not absorbed under a single caregiver. A formal re-assessment and a dedicated additional caregiver are recommended. Pricing set after consultation."* |

Podiatric Secondary ($349) is **left untouched**.

## 2. Code propagation

### `src/utils/lifecycleScenarios.ts`
- Update `DEFAULT_PRICING` fallbacks: `addon_secondary_light: 350`, `addon_secondary_standard: 0`, `addon_secondary_high: 0`.
- In `buildOptionalServices`, append `customQuote: true` flag (new optional field on `OptionalServiceItem`) for Standard + High-Need so the UI can render "Custom quote" instead of `$0/wk`.

### `src/components/admin/lifecycle/OptionalServicesRow.tsx`
- When `item.customQuote` is true, render the price column as a `Custom quote` badge instead of `$0/wk`, with a one-line caption explaining consultation is required.

### `src/components/admin/lifecycle/LifecycleCostBuilder.tsx`
- For the Secondary Support `<select>`: relabel Standard → `Standard — Custom quote` and High-need → `High-need — Custom quote (re-assessment)`.
- When the user picks `standard` or `high`, **do not** add a numeric value to `weeklyAddons` (already $0, but add a small inline warning under the dropdown: *"Custom quote — not included in the projected total. Contact admin for pricing."*).

### `src/pages/admin/LifecycleCostPage.tsx`
- No math change needed (the $0 values already flow through correctly), but the Custom scenario card will display the warning sourced from the builder.

## 3. What stays the same
- Hook `useLifecycleCost` already pulls the new prices live via regex match — no change needed.
- TTD/USD formatting, billing-rhythm copy, Day-0 bundle, and the FreePlanValueCard are untouched.
- No artifact regeneration in this turn (PDF/PPTX) — say "regen artifacts" if you want v3 files.

## 4. Verification
After approval the AI will:
1. Run the data update (insert tool) and re-query the 3 rows to confirm new values.
2. Edit the 3 TS/TSX files above.
3. Spot-check `/admin/lifecycle-cost` renders: Light = `TTD $350/wk`, Standard + High-Need = `Custom quote` badges in the Optional Services row and builder dropdown.
