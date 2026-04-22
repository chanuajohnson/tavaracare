

## Plan — Fix: "Something went wrong" on `/admin/onboarding-checklist` after L3 nullable price change

### What you saw

Clicking the **Preparing Your Home** section → route-level error boundary fires with *"An error occurred in Route: /admin/onboarding-checklist"*. (Same error renders on the Family-side onboarding checklist whenever it tries to display the Care Environment service catalog.)

### Root cause (verified in 3 files)

When we set `unit_price = NULL` on the **Full Care Environment Reset** (L3) row in `billable_service_items` — to support the "Custom / month — quoted per household" model — three onboarding components still treat `unit_price` as a guaranteed `number` and call `.toFixed(2)` on it directly. Those throw `TypeError: Cannot read properties of null (reading 'toFixed')` the moment the L3 row enters the render loop, which the `RouteErrorBoundary` catches and turns into the red error card you saw.

The TypeScript interfaces also still declare `unit_price: number` (non-nullable), so the compiler didn't catch this when we made the schema column nullable.

| File | Line | Crash site |
|---|---|---|
| `src/components/admin/onboarding/ServiceSelectionBlock.tsx` | 188, 209, 253 | `effectivePrice.toFixed(2)` (when override absent) and `item.unit_price.toFixed(2)` placeholder |
| `src/components/admin/onboarding/BillingSummaryCard.tsx` | 88, 242, 243, 263, 266 | `getPrice()` multiplies null × qty; `${item.unit_price.toFixed(2)}` line-through |
| `src/components/admin/onboarding/ServiceCommencementConfirmation.tsx` | 181, 202 | `svc.unit_price.toFixed(2)` line-through; `hasDiscount` comparison |

`DocumentGenerationMenu.tsx` is already null-safe (`item?.unit_price ?? 0` on line 83) — no fix needed there.

### Fix — null-safe rendering for custom-quoted services

The contract: when `unit_price` is NULL, the SKU is **custom-quoted per household**. UI should display **"Custom"** (or the override once admin enters one), and treat the line as $0 in any totals until an override is set. No data migration, no rolling back the L3 change.

#### 1. `ServiceSelectionBlock.tsx`
- Update `BillableServiceItem.unit_price` type → `number | null`
- Line 188 — `effectivePrice = sel?.override_price ?? item.unit_price ?? null`; render badge as `"Custom"` when null, else `$X.XX`
- Line 253 — placeholder becomes `"Custom"` when `unit_price` is null
- Add a small inline hint under the override input for null-priced SKUs: *"This service is quoted per household — enter the agreed monthly amount."*

#### 2. `BillingSummaryCard.tsx`
- Update `ServiceItemWithSelection.unit_price` type → `number | null`
- Line 88 — `getPrice()` returns `0` when both `override_price` and `unit_price` are null (so totals don't NaN)
- Lines 242–243 — `effectivePrice` may be null; `hasDiscount` only true when both sides are numeric and different
- Line 263 — show line-through original only when `unit_price` is a number; line 266 prints `"Custom — pending"` when both are null, else `$X.XX`

#### 3. `ServiceCommencementConfirmation.tsx`
- Update `unit_price: number` → `number | null` in the local interface
- Line 79 — keep `effective_price: s.override_price ?? s.billable_service_items?.unit_price ?? 0`
- Line 181 — `hasDiscount` only true when `unit_price` is numeric
- Line 202 — guard `.toFixed` behind a numeric check

#### 4. (Optional polish) `CareEnvironmentIntroCard.tsx`
- No code change. Copy is already correct ("Custom / month").

### Acceptance test

1. Log in as admin → navigate to `/admin/onboarding-checklist`
2. Open any family with the Care Environment section visible → expand **Preparing Your Home** → page renders without error boundary; L3 row shows badge `Custom · monthly` (no crash)
3. Tick L3 → override input shows placeholder `Custom` and helper text *"…enter the agreed monthly amount."*
4. Type `200` in override → badge updates to `$200.00 · monthly`; BillingSummaryCard L3 row shows `$200.00`; monthly total includes $200
5. Untick L3 → page still renders; totals exclude L3
6. Open a family that already has L1+L2 selected (no L3) → behavior unchanged (regression check)
7. Navigate to `/family/onboarding-checklist` as a family user → Care Environment section renders without error
8. Service Commencement Confirmation card → L3 line (when selected) shows `Custom — pending` if no override, or `$200.00 monthly` if override set

### Files touched

| File | Change |
|---|---|
| `src/components/admin/onboarding/ServiceSelectionBlock.tsx` | Type widen + null-safe price rendering + helper text |
| `src/components/admin/onboarding/BillingSummaryCard.tsx` | Type widen + null-safe `getPrice` and ServiceRow |
| `src/components/admin/onboarding/ServiceCommencementConfirmation.tsx` | Type widen + guarded `.toFixed` |

### Out of scope
- Reverting L3 to a fixed price (Part 2 plan was approved — keep it custom-quoted)
- Changing the schema again (column stays nullable; that's the correct shape for custom-quote SKUs going forward)
- Touching `DocumentGenerationMenu.tsx` (already null-safe)
- Any `App.tsx`, routing, or registration flow changes (protected per project guardrails)

