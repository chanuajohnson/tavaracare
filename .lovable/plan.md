

## Plan: Smart Caregiver Rate Selector in Admin Onboarding Checklist

### Problem
There is no UI to **set** a family's caregiver hourly rate. The Care Summary Header reads `checkedItems["care_rate"]` but nothing writes to it. Additionally, the rate selector needs to be "smart" — aligned with the family's selected shift schedule and the platform's rate tiers — and must support legacy rates like Anna Maria's $35/hr that predate current pricing.

### Design

The rate selector will be embedded in the **"Rates, Care Changes & Escalation"** section, just above the `RateTierReferenceCard`. It will:

1. **Show the family's active shift schedule** (read from their profile's `care_schedule` field) so the admin sees context like "Mon-Fri 8 AM - 4 PM (8 hrs/day × 5 days = 40 hrs/wk)"
2. **Offer rate options** aligned with current tiers plus a legacy option:
   - `$35/hr (Legacy)` — for families onboarded before rate updates
   - `$40/hr (Standard)` — current standard tier
   - `$45/hr (Full Service)` — current full service tier
   - `$50+/hr (Premium)` — current premium tier
   - `Custom` — free-text input for edge cases
3. **Save to `checkedItems["care_rate"]`** via the existing upsert mechanism (auto-persists to `onboarding_checklists.checked_items`)
4. **Calculate and display weekly caregiver labor** based on selected rate × hours from shift schedule
5. **Flow downstream** into:
   - Care Summary Header (already reads `care_rate`)
   - BillingSummaryCard projected totals (add caregiver labor line)
   - DocumentGenerationMenu quote/invoice (add nursing line item)
   - PDF reports (already reads `care_rate`)

### How Anna Maria Is Protected
- Admin selects "$35/hr (Legacy)" for Anna
- All downstream displays show $35/hr — the $40/$45 tiers never appear in her documents
- Her quote shows: "Standard Weekly Care — Nursing (40 hrs/wk) × $35.00/hr = $1,400.00"
- Her projected weekly total = $499 (Active Care Management) + $1,400 (nursing) = $1,899/wk

### File Changes

**1. `src/pages/admin/AdminOnboardingChecklistPage.tsx`**

- Add `CaregiverRateSelector` inline component rendered inside the `rates_and_changes` section (before `RateTierReferenceCard`)
- Reads the family's `care_schedule` from the profile data to show shift context
- Select dropdown with rate options; on change, saves to `checkedItems["care_rate"]` and triggers `saveFamilyToSupabase`
- Shows calculated weekly hours and projected weekly caregiver cost

**2. `src/components/admin/onboarding/BillingSummaryCard.tsx`**

- Accept optional `careRate` prop (string like "$35/hr (Legacy)")
- Parse hourly rate number from string
- Accept optional `weeklyHours` prop (calculated from shift schedule)
- Add "Caregiver Weekly Labor" row to projected totals section
- Update projected weekly and monthly totals to include caregiver labor

**3. `src/components/admin/care-plans/DocumentGenerationMenu.tsx`**

- Accept optional `careRate` and `weeklyHours` props
- When building line items with `additionalLineItems`, also append a "Standard Weekly Care — Nursing" line item using the rate and hours
- This ensures quotes/invoices include the nursing cost alongside the care management fee

**4. `src/services/care-plans/invoiceService.ts`**

- No structural changes needed — the nursing line item will be passed via `additionalLineItems` from `DocumentGenerationMenu`

### Rate-Shift Alignment Logic
```text
Shift → Hours/day → Days/week → Weekly hours

mon_fri_8am_4pm  → 8 hrs × 5 days = 40 hrs/wk
mon_fri_8am_6pm  → 10 hrs × 5 days = 50 hrs/wk
mon_fri_6am_6pm  → 12 hrs × 5 days = 60 hrs/wk
sat_sun_8am_4pm  → 8 hrs × 2 days = 16 hrs/wk
weekday_evening_4pm_8am → 16 hrs × 5 days = 80 hrs/wk
(etc — derived from shiftTimeMapping.ts)
```

Admin sees: "Active shift: Mon-Fri 8am-4pm (40 hrs/wk) → Rate: $35/hr → Weekly labor: $1,400"

### Files Modified
1. `src/pages/admin/AdminOnboardingChecklistPage.tsx` — Add rate selector UI
2. `src/components/admin/onboarding/BillingSummaryCard.tsx` — Include caregiver labor in totals
3. `src/components/admin/care-plans/DocumentGenerationMenu.tsx` — Pass rate into quote/invoice line items

