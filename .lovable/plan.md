

## Fix: Legacy Stories 404

**Problem**: The route is registered as `/legacy/stories` in AppRoutes.tsx (line 173), but all links across the app point to `/legacy-stories` (with a hyphen, no slash).

**Affected files with wrong links**:
1. `src/components/dashboard/DashboardHeader.tsx` (line 27) — `/legacy-stories`
2. `src/components/family/TellTheirStoryCard.tsx` (line 108) — `/legacy-stories`
3. `src/pages/legacy/LegacyStoriesPage.tsx` (line 24) — breadcrumb path `/legacy-stories`

**Fix**: Update the route in `AppRoutes.tsx` line 173 from `/legacy/stories` to `/legacy-stories` to match all existing links. This is the smallest change (1 line) versus updating 3 files.

**Technical detail**: Change `<Route path="/legacy/stories"` to `<Route path="/legacy-stories"` in AppRoutes.tsx.

