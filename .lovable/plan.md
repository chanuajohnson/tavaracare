

## Plan: Fix Ana Maria's economics + Plan label rename

### What's actually happening for Ana (DB-confirmed)

- Subscription row: plan = **"Family Care"** at **$499** (a legacy monthly plan, not weekly)
- Service selections on her care plan include:
  - ✅ "Active Care Management" — `weekly` @ $499 override (this is double-billing — her $499 sub already IS this)
  - ✅ 3 one-time setup fees (Care Assessment, Caregiver Matching, Care Readiness)
- Hook bug 1 — `getWeeklySubscriptionRevenue()` line 92: matches "care" in "Family Care" → returns hard-coded **$699/wk**, ignoring the actual $499 price which is a **monthly** amount. So Sub/mo shows $699 instead of $499.
- Hook bug 2 — Active Care Management service selection contributes $499 to Svc Rev/mo, double-counting the subscription.

### Three fixes

**1. Treat "Family Care" $499 as a flat monthly legacy plan**
In `src/hooks/admin/useUnitEconomics.ts` `getWeeklySubscriptionRevenue()`:
- Add explicit case: if `name === 'family care'` → treat `price` as **monthly** flat → return `price / 4.33` weekly so monthly math = $499 exactly.
- Reorder checks so this matches BEFORE the generic "care/active" → $699 fallback.
- Keep current "Care" tier ($699/wk) and "Premium" tier ($899/wk) for new-style subscriptions.

**2. Rename Plan label in the table to the meaningful service**
The "Plan" column currently shows the raw subscription_plans.name ("Family Care"). Change `subscriptionPlan` resolution to a **friendly label**:
- If plan name === "Family Care" (legacy $499) → display **"Active Care Management"** in the table.
- If plan name contains "premium" → display "Premium Care Management".
- If plan name contains "care" / "active" (new tier) → display "Active Care Management".
- Otherwise pass through the raw name.
- Implemented as small `friendlyPlanLabel(name)` helper in the hook so both the table chip and the tooltip use the same label.

**3. Suppress the duplicate "Active Care Management" service line for Ana (and any future legacy $499 family)**
Two options — recommend (a):
- (a) **Filter rule in the hook**: when subscription is the legacy "Family Care" $499 plan AND a selected service has label "Active Care Management", **skip it from `monthlyServiceRevenue` and `serviceBreakdown`** (it would be double-counted). Add an inline console.warn so admins can see the suppression.
- (b) Manually deselect that row in care_plan_service_selections — but this would happen again on any other legacy family.

→ Going with (a) — code-level guardrail, no DB write, applies forever.

### Files

| File | Change |
|---|---|
| `src/hooks/admin/useUnitEconomics.ts` | (1) Fix `getWeeklySubscriptionRevenue` — explicit "Family Care" legacy case returning `price / 4.33`. (2) Add `friendlyPlanLabel()` helper, set `subscriptionPlan` to the friendly label. (3) Skip "Active Care Management" service line when sub is legacy Family Care. |

### Expected result for Ana (April 2026)

- Plan column → **"Active Care Management"** (was "Family Care")
- Sub/mo → **$499** (was $699)
- Svc Rev/mo → **$0** (was $499) — duplicate suppressed
- Revenue/mo → **$1,899** ($499 sub + $1,400 caregiver fees) (was $2,598)
- Status / margin recalculate accordingly with fewer phantom dollars

No DB writes required. Pure hook-level fix. Chanua/Peltier unaffected (different plan).

