

## Plan: Fix Professional Schedule Filtering and Navigation

### Issues Found

1. **Daily care logs not filtered by care plan** — The green care log entries ("User1 Family Family Family") appear on every care plan's schedule because `fetchLogs` in `ProfessionalCalendar.tsx` (line 46-67) only filters by `professional_id`, not by `care_plan_id`. The `daily_care_logs` table has a `care_plan_id` column, so this is a simple filter addition.

2. **Breadcrumb "Back to Care Plans" sends professionals to family page** — When a professional clicks "Work Logs" from their profile hub, it navigates to `/family/care-management/{carePlanId}?tab=payroll` (in `ActionCardsGrid.tsx` line 18). The `CarePlanHeader.tsx` breadcrumb always navigates to `/family/care-management`, which is a family-only page. Professionals should be sent back to `/professional/profile`.

### Changes

#### 1. Filter daily care logs by care plan (ProfessionalCalendar.tsx)

Update the `fetchLogs` function to accept and filter by `carePlanId`:

```typescript
// Add .eq('care_plan_id', carePlanId) to the query
const { data, error } = await supabase
  .from('daily_care_logs')
  .select('id, shift_date, client_name, created_at')
  .eq('professional_id', user.id)
  .eq('care_plan_id', carePlanId)   // <-- ADD THIS
  .gte('shift_date', startDate)
  .lte('shift_date', endDate);
```

Also add `carePlanId` to the `useEffect` dependency array so logs refresh when care plan changes.

#### 2. Fix breadcrumb navigation for professionals (CarePlanHeader.tsx)

Detect whether the user arrived from the professional hub (via referrer or URL param) and navigate back accordingly. Two options:

- **Option A**: Add a `from` query param when navigating from ActionCardsGrid (`?tab=payroll&from=professional`), then read it in CarePlanHeader to decide the back destination.
- **Option B**: Check the user's role and navigate to the appropriate dashboard.

I'll use **Option A** since it's explicit and doesn't require role lookup:

- `ActionCardsGrid.tsx`: Change navigate to include `&from=professional`
- `CarePlanHeader.tsx`: Read `from` param; if `professional`, go to `/professional/profile`

### Files Modified

| File | Change |
|------|--------|
| `src/components/professional/ProfessionalCalendar.tsx` | Add `care_plan_id` filter to `fetchLogs` query |
| `src/components/professional/profile/ActionCardsGrid.tsx` | Add `&from=professional` to Work Logs navigation URL |
| `src/components/care-plan/CarePlanHeader.tsx` | Read `from` query param; navigate to `/professional/profile` when `from=professional` |

