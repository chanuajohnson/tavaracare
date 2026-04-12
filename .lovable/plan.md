

## Plan: Fix `timeLabel.charAt is not a function` Error in MedicationScheduleView

### Root Cause

In `src/components/medication/MedicationScheduleView.tsx`, the `formatTimeLabel` function (line 290) calls `timeLabel.charAt(0)`, but `timeLabel` can be a non-string value. This happens in two scenarios:

1. **Line 137**: When processing array-based `times`, `timeLabel` is set to the raw `time` value from `med.schedule.times` — which could be a number or object if the data is inconsistent
2. **Line 106**: When processing boolean flags, `timeLabel` comes from `Object.entries(TIME_MAPPINGS)` keys — these should always be strings, but the schedule object might have unexpected entries

### Fix

Add defensive type coercion in `formatTimeLabel` to ensure `timeLabel` is always treated as a string:

```typescript
const formatTimeLabel = (timeLabel: string, time: string) => {
  const label = String(timeLabel || '');
  if (!label) return time;
  const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);
  return `${capitalizedLabel} (${time})`;
};
```

Also add `String()` coercion at the dose creation points (lines 106 and 137) to prevent non-string values from entering the data:

- Line 106: `timeLabel: String(timeLabel)`
- Line 137: `timeLabel: String(time)`

### Files Modified

| File | Change |
|------|--------|
| `src/components/medication/MedicationScheduleView.tsx` | Add `String()` coercion in `formatTimeLabel` and at dose creation points to prevent `charAt` error |

