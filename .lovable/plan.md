

# Fix: Subscription Must Appear as Line Item with Correct Total

## Current Problem (from screenshot)
The quote shows only ONE line item (Standard Weekly Care — $1,400) with total $1,400. The subscription "Active Care Management" appears as a separate purple info box showing **$699/week** (ignoring the $499 override) and is **NOT included in the total**. This is wrong.

## Root Cause
Two issues in `invoiceService.ts`:

1. **The subscription info box duplicates the line item** — `buildSubscriptionSection()` renders a visual-only box with `$699/week` (default) even when the subscription is detected at $499 from approved services. This box is shown BELOW the table and confuses the total.

2. **The subscription detection may not fire** — if the `description` from `DocumentGenerationMenu` includes `[Discounted from $699.00]`, the detection works, but the subscription info box STILL renders separately with the wrong rate, creating a visual disconnect.

## Fix

### `src/services/care-plans/invoiceService.ts`

1. **Remove the standalone subscription info box from quotes/invoices** — since the subscription is now a proper line item in the table, `buildSubscriptionSection()` should only show the "Includes:" details as a subtle note beneath the table (no separate price display that contradicts the line item).

2. **Ensure the subscription line item shows clean label** — strip `[Discounted from ...]` and `[WAIVED ...]` annotations from the subscription line item description when it appears in the PDF table. Show it as: `Active Care Management — Care Coordination` with amount `$499.00` and note `(weekly)`.

3. **Verify total calculation** — `allLineItems` already sums correctly in the code, so this is about making sure the subscription IS in `allLineItems`. Add a console.log guard to verify during generation.

### `src/components/admin/care-plans/DocumentGenerationMenu.tsx`

No changes needed — the subscription item flows correctly from `approvedLineItems` through `additionalLineItems`.

## Expected Result for Anna
| Description | Hours | Rate | Amount |
|---|---|---|---|
| Standard Weekly Care — Caregiver (40 hrs/wk) | 40 hrs/wk | $35.00/hr | $1,400.00 |
| Active Care Management — Care Coordination | — | — | $499.00 |
| **Subtotal** | | | **$1,899.00** |
| **Total (TTD)** | | | **$1,899.00** |

Below the table: a subtle note listing what the subscription includes (coordinator, replacement guarantee, etc.) — no separate price box.

## Files Modified
1. `src/services/care-plans/invoiceService.ts` — Clean subscription label in line items, change `buildSubscriptionSection` to show only "Includes" without price, verify total

