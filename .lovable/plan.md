

## Plan — Restructure family subscription tiers on `/subscription`

### What will change

Move 5 features out of **Family Basic** (Free) up into the paid tiers, rename one feature in the **Active Care Management** ($699/wk) tier, and add 4 new feature lines to the **Premium Care Management** ($899/wk) tier — three of them flagged as "Add-on" upgrades.

All edits are confined to the `familyPlans` array in `src/pages/subscription/SubscriptionPage.tsx` (lines 99–219). No routing, layout, pricing amounts, or other tier behavior changes.

### Tier-by-tier edits

**1. Family Basic (Free) — remove 5 features**

These move out of the free tier (will be marked `included: false` so they still appear, struck through, signaling the upgrade path):
- Care team discovery and matching
- Medication tracking and scheduling
- Meal planning and grocery lists
- Unlimited messaging with your care team
- Community support and resources

Kept as included in Free: Family profile setup, Care needs assessment, Legacy Story.

**2. Active Care Management ($699/wk · $2,499/mo) — additions + rename**

- **Rename**: "Care coordination and billing support" → **"Care coordination and care payments support (incl. NIS payment submission for family)"**
- **Add (included)** the 5 features promoted out of Basic, so the paid tier visibly inherits them:
  - Care team discovery and matching
  - Medication tracking and scheduling
  - Meal planning and grocery lists
  - Unlimited messaging with your care team
  - Community support and resources

**3. Premium Care Management ($899/wk · $3,299/mo) — add 4 lines**

Append after the existing Premium features:
- **Add-on:** Payroll log generation for care team
- **Add-on:** Caregiver daily reports
- Weekly care check-ins and status updates *(included)*
- **Add-on:** Full Care Environment Reset

The three "Add-on" lines render with an `Add-on` badge alongside the included checkmark to signal they are subscribable extras at this tier (not bundled).

### Visual treatment for "Add-on" lines

Minimal, no new components. In the feature row map, when a feature's name starts with `Add-on:`, strip the prefix for display and render a small `Add-on` pill (`bg-amber-100 text-amber-800`) next to the feature name. Existing checkmark styling stays the same.

### Files touched

| File | Change |
|---|---|
| `src/pages/subscription/SubscriptionPage.tsx` | Edit `familyPlans` array (lines 99–219); add small badge render in the feature-row JSX where features map |

### Acceptance test

1. Visit `/subscription` as a family user → toggle weekly/monthly works (unchanged)
2. **Family Basic** card shows the 5 listed features struck through (not included); only profile setup, assessment, Legacy Story remain green-checked
3. **Active Care Management** ($699/wk) shows the 5 promoted features as included, and the renamed line reads "Care coordination and care payments support (incl. NIS payment submission for family)"
4. **Premium Care Management** ($899/wk) shows 4 new lines at the bottom; the three Add-on lines display an amber `Add-on` pill; "Weekly care check-ins and status updates" appears without a pill
5. Mobile (375px wide) — pills wrap cleanly; no overflow; cards remain readable
6. Professional plans on `/subscription` (when accessed from professional context) — unchanged

### Out of scope

- Pricing changes (all amounts stay as today)
- Wiring add-ons to actual purchase/checkout flow (display-only signal for now; can be a follow-up)
- Professional plan tiers (untouched)
- `App.tsx`, routing, AuthProvider, registration flow (per project guardrails)

