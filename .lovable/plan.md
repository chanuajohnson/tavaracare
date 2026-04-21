

## Plan: Per-document line-item picker (only include what you want on this quote/invoice)

### What's actually wrong

`DocumentGenerationMenu.tsx` (lines 64–103) fetches **every** `selected=true` row from `care_plan_service_selections` and pipes them all into the PDF. There's no way to say *"just the new $199 SOP one-time activation, please."* So your quote shows all 4 approved services every time.

### The fix — a small inline picker before "Generate"

Turn the current 3-item dropdown into a **two-step dropdown**:

1. **Top section: "Include on document" checklist** — one row per fetched service (label + price + billing type). All checked by default (current behavior preserved). Admin unticks the ones they don't want on this specific document.
2. **Below: the existing 3 generate actions** (`Quote`, `Invoice`, `Receipt`) — each now uses only the **checked** subset.
3. **Footer hint**: *"3 of 4 services included · click to toggle"* updates live.

Plus two tiny convenience buttons inside the dropdown header:
- **Select all** (default state)
- **Clear all** (handy when admin only wants to send a quote for the new $199 SKU alone)

### Files touched

| File | Change |
|---|---|
| `src/components/admin/care-plans/DocumentGenerationMenu.tsx` | Add `selectedItemIds: Set<string>` state initialized to all fetched IDs; render a `<DropdownMenuCheckboxItem>` list above the generate actions; `getData()` filters `approvedLineItems` by that set |

**Untouched:** the PDF generator itself (`invoiceService.ts`), `BillingSummaryCard`, the catalog rows, the family-side gate, the SOP entitlement work, routing, AuthProvider — everything else stays exactly as today.

### How it looks (ASCII)

```text
┌─ Generate Document ────────────────────────┐
│ Include on document         Select | Clear │
│ ─────────────────────────────────────────  │
│ ☑ Active Care Management   $499/wk         │
│ ☐ Daily Care SOP+Monitor   $149/wk         │
│ ☑ Daily Care SOP One-Time  $199 one-time   │
│ ☐ Meal Support Upgrade     $75/wk          │
│ ─────────────────────────────────────────  │
│ 2 of 4 services included                   │
│ ─────────────────────────────────────────  │
│ 📄 Generate Quote                          │
│ 📑 Generate Invoice                        │
│ 🧾 Generate Receipt                        │
└────────────────────────────────────────────┘
```

### Acceptance test

1. Admin opens **Documents** dropdown on Ana Maria Aimey's onboarding checklist
2. All 4 approved services appear pre-checked at the top of the dropdown
3. Admin clicks **Clear all**, then ticks only **Daily Care SOP — One-Time Activation $199**
4. Footer reads *"1 of 4 services included"*
5. Click **Generate Quote** → PDF downloads showing **only** the $199 SOP line item + caregiver labor (which is built separately from `careRate` and is unaffected)
6. Re-open dropdown next time → state resets to "all checked" (per-document picking, not persisted — cleaner for one-off quote generation)
7. Existing flow with no admin interaction → identical to today (all approved items included)

### Out of scope
- Persisting the picker state across sessions (intentionally per-open so it doesn't surprise the next admin)
- Caregiver labor toggle (it's a derived line item, not part of `care_plan_service_selections` — separate concern, can add later if needed)
- The 30-day SOP expiry plan you have open in `.lovable/plan.md` — that's still queued, not affected by this change

