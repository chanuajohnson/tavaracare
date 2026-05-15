Add a "Lifecycle Cost" quick-action card to the Admin Dashboard action grid, mirroring the style of the existing Unit Economics and Pricing Catalog cards, linking to `/admin/lifecycle-cost`.

### Change
- File: `src/pages/admin/AdminDashboard.tsx`
  - Import `Calculator` icon from `lucide-react` (or reuse `BarChart`/`DollarSign` if preferred — `Calculator` is distinct from existing icons)
  - Add `handleLifecycleCostClick = () => navigate('/admin/lifecycle-cost')`
  - Insert a new `<Button>` in the quick-actions grid right after the Pricing Catalog card, with label "Lifecycle Cost" and the Calculator icon

No other files touched. Routing for `/admin/lifecycle-cost` already exists.