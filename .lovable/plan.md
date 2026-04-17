

## Finding: No "Staff Cost" copy exists

I searched the entire `src/` codebase (case-insensitive) for:
- "staff cost" / "Staff Cost" / "staff_cost" / "staffCost" / "StaffCost"
- the broader word "staff"

**Result: zero matches** for any cost-related "staff" terminology.

The only hit for the word "staff" at all is in `src/constants/flyerCategories.ts` line 17 — a marketing flyer category description ("Retirement Homes — *Staff & visiting families*"). This is unrelated to cost labels and should not be renamed.

### Likely terms you may have meant

The Unit Economics dashboard and related copy use these labels for caregiver/operating costs (already renamed in prior loops):

| Current label | Where | Already covered by prior rename? |
|---|---|---|
| "Direct Care" / "Direct Care Cost" (Layer 1) | UnitEconomicsTable, UnitEconomicsPage | — |
| "Care Ops" / "Care Operations" (Layer 2) | OperatingCostConfig, framework | — |
| "Caregiver Compensation Pass-through" | UnitEconomicsTable | ✅ renamed from "Wages" |
| "NIS Contribution (Caregiver)" | UnitEconomicsTable, payroll | ✅ renamed from "Employer NIS" |
| "Care Payments" | Payroll tab/table | ✅ renamed from "Payroll" |

### Recommended next step

Please confirm which label you want renamed to **"Care Delivery Cost"**. Best candidates:

1. **"Direct Care"** (Layer 1 column header + summary card "Direct Care/mo (Layer 1)") → *"Care Delivery Cost"*
2. **"Care Ops"** (Layer 2) → less likely, this is operations not direct delivery
3. Some other phrase you saw on a specific screen — if so, please share the screen/screenshot

Once you confirm which term, I'll produce a precise file-by-file rename plan (same format as the previous Wages / Employer NIS / Payroll renames).

