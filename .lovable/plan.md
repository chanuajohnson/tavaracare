

## Plan: Restructure Unit Economics into 3-Layer Cost Model

### The core fix
Move shared overhead OUT of per-client costing. Allocate it across active clients instead. Result: per-client margins reflect true marginal profitability, not "every client carries the entire founder salary."

### New 3-layer model

```
LAYER 1: DIRECT CARE COSTS (per client, scales 1:1)
  - Caregiver wages
  - Employer NIS
  - Employee NIS pass-through display

LAYER 2: CARE OPERATIONS (semi-direct, per-client controlled)
  - Care coordination labor
  - Training & shadow shift stipends
  - Backup caregiver buffer
  - Quality oversight

LAYER 3: PLATFORM & OPERATIONS (shared overhead, allocated)
  - Founder & Admin time
  - Software & SaaS (incl. CapCut/Canva/etc.)
  - Devices & Equipment
  - Marketing
  - Professional Services (legal/accounting)
  - Banking & Financial fees
  - T&T Statutory levies
  
  → Allocated per client = Total Platform Cost / Active Clients
```

### Per-client margin formula (new)

```
Revenue
  − Direct Care Costs (Layer 1)
  − Care Operations (Layer 2, prorated by hours)
  − Allocated Ops (Layer 3, equal-split or revenue-weighted)
= TRUE MARGIN
```

### File changes

| File | Change |
|---|---|
| `src/hooks/admin/operatingCostFramework.ts` | Add `layer: 'direct' \| 'care_ops' \| 'platform'` field to each `CostCategory`. Tag existing 8 categories: Care Operations → `care_ops`; Software, Devices, Founder/Admin, Marketing, Professional Services, Banking, T&T Statutory → `platform`. Add helper `weeklyByLayer(framework)` returning `{ careOps, platform }` weekly totals. Migration handles old saved frameworks. |
| `src/hooks/admin/useUnitEconomics.ts` | Split `monthlyOperatingCost` into `monthlyCareOpsCost` (per-client, weeks-based) + `monthlyAllocatedPlatformCost` (total platform / active client count). Add `platformSummary: { weeklyTotal, monthlyTotal, perClientAllocation, activeClientCount }`. Add `scenarioClientCount` parameter so admin can simulate scaling. Recalculate margin = revenue − direct − careOps − allocatedPlatform. |
| `src/components/admin/OperatingCostConfig.tsx` | Group categories visually under 2 headers: **"Care Operations (per-client)"** and **"Platform & Shared Overhead (allocated)"**. Tooltip on each header explaining direct vs allocated. Per-layer subtotals. |
| `src/components/admin/UnitEconomicsTable.tsx` | Replace single "Ops/mo" column with two: **"Care Ops"** and **"Allocated Ops"**. Update Total Cost + Margin to use new formula. Expanded row breakdown shows all 3 layers separately with explanation. |
| `src/components/admin/PlatformOperationsCard.tsx` | NEW. Section 3 — grouped breakdown of platform overhead (6 sub-groups: Founder & Admin, Software & SaaS, Devices, Marketing, Professional, Financial). Shows weekly + monthly + per-client allocation. |
| `src/components/admin/ScenarioControlsCard.tsx` | NEW. Section 4 — slider/input "Simulate active clients: [1—50]". Shows projected: per-client allocation, average margin, break-even client count. Pure read-only what-if (doesn't persist). |
| `src/pages/admin/UnitEconomicsPage.tsx` | Restructure into 4 sections: Summary, Per-Client Economics, Platform & Operations, Scenario Controls. Update summary cards: replace "Total Cost" with "Platform Cost/mo". Add "Allocated/Client" mini-stat. |
| `mem://admin/unit-economics-dashboard` | Update to reflect 3-layer model. |

### What stays the same
- Storage: localStorage (with backward-compat migration)
- All existing care plan data, payroll integration, NIS calc
- Custom line items + pre-seeded software placeholders
- Draft care plans card
- Quarterly Action Plan tab
- "Family Care" legacy plan handling for Ana

### Backward compatibility
The framework migration assigns layer tags to any existing saved categories by key match. If an admin's localStorage has an unknown custom category, it defaults to `platform`. No data loss.

### Expected result for current data (Apr 2026)

Before: Both clients show "Losing" because each absorbs ~$2K of founder/SaaS/marketing weekly
After: 
- **Direct margins** visible (caregiver wages vs revenue) — likely positive for both
- **After Care Ops**: still healthy
- **After Allocated Platform** (total platform ÷ 2 clients): may be tight or negative — but that's the **real** picture, and the scenario tool shows breakeven at, e.g., 8 clients
- Investor-ready story: "Marginal profitability is strong; we scale into platform overhead"

### UX details
- Tooltip on "Allocated Ops" column: *"Your share of platform overhead. Total platform cost ÷ active clients. Decreases as you add more clients."*
- Color coding: Direct (blue), Care Ops (amber), Platform (purple) — consistent across table, config, and breakdown
- Summary card "Avg Margin" recalculates with full formula so it matches the table

### Tests after build
1. Toggle a Software item amount up — confirm allocated/client increases, but per-client direct cost unchanged
2. Move scenario slider from 2 → 10 clients — allocated/client drops, margins improve
3. Confirm Ana shows: Sub $499 + caregiver pass-through, direct margin healthy, full margin reflects allocated share

