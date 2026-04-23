

## Plan — Capture the user's voice + convert anonymous quiz-takers into leads

You're asking for two related things:

1. **An open-text "tell us what's really going on" field** on every result screen — so when our 4 stages don't perfectly capture someone's reality (bananas-and-bread vs. someone else's specific load), they can tell us in their own words. This becomes invaluable product/CX data.
2. **A lead-capture flow for anonymous quiz-takers** — when a logged-out visitor completes the quiz, prompt them to save their result (sign up / sign in / send to WhatsApp), so we get name + email + phone into our database instead of losing them.

Here's how we deliver both, cleanly, without touching protected files.

---

### Part 1 — "Did we get it right?" reflection field on the result screen

A soft, optional text area appears on every result screen (all 4 stages, both signed-in and anonymous) right under the next-step CTAs:

```text
┌──────────────────────────────────────────────────────────┐
│ 💬  Did we get it right?                                  │
│                                                            │
│ Tell us in your own words what's actually weighing on you │
│ right now. Specifics help us help you better.              │
│                                                            │
│ ┌────────────────────────────────────────────────────────┐│
│ │ e.g. "Bananas and bread every other day, plus pharmacy  ││
│ │ runs when I'm not feeling well…"                        ││
│ └────────────────────────────────────────────────────────┘│
│                                              [ Share ]    │
└──────────────────────────────────────────────────────────┘
```

**Behavior:**
- Stage-specific placeholder text — Stage 4 shows the bananas/bread example; Stage 1 shows *"e.g. 'I just need someone to help me get started — I don't even know what I need yet'"*; Stage 2 / Stage 3 get their own examples
- Optional — never blocks "Go to my dashboard"
- Submitting shows a quiet *"Thank you — we hear you"* inline confirmation, then collapses the field
- Char counter (max 500), no formal labels, no "submit" button feel — feels like a WhatsApp note
- Already-submitted users see their reflection echoed back as *"You shared: '…'"* with a pencil icon to edit

**Where it stores (signed-in):** uses the existing `client_stage_quiz_responses` jsonb column — adds a `reflection: { text, submitted_at }` key. No schema change needed.

**Where it stores (anonymous):** writes to `localStorage.tavara_readiness_reflection` and gets migrated to the profile on signup (same migration path the quiz answers already use).

---

### Part 2 — Lead capture for anonymous completers (the conversion moment)

Today, anonymous users see *"Save my stage → Sign up"* as the only CTA. We're losing people who don't want a full account but would happily share name + email or get the result on WhatsApp. Three-option capture:

```text
┌──────────────────────────────────────────────────────────┐
│ ✦  Want to keep this?                                     │
│                                                            │
│ Your results are saved on this device — but if you'd like │
│ them tied to you (and to get gentle check-ins as things   │
│ change), pick one:                                         │
│                                                            │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│ │ 📱 WhatsApp  │  │ ✉  Email me  │  │ 🔐 Create account│ │
│ │ my result    │  │ my result    │  │ (full dashboard) │ │
│ └──────────────┘  └──────────────┘  └──────────────────┘ │
│                                                            │
│ Already have an account? Sign in                          │
└──────────────────────────────────────────────────────────┘
```

**Three paths, three different commitment levels (in order of friction):**

1. **WhatsApp my result** → opens a small modal asking for *Name* + *WhatsApp number*, then opens the central Tavara WhatsApp (`18687865357`) pre-filled with the result summary + their reflection text + a `?lead=quiz_<stage>_<timestamp>` deep link. **We capture the phone number to a new `quiz_leads` table on submit** — even if they never send the WhatsApp message, we have them.
2. **Email me my result** → small modal asking for *Name* + *Email*, sends via existing transactional email (Resend if available, otherwise stored for nudge). Same `quiz_leads` row created.
3. **Create account** → existing flow, routes to `/auth?tab=signup&role=family&from=quiz&stage=<n>` — quiz responses + reflection migrate to profile on signup (already wired).

**Plus a fourth, lighter path:** *"Just take me to the dashboard"* (existing behavior preserved — no forced capture, anti-stuck principle).

**New `quiz_leads` table** (separate from `profiles` — these are pre-registration leads, not users):

| column | type | notes |
|---|---|---|
| `id` | uuid (pk) | |
| `name` | text | required |
| `contact_method` | text | `'whatsapp'` \| `'email'` |
| `whatsapp_number` | text | nullable |
| `email` | text | nullable |
| `client_stage` | smallint | 1–4 |
| `quiz_responses` | jsonb | full answer set |
| `reflection` | text | nullable, the open-text field from Part 1 |
| `source_path` | text | e.g. `/family/readiness-quiz` |
| `converted_user_id` | uuid | nullable, set when they later sign up — links lead to profile |
| `created_at` | timestamptz | default `now()` |

RLS: anonymous INSERT allowed (`with check (true)`), SELECT restricted to admins only (using existing `has_role(auth.uid(), 'admin')`). No public read.

**Conversion linkage:** when a lead later signs up with the same email or phone, an edge function (or simple post-signup hook) sets `converted_user_id` so admin can see the lead → user funnel.

---

### Part 3 — Admin visibility (so the data we capture isn't a black hole)

Add a small **"Quiz Leads"** section to the existing admin user-management area, NOT a new admin route. Lists `quiz_leads` rows with: name, contact, stage badge (using same color palette), reflection snippet, conversion status, and a *"Send WhatsApp follow-up"* button that opens the central Tavara WA pre-filled with a stage-aware nudge template.

Reuses the existing admin nudge-system pattern (`admin/nudge-system-v2`) — no new infra.

---

### Files touched

| File | Change |
|---|---|
| `supabase/migrations/<ts>_create_quiz_leads.sql` | NEW — create `quiz_leads` table + RLS (anon insert, admin select) |
| `src/components/family/quiz/QuizReflectionField.tsx` | NEW — soft textarea with stage-specific placeholder, char count, save-to-profile-or-localStorage logic |
| `src/components/family/quiz/AnonymousLeadCapture.tsx` | NEW — 3-card capture (WhatsApp / Email / Account) with two small modals (`LeadWhatsAppModal`, `LeadEmailModal`) |
| `src/components/family/quiz/QuizResultCard.tsx` | EDIT — render `<QuizReflectionField />` under CTAs (always); render `<AnonymousLeadCapture />` only if `isAnonymous` |
| `src/data/familyReadinessQuiz.ts` | EDIT — add `reflectionPlaceholder` string to each `StageDefinition` (4 strings, stage-specific) |
| `src/pages/family/FamilyReadinessQuizPage.tsx` | EDIT — pass reflection state/handlers to `QuizResultCard`; on completion-while-anonymous, persist reflection + answers to localStorage; on signup migration, push to profile |
| `src/integrations/supabase/types.ts` | AUTO-REGEN after migration |
| `src/components/admin/QuizLeadsPanel.tsx` | NEW — admin table view with stage badge, reflection, "Nudge via WhatsApp" button reusing existing nudge templates |
| `src/pages/admin/AdminUserManagement.tsx` *(or wherever admin tabs live — I'll locate exactly)* | EDIT — add tab/section for `<QuizLeadsPanel />`. **No route changes.** |

**No** changes to: `App.tsx`, AppRoutes, AuthProvider, FamilyRegistration, chat flow, `useFamilyStage`, scoring logic, or quiz scoring/persistence infrastructure already shipped.

---

### Acceptance test

1. Signed-in family completes the quiz → result screen shows next-step CTAs **plus** a soft *"Did we get it right?"* textarea with stage-4 placeholder *"Bananas and bread every other day…"* → types reflection → taps Share → sees *"Thank you — we hear you"* → reflection now stored in `profiles.client_stage_quiz_responses.reflection`
2. Same family revisits result via `/family/readiness-quiz?view=result` → reflection echoes back as *"You shared: '…'"* with edit pencil
3. Anonymous user completes quiz → sees reflection field + new 3-card lead capture (WhatsApp / Email / Account) below the CTAs
4. Anonymous taps **WhatsApp my result** → modal asks Name + WA number → submitting writes a `quiz_leads` row AND opens `wa.me/18687865357` pre-filled with result summary + reflection text
5. Anonymous taps **Email me my result** → modal asks Name + Email → writes `quiz_leads` row → triggers transactional email (or queues if Resend unavailable)
6. Anonymous taps **Create account** → routed to `/auth?tab=signup&role=family&from=quiz&stage=4` → after signup, profile populated with stage + responses + reflection AND any matching `quiz_leads` row gets `converted_user_id` set
7. Admin opens user management → sees new Quiz Leads section with stage-colored badges, reflection snippets, and "Nudge via WhatsApp" button
8. Anonymous user who skips lead capture and clicks *"Just take me to the dashboard"* → no forced capture, lands at `/` (existing behavior, anti-stuck principle preserved)
9. RLS: an unauthenticated `INSERT` into `quiz_leads` succeeds; a `SELECT` from anon fails; admin `SELECT` succeeds

---

### Out of scope

- Building a full email-template system (uses existing transactional email infra; if Resend is not yet configured, the row is stored and admin can manually follow up — non-blocking)
- Automated lead nurture sequences (admin can send manually for v1)
- Editing the quiz questions themselves
- Deduping leads across email + phone (v2 — for now, each capture creates a row; admin can merge mentally via the converted_user_id linkage)
- TAV tone variants per stage (still separate workstream)

