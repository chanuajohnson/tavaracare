

## Fix: DashboardCaregiverMatches Still Shows Old Professional Type Labels

### Root Cause

The family dashboard at `/dashboard/family` uses `DashboardCaregiverMatches.tsx` — a completely separate component from `CaregiverMatchCard.tsx` and `SimpleMatchCard.tsx` that were previously updated. This component was missed.

It currently:
- Uses `professionalLabel(cg)` as the card heading (shows "Certified Nursing Assistant", "Gapp Certified")
- Uses `initials(label)` which derives initials from the professional label (gives "CNA", "GC")
- Still has "Name protected until subscription" text

### Fix in `src/components/family/DashboardCaregiverMatches.tsx`

1. **Card heading** (line 137): Change from `{label}` to show first name: `{cg.first_name || cg.full_name?.split(' ')[0] || 'Caregiver'}`

2. **Add professional type as subtitle** (line 138): Replace "Name protected until subscription" with `{label}` (the professional type) as a muted subtitle

3. **Avatar initials** (line 132): Change from `initials(label)` to derive from `cg.full_name` instead:
   ```
   {cg.full_name ? cg.full_name.split(' ').filter(Boolean).map(p => p[0]).join('').substring(0, 2).toUpperCase() : 'CG'}
   ```

### Files Changed

| Action | File | Description |
|--------|------|-------------|
| Modify | `src/components/family/DashboardCaregiverMatches.tsx` | Show first name as heading, professional type as subtitle, real initials from full_name, remove "Name protected" text |

