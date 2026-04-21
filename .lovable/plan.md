

## Plan: Surface the new $199 one-time SOP SKU in the right place

### What's actually wrong

Both pieces of the previous change **did ship** — they're just buried:

1. The new SKU `Daily Care SOP — One-Time Activation · $199 · one-time` is in the catalog (`id 2093fdef…`), but its `sort_order = 185` puts it dead last in the Approved Service Components panel — below "Podiatric Care", which is what your screenshot ends on. Scroll down one more row and it's there.
2. The bullet text at line 181 of `onboardingSections.ts` is in the **checklist items** part of the card (the bulleted SOP list), not the Approved Service Components panel — and the checklist list isn't expanded in your screenshot.

### The fix — two tiny changes

**1. Re-sort the SKU so it sits next to its weekly twin**

Migration:
```sql
UPDATE public.billable_service_items
SET sort_order = 6
WHERE id = '2093fdef-9195-46cd-83e5-f5c1062edf7b';
```

This puts the **One-Time Activation ($199)** immediately after **Daily Care SOP + Monitoring ($149/wk)** in the Approved Service Components list — same row family, easy A/B for the admin.

**2. Add a tiny visual hint above the Approved Service Components panel inside the SOP card**

In `src/components/admin/onboarding/ServiceSelectionBlock.tsx`, when `filterCategory === 'weekly_addon'` AND the panel is rendered inside the SOP section, show a one-line subhead:

> *"Two SOP options: $149/week recurring **or** $199 one-time (30-day full log access)."*

Implemented as a conditional helper line at the top of the card body — non-intrusive, makes the choice obvious without scrolling.

### Files touched

| File | Change |
|---|---|
| `supabase/migrations/<ts>_resort_sop_onetime_sku.sql` | **NEW** — `UPDATE billable_service_items SET sort_order = 6 WHERE id = '2093fdef…'` |
| `src/components/admin/onboarding/ServiceSelectionBlock.tsx` | Add one-line helper subhead when `filterCategory='weekly_addon'` mentioning the two SOP options |

**Untouched:** routing, AuthProvider, registration, chat flow, `onboardingSections.ts` (the bullet at line 181 stays as-is — it's correctly placed in the checklist items list).

### Acceptance test

1. Admin opens `/admin/onboarding-checklist` for a family → expand **Daily Care Checklist (Caregiver SOP)** card
2. Approved Service Components panel now shows a small italic line at top: *"Two SOP options: $149/week recurring or $199 one-time (30-day full log access)."*
3. Scroll list: **Active Care Management → Daily Care SOP + Monitoring ($149/wk) → Daily Care SOP — One-Time Activation ($199 one-time) → Medication Management → Meal Support → …** — the two SOP options now sit side-by-side
4. Tick **One-Time Activation** → Family approved → check "Override $" defaults to 199 → save
5. Family side: refresh dashboard → "View Full Care Plan 🔒" → unlocks (gate already wired in last round)

### Out of scope
- Changing the bullet copy in `onboardingSections.ts` (already in place)
- Auto-expiry of the 30-day window (still admin-managed)
- Memory updates — will save after implementation

