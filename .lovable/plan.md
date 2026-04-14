

## Plan: Add Employee NIS Column and Editable Operating Costs Per Client

### Issues from Screenshots

1. **Employee NIS column missing from main table** — The table header shows "Employer NIS" but there is no "Employee NIS" column. Both should be visible at the top level (not just in the expanded breakdown). The user wants to see both contributions at a glance.

2. **Operating cost per client is not editable inline** — The user wants to be able to see and edit the Ops/mo contribution per client row, or at minimum see the breakdown and adjust it to see the impact on margins.

### Changes

**1. `src/components/admin/UnitEconomicsTable.tsx`**

- Add **Employee NIS** column to the main table header (after Employer NIS)
- Display `client.monthlyEmployeeNis` in that new column for each row
- Update `colSpan` from 12 to 13 for the expanded row
- In the expanded **Cost Summary** section, make the Operating Cost line more prominent — show the weekly rate and number of weeks clearly, and note that the weekly rate is editable in the Operating Cost Assumptions section above the table

**2. No changes to `useUnitEconomics.ts`** — Employee NIS data (`monthlyEmployeeNis`) is already computed and available in the `ClientEconomics` interface; it's just not rendered in the main table row.

### Expected Result

The main table will show columns:
`Client | Plan | Sub/mo | CG Fees/mo | Revenue/mo | Wages/mo | Employer NIS | Employee NIS | Ops/mo | Total Cost/mo | Margin | Status`

Both NIS columns will be visible for every client row, matching the payroll summary data (e.g., $602 employer and $301 employee for Peltier March 2026).

### Files Modified
1. `src/components/admin/UnitEconomicsTable.tsx` — add Employee NIS column, update colSpan

