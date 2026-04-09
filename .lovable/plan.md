

## Admin Care Plan Management for Families (Bidirectional Editing with Notifications)

### Context
Currently, care plans can only be created/edited by the family user whose `auth.uid()` matches `family_id` on the `care_plans` table. The RLS policy is `family_id = auth.uid()`. The same pattern applies to `medications` and `meal_plans`. This means admins cannot create or edit care plans on behalf of families.

### What Changes

#### 1. Database: RLS Policy Updates
Add admin access to the key tables so admins can create/edit on behalf of any family:

**`care_plans`** -- Currently only `family_owns_care_plans` (`family_id = auth.uid()`):
```sql
-- Keep existing family policy
-- Add admin full access
CREATE POLICY "admins_manage_all_care_plans" ON care_plans
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

**`medications`** -- Add admin policies for SELECT, INSERT, UPDATE, DELETE.

**`meal_plans`** -- Add admin policy for ALL.

**`medication_administrations`** -- Add admin SELECT policy if not present.

#### 2. Database: Care Plan Edit Log Table
Track who edited what, so both parties are informed:
```sql
CREATE TABLE care_plan_edit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  care_plan_id uuid REFERENCES care_plans(id) ON DELETE CASCADE NOT NULL,
  edited_by uuid REFERENCES profiles(id) NOT NULL,
  editor_role text NOT NULL, -- 'admin' or 'family'
  edit_type text NOT NULL, -- 'care_plan', 'medication', 'meal_plan'
  edit_summary text NOT NULL,
  created_at timestamptz DEFAULT now()
);
-- RLS: family sees edits for their plans, admins see all
```

#### 3. Admin UI: Family Care Plan Manager Page
New page at `/admin/family-care-plans`:
- **Family selector dropdown** listing all registered families (from `profiles WHERE role = 'family'`)
- Once a family is selected, show their existing care plans (or "No care plans yet")
- **"Create Care Plan for Family"** button that opens the existing `CreateCarePlanPage` form but sets `family_id` to the selected family's ID instead of `auth.uid()`
- **View/Edit** links for each existing care plan that navigate to `/family/care-management/{planId}` (reusing the existing detail page)
- Quick links to medication management and meal management for each plan

#### 4. CreateCarePlanPage: Accept `familyId` Override
Modify `CreateCarePlanPage.tsx` to accept an optional `familyId` query parameter:
- If `?familyId=xxx` is present and the current user is admin, use that ID as `family_id` in the care plan creation
- If no override, use `user.id` as before (family self-service)
- Log the creation in `care_plan_edit_log`

#### 5. CarePlanDetailPage: Admin Access
The existing detail page already works if the user can read the care plan. With the new RLS policy, admins will automatically see and edit all care plans. Add:
- A banner at the top when admin is viewing: "You are managing this care plan on behalf of [Family Name]"
- On save/edit of any tab (medications, meals, plan details), log the edit in `care_plan_edit_log`

#### 6. Family-Side: Edit Notifications
On the family's care management page and care plan detail page:
- Query `care_plan_edit_log` for recent admin edits
- Show a notification badge/banner: "Admin updated your care plan on [date]: [summary]"
- This gives the family awareness of changes without requiring a separate notification system

#### 7. Admin Dashboard: Quick Link
Add a "Manage Family Care Plans" card to `AdminDashboard.tsx` linking to `/admin/family-care-plans`.

### Files Changed

| File | Change |
|------|--------|
| New migration | Add admin RLS policies to `care_plans`, `medications`, `meal_plans`; create `care_plan_edit_log` table with RLS |
| `src/pages/admin/AdminFamilyCarePlansPage.tsx` | **New** -- family selector + care plan list + create/edit links |
| `src/pages/admin/AdminDashboard.tsx` | Add quick link card to family care plan management |
| `src/components/routing/AppRoutes.tsx` | Add route `/admin/family-care-plans` |
| `src/pages/family/care-management/CreateCarePlanPage.tsx` | Accept `familyId` query param for admin override |
| `src/pages/family/care-management/CarePlanDetailPage.tsx` | Show admin banner when admin is viewing; log edits |
| `src/pages/family/care-management/CareManagementPage.tsx` | Show recent admin edit notifications from `care_plan_edit_log` |
| `src/services/care-plans/carePlanService.ts` | Add `logCarePlanEdit()` helper function |

### What This Enables
- Admin selects Anna Maria's family, creates her care plan, adds medications and meals -- all show up immediately on her side
- Anna Maria logs in and sees the care plan as if she created it; she can edit it freely
- When Anna Maria edits, admin sees a notification of what changed
- When admin edits, Anna Maria sees a notification of what changed
- Same flow works for any future family onboarding

### What This Does NOT Change
- Family self-service flow (families can still create their own plans)
- Professional access patterns (care team members still access via their existing policies)
- Registration flows
- Navigation structure (no existing routes modified)

