Today both banners pick a single record:
- `PaymentRecordsBanner` (family) loads only the most recent `care_plans` row and renders one ticker.
- `ProfessionalPaymentRecordsBanner` picks the first `care_team` assignment from `useUnifiedMatches` and renders one ticker.

A caregiver can be on multiple care plans, and a family can have multiple plans. We need both banners to render one ticker per care plan, clearly labeled with the plan (and family, on the professional side).

### Family side — `src/components/family/dashboard/PaymentRecordsBanner.tsx`
1. Fetch ALL care plans for the user (`select id, title, status` from `care_plans` where `family_id=user.id`, ordered by `created_at desc`).
2. Render one `<PaymentMilestoneTicker />` per care plan with:
   - `carePlanId={plan.id}` (so payments are filtered per plan)
   - `title={\`Your payment records — ${plan.title}\`}` (fallback to "Untitled care plan")
3. Keep the onboarding-checklist milestone fetch as-is (one row per family) and pass the same `milestoneDates` to each ticker. (Plan-level milestones aren't tracked separately yet — out of scope.)
4. If the family has zero care plans, render a single ticker with `carePlanId={null}` and the existing title to preserve current behavior.
5. Continue returning null until resolved.

### Professional side — `src/components/professional/ProfessionalPaymentRecordsBanner.tsx`
1. Switch from "pick first care_team assignment" to "list all assignments that have a `care_plan_id`" using the existing `useUnifiedMatches('professional')` data (`assignments` already includes `assignment_type`, `family_user_id`, `care_plan_id`, `family_name`, `care_plan_title`).
2. For each such assignment, fetch the family's `onboarding_checklists.checked_items` once per `family_user_id` (memoized in a `Map<familyUserId, milestoneDates>`) to avoid duplicate calls.
3. Render one `<PaymentMilestoneTicker />` per assignment with:
   - `familyUserId={assignment.family_user_id}`
   - `carePlanId={assignment.care_plan_id}`
   - `mode="family"` (read-only)
   - `title={\`Family payment records — ${assignment.family_name}${assignment.care_plan_title ? ' · ' + assignment.care_plan_title : ''}\`}`
   - `milestoneDates={milestonesByFamily.get(family_user_id)}`
4. Render nothing if there are zero assignments with a `care_plan_id` (matches today's null behavior when there's no care_team assignment).

### Files touched
- `src/components/family/dashboard/PaymentRecordsBanner.tsx`
- `src/components/professional/ProfessionalPaymentRecordsBanner.tsx`

No DB changes, no shared component changes — `PaymentMilestoneTicker` already supports per-plan filtering via its `carePlanId` prop.

### Verification
- Tricia (professional, 1 active care_team assignment to family `7d850934`, plan `4848aec5`): sees one ticker labeled with that family + plan title.
- Family with 2 care plans: sees two tickers, each labeled with the plan title and showing only that plan's payments.
- Family/professional with no plans: same as today (null or single fallback).