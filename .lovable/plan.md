

## Plan: Group "Direct Care" + "Care Ops" under a "Care Delivery Cost" parent label

### Where the grouping will appear (3 locations)

**Location 1 — Operating Cost Framework configurator** (`OperatingCostConfig.tsx`)
Currently has 2 sibling section headers:
- A. Care Operations (Per Client) — amber
- B. Platform & Shared Overhead (Distributed) — purple

Change: introduce a parent wrapper section **"Care Delivery Cost"** that visually contains Direct Care + Care Ops as sub-sections, while Platform & Shared Overhead stays a sibling, fully separate.

**Location 2 — Per-Client Economics table** (`UnitEconomicsTable.tsx`)
Currently has 3 separate cost columns: `Direct Care | Care Ops | Allocated Ops`.
Change: add a top-tier grouped header row spanning the first two columns labeled **"Care Delivery Cost"**, leave "Allocated Ops" / "Allocated Platform" as a separate group.

**Location 3 — 3-Layer Cost Breakdown card** inside the expanded row (same file).
Currently 3 equal cards: Layer 1 / Layer 2 / Layer 3.
Change: wrap Layer 1 + Layer 2 in a tinted container labeled **"Care Delivery Cost"**, with Layer 3 (Allocated Platform) outside it.

### Components to update (2 files only)

1. `src/components/admin/OperatingCostConfig.tsx` — wrap section A in a parent block, add a new "Direct Care" sub-section header above it (currently no Direct Care category exists in the framework — costs come from payroll — so this stays as a labeled placeholder note: *"Direct Care costs (caregiver compensation + NIS) flow from care payments — see Per-Client Economics."*)
2. `src/components/admin/UnitEconomicsTable.tsx` — add grouped `<colgroup>`-style header row spanning Direct Care + Care Ops; tint-wrap Layer 1 + Layer 2 cards.

### Before vs After structure

**Before — OperatingCostConfig:**
```text
Operating Cost Framework
├── A. Care Operations (Per Client)         [amber]
│   └── Care Operations category
└── B. Platform & Shared Overhead           [purple]
    └── Software, Devices, Founder, etc.
```

**After — OperatingCostConfig:**
```text
Operating Cost Framework
├── ▼ Care Delivery Cost  (parent, neutral border)
│   ├── A1. Direct Care (per client, from care payments)   [blue note]
│   │   └── ℹ Caregiver compensation + NIS — flows from care payments
│   └── A2. Care Operations (per client)                    [amber]
│       └── Care Operations category
└── ▼ Platform & Shared Overhead (Distributed)              [purple]
    └── Software, Devices, Founder, etc.
```

**Before — UnitEconomicsTable header:**
```text
| Client | Plan | Revenue | Direct Care | Care Ops | Allocated Ops | Total | Margin | Status |
```

**After — UnitEconomicsTable header (2-row grouped):**
```text
|        |      |         |   Care Delivery Cost    |  Platform   |       |        |        |
| Client | Plan | Revenue | Direct Care | Care Ops  | Allocated   | Total | Margin | Status |
```

**Before — expanded 3-Layer Cost Breakdown:**
```text
[ Layer 1 — Direct Care ] [ Layer 2 — Care Ops ] [ Layer 3 — Allocated Platform ]
```

**After:**
```text
┌─ Care Delivery Cost ──────────────────────────────┐  ┌─ Allocated Platform ─┐
│ [ Layer 1 — Direct Care ] [ Layer 2 — Care Ops ]  │  │ [ Layer 3 ]          │
└───────────────────────────────────────────────────┘  └──────────────────────┘
```

### What stays unchanged (per your instructions)

- ✅ "Direct Care" line item label — kept
- ✅ "Care Ops" / "Care Operations" label — kept
- ✅ "Caregiver Compensation Pass-through" — kept
- ✅ "NIS Contribution (Caregiver)" — kept
- ✅ Platform & Operations remains its own separate section
- ❌ No "staff" or "salary" language introduced anywhere
- ❌ No DB columns, hooks, or framework keys renamed
- ❌ No changes to summary cards at top of page (Layer 1 / Layer 2 / Layer 3 mini-stats keep their current labels — only the table & framework get the parent grouping)

### Tooltip copy for the new "Care Delivery Cost" header

> "Care Delivery Cost = the total cost of delivering care for this client (Direct Care + Care Ops). Excludes shared platform overhead, which is allocated separately."

