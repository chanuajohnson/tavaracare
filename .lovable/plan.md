
Problem 1 is now clear: the remaining “Unknown” is not caused by the profile fallback anymore. It is caused by the wrong data source plus RLS.

What I verified
- The “Work Logs” card in the professional hub routes to:
  `src/components/professional/profile/ActionCardsGrid.tsx`
  → `/family/care-management/${carePlanId}?tab=schedule&from=professional`
- That page is the family care-plan detail page shown in professional context:
  `src/pages/family/care-management/CarePlanDetailPage.tsx`
- Its Schedule tab uses:
  `src/hooks/useCarePlanData.tsx`
  which loads:
  - `fetchCareTeamMembers(carePlanId)`
  - `fetchCareShifts(carePlanId)`
- The visible caregiver name in that schedule comes from:
  `src/components/care-plan/ShiftCalendar.tsx`
  which does:
  `careTeamMembers.find(m => m.caregiverId === shift.caregiverId)?.professionalDetails?.full_name || "Unknown"`

Why Denise still shows as Unknown
- The earlier fix only helped when a `care_team_members` row is returned but its joined `profiles` data is blocked.
- In the professional view, the bigger problem is that Denise’s teammate row may not be returned at all.
- Current RLS on `care_team_members` only allows select when:
  - `family_id = auth.uid()`
  - or `caregiver_id = auth.uid()`
  - or admin
- So when Tricia opens the family-style care plan page, she can usually see only her own `care_team_members` row, not Denise’s row.
- That exactly matches the screenshot:
  - the page can still show shifts
  - but the roster used by `ShiftCalendar` is incomplete
  - so Denise’s `shift.caregiverId` cannot be matched
  - result: “Unknown”

Why the professional calendar can still show names
- `src/hooks/useCarePlanShifts.tsx` resolves caregiver names directly from shift/profile data plus RPC fallback.
- That flow does not depend on the family page’s limited `careTeamMembers` roster in the same way.
- So one part of the app works while the family-style schedule page in professional mode still fails.

Implementation plan

1. Fix the backend visibility gap for same-plan teammates
- Add a safe backend path so an assigned professional can read the public roster for their care plan teammates.
- Best approach: add a `SECURITY DEFINER` RPC such as:
  `get_professional_care_plan_team_members(plan_id uuid)`
- It should only return safe public fields:
  - care team member id
  - care_plan_id
  - caregiver_id
  - role
  - status
  - full_name
  - professional_type
  - avatar_url
  - phone_number if allowed
- It must verify the current user is an active caregiver on that same care plan before returning teammates.
- This avoids weakening `care_team_members` globally.

2. Update the professional-facing schedule route to use the teammate-safe source
- In `src/hooks/useCarePlanData.tsx`, detect professional-context access from the page query/prop flow, or pass a dedicated flag down from `CarePlanDetailPage`.
- When opened with `from=professional`, load team members through the new teammate RPC instead of the normal family-only `fetchCareTeamMembers`.
- Keep the family/admin path unchanged.

3. Make the schedule UI resilient even if roster data is partial
- Update `src/components/care-plan/ShiftCalendar.tsx` so caregiver display resolves in this order:
  1. matching care team member name
  2. shift-level caregiver details if present
  3. dedicated resolver/RPC lookup by caregiverId
  4. “Unassigned” only when there is no caregiverId
  5. “Unknown” only as final fallback
- This prevents assigned shifts from immediately degrading to Unknown when the roster is incomplete.

4. Remove duplicate/legacy professional team-member fetching
- `src/pages/professional/ProfessionalProfileHub.tsx` has its own local `fetchCareTeamMembers` implementation that still uses direct joins and no teammate-safe backend path.
- Refactor it to use the same shared service/RPC so the professional area has one consistent name-resolution path.

5. Add Trinidad & Tobago NIS integration securely
- Do not call the Nuacha API directly from the browser with the provided API key.
- Add a Supabase Edge Function in this project to proxy the request securely to:
  `https://fjrxqeyexlusjwzzecal.supabase.co/functions/v1/payroll-api`
- Store the external API key as an edge-function secret.
- Create a reusable server-side helper for:
  - `calculate-nis`
  - `get-nis-classes`

6. Record NIS values in payroll entries
- Add a migration for `payroll_entries` to store NIS results, for example:
  - `nis_applicable boolean`
  - `nis_class text`
  - `employee_contribution numeric`
  - `employer_contribution numeric`
  - `gross_pay numeric`
  - `net_pay_after_nis numeric`
  - optional `nis_response jsonb`
- Keep current `total_amount` behavior explicit:
  - either preserve it as gross pay
  - or standardize it during the update and adjust UI consistently
- I will keep this aligned in code and labels so there is no ambiguity.

7. Calculate NIS when approving work logs
- Update `src/services/care-plans/work-logs/approvalService.ts`
- After payroll totals are calculated, call the new edge function with weekly earnings.
- Insert the returned NIS values into `payroll_entries` at creation time.
- If the API fails, handle it safely:
  - do not silently invent values
  - show a clear error or mark NIS calculation unavailable
  - avoid generating a misleading payslip

8. Show NIS on payroll receipts/payslips
- Update:
  - `src/services/care-plans/receiptService.ts`
  - `src/components/care-plan/payroll/PayrollEntriesTable.tsx` if needed
- Receipt/payslip should show:
  - gross pay
  - employee NIS deduction
  - net pay after NIS
  - employer NIS contribution as employer liability
- If not applicable:
  - show `NIS: Not applicable (weekly earnings ≤ $200)`

Technical notes
- No protected routing or registration files need to be touched.
- This does require a database migration plus an edge function.
- The current bug cannot be fully fixed in frontend-only code because the missing teammate row is blocked before it reaches the app.
- Best security choice for the Nuacha integration is edge function + secret, not client-side fetch.

Files likely to change
- `src/pages/family/care-management/CarePlanDetailPage.tsx`
- `src/hooks/useCarePlanData.tsx`
- `src/components/care-plan/ShiftCalendar.tsx`
- `src/pages/professional/ProfessionalProfileHub.tsx`
- `src/services/care-plans/team/fetchServices.ts`
- `src/services/care-plans/work-logs/approvalService.ts`
- `src/services/care-plans/receiptService.ts`
- `src/services/care-plans/types/workLogTypes.ts`
- `src/integrations/supabase/types.ts` will update automatically from schema changes; I will not edit it manually
- new edge function under `supabase/functions/`
- new migration under `supabase/migrations/`

Verification after implementation
1. Log in as Tricia
2. Open Professional Profile Hub
3. Open “Care plan for Mum” from Work Logs
4. Confirm Monday–Friday 8–4 now shows Denise Narcis instead of Unknown
5. Confirm Peltier plan still shows Angela correctly
6. Approve a work log and verify NIS is calculated and stored
7. Generate a payslip and confirm:
   - gross pay
   - employee NIS deduction
   - employer NIS liability
   - net pay after NIS
   - “Not applicable” message when weekly earnings are ≤ $200
