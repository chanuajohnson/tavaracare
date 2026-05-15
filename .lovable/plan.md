## Pricing Source-of-Truth Alignment + Admin Pricing Manager

### Decisions confirmed by user (canonical values)

| Item | Old/Stale | Canonical |
|---|---|---|
| Caregiver Matching & Placement | $299 | **$1,399** one-time |
| Active Care Management (weekly) | $499/wk (legacy) | **$699/wk** (Ana Aimey legacy = $499) |
| Rate tier — Standard | $35/hr | **$40/hr** |
| Rate tier — Full Service | $40/hr | **$45/hr** |
| Rate tier — Premium | $45+/hr | **$50+/hr** |
| Emergency Stabilization / Rapid Response | absent | **$300–$2,000** (range, new constant) |
| Standard / High-Need Secondary Support | n/a | **"Custom Quote"** — surface as line item, no number |
| Full Care Environment Reset | n/a | **"Custom monthly retainer"** — surface as line item, no number |

---

### Part 1 — Code & copy alignment (immediate)

**`src/utils/lifecycleScenarios.ts`**
- `setup_matching: 299` → `1399`
- `sub_active: 699` (already correct — keep)
- Add `fee_emergency_stabilization_min: 300`, `fee_emergency_stabilization_max: 2000`
- Add display-only entries (no math) for `Standard/High-Need Secondary Support` and `Full Care Environment Reset` as `customQuote: true` line items so they render in `/admin/lifecycle-cost` builder as "Custom Quote".

**`src/pages/support/FAQPage.tsx`**
- Line 159: "Caregiver Matching & Placement — $299" → **$1,399**
- Line 99: confirm `$699/wk` already present (yes) — no change.

**`src/components/admin/lifecycle/FreePlanValueCard.tsx`**
- Line 64: "$299" → **$1,399**

**`src/pages/admin/AdminOnboardingChecklistPage.tsx`** (PDF labels lines 261–263)
- Standard `$35/hr` → **$40/hr**
- Full Service `$40/hr` → **$45/hr**
- Premium `$45+/hr` → **$50+/hr**

**`src/components/admin/onboarding/onboardingSections.ts`** — already $40/$45 at lines 226–227; verify line for Premium tier shows $50+/hr; if not, update.

**`src/components/admin/onboarding/professionalOnboardingSections.ts`** — apply same tier updates if mirrored.

**Search sweep** — `rg "\\$35/hr|\\$45\\+/hr|\\$299"` and update any remaining stale strings (component cards, banners, nudge templates, billing email copy).

**Memory updates (`mem://index.md` + `mem://features/caregiver-rate-tiers`)**
- Core line: `Care Pricing: Standard ($40/hr), Full Service ($45/hr), Premium ($50+/hr).`
- Update `caregiver-rate-tiers` memory body to match.

---

### Part 2 — Admin Pricing Manager (single source of truth)

New admin facility so pricing is editable without code changes.

**Database** — new table `pricing_catalog`:
- `code` (text, unique — e.g. `setup_matching`, `sub_active_weekly`, `rate_standard_hr`, `fee_emergency_min`)
- `category` (enum: `setup`, `subscription`, `add_on`, `rate_tier`, `escalation`, `environment`, `secondary_support`)
- `display_name`, `description` (text)
- `price_min` (numeric), `price_max` (numeric, nullable — for ranges like $300–$2,000)
- `unit` (text: `one_time`, `per_week`, `per_month`, `per_hour`, `custom_quote`)
- `is_active` (bool), `sort_order` (int)
- RLS: admins read/write; everyone else read-only `is_active=true`.
- Seed migration with all canonical values above.

**Admin UI** — new page `/admin/pricing-catalog` (route added without touching protected core routes):
- Table view grouped by category
- Inline edit: name, description, price_min/max, unit, active toggle
- "Custom Quote" rows render with no numeric input
- Audit toast on save; updated_at displayed

**Refactor read paths** — `lifecycleScenarios.ts` constants become a fallback; the `/admin/lifecycle-cost` page, FAQ pricing block, onboarding PDF labels, and FreePlanValueCard all read from `pricing_catalog` via a new `usePricingCatalog()` hook (with the seeded values as compile-time fallback so nothing breaks if fetch fails).

---

### Files to edit
- `src/utils/lifecycleScenarios.ts`
- `src/pages/support/FAQPage.tsx`
- `src/components/admin/lifecycle/FreePlanValueCard.tsx`
- `src/pages/admin/AdminOnboardingChecklistPage.tsx`
- `src/components/admin/onboarding/onboardingSections.ts` (verify Premium tier)
- `src/components/admin/onboarding/professionalOnboardingSections.ts` (if mirrored)
- `mem://index.md`, `mem://features/caregiver-rate-tiers`

### Files to create
- Migration: `pricing_catalog` table + RLS + seed
- `src/hooks/admin/usePricingCatalog.ts`
- `src/pages/admin/AdminPricingCatalogPage.tsx`
- `src/components/admin/pricing/PricingCatalogTable.tsx`
- `src/components/admin/pricing/PricingRowEditor.tsx`
- Route registration in admin router (additive, no changes to existing routes)

### Out of scope (intentional)
- No changes to `App.tsx`, registration, or auth flows
- No subscription billing logic changes — display-only catalog
