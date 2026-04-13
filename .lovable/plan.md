

## Plan: Fix Work Log Navigation, Hide Approve/Reject for Professionals

### Issues

1. **Work Logs link from Profile Hub goes to Payroll tab** — Should go to Schedule tab instead, so professionals can click a shift and log hours there.
2. **Professionals see Approve/Reject buttons on their own work logs** — Professionals should never approve their own hours. Instead, show status text like "Pending Approval" or "Approved by Admin/Family".
3. **Professionals should be able to edit pending work logs** — From the Schedule tab, not the Payroll tab.

### Changes

#### 1. Redirect Work Logs card to Schedule tab (`ActionCardsGrid.tsx`)

Change line 18 from:
```
navigate(`/family/care-management/${carePlanId}?tab=payroll&from=professional`);
```
to:
```
navigate(`/family/care-management/${carePlanId}?tab=schedule&from=professional`);
```

This sends professionals to the Schedule tab where they can click their shift and log hours directly.

#### 2. Pass `from=professional` context into PayrollTab and WorkLogActions

- **`CarePlanDetailPage.tsx`**: Read `from` search param, pass `isProfessionalView` boolean to `<PayrollTab>`.
- **`PayrollTab.tsx`**: Accept `isProfessionalView` prop, pass it down to `<WorkLogsTable>`.
- **`WorkLogsTable.tsx`**: Accept `isProfessionalView` prop, pass it to `<WorkLogTableRow>`.
- **`WorkLogTableRow.tsx`**: Pass it to `<WorkLogActions>`.

#### 3. Conditionally hide Approve/Reject in WorkLogActions (`WorkLogActions.tsx`)

Accept `isProfessionalView` prop. When true and status is `pending`:
- Hide Approve/Reject buttons
- Show text: "Pending Approval"

When status is `approved` or `rejected`, show who actioned it (if available) or just "Approved" / "Rejected".

#### 4. Update PayrollStatusBadge for professional context

Enhance the badge to show more descriptive text for professionals:
- `pending` → "Pending Approval"
- `approved` → "Approved" (keep green badge)
- `rejected` → "Rejected" (keep red badge)

### Files Modified

| File | Change |
|------|--------|
| `src/components/professional/profile/ActionCardsGrid.tsx` | Change `?tab=payroll` to `?tab=schedule` |
| `src/pages/family/care-management/CarePlanDetailPage.tsx` | Read `from` param, pass `isProfessionalView` to PayrollTab |
| `src/components/care-plan/PayrollTab.tsx` | Accept and forward `isProfessionalView` prop |
| `src/components/care-plan/payroll/WorkLogsTable.tsx` | Accept and forward `isProfessionalView` prop |
| `src/components/care-plan/payroll/table/WorkLogTableRow.tsx` | Accept and forward `isProfessionalView` prop |
| `src/components/care-plan/payroll/table/WorkLogActions.tsx` | Hide Approve/Reject when `isProfessionalView`, show status text instead |

### Result

- Clicking "Work Logs" from Profile Hub opens the **Schedule tab** where the professional can click a shift to log hours
- On the Payroll & Hours tab, professionals see their work logs with status display ("Pending Approval" / "Approved") but **no Approve/Reject buttons**
- Admin and family users continue to see Approve/Reject buttons as before

