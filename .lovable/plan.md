

## Fix: Route All Match Navigation to Real Matches Page

### Changes — 4 files, same substitution: `/caregiver/matching` → `/family/matching`

| File | Lines | Change |
|------|-------|--------|
| `src/hooks/useEnhancedJourneyProgress.ts` | 428-429, 511-512 | Both case 4 navigate calls |
| `src/hooks/useUserJourneyProgress.ts` | 52 | Step 4 link in ternary chain |
| `src/hooks/useFamilyJourneyProgress.ts` | 87 | Step link property |
| `src/components/family/FamilyMatchNotification.tsx` | 109 | Navigate fallback call |

All five occurrences change from the fake teaser page (`/caregiver/matching` with hardcoded "Maria Johnson") to the real matches page (`/family/matching` using `useUnifiedMatches` with actual DB data).

