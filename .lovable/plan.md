## Goal

Two blog updates, both done through the admin CMS (`blog_posts` table — no code changes):

1. Revise **"Senior Care Costs in Trinidad & Tobago (2026 Guide)"** for accuracy, add GAPP, expand the rate tiers, add a new price driver, and tighten coordinator language per guardrails.
2. Create a new post about **`/family/readiness-quiz`** — why it exists, what it is, how to use and share it.

No source code, routing, or schema changes. Pure content edits, executed by updating `blog_posts.body` (and inserting one new row).

---

## 1. Edits to `senior-care-costs-trinidad-tobago-2026`

### 1a. "The short answer" table — add GAPP row

Insert a new row in the rate table:

| Care type | Typical rate (TTD) |
|---|---|
| GAPP (Geriatric Adolescent Partnership Programme) | Free to family — government-subsidised |

Add a paragraph under the table noting GAPP is a Ministry of Social Development & Family Services programme. Care is no-cost to qualifying families, but the model is different: scope is set by the programme, not curated to a specific household, and caregivers offer less home-specific, less curated care than a privately matched arrangement. Useful as a complement or starting point, not a substitute for tailored coordination.

### 1b. "What 'Standard,' 'Full Service,' and 'Premium' actually mean" — add lower-rate context

Add a clearly-labelled subsection **before** the Standard tier block:

> **Market context: below Tavara's floor**
>
> Across T&T you'll see caregivers offered at **under $30/hr**, **$30/hr**, and **$34/hr**. We want you to know these exist and what they typically signal.
>
> - **Under $30/hr** — usually informal, unvetted arrangements, no coordination, no logs, no backup if the caregiver is sick. Common in family-of-a-friend referrals. Risk sits entirely with the household.
> - **$30/hr** — entry-level companion care from independent caregivers or small agencies with minimal screening. Limited scope, often no medication training, no payroll handling, no NIS coordination.
> - **$34/hr** — basic agency rate. Some screening, some scheduling, but typically light on the operational layer (dashboards, shift swaps, daily logs, payroll, NIS reporting).
>
> Tavara does not staff caregivers at these rates. Our floor is $40/hr because the rate covers a vetted caregiver plus the coordination layer the family doesn't have to build themselves. The point of listing the lower rates is transparency, not comparison — different products at different price points.

### 1c. "What drives the price up" — add a 4th driver

Add:

> **4. Household context and secondary care needs.** Pricing reflects the full picture of the home, not just the primary care recipient. A spouse who also needs check-ins, a second elder in the household, complex household routines, dietary specifics, or layered medical conditions across more than one person all shape the caregiver brief. Curating to those specifics is part of what the rate pays for.

### 1d. Rewrite passages to match guardrails (coordinator, not employer)

Per `mem://legal/platform-positioning-standard`: Tavara is a care coordination platform, never the employer, never the payer of wages. Edits:

- Line 75 currently reads: *"Once you're matched and running, the family pays the caregiver's wage directly and (optionally) a subscription for ongoing coordination, see below."*
  - Rewrite to clarify pass-through, NIS coordination, and care payment coordination:
  > Once you're matched and running, the family engages the caregiver directly. Tavara coordinates the moving parts on the family's behalf — care payment scheduling, NIS reporting, payroll calculation, shift coverage — but the wage itself is a direct pass-through from family to caregiver. The optional subscription covers that coordination layer. See [/admin/lifecycle-cost] reference structure below.

- Line 87 ("Payroll calculation and NIS handling.") — soften to coordinator language:
  > Payroll calculation and NIS reporting that we coordinate on the family's behalf (the family remains the engager; Tavara is not the employer).

- Line 109 NIS bullet — rewrite:
  > **NIS contributions.** Tavara coordinates NIS calculation and reporting on wage-only sums (excluding expense reimbursements). The family remains the contributor of record; we handle the operational side so nothing is missed.

- Line 137 ("Pay the caregiver directly and on time."):
  > **Keep care payments to the caregiver on time.** Tavara coordinates scheduling and reporting, but the payment flows from family to caregiver. Late payment is the single biggest predictor of caregiver turnover.

- Scan the rest of the body for any phrasing that implies Tavara employs caregivers or pays wages, and rewrite to "coordinate / engage / pass-through."

### 1e. Style compliance

Run the rewritten body through the lint rules already in `src/lib/blog/api.ts` (`lintBody`) — no em/en-dashes, no "It's not just X, it's Y", no banned AI vocabulary. Keep the existing voice.

---

## 2. New post: Family Readiness Quiz

New row in `blog_posts`:

- **slug:** `family-readiness-quiz-trinidad-tobago`
- **title:** Are You Ready for In-Home Care? The Family Readiness Quiz
- **category:** Family Guidance (match existing categories)
- **author:** same default as the cost guide
- **status:** `published`, `published_at` ≈ today (May 17, 2026) so it lands cleanly after the May 13 hoarding post
- **cta_label / cta_href:** "Take the Readiness Quiz" → `/family/readiness-quiz`

### Outline of body

1. **Why this quiz exists** — most families wait until crisis to think about care; the quiz exists so a family can take ten honest minutes *before* the crisis and see where they actually stand across daily living, safety, finances, and household dynamics.
2. **What it is** — a structured self-assessment, not a sales tool. Covers care recipient status, household context (including spouse / secondary care), readiness to engage a caregiver, financial picture, and emotional bandwidth of the primary family contact.
3. **What it isn't** — not a diagnosis, not a quote, not a commitment. No caregiver is dispatched from a quiz result.
4. **How to use it well** — take it honestly, take it with one other family member if possible, take it twice (once for "today," once for "if things shift in 6 months"), screenshot or save the summary.
5. **How to share it** — share the link with siblings, adult children, or a spouse before a family meeting; it gives everyone the same baseline so the conversation isn't "you don't understand what's happening at home."
6. **What happens after** — the family can choose to start a profile, book a coordinator call, or simply hold the result for later. Coordinator language: Tavara coordinates next steps if the family wants them; nothing automatic.
7. **CTA** — link to `/family/readiness-quiz`.

Apply the same lint rules and coordinator-language guardrails.

---

## Technical notes (for the implementer, not the user)

- Both updates are pure content: `UPDATE blog_posts SET body = ... WHERE slug = 'senior-care-costs-trinidad-tobago-2026'` and one `INSERT INTO blog_posts (...)`.
- Use the existing admin editor at `/admin/blog` rather than raw SQL where possible, so the lint panel runs.
- No migrations, no route changes, no component changes.
- Do not touch `src/pages/registration/FamilyRegistration.tsx`, `App.tsx`, routing, or any protected files per project guardrails.

---

## Out of scope

- Any change to the readiness quiz itself (`/family/readiness-quiz` page).
- Any change to `/admin/lifecycle-cost` — referenced only as the source-of-truth for cost language in the rewritten passages.
- Pricing catalog edits — the canonical numbers in `pricing_catalog` are already correct; we are only aligning blog copy to them.
