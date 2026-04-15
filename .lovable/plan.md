

## Plan: Embed Pricing into Onboarding & Build Billable Services Architecture

This is a large, multi-phase initiative. I recommend implementing it in **3 phases** to avoid breaking anything and to deliver incremental value.

---

### Phase 1: Data Model & Service Items Definitions

**New database table: `billable_service_items`**

Stores the catalog of available service items:

```sql
CREATE TABLE billable_service_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL, -- setup, weekly_addon, hourly_addon, premium_support, clinical_support, care_change
  label TEXT NOT NULL,
  description TEXT NOT NULL,
  billing_type TEXT NOT NULL, -- one_time, weekly, monthly, hourly
  unit_price NUMERIC(10,2) NOT NULL,
  default_quantity INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  visible_in_quote BOOLEAN DEFAULT true,
  visible_in_invoice BOOLEAN DEFAULT true,
  visible_in_unit_economics BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

Seed data for the minimum required items:
- Care Assessment & Setup (one_time, $499)
- Caregiver Matching & Placement (one_time, $299)
- Family Care Coordination Plan (weekly, $499)
- Family Premium Coordination Plan (monthly, $2499)
- Medication Management Support (weekly, $99)
- Meal Support Upgrade (weekly, $75)
- Podiatric Care — Secondary Household Member (weekly, $349)
- Care Plan Adjustment Fee (one_time, $149)
- Urgent Care Change / Escalation (one_time, $199)
- Specialist Care Support (hourly, $45)
- Holiday / Overtime Premium (hourly, $52.50)

**New database table: `care_plan_service_selections`**

Stores which services are selected/approved for a specific care plan:

```sql
CREATE TABLE care_plan_service_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  care_plan_id UUID REFERENCES care_plans(id) ON DELETE CASCADE NOT NULL,
  service_item_id UUID REFERENCES billable_service_items(id) NOT NULL,
  selected BOOLEAN DEFAULT false,
  approved_by_family BOOLEAN DEFAULT false,
  quantity INTEGER DEFAULT 1,
  override_price NUMERIC(10,2), -- NULL means use catalog price
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(care_plan_id, service_item_id)
);
```

RLS: Admin full access; family read-only on their own care plans.

---

### Phase 2: Onboarding Copy Rewrite & Service Selection UI

**File: `src/components/admin/onboarding/onboardingSections.ts`**

Rewrite copy for all 16 sections per the user's spec. Key changes:

| Section | Copy Change Summary |
|---------|-------------------|
| Pre-Call | Add "Care Assessment & Setup" helper text; note initial case review is part of onboarding |
| Review Submissions | Add complexity note: "More complex care situations may require additional planning" |
| Platform Overview | Reframe as "Guided Activation" — included in coordination plan |
| Care Plan Review | Add care plan adjustment language; link to service selection |
| Medication Mgmt | Reframe as structured support: "may be included or added depending on plan" |
| Meal Mgmt | Add tiered language: basic vs. involved meal support |
| Daily Checklist | Add value reinforcement: "Your coordination plan ensures consistency" |
| Professional Dashboard | "Tavara supports your care team through structure and documentation" |
| Caregiver Matching | Add "matching and placement may be included or billed separately" |
| Rates & Escalation | Enhanced language for holiday/overtime/change fees/escalation |
| Next Steps | "Your coordination plan includes activation support and early follow-up" |
| Communication | "Tavara keeps everyone connected through structured updates" |
| Terms & Conditions | Add approval language for additional services and rate adjustments |
| Post-Onboarding | Add "Billing & Care Structure Summary" card items |

Add new `OnboardingSectionDef` fields:
```typescript
helperText?: string;        // info banner text for the section
serviceItemIds?: string[];  // IDs of billable services relevant to this section
```

**New component: `src/components/admin/onboarding/ServiceSelectionBlock.tsx`**

A reusable block that renders within relevant onboarding sections showing:
- Checkboxes for each relevant service item
- Label, description, billing type, price
- Toggle for "approved by family"
- Optional notes field
- Reads from `billable_service_items` catalog, writes to `care_plan_service_selections`

**New component: `src/components/admin/onboarding/BillingSummaryCard.tsx`**

Displayed in Post-Onboarding Summary section:
- Lists all selected/approved services grouped by billing type
- Shows frequency, unit price, and totals
- Displays projected weekly and monthly totals
- Styled as an organized service summary (not a shopping cart)

**New component: `src/components/admin/onboarding/ServiceCommencementConfirmation.tsx`**

Before approval, shows:
- Care recipient name
- Schedule summary
- Selected plan
- All approved services with rates
- Billing cadence
- Note that changes will be discussed before implementation

---

### Phase 3: Integration with Documents & Unit Economics

**File: `src/services/care-plans/invoiceService.ts`**

Update `buildDefaultCareBillingData` to:
- Accept selected service items as input
- Dynamically build `lineItems` from approved `care_plan_service_selections`
- Replace hardcoded podiatry toggle with dynamic service item list

**File: `src/components/admin/care-plans/DocumentGenerationMenu.tsx`**

- Replace hardcoded podiatry checkbox with dynamic list from `care_plan_service_selections`
- Fetch approved services for the care plan and pass to `buildDefaultCareBillingData`

**File: `src/hooks/admin/useUnitEconomics.ts`**

Update revenue calculation:
- Fetch `care_plan_service_selections` joined with `billable_service_items` for each care plan
- Calculate revenue as: `hourly care revenue + sum of selected weekly items + sum of selected monthly items + one-time items (for applicable period)`
- Add new fields to `ClientEconomics`: `selectedServiceRevenue`, `serviceBreakdown[]`

**File: `src/components/admin/UnitEconomicsTable.tsx`**

- Add "Service Revenue" breakdown in expanded row showing each approved service item
- Total revenue becomes dynamic: caregiver wages + all selected services

---

### Files Modified/Created

| File | Action |
|------|--------|
| `supabase/migrations/new.sql` | Create `billable_service_items` and `care_plan_service_selections` tables with RLS |
| `src/components/admin/onboarding/onboardingSections.ts` | Rewrite all section copy, add `helperText` and `serviceItemIds` fields |
| `src/components/admin/onboarding/ServiceSelectionBlock.tsx` | **New** — service checkbox UI |
| `src/components/admin/onboarding/BillingSummaryCard.tsx` | **New** — approved services summary |
| `src/components/admin/onboarding/ServiceCommencementConfirmation.tsx` | **New** — pre-approval confirmation |
| `src/pages/admin/AdminOnboardingChecklistPage.tsx` | Integrate `ServiceSelectionBlock` into relevant sections, add `BillingSummaryCard` to post-onboarding |
| `src/pages/family/FamilyOnboardingChecklistPage.tsx` | Show approved services summary (read-only) |
| `src/services/care-plans/invoiceService.ts` | Dynamic line items from service selections |
| `src/components/admin/care-plans/DocumentGenerationMenu.tsx` | Replace hardcoded podiatry with dynamic services |
| `src/hooks/admin/useUnitEconomics.ts` | Dynamic revenue from service selections |
| `src/components/admin/UnitEconomicsTable.tsx` | Show service revenue breakdown |

### What Remains Included (Not Separately Monetized)
- Platform access and dashboard
- Guided onboarding walkthrough
- Daily care checklist/SOP system
- Communication and notification tools
- Basic care supplies guidance
- Professional dashboard access
- Early follow-up support

### Technical Notes
- The `billable_service_items` table acts as a catalog — admins can add/edit items over time
- `care_plan_service_selections` is the per-client selection record
- Copy changes use warm, premium language per Tavara brand principles
- No existing onboarding checklist logic is removed — this enhances it with a service selection layer
- The subscription rate in `invoiceService.ts` ($199.99) appears outdated vs the $499/wk Family Care plan — this will be corrected as part of the document integration

