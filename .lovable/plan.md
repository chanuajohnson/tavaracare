

## Plan — Promote auto-matching + coordinator features to Family Basic (Free)

### What changes

Move the "discovery / auto-matching" capabilities into Free, and reposition the paid tier around the **human coordinator** layer that wraps around them. This honors what the platform already does for free (auto-matching is live for everyone) and makes the upgrade story honest: you're paying for the coordinator, not for matching.

### Tier-by-tier edits (Family plans only)

**Family Basic — Free** (`slug: basic`)

Becomes **included** (green checks):
- Family profile and care preferences setup *(already included)*
- Care needs assessment and planning tools *(already included)*
- Legacy Story — preserve your loved one's journey *(already included)*
- **Caregiver matching (auto-matching included)** ← NEW line, makes free auto-matching explicit
- **Care team discovery and matching** ← promote from "not included"
- **Medication tracking and scheduling** ← promote
- **Meal planning and grocery lists** ← promote
- **Unlimited messaging with your care team** ← promote
- **Community support and resources** ← promote

Stays **not included** (struck through, signals upgrade):
- Care team scheduling and oversight
- Dedicated care coordinator assigned to your family
- Video consultations for care planning
- Care coordination and care payments support (incl. NIS payment submission for family)

**Active Care Management — $699/wk · $2,499/mo** (`slug: care`)

Reframe top features so the value is the human coordinator actively running the matches and team — not the matching engine itself:

Replace the current opening lines with:
- Everything in Family Basic *(kept)*
- **Dedicated care coordinator assigned to your family — actively manages your matches and builds your care team around your family profile, care preferences, and assessment** ← rewritten/expanded line replacing the existing "Dedicated care coordinator assigned to your family"
- Care team scheduling and oversight *(kept)*
- Video consultations for care planning *(kept)*
- Care coordination and care payments support (incl. NIS payment submission for family) *(kept)*
- Priority matching and complex care management *(kept, still not-included today — leave as-is)*
- 24/7 on-call coordinator support *(kept, still not-included today — leave as-is)*

**Remove** these duplicate lines (now covered by "Everything in Family Basic"):
- Care team discovery and matching
- Medication tracking and scheduling
- Meal planning and grocery lists
- Unlimited messaging with your care team
- Community support and resources

**Premium Care Management — $899/wk · $3,299/mo** (`slug: premium`)

No changes — already opens with "Everything in Active Care Management" and inherits the new structure cleanly. Add-on rows and check-ins stay as-is.

### How this gets done

Single `UPDATE` statement per plan against `subscription_plans.features` (jsonb) — no schema change, no code change. The existing `useSubscriptionPlans` hook + render loop on `/subscription` already handles this exact data shape (included / not-included / is_addon).

| Plan slug | Action |
|---|---|
| `basic` | Replace `features` jsonb: 9 included, 4 not-included (per list above) |
| `care` | Replace `features` jsonb: 7 included (with rewritten coordinator line), 2 not-included; remove 5 duplicates |
| `premium` | No change |

### Files touched
- Database only: `subscription_plans` table — 2 rows updated via insert/update tool
- No source files modified
- No migration required (data update, not schema)

### Acceptance test

1. `/subscription` as a family user → **Family Basic (Free)** card shows 9 green-checked features including new "Caregiver matching (auto-matching included)" line; remaining 4 features struck through with the coordinator/scheduling/video/payments lines clearly signaling the upgrade
2. **Active Care Management** card opens with "Everything in Family Basic" then leads with the rewritten coordinator line emphasizing active management of matches and care team building; no duplicate matching/messaging/meal/medication lines
3. **Premium Care Management** card unchanged; "Everything in Active Care Management" still cascades correctly
4. Weekly/monthly toggle still works on all three cards
5. Admin → "Manage Plans" drawer → Family tab → all three plans editable; feature ordering matches what users see
6. Mobile (375px) → no overflow, struck-through items legible

### Out of scope
- Pricing changes
- Professional plans (untouched)
- Wiring Free-tier auto-matching to any new code path (it already exists — this is purely a marketing/transparency change to the plan card)
- Re-ordering or restyling cards
- Touching `App.tsx`, AuthProvider, registration flows

