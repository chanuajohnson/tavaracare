

## Plan: Fix Work Logs Not Showing Before March 14

### Root Cause

The Work Logs list defaults to the **"Last 30 days"** date filter. Today is April 13, so `subDays(today, 30)` = **March 14**. All work logs with a `start_time` before March 14 are filtered out. The data is in the database (March 2–13 confirmed present) — it is just hidden by the default filter.

### What I Will Change

**File: `src/hooks/payroll/usePayrollFilters.ts`**

1. Change the default `dateRangeFilter` from `'last30'` to `'all'` so that all work logs are visible by default.

**File: `src/components/care-plan/payroll/PayrollFilters.tsx`**

2. Add a **"Last 60 days"** and **"Last 90 days"** option to the date range dropdown so users can view longer periods without switching to "All time".

### Result

After this change:
- The Work Logs list will default to showing **all** work logs instead of only the last 30 days
- Angela's March 2–13 entries will appear immediately without manual filter changes
- Users can still narrow down using the 7/30/60/90-day or "This month" filters

