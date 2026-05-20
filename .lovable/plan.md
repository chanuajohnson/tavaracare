## Goal

Enable RLS on `work_log_expenses`, `user_journey`, and `holidays` without breaking payroll calculations, expense lists, or journey tracking.

## Context discovered

- **`work_log_expenses`** — RLS OFF. 3 inert policies exist (`deny_writes_when_limited_ins/upd/del`) but **no SELECT policy**. Just flipping RLS on would make `payrollCalculationService.calculatePayrollEntry` see zero expenses and silently drop reimbursements. Columns: `id, work_log_id, category, amount, description, receipt_url, status`. Authorization derives via `work_logs.care_team_member_id` → `care_team_members.caregiver_id` (caregiver) and `care_team_members.family_id` (family).
- **`user_journey`** — RLS OFF. No policies. Columns: `id, user_id, event_type, event_data, event_timestamp`. Write-mostly analytics. `user_id` is nullable (anonymous events possible).
- **`holidays`** — RLS OFF. No policies. Columns: `id, date, name, pay_multiplier`. Reference data — frontend uses a hardcoded array, but if any read happens it should still work for authenticated users.

## Migration plan (single migration)

### 1. `work_log_expenses`
Drop the 3 stale "deny_writes" policies and replace with a full set:

- **SELECT** for `authenticated`:
  - admin via `has_role(auth.uid(),'admin')`, OR
  - caregiver who owns the work log: `EXISTS (work_logs wl JOIN care_team_members ctm ON ctm.id = wl.care_team_member_id WHERE wl.id = work_log_expenses.work_log_id AND ctm.caregiver_id = auth.uid())`, OR
  - family on the care plan: `EXISTS (... AND ctm.family_id = auth.uid())`.
- **INSERT** with check: same caregiver-owns-work-log condition AND `NOT is_account_limited(auth.uid())`. Admin bypass via `has_role`.
- **UPDATE** USING + WITH CHECK: caregiver who owns the row OR admin, AND `NOT is_account_limited`.
- **DELETE** USING: caregiver who owns the row OR admin, AND `NOT is_account_limited`.
- Then `ALTER TABLE public.work_log_expenses ENABLE ROW LEVEL SECURITY;`

### 2. `user_journey`
- **INSERT** with check `true` to `authenticated` and `anon` (event_data is non-PII analytics, user_id may be null for pre-auth events; preserves current write-mostly hook behavior).
- **SELECT** to `authenticated`: `user_id = auth.uid() OR has_role(auth.uid(),'admin')`.
- **UPDATE/DELETE** to admin only via `has_role`.
- Enable RLS.

### 3. `holidays`
- **SELECT** to `authenticated` USING `true` (reference data, non-sensitive).
- **INSERT/UPDATE/DELETE** to admin only via `has_role(auth.uid(),'admin')`.
- Enable RLS.

## Verification (after user approves + runs)

1. `select tablename, rowsecurity from pg_tables where schemaname='public' and tablename in ('work_log_expenses','user_journey','holidays');` — all `true`.
2. Re-run `security--run_security_scan` — the 4 errors for these tables clear.
3. Spot-check in preview:
   - `/dashboard/family/care-management/<plan>/payroll` — pending payroll entry that includes a reimbursement still shows `expenseTotal > 0` (proves caregiver SELECT works).
   - Caregiver adds an expense from shift card — succeeds (INSERT policy works).
   - Admin views any work log's expenses — succeeds.
   - Journey tracking still fires on dashboard navigation — no 401/403 in network tab.

## Out of scope (separate follow-ups)

- ~190 `function_search_path_mutable` warnings.
- ~10 `rls_references_user_metadata` errors (would need `get_current_user_role` rewrite).
- Auth config warnings (OTP expiry, leaked password protection).
- No changes to `pricing_catalog`, payroll calc code, or any frontend.

## Notes / risk

- Existing `deny_writes_when_limited_*` policies become redundant because the limit guard is folded into the new INSERT/UPDATE/DELETE policies. Dropping them keeps the policy set clean and prevents OR-merge surprises.
- All policies are `AS PERMISSIVE` (default). Caregiver and admin clauses are OR'd inside each policy so admins keep full access.
- No schema changes, no data changes. Pure RLS hardening.
