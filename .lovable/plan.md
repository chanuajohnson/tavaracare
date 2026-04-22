

## Plan — Fix `/subscriptions` 404 + add Tavara Care Delivery Packages (recurring supplies)

### Part 1 — Fix the 404 (small)

**Problem:** You typed `/subscriptions` (plural). Only `/subscription` (singular) is registered in `src/components/routing/AppRoutes.tsx` (line 175).

**Fix:** Add an alias route `/subscriptions` that renders the same `<SubscriptionPage />`. Both URLs work; nothing else moves. Same fix for `/subscriptions/features` → `<SubscriptionFeaturesPage />`. Per project guardrails I'll only add 2 lines inside `AppRoutes.tsx`, no restructuring.

---

### Part 2 — Tavara Care Delivery Packages

A new recurring-supplies module that lives **inside the Errands service** (`/errands`) and is also surfaceable on the Care Environment Support tier. Families pick the items they want, choose a cadence (weekly / biweekly / monthly), and Tavara delivers them on schedule. Admin manages the catalog and per-family subscriptions.

#### What the family sees (on `/errands`, new section under Pricing)

A new **"📦 Recurring Care Supplies"** card with:

1. **Curated bundles** to start fast (one-click selectable):
   - **Caregiver Essentials** — gloves, hand sanitizer, disinfectant, cleaning cloths, paper towels, garbage bags
   - **Personal Care** — soap, toothpaste, toothbrushes, deodorant, face moisturizer, deep hair conditioner, house slippers
   - **Incontinence & Hygiene** — adult diapers (size selectable), wet wipes, rubbing alcohol, hydrogen peroxide, methylated spirit
   - **Alzheimer's / Parkinson's Comfort Kit** — soft slippers, easy-grip toothbrush, no-rinse body wash, barrier cream, oil, big-bottle vinegar (for natural cleaning)
   - **Home Reset Add-Ons** — clothes baskets (dirty laundry), bathroom/toilet mats, room deodorizer
2. **À-la-carte item picker** — full catalog with quantity per item
3. **Cadence selector** per package or per item: Weekly · Biweekly · Monthly · One-time
4. **Delivery day** preference (Mon–Sat)
5. **Estimated total** with line-item breakdown + `TT$50` Tavara delivery fee per drop
6. CTA: **"Schedule Recurring Delivery"** → opens WhatsApp pre-filled with the selection + cadence (using centralized number 18687865357 per project rules) for confirmation, OR **"Pay Deposit & Lock In"** via existing `PayPalErrandsButton`

#### What admin sees (new admin page `/admin/care-supplies`)

- **Catalog Manager**: add/edit items — name, category (caregiver / personal / hygiene / cognitive-support / home-reset), unit, default unit price (TTD), is_active, sort_order, supplier note
- **Bundle Manager**: define bundles (name, description, items + default qty)
- **Family Subscriptions Table**: every family's active recurring delivery — items, cadence, next delivery date, status (active / paused / cancelled), monthly value
- **"Mark Delivered" + auto-advance** next delivery date per cadence; logs to history
- Cadence/value rolls into the existing **Unit Economics** dashboard as a new revenue stream

#### Data model (3 new tables)

| Table | Columns |
|---|---|
| `care_supply_items` | `id`, `name`, `category`, `description`, `unit_label` (e.g. "pack of 100"), `unit_price_ttd`, `image_url`, `is_active`, `sort_order`, timestamps |
| `care_supply_bundles` | `id`, `name`, `description`, `category`, `is_active`, `sort_order`, timestamps; plus `care_supply_bundle_items` join (`bundle_id`, `item_id`, `default_quantity`) |
| `care_supply_subscriptions` | `id`, `family_user_id` (fk auth.users), `cadence` enum(`weekly`,`biweekly`,`monthly`,`one_time`), `delivery_day`, `next_delivery_at`, `status` enum(`active`,`paused`,`cancelled`), `notes`, `created_by_admin`, timestamps; plus `care_supply_subscription_items` (`subscription_id`, `item_id`, `quantity`, `price_snapshot_ttd`) |
| `care_supply_deliveries` | `id`, `subscription_id`, `delivered_at`, `total_ttd`, `notes`, `marked_by` — append-only history |

**RLS**:
- Items + bundles: `SELECT` public (active only); write = admin only via `has_role(auth.uid(), 'admin')`
- Subscriptions + deliveries: family can `SELECT` their own; admin can do everything; writes by family limited to `INSERT` (create their own) and `UPDATE status='paused'` on their own row

#### Files touched

| File | Change |
|---|---|
| `src/components/routing/AppRoutes.tsx` | + 2 alias routes (`/subscriptions`, `/subscriptions/features`) |
| `supabase/migrations/<ts>_care_supply_packages.sql` | NEW — 4 tables, enums, RLS, seed bundles & ~25 items |
| `src/hooks/useCareSupplyCatalog.ts` | NEW — fetch items + bundles |
| `src/hooks/useCareSupplySubscription.ts` | NEW — current family's subscription CRUD |
| `src/components/errands/CareSupplyPackages.tsx` | NEW — family-facing bundle + à-la-carte picker, cadence selector, total calc, WhatsApp/PayPal CTA |
| `src/components/errands/SupplyItemPicker.tsx` | NEW — searchable catalog grid with qty steppers |
| `src/components/errands/CadenceSelector.tsx` | NEW — weekly/biweekly/monthly/one-time chip group |
| `src/pages/errands/ErrandsPage.tsx` | + render `<CareSupplyPackages />` after `<PricingBanner />` |
| `src/pages/admin/AdminCareSuppliesPage.tsx` | NEW — admin catalog + bundle + subscriptions manager |
| `src/components/admin/care-supplies/CatalogManager.tsx` | NEW |
| `src/components/admin/care-supplies/BundleManager.tsx` | NEW |
| `src/components/admin/care-supplies/SubscriptionsTable.tsx` | NEW (with "Mark Delivered" + cadence auto-advance) |
| `src/components/routing/AppRoutes.tsx` | + 1 line: `/admin/care-supplies` route |
| `src/components/admin/AdminQuickActions.tsx` (or sidebar) | + entry "Care Supplies" (only if admin nav exists; otherwise just the route) |

#### Seed catalog (initial items, all editable in admin after)

Gloves (box of 100) · Wet wipes · Adult diapers S/M/L/XL · Hand sanitizer · Disinfectant · Cleaning cloths · Paper towels · Garbage bags · Rubbing alcohol · Methylated spirit · Hydrogen peroxide · Big bottle vinegar · Soap · Toothpaste · Toothbrushes · Deodorant · Face moisturizer · Deep hair conditioner (steam) · House slippers · Clothes baskets · Bathroom/toilet mats · Coconut oil · Barrier cream · No-rinse body wash · Easy-grip toothbrush · Room deodorizer

Prices: admin-editable; seed with placeholder TTD values flagged `needs_pricing_review = true` (extra column) so you can sweep through and confirm before launch.

#### Tie-in to existing Care Environment Support

On the `Full Care Environment Reset` tier (Level 3, monthly retainer), the admin onboarding checklist will gain a "Set up Recurring Supplies" suggested step that deep-links to `/admin/care-supplies?family={id}` to create the subscription on the family's behalf. No DB change to the existing `billable_service_items` — purely a UI link.

#### Acceptance test

1. Visit `https://tavara.care/subscriptions` → loads same page as `/subscription` (no 404)
2. `/errands` → new "Recurring Care Supplies" section visible under pricing; tapping "Caregiver Essentials" prefills 6 items; cadence defaults to **Monthly**; total TTD recalculates as items toggle/qty changes
3. Change cadence to Weekly → total stays per-delivery, label updates to "every week"
4. Click "Schedule Recurring Delivery" → WhatsApp opens to 18687865357 with message listing items, qty, cadence, delivery day
5. Authed family clicks "Pay Deposit & Lock In" → creates `care_supply_subscriptions` row (status=`active`, `next_delivery_at` = next matching delivery_day) + items snapshot
6. Admin → `/admin/care-supplies` → sees the new subscription; can edit items, change cadence, pause, mark delivered (creates `care_supply_deliveries` row, advances `next_delivery_at` by cadence interval)
7. Non-admin trying to `UPDATE care_supply_items` via console → RLS denies
8. Mobile 375px → bundle cards stack, qty steppers tappable, cadence chips wrap cleanly

#### Out of scope

- Real-time delivery tracking / driver app
- Inventory management for Tavara stockroom (assume buy-on-demand from supermarket per delivery)
- Auto-charging recurring payments (PayPal recurring stays as today; supply payments handled per-delivery via existing PayPal/WhatsApp flow until you opt-in to wire recurring billing)
- Touching `App.tsx` root, `AuthProvider`, registration flows, family chat flow (per guardrails)

