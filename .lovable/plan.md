

# Plan: Exclude Waived $0 Line Items for Anna + Include Subscription as Proper Line Item

## Problem
Anna's quote shows waived $0 items (Caregiver Matching & Placement, Care Assessment & Setup) which confuses her. Also, the $499 subscription isn't in the total — it appears as a separate info box.

## Changes

### 1. `src/components/admin/care-plans/DocumentGenerationMenu.tsx`

**Filter waived items for specific families**: Add an optional `hideWaivedItems` prop (boolean). When true, filter out any `approvedLineItems` where `amount === 0` and description contains `[WAIVED]` before passing to `buildDefaultCareBillingData`.

**Include subscription as line item**: Detect if any approved service selection is a subscription-type item (e.g., "Active Care Management"). If found, include its amount in the line items table so the total reflects it (e.g., $1,400 + $499 = $1,899). Update the `subscriptionRate` override to match the actual override price (e.g., "$499/week" not "$699/week").

### 2. Where Anna's DocumentGenerationMenu is rendered

Find where Anna's care plan renders `DocumentGenerationMenu` and pass `hideWaivedItems={true}`. This is likely in the admin onboarding checklist or care plan detail page.

**Approach**: Rather than hardcoding Anna's ID, add the `hideWaivedItems` prop to `DocumentGenerationMenu` and set it contextually. For now, the simplest approach: filter out $0 waived items by default (since waived items with $0 add no financial value to a client-facing quote), BUT keep a `showWaivedItems` prop that defaults to `false` for client-facing documents.

Actually, the cleaner approach per the user's request: **For Anna only** — since the user explicitly said "for all others we include all line items." So we need a per-family toggle.

**Final approach**: Add `hideWaivedItems?: boolean` prop to `DocumentGenerationMenu`. Default `false`. The admin onboarding checklist page (where Anna is managed) can pass this prop based on a checkbox or the admin's decision. For the immediate fix, we'll filter waived items in `getData()` when `hideWaivedItems` is true.

### 3. `src/services/care-plans/invoiceService.ts` — `buildDefaultCareBillingData`

- When `additionalLineItems` includes a subscription-type item (label contains "Care Management" or "Active Care Management"), extract its amount and set `subscriptionRate` to the actual price (e.g., "$499/week")
- Ensure the subscription item's amount is included in `allLineItems` so it's part of the subtotal/total calculation
- The subscription info box should still display but without duplicating the price in the total

### 4. Admin Onboarding Checklist — Add toggle for Anna

In the section where `DocumentGenerationMenu` is rendered for families, add a small checkbox: "Hide waived ($0) items on documents" that passes `hideWaivedItems` to the component. This lets the admin control per-family whether waived items appear.

## Result for Anna's Quote
- Line 1: Standard Weekly Care — Caregiver (40 hrs/wk) → $1,400.00
- Line 2: Active Care Management → $499.00 (weekly)  
- **Total: $1,899.00/week**
- No $0 waived items shown

## Result for Other Families
- All line items shown including waived ones (default behavior preserved)

## Files Modified
1. `src/components/admin/care-plans/DocumentGenerationMenu.tsx` — Add `hideWaivedItems` prop, filter logic, subscription-as-line-item logic
2. `src/services/care-plans/invoiceService.ts` — Update `buildDefaultCareBillingData` to handle subscription in line items and correct `subscriptionRate`
3. `src/pages/admin/AdminOnboardingChecklistPage.tsx` — Add "Hide waived items" toggle that passes to DocumentGenerationMenu

