

## Plan: Restore care plans + add custom software rows + expand cost catalog

### A. Why per-client plans aren't showing

Even though the table is built to render zero-payroll plans with a "No payroll this month" badge, the screen shows "No active care plans found" — that empty state only appears when `clients.length === 0`. Two likely causes:

1. **Care plans status filter too strict**: `useUnitEconomics.ts` line 200 hard-filters `.eq('status', 'active')`. If Peltier/Mum got flipped to another status (e.g. `pending`, `in_progress`, `completed`) the query returns 0 rows. The earlier session showed both as active, but a recent edit elsewhere may have changed status.
2. **Silent RLS rejection**: if `care_plans` returns `[]` with no error under admin context, the dashboard correctly empties. We need a visible diagnostic (count of plans found per status) to confirm.

### B. Fix — three changes

1. **Loosen + diagnose the care plans query** (`src/hooks/admin/useUnitEconomics.ts`):
   - Fetch `care_plans` without status filter, then split into `active` vs. `draft/other` in code.
   - Expose a new `draftCarePlans: ClientEconomics[]` and `statusCounts: Record<string, number>` from the hook.
   - Console-log the row counts so we can see in dev tools exactly what's returned.

2. **"Active Plans Without Payroll Data" draft section** (`src/pages/admin/UnitEconomicsPage.tsx` + `UnitEconomicsTable.tsx`):
   - Per your answer: keep the main payroll-driven table for plans with payroll, render a **separate compact "Draft / No-Payroll Plans"** card below listing every other active plan with a status badge and a "Log first hours" link to the family schedule page.
   - Status-counts banner at top: "Found X active, Y draft, Z completed care plans this month."

3. **Custom software rows in the Operating Cost Framework** (`src/components/admin/OperatingCostConfig.tsx` + `operatingCostFramework.ts`):
   - Per your answer: add an "**+ Add line item**" button inside every category that opens a tiny inline form (label, amount, recurrence, tax-deductible toggle, optional notes).
   - Custom items get `isCustom: true` and a delete button. They persist in the same localStorage shape.
   - Bonus: pre-seed empty placeholder rows in Software & SaaS for the tools you named so you can fill them in immediately without clicking Add (they don't add to totals until you enter an amount):
     - 🎬 CapCut Pro (content creation)
     - ✂️ OpusClip (AI clip generation)
     - ☁️ iCloud+ storage
     - 🎨 Canva Pro
     - 🤖 mAregtig content tools
     - 📝 Captions / subtitle tooling
     - 🎙️ Audio tools (Descript, ElevenLabs, etc.)
   - Adds a "Suggested categories" hint footer with examples for each section so you remember what to log.

### C. Files

| File | Change |
|---|---|
| `src/hooks/admin/useUnitEconomics.ts` | Drop `.eq('status','active')` filter, split in JS, expose `draftCarePlans` + `statusCounts`. Keep current zero-payroll handling for active plans. |
| `src/hooks/admin/operatingCostFramework.ts` | Add `isCustom?: boolean` to `CostLineItem`. Add 7 zero-amount Software & SaaS placeholders for CapCut/OpusClip/iCloud/Canva/mAregtig/Captions/Audio tools. Helper `addCustomItem(framework, catKey, item)` and `removeItem(framework, catKey, itemKey)`. |
| `src/components/admin/OperatingCostConfig.tsx` | "+ Add line item" button per category opening inline form. Delete button on custom items. Suggested-categories hint footer. |
| `src/pages/admin/UnitEconomicsPage.tsx` | New "Active Plans Without Payroll Data" card under the main table. Show `statusCounts` summary. |
| `src/components/admin/UnitEconomicsTable.tsx` | Optional: show small `statusCounts` chip row above the table. |
| `mem://admin/unit-economics-dashboard` | Update to reflect custom line items + draft plans section. |

### D. Result

- Peltier and Mum will reappear — either inside the payroll table (if active + has hours logged for the month) or in the new "Active Plans Without Payroll Data" card with a status badge.
- You can add CapCut, OpusClip, iCloud, Canva, mAregtig, captions, etc. directly in the Software & SaaS category (and create your own items in any other category) without code changes.
- Diagnostic counts make it impossible for plans to disappear silently again.

