

## Fix 3 Issues: Care Plan Quick Link, Weekend 8-4 Option, and Admin-Created Plan Error

### Issue 1: Add Care Plans Quick Link to Family Dashboard
The `FamilyShortcutMenuBar` currently shows "Care Management" only after a visit is scheduled (line 146). A dedicated "Care Plans" quick link should always be visible when care plans exist.

**File**: `src/components/family/FamilyShortcutMenuBar.tsx`
- Add a "Care Plans" button linking to `/family/care-management` that appears for all authenticated families (not gated behind visit scheduling)
- Use the `FileText` icon to match the care plan iconography used elsewhere

### Issue 2: Add Weekend 8 AM - 4 PM Shift Option
Currently the weekend coverage only offers "Saturday - Sunday, 6 AM - 6 PM" or "No Weekend Coverage". An additional option for 8 AM - 4 PM is needed.

**File**: `src/pages/family/care-management/CreateCarePlanPage.tsx`
- Change `WeekendOption` type from `'yes' | 'no'` to `'6am-6pm' | '8am-4pm' | 'no'`
- Add a third radio button: "Saturday - Sunday, 8 AM - 4 PM" (standard weekend hours)
- Update default value and metadata handling to use the new string values instead of `yes`/`no`
- Ensure backward compatibility: existing plans with `weekendCoverage: 'yes'` still display correctly

### Issue 3: Fix Error When Family Accesses Admin-Created Care Plan
**Root Cause**: `CarePlanDetailPage.tsx` violates React's rules of hooks. The `useCarePlanData` hook (line 67-81) is called *after* conditional early returns (lines 51-65), and a `useEffect` (line 107) is also placed after conditional returns. React requires hooks to be called in the same order every render -- conditional returns before hooks break this rule, causing a crash.

**File**: `src/pages/family/care-management/CarePlanDetailPage.tsx`
- Move ALL hooks to the top of the component (before any conditional returns)
- Move `useCarePlanData` call above the auth/id checks
- Move the admin-check `useEffect` above conditional returns
- Provide safe fallback values (`id || ''`, `user?.id || ''`) to hooks when values aren't ready yet
- Keep the conditional return logic but place it AFTER all hooks

### Files Changed

| File | Change |
|------|--------|
| `src/components/family/FamilyShortcutMenuBar.tsx` | Add always-visible "Care Plans" quick link |
| `src/pages/family/care-management/CreateCarePlanPage.tsx` | Add weekend 8 AM - 4 PM option |
| `src/pages/family/care-management/CarePlanDetailPage.tsx` | Fix hooks ordering to prevent crash on admin-created plans |

