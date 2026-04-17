

## Plan: Surface "what was paid / received" on Family + Professional sides

### What exists today
- **Family side** (`/family/care-management/:id` → "Care Payments & Hours" tab) is the **authoritative hub** — already shows Work Logs, Care Payments (with Paid/Pending status, bank transfer ref, receipts), and NIS Reports. Nothing more is needed here. The recent receipt download (smart filename) flows from this tab.
- **Family Documents tab** (separate) generates Quotes / Invoices / Receipts for **family→Tavara** subscription billing — a different concept.
- **Professional Profile Hub** (`/professional/profile`) currently has tabs: **Schedule · Medications · Meal Planning · Admin Assist · Documents · References**. There is no surface where the caregiver sees "what was paid to me, when, and the receipt".

### What you actually asked for
1. **Caregiver (professional) side**: a new tab AFTER Schedule on the Profile Hub showing **payments received by the caregiver** (their care payments + receipts). Must NOT show what the family paid Tavara — only what the caregiver was paid.
2. **Family side**: confirm/clarify where this lives. Already exists at care-plan → "Care Payments & Hours". No new tab needed unless you want a roll-up across all care plans.

### Concrete changes

#### 1. NEW caregiver tab: "Care Payments" on Professional Profile Hub
**File**: `src/components/professional/profile/CarePlanTabs.tsx`
- Insert a new tab between `schedule` and `medications`:
  ```
  Schedule | Care Payments | Medications | Meal Planning | Admin Assist | Documents | References
  ```
- `value: "care-payments"`, icon `Receipt` (from lucide-react), label "Care Payments".
- Update `gridCols`: `grid-cols-7` when care plans visible (was 6), `grid-cols-3` otherwise (unchanged).
- Add new `<HorizontalTabsContent value="care-payments">` rendering a NEW component `<ProfessionalPayrollView carePlanId={selectedCarePlanId} />`.

#### 2. NEW component: `src/components/professional/profile/ProfessionalPayrollView.tsx`
A **read-only, caregiver-scoped** view of payment activity for the selected care plan. It will:
- Fetch `payroll_entries` filtered by:
  - `care_plan_id = selectedCarePlanId`
  - `care_team_member_id` belonging to the **logged-in professional** (resolved via `care_team_members` where `caregiver_id = user.id`).
- Reuse the existing `PayrollEntriesTable` in a **read-only mode** — pass new prop `readOnly={true}` to hide:
  - Bulk delete / undo / recalculate / record bank transfer / mark paid actions
  - Status edit controls
- Keep visible: Caregiver/Period · Hours · Gross Amount · NIS (Employee) · NIS (Employer) · Net Amount · Status badge · **Receipt action (view/download)**.
- Add a small header: *"Payments received for [care plan title]. This is what has been paid (or is pending payment) to you for shifts on this care plan."*
- Empty state: *"No care payments yet for this care plan."*

#### 3. Tiny extension to `PayrollEntriesTable.tsx`
- Add optional `readOnly?: boolean` prop. When true:
  - Hide selection checkboxes, bulk action toolbar, "Record Monthly Bank Transfer", "Process Payment", "Undo Payment", "Recalculate NIS", "Delete" controls.
  - Keep: row expansion, NIS breakdown, Receipt download dropdown (caregiver wants to download their own receipt).
- Default `readOnly = false` → existing family/admin behavior unchanged.

#### 4. Family side — NO new tab
The family already has the full "Care Payments & Hours" tab on each care plan page. Confirmed: this surface already shows everything needed (paid status, bank transfer ref, receipt download with the new smart filename). No changes here.

> If you later want a **cross-care-plan rollup** for families with multiple plans (e.g. on `/family/care-management`), that would be a separate small card. Not in this scope unless you confirm.

### Visual placement (Professional Profile Hub)

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Schedule │ Care Payments │ Medications │ Meal Planning │ Admin │ Docs │ Refs │
└─────────────────────────────────────────────────────────────────────────┘
            ↑ NEW TAB
   ┌────────────────────────────────────────────────────────────┐
   │ Care Payments — [Care plan for Mum]                        │
   │ Payments received for shifts on this care plan.            │
   │                                                             │
   │ ▾ April 2026  (1 week)   40h   $1400   $75.30   $1324.70  │
   │   denise Narcis  Apr 13–19, 2026  · 5 entries   [paid]    │
   │   [📄 Receipt ▾]                                           │
   └────────────────────────────────────────────────────────────┘
```

### Privacy guardrail (critical)
- The query is **filtered by the logged-in caregiver's `care_team_member_id`** at the data layer — caregivers can never see other caregivers' payments on the same care plan.
- The view shows ONLY caregiver-relevant columns (their pay). It does NOT show:
  - What the family pays Tavara in subscription/coordination fees
  - Other caregivers' rates or amounts
  - Family billing documents (Quotes/Invoices)
- Matches the existing `mem://admin/care-log-visibility-logic` privacy pattern (caregivers see only their own log activity).

### Files touched
1. `src/components/professional/profile/CarePlanTabs.tsx` — add new tab + content
2. `src/components/professional/profile/ProfessionalPayrollView.tsx` — **NEW**
3. `src/components/care-plan/payroll/PayrollEntriesTable.tsx` — add optional `readOnly` prop, gate destructive controls

### Out of scope
- Cross-care-plan rollup on family `/family/care-management` (can add later)
- Showing family→Tavara subscription receipts inside the caregiver view (correctly excluded — that's family-private)
- Notifications/badges for "new payment received" (separate feature)
- Any changes to receipt PDF content or filename logic (already complete)

### What stays the same
- ✅ Family-side "Care Payments & Hours" tab — untouched, fully functional
- ✅ Existing Documents tab (Quote/Invoice/Receipt for family billing) — untouched
- ✅ All payroll DB fields, NIS forms, receipt generation — untouched
- ✅ Routes, auth, navigation — untouched

