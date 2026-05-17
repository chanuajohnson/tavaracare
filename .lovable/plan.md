# Why the "Inside Tavara Onboarding" article is not visible

Confirmed in the database:

- Title: *Inside Tavara Onboarding: What the First Two Weeks Really Look Like*
- `status` = `published`
- `published_at` = **2026-05-18 01:51:00 UTC**
- Current time = 2026-05-17 ~14:00 UTC

The public blog query in `src/lib/blog/api.ts` (`usePublishedPosts` / `usePublishedPost`) filters with `.lte("published_at", new Date().toISOString())`, so anything scheduled in the future is correctly hidden. The post is scheduled ~12 hours in the future, not actually live yet.

**Fix:** one-click "Publish now" — update `published_at` to `now()` for that row. No code change needed for that single fix, but see Part B below for a small editor improvement so this stops biting us.

---

# Part A — Make the missing article live now

Single data update:

```
UPDATE blog_posts
SET published_at = now()
WHERE slug = 'inside-tavara-onboarding-step-by-step';
```

Done via the insert/update tool, not a migration.

---

# Part B — Self-improving guardrails (zero-breach loop)

Today's gap: the dynamic `language_guardrails` table powers the TAV chatbot prompt and the amber panel in the blog editor, but **nothing actually scans the article body against those rules before publish**. The legacy `lintBody()` in `src/lib/blog/api.ts` has a tiny hardcoded BANNED_WORDS list and isn't wired into any UI. That is why "placement fee", "paid directly to caregiver", "baseline agreement", etc. slipped through.

We close the loop in four moves.

## B1. Live guardrail scanner in the blog editor

Replace the unused hardcoded `lintBody` with a live scanner that reads from `language_guardrails`:

- New hook `useGuardrailScan(body, title, description, faqs)` that:
  - pulls all active rules from `language_guardrails`
  - for each `word` rule: regex-match `banned_term` in body/title/description/faqs, suggest `preferred_term`
  - for each `financial_deny` rule: regex-match the denied figure/phrase
  - for `tone` rules: regex-match if `banned_term` is present (e.g. "drift back into chaos" overuse → count occurrences > 1)
  - returns `{ issues: [{ ruleId, severity, kind, excerpt, lineNumber, banned, preferred, scope }] }`
- Panel in `AdminBlogEditorPage.tsx` directly under the body field:
  - Red badge for `severity = hard`, amber for `soft`
  - Each issue shows the offending excerpt, the rule, and a **"Replace with preferred"** button that does a single in-body replace
  - Live count, updates as you type (debounced 400ms)
- **Publish guard**: the existing "Status: published" save is blocked while any `hard` issues exist. Soft issues show a warning but allow save. An admin override checkbox ("I've reviewed these and they are intentional") unblocks; the override + reason is written to `language_guardrails_audit` as a new action type `override_used` so we can learn from overrides.

## B2. "Learn from review" intake on the guardrails page

On `/admin/language-guardrails`, add a new tab **"Learn from feedback"**:

- Textarea: paste reviewer feedback (the kind of message the user just sent)
- "Extract proposed rules" button calls a new edge function `guardrails-extract-rules` that:
  - sends the pasted feedback + the current rule set to Lovable AI Gateway (`google/gemini-2.5-flash`)
  - asks it to return a JSON array of *new candidate rules* in the same shape as `language_guardrails` rows, with `banned_term`, `preferred_term`, `rule_type`, `scope`, `severity`, and a short `rationale`
  - skips anything that duplicates an existing active rule
- The candidates render as a review list: each row has Accept / Edit / Reject. Accept inserts into `language_guardrails` with `created_by = current admin`. Reject is logged so we don't re-propose it.

This is the actual learning loop — every round of editorial feedback becomes new enforced rules without manual SQL.

Seed the new system immediately with the rules implied by today's feedback so the next breach is impossible:

| rule_type | banned_term | preferred_term | severity |
|---|---|---|---|
| word | placement fee | onboarding coordination | hard |
| word | matching and placement fee | care setup coordination | hard |
| word | placement | onboarding coordination | soft |
| word | dispatch | coordinate | soft |
| word | match result | match outcome | soft |
| word | paid directly to (the )?caregiver | coordinated through Tavara | hard |
| word | family arranges (care )?directly | Tavara coordinates the arrangement | hard |
| word | direct arrangement | care coordination arrangement | hard |
| word | baseline agreement | care coordination agreement | soft |
| tone | drift back into chaos | fragmented coordination / reactive care / household strain / operational overwhelm / unstable routines | soft (overuse: warn if used >1x in same post) |
| word | 8 hour shift | eight-hour shift | soft |

## B3. Nightly re-scan of all published posts

New edge function `guardrails-scan-published` (scheduled daily via Supabase cron):

- Loads every `status = published` post
- Runs the same scanner against current `language_guardrails`
- Writes results to a new lightweight table `guardrail_breach_log` (post_id, rule_id, severity, excerpt, scanned_at, resolved bool)
- Admin dashboard guardrails card surfaces:
  - "X published posts with active breaches" with a link to a list
  - Per-post: open in editor with the breach panel pre-expanded

This is what gets us toward zero — when a rule is added today, tomorrow's scan flags every legacy article that violates it.

## B4. Audit + visibility upgrades

- `language_guardrails_audit` already captures CRUD. Add two synthetic actions:
  - `override_used` — when an admin publishes despite soft issues
  - `proposal_accepted` / `proposal_rejected` — from the Learn-from-feedback flow
- AdminDashboard guardrails card adds two numbers: **active rules** and **open breaches in published posts**.

---

# Technical notes

- **Tables touched:** `blog_posts` (data update only), `language_guardrails` (seed new rules via insert tool), new table `guardrail_breach_log` (migration).
- **New files:**
  - `src/hooks/admin/useGuardrailScan.ts`
  - `src/components/admin/guardrails/GuardrailScanPanel.tsx` (used inside `AdminBlogEditorPage`)
  - `src/components/admin/guardrails/LearnFromFeedbackTab.tsx`
  - `supabase/functions/guardrails-extract-rules/index.ts` (Lovable AI Gateway, `google/gemini-2.5-flash`, validates JSON before returning)
  - `supabase/functions/guardrails-scan-published/index.ts` (scheduled)
- **Edited files:**
  - `src/lib/blog/api.ts` — remove the dead hardcoded `lintBody`, keep typed exports
  - `src/pages/admin/AdminBlogEditorPage.tsx` — mount the scan panel, gate the Publish action on `hard` issues
  - `src/pages/admin/AdminLanguageGuardrailsPage.tsx` — add the Learn-from-feedback tab
  - `src/pages/admin/AdminDashboard.tsx` — surface open-breach count on the guardrails card
- **Memory:** update `mem://constraints/tavara-language-guardrails` to record the new banned terms (placement/dispatch/match result/paid directly/baseline agreement) and the "drift back into chaos" overuse rule.

---

# Open questions before I build

1. **Publish gating strength** — block hard-severity issues completely, or always allow override-with-reason? Default: block hard, allow override-with-reason on soft.
2. **Scope of the nightly scan** — only `published`, or also `scheduled` and `draft`? Default: published + scheduled.
3. **Auto-fix on accept** — when a new rule is accepted from feedback, should the system also auto-scan existing posts and offer one-click apply-preferred-term? Default: yes, surface as a list, never auto-rewrite without admin click.

Reply with answers (or "go with defaults") and I'll build it.