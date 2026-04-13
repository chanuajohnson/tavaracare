

## Plan: Professional Approval RLS Fix + Admin Care Plan Access + Care Logs Visibility

### Summary
Three interconnected issues to resolve:

1. **Professional digital signature not persisting** — RLS blocks UPDATE on `professional_onboarding_checklists`
2. **Admin cannot manage care plans on behalf of families** — no admin route to access a family's care plan management (schedule, shifts, team assignments)
3. **Care Logs tab needs to be more visible on the family care plan page** — already exists as "Daily Logs" tab but user wants it more prominent with medication administrations included

---

### Change 1: Add UPDATE RLS policy for professionals on their own onboarding checklists

**Migration required**

Currently `professional_onboarding_checklists` has:
- `Admins can manage...` (ALL)
- `Professionals can view own...` (SELECT only)

Missing: UPDATE policy so professionals can save their digital approval. This is exactly why Tricia's "Approved" toast appeared but the data never persisted.

```sql
CREATE POLICY "Professionals can update own onboarding checklist"
  ON public.professional_onboarding_checklists
  FOR UPDATE
  TO authenticated
  USING (professional_id = auth.uid())
  WITH CHECK (professional_id = auth.uid());
```

### Change 2: Show professional's approval status on admin onboarding checklist

**File: `src/pages/admin/AdminOnboardingChecklistPage.tsx`**

The Professional Feedback Summary card already reads `professional_approval_confirmed` from `profCheckedItems`. Once the RLS fix above is applied, the professional's self-approval will persist and the admin will automatically see it — including the date and "by Admin" vs self-signed distinction. No frontend change needed for this part.

### Change 3: Admin access to manage care plans on behalf of a family

**File: `src/components/admin/UserDetailModal.tsx`**

Add a "Manage Care Plans" button in the family user's Profile tab that navigates the admin directly to `/family/care-management/{carePlanId}`. The CarePlanDetailPage already has `isAdminViewing` support (detects admin via `user_roles` table and shows an info banner).

Steps:
- Fetch the family's care plans (`care_plans` where `family_id = user.id`)
- Display each care plan as a clickable link: "View [Plan Title]" → navigates to `/family/care-management/{planId}`
- If no care plans exist, show a "Create Care Plan" button → `/family/care-management/create` (admin creates on behalf)

This gives admin full access to schedule, shifts, team, medications, meals, daily logs — everything the family sees.

### Change 4: Enhance Daily Logs tab on family care plan with medication administrations

**File: `src/components/care-plan/DailyCareLogsTab.tsx`**

Currently shows only `daily_care_logs` records. Add a medication administration section at the top (similar to the DailyCareQuickView component pattern):
- Fetch recent `medication_administrations` joined through `medications` → `care_plans`
- Display med name, dosage, time, administered by (name + role)
- This makes the existing "Daily Logs" tab a comprehensive care log viewer

---

### Files to modify

| File | Change |
|------|--------|
| **Migration** | Add UPDATE policy on `professional_onboarding_checklists` for professionals |
| `src/components/admin/UserDetailModal.tsx` | Add "Manage Care Plans" links in family Profile tab with direct navigation to care plan detail pages |
| `src/components/care-plan/DailyCareLogsTab.tsx` | Add medication administration history section alongside daily care logs |

### No other frontend changes needed
- Professional Feedback Summary on admin checklist already reads `professional_approval_confirmed` — it will work once RLS permits the UPDATE
- CarePlanDetailPage already supports admin viewing with the blue "managing on behalf of" banner

