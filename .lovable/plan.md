

## Plan: Fix Admin Care Plan Management (Shifts, Edit, Payroll)

### Problems Found

1. **Care shift creation fails for admin** — The `care_shifts` table has NO admin RLS policy. INSERT/UPDATE/DELETE policies only allow `family_id = auth.uid()`. When admin creates shifts, `family_id` is the family's ID (not admin's), so RLS blocks it.

2. **404 on "Edit" care plan details** — `PlanDetailsTab.tsx` navigates to `/family/care-management/create/${carePlan.id}` but the route is defined as `/family/care-management/create` (no `:id` param). The `useParams()` in CreateCarePlanPage reads `id` but never receives it because no route matches.

3. **Work logs / payroll inaccessible to admin** — The `work_logs` table has no admin RLS policy, so admin can't view or manage payroll/hours.

4. **Care team member management blocked for admin** — INSERT/UPDATE/DELETE on `care_team_members` only allows `family_id = auth.uid()`, blocking admin from assigning caregivers to shifts.

5. **Daily care logs INSERT blocked for admin** — Only professionals can create logs; admin has SELECT only.

---

### Changes

#### 1. Database Migration — Add admin RLS policies

Add admin ALL policies to these tables that are missing them:
- `care_shifts` — admin can manage all shifts
- `work_logs` — admin can manage all work logs
- `care_team_members` — admin can manage all team members
- `daily_care_logs` — admin can manage all logs

```sql
CREATE POLICY "Admins can manage all care shifts"
  ON public.care_shifts FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all work logs"
  ON public.work_logs FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all care team members"
  ON public.care_team_members FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all daily care logs"
  ON public.daily_care_logs FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
```

#### 2. Fix Edit route — Add `:id` param to create route

**File: `src/components/routing/AppRoutes.tsx`**

Add a second route for editing:
```
<Route path="/family/care-management/create/:id" element={<CreateCarePlanPage />} />
```
This allows `PlanDetailsTab` to navigate to `/family/care-management/create/{planId}` and have `useParams().id` resolve correctly for edit mode.

#### 3. No other frontend changes needed

`CreateCarePlanPage` already reads `useParams().id`, detects edit mode, and loads existing plan data. `CarePlanDetailPage` already has `isAdminViewing` support. The only missing pieces were the route and the RLS policies.

### Files to modify
| File | Change |
|------|--------|
| **Migration** | Add admin ALL policies on `care_shifts`, `work_logs`, `care_team_members`, `daily_care_logs` |
| `src/components/routing/AppRoutes.tsx` | Add `/family/care-management/create/:id` route for edit mode |

