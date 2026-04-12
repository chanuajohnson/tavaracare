

## Plan: Allow Caregivers to Undo/Delete Medication Administrations

### Problem
Currently, there is no way for a caregiver to undo or delete a medication administration recorded in error. The database has no DELETE or UPDATE RLS policy on `medication_administrations`, and the service layer has no delete/undo method. The UI has no button for this action.

### Solution
Add the ability for a caregiver to delete their own administration records (only records they personally created). This requires changes at three layers: database RLS, service, and UI.

### Changes

**1. Database Migration** -- Add DELETE RLS policy on `medication_administrations`
- Allow users to delete only rows where `administered_by = auth.uid()` (you can only undo your own entries)
- Admins can delete any administration record

```sql
CREATE POLICY "Users can delete their own administrations"
ON medication_administrations
FOR DELETE
TO authenticated
USING (administered_by = auth.uid());

CREATE POLICY "Admins can delete any administration"
ON medication_administrations
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
```

**2. Service Layer** -- `src/services/medicationService.ts`
- Add a `deleteAdministration(administrationId: string)` method that calls `supabase.from('medication_administrations').delete().eq('id', administrationId)`

**3. Professional UI** -- `src/components/professional/MedicationDashboard.tsx`
- In the administration history / medication cards, add a small "Undo" or trash icon button next to each administration record that the current user created
- Clicking it shows a confirmation dialog ("Are you sure you want to remove this administration record?")
- On confirm, calls the delete method and refreshes the list

**4. Family UI** -- `src/components/care-plan/MedicationsTab.tsx`
- In the "Recent Administration Log" section, add the same undo button for entries where `administered_by` matches the current user
- Same confirmation flow

### Files Modified

| File | Change |
|------|--------|
| **Database migration** | Add DELETE RLS policies for own records + admin |
| `src/services/medicationService.ts` | Add `deleteAdministration()` method |
| `src/components/care-plan/MedicationsTab.tsx` | Add undo button in Recent Administration Log for own entries |
| `src/components/professional/MedicationDashboard.tsx` | Add undo button in medication views for own entries |
| `src/components/medication/MedicationScheduleView.tsx` | Add undo capability in the schedule view where administrations are shown |

### Safety
- Only the person who recorded the administration can delete it (RLS enforced)
- Confirmation dialog prevents accidental deletion
- Admins retain the ability to delete any record if needed

