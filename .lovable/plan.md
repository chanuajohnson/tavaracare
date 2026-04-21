

## Plan: Upgrade gate for caregiver SOP logs + arrival-time override on WhatsApp check-in

Two distinct, focused changes. No protected files touched.

---

### Part 1 — "View Full Care Plan" → upgrade gate for SOP logs

**Today:** Family clicks **View Full Care Plan** under "Caregiver Shift Logs" → goes straight to `/family/care-management`. The full caregiver SOP log detail (section breakdowns, full notes, history) should be a **paid add-on**, not free.

**The good news:** The billable item already exists in the catalog —
**`Daily Care SOP + Monitoring` · $149/week · weekly_addon** (id `81d017e5…`). And it's already wired into the onboarding **Daily Care Checklist (Caregiver SOP)** card (`onboardingSections.ts` line 180). We just need to:
1. Gate the family-side "view full" link behind it
2. Add a **one-time activation** option so families who don't want a recurring weekly add-on can pay once to unlock it
3. Surface the upgrade clearly with an in-product page + WhatsApp quote nudge

#### 1a. New upgrade page — `src/pages/family/CareLogUpgradePage.tsx`

Route: `/family/upgrade/care-log-access` (added in `App.tsx` only as a single new `<Route>` — no existing routes touched).

Layout:
- Hero: *"Unlock the Full Caregiver Care Log"* + lock icon
- "What you're missing" panel (mock screenshots of full SOP log detail vs. the summary they have today)
- **Benefits list** — full 66-item GAPP checklist visibility per shift, time-stamped section completion, full caregiver notes, incident reports, historical log search, two-way acknowledgment thread
- Two upgrade paths in a `SplitButton`-style card:
  - **Add to weekly plan** — *Daily Care SOP + Monitoring · $149/week* → on click, calls existing `care_plan_service_selections` insert (using the catalog `id` above, marks `selected=true`, `approved_by_family=true`), then opens WhatsApp quote nudge (uses existing nudge pattern with bank details from `mem://features/billing-bank-details`)
  - **One-time activation** — *$199 one-time, 30-day access* → same flow but inserts into `care_plan_service_selections` with `quantity=1`, plus a new `expires_at` field stored in the selection's `notes` JSON for now (no schema change — we'll just record the 30-day window in notes and let admin manage)
- Preview WhatsApp message before sending: *"Hi [Family] — please confirm activation of Daily Care SOP + Monitoring ($149/wk OR $199 one-time 30 days). Payment: First Citizens Bank Point Lisas, A/C 2991223, Chanua Johnson, Savings. Reply with reference once paid. — Tavara Care"*
- Final state after submission: *"Quote sent. Once payment is confirmed by admin, the full care log unlocks within 24 hrs."*

#### 1b. New one-time SKU in `billable_service_items`

Migration adds:
```
INSERT INTO billable_service_items (label, billing_type, unit_price, category, description, is_active)
VALUES ('Daily Care SOP — One-Time Activation', 'one_time', 199.00, 'weekly_addon',
        '30-day full access to caregiver SOP logs, section-by-section detail, and historical shift records.', true);
```

#### 1c. Gate the link in `DailyCareQuickView.tsx` (lines 305–312)

Replace the unconditional `<Link to="/family/care-management">` with a gated version:
- Query `care_plan_service_selections` for either the weekly SOP item (id `81d017e5…`) **or** the new one-time SKU, where `selected=true AND approved_by_family=true`
- If found → keep current behavior, link to `/family/care-management`
- If not found → button label becomes **"View Full Care Plan 🔒"** and links to `/family/upgrade/care-log-access` instead
- Tiny lock badge to make the gate visible without being aggressive

#### 1d. Add the one-time SKU to the onboarding Daily Care Checklist card

In `src/components/admin/onboarding/onboardingSections.ts` (the SOP section, lines 166–184) — append to the `items[]` array a new bullet:
> *"One-time SOP activation — $199 for 30-day full caregiver log access (alternative to weekly add-on)"*

This makes it visible/checkable in the admin onboarding checklist (`/admin/onboarding-checklist`) under the same card, surfaced as an Approved Service Component automatically because `serviceCategory: weekly_addon` matches the new SKU.

---

### Part 2 — Arrival-time override on caregiver WhatsApp check-in

**Today:** When the caregiver first saves their checklist, `DailyChecklist.tsx` lines 850–913 opens a dialog → on confirm calls `openCheckInWhatsApp({ startedAtIso: <now> })`. The template stamps "Logged in at 9:52 AM (very late, 113 min)" — but as the user noted, caregivers often only get a break to log in *much later* than they actually arrived. The "very late" tag is wrong and embarrassing.

#### 2a. Add an "Actual arrival time" override in the check-in dialog

In the existing `<Dialog>` (line 850) — between `<DialogDescription>` and the footer, add:
- A small disclosure: *"Did you arrive earlier than your login time? Set your actual arrival time so Tavara has the right record."*
- A **time picker input** (`<input type="time">`) defaulting to the system login time (`pendingCheckIn.startedAtIso` formatted as `HH:mm`)
- Helper text: *"This becomes the timestamp Tavara records and shares with the family."*
- Validation: arrival time cannot be **after** the login time and cannot be more than 12 hours before it

#### 2b. Pass override into the WhatsApp template

When the caregiver clicks **Open WhatsApp**:
- Build a new ISO timestamp using today's date + the picked arrival time
- Pass that as `startedAtIso` to `openCheckInWhatsApp(...)` instead of the raw login timestamp
- If no change made, behavior is identical to today

The template in `src/utils/whatsapp/checkInTemplate.ts` then naturally re-computes the tardiness tag against the (corrected) arrival time — no template changes needed. Output becomes:
> *🟢 Shift Check-In · Tricia Cumm started shift for Chanua Johnson · 08:00 – 16:00 · Logged in at 8:05 AM (on time) · Checklist 7/66 ticked — Tavara Care*

#### 2c. Persist arrival_time on the `daily_care_logs` row

Same submit flow already updates the log's `time_in`. We just write the corrected ISO into `time_in` (instead of `now()`) so the family-side activity feed and admin views all align with what was sent on WhatsApp.

---

### Files touched

| File | Change |
|---|---|
| `supabase/migrations/<ts>_sop_onetime_sku.sql` | **NEW** — insert one-time SOP activation SKU |
| `src/pages/family/CareLogUpgradePage.tsx` | **NEW** — upgrade page with 2 plans + WA quote nudge |
| `src/App.tsx` | Add **single** new `<Route path="/family/upgrade/care-log-access" …>` (no other routes touched) |
| `src/components/family/DailyCareQuickView.tsx` | Gate the "View Full Care Plan" button behind SOP entitlement |
| `src/components/admin/onboarding/onboardingSections.ts` | Add one-time SOP bullet to existing Daily Care Checklist (Caregiver SOP) section |
| `src/components/professional/DailyChecklist.tsx` | Add arrival-time override input in the check-in dialog (lines 850–913 area only) |

**Untouched:** routing tree (just a single additive route), AuthProvider, registration, chat flow, all other dashboards, `checkInTemplate.ts` (already supports it via `startedAtIso`), the existing Daily Care SOP weekly catalog row.

---

### Acceptance test

**Part 1 — Upgrade gate**
1. Family without SOP entitlement opens dashboard → "Caregiver Shift Logs" card shows the summary chips as today
2. The link now reads **"View Full Care Plan 🔒"** → click → lands on `/family/upgrade/care-log-access`
3. Page shows two clear options: $149/wk recurring **or** $199 one-time (30 days)
4. Click either → preview dialog shows WA message with bank details → **Send via WhatsApp** opens api.whatsapp.com to `18687865357` pre-filled
5. Admin sees the new selection on the family's onboarding checklist Daily Care Checklist card under Approved Service Components → ticks "Family approved" → entitlement unlocks
6. Family refreshes dashboard → button now reads **"View Full Care Plan →"** → links to `/family/care-management` as before

**Part 2 — Arrival override**
1. Tricia logs into Daily Checklist at 9:52 AM, ticks 7 items, clicks **Save Daily Log**
2. Check-in dialog opens with new arrival-time field defaulting to **09:52**
3. She changes it to **08:05** → clicks **Open WhatsApp**
4. WA opens with: *"Logged in at 8:05 AM (on time) · Checklist 7/66 ticked"* (no "very late" tag)
5. Family dashboard activity feed shows shift `08:05 – 16:00` (matches WhatsApp record)
6. Admin sees `time_in = 08:05` in `daily_care_logs`
7. If she leaves the field at 09:52 → unchanged behavior, message reads "(very late, 113 min)" exactly as today

---

### Out of scope
- Admin approval queue UI for the new one-time SKU (uses existing service selection approval flow)
- Auto-expiry of the 30-day one-time access (admin manually deselects after 30 days; tracked via notes for now)
- Memory updates — will save after implementation

