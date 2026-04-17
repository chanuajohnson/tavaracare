

## Plan: Wire up the 3-layer Unit Economics dashboard UI

The data layer is done. This plan finishes the **page wiring** so PlatformOperationsCard and ScenarioControlsCard render, summary cards reflect the new model, and the operating cost config visually separates per-client vs shared overhead.

### Quick exploration first

Need to confirm: current shape of `UnitEconomicsPage.tsx`, `OperatingCostConfig.tsx`, and the exact return signature of `useUnitEconomics()` (especially `platformSummary`, `weeklyByLayer`, allocation fields) before wiring.

### Changes

| File | Change |
|---|---|
| `src/pages/admin/UnitEconomicsPage.tsx` | (1) Add `scenarioClientCount` state. (2) Pass it as 2nd arg to `useUnitEconomics`. (3) Replace 4 summary cards with: **Active Clients**, **Total Revenue/mo**, **Platform Cost/mo**, **Avg Margin**. Add a 2nd row of mini-stats: **Care Ops/mo**, **Allocated Cost/Client**, **Direct Care/mo**. (4) Add Section 3 `<PlatformOperationsCard />` below per-client table. (5) Add Section 4 `<ScenarioControlsCard scenarioClientCount={...} onChange={...} />`. (6) Add section headers: "Per-Client Economics", "Platform & Operations", "Scenario Simulation". (7) Helper text under page title: *"Platform costs are distributed across active clients to reflect true profitability."* |
| `src/components/admin/OperatingCostConfig.tsx` | Group categories by `layer` field into 2 collapsible sections: **A. Care Operations (Per Client)** with tooltip *"Scales per client — coordination, training, oversight"*, **B. Platform & Shared Overhead (Distributed)** with tooltip *"Shared across all clients — divided by active client count"*. Show per-section weekly subtotal. Keep "+ Add line item" inside each category. |
| `src/components/admin/UnitEconomicsTable.tsx` | (Already has Direct/CareOps/Allocated columns from prior pass.) Verify expanded row shows: Layer 1 Direct, Layer 2 Care Ops, Layer 3 Allocated, then **"Marginal Profit (before allocation)"** = Revenue − Direct − CareOps, then **"Final Profit (after allocation)"** = above − Allocated. Add color-coded labels (blue/amber/purple). |
| `src/hooks/admin/useUnitEconomics.ts` | Verify `platformSummary` exposes `{ weeklyTotal, monthlyTotal, yearlyTotal, perClientAllocation, activeClientCount, scenarioClientCount, breakEvenClients }`. Add `breakEvenClients` calc if missing: `ceil(totalPlatformWeekly / avgWeeklyContributionMargin)`. Add `directCostTotal` to summary so the new mini-stat works. |
| `src/components/admin/PlatformOperationsCard.tsx` | Verify it accepts `platformSummary` + `framework` and renders weekly/monthly/yearly + grouped category breakdown + per-client allocation. Patch if any field missing. |
| `src/components/admin/ScenarioControlsCard.tsx` | Verify slider 1–50, shows: cost/client at scenario, projected avg margin %, break-even client count. Patch if any field missing. |

### Summary card layout (top of page)

```text
Row 1 (primary):
[ Active Clients ]  [ Revenue/mo ]  [ Platform Cost/mo ]  [ Avg Margin ]

Row 2 (mini-stats, smaller):
[ Direct Care/mo ]  [ Care Ops/mo ]  [ Allocated/Client ]
```

### Page structure after wiring

```text
┌─ Header + month picker + helper text ──────────────┐
├─ Summary cards (4 + 3) ────────────────────────────┤
├─ Tabs: Per-Client | Quarterly Plan ────────────────┤
│  └─ Per-Client tab:                                │
│     ├─ Status diagnostics                          │
│     ├─ § "Operating Cost Framework"                │
│     │   └─ OperatingCostConfig (grouped A/B)       │
│     ├─ § "Per-Client Economics"                    │
│     │   └─ UnitEconomicsTable (3-layer cols)       │
│     │   └─ Draft plans card                        │
│     ├─ § "Platform & Operations"                   │
│     │   └─ PlatformOperationsCard                  │
│     └─ § "Scenario Simulation"                     │
│         └─ ScenarioControlsCard (slider 1-50)      │
└────────────────────────────────────────────────────┘
```

### Logic guardrails (preserved)
- Platform cost never fully assigned to one client — always `totalPlatform / divisor`.
- Divisor = `scenarioClientCount ?? activeClientCount ?? 1` (already in hook).
- Margin formula: `revenue − direct − careOps − allocatedPlatform` (already in hook).
- Existing protections: care plans visibility, Ana legacy plan handling, custom line items, draft plans card — all untouched.

### Files NOT touched
- App.tsx, routing, AuthProvider, registration pages — per guardrails.
- Quarterly Action Plan tab — unchanged.
- Storage layer (localStorage) — unchanged.

### Post-build verification
1. Slider 2 → 10 clients: allocated/client drops, avg margin improves visibly.
2. Bump a Software item: platform cost rises, allocated/client rises, **direct cost unchanged**.
3. Ana row shows: Direct healthy, Care Ops modest, Allocated significant; expanded view shows both Marginal and Final profit lines.
4. Mobile (375px): summary cards stack, slider remains usable, table horizontally scrolls.

