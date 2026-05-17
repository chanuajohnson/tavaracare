# Admin Guardrails Management Facility

## Goal
Move the Tavara language and financial-privacy guardrails out of hardcoded files and into an admin-managed catalog. Give admins a single place to view, edit, add, and retire rules, plus a clear "how to use and enforce" guide. The blog editor panel and the TAV chatbot system prompt both read from the same source of truth.

## What admins get

1. **Dashboard card** — new tile on `/admin` labelled "Language Guardrails" next to "Blog Management" and "Pricing Catalog". Shows current rule count and a small status badge (e.g. "12 banned terms, 3 financial rules").
2. **Management page** — new route `/admin/language-guardrails` with four tabs:
   - **Word Rules** — table of banned → preferred entries. Inline add, edit, archive. Each row has: banned term, preferred replacement, why this matters (short reason shown as tooltip), severity (hard ban vs soft preference), scope (family-facing, caregiver-facing, internal-only, all surfaces), active toggle.
   - **Financial Privacy** — table of allow-list and deny-list items (per-hour rates allowed, subscription dollar amounts forbidden, etc.) with the same edit/archive controls.
   - **Tone Rules** — list of style guardrails (no em-dashes, no AI buzzwords, no "It's not just X, it's Y", etc.). Plain text bullets, editable.
   - **How to use** — written guide (see below) rendered from a markdown field, editable by admin.
3. **Search and filter** on the Word Rules tab. Filter by scope, by severity, or by active/archived.
4. **Audit trail** — every change records who edited what and when. Shown as a "Recent changes" panel on the page.

## Where the rules surface (enforcement)

- **Blog editor panel** (`AdminBlogEditorPage.tsx`) — the amber collapsible block reads the active rules from the catalog instead of hardcoded JSX. Same visual, dynamic content.
- **TAV chatbot system prompt** (`tav-chat-enhanced` edge function) — on every invocation, the function fetches active guardrail rules from the table and injects them into the system prompt. One DB read, cached for the request lifetime.
- **`docs/TAVARA_LANGUAGE_GUARDRAILS.md`** — stays as the canonical narrative document. The management page links to it. Admin can regenerate the doc from the catalog with a one-click "Export to markdown" action (writes nothing to the repo, just gives the admin the up-to-date text to paste).
- **`mem://constraints/tavara-language-guardrails`** — remains as the always-on memory file for the Lovable agent. Manual sync from admin export when rules change meaningfully.

## Data model

New table `language_guardrails` (single table covers word rules, financial rules, and tone rules via a `rule_type` discriminator):

- `id uuid`
- `rule_type text` — one of `word`, `financial_allow`, `financial_deny`, `tone`
- `banned_term text nullable` — only used when rule_type=word
- `preferred_term text nullable` — only used when rule_type=word
- `body text` — the full rule statement (used for financial and tone rules; for word rules it's the "why this matters" reason)
- `scope text` — `family_facing`, `caregiver_facing`, `internal`, `all`
- `severity text` — `hard` (never use) or `soft` (prefer alternative)
- `is_active boolean default true`
- `display_order int`
- `created_by uuid`, `updated_by uuid`, `created_at`, `updated_at`

New table `language_guardrails_audit` (id, guardrail_id, action [created/updated/archived/restored], changed_by, changed_at, before jsonb, after jsonb).

RLS: admins can read and write both tables. Anonymous reads allowed on `language_guardrails` (active rows only) so the blog editor preview and any public-facing tooling can read without auth. Audit table is admin-read-only.

Seed migration inserts the current hardcoded rule set from the existing panel and `tav-chat-enhanced` so day one of the admin page matches what is already live.

## The "How to use" guide (seeded into the page)

Rendered as a markdown section inside the management page. Covers:

1. **What guardrails are.** Non-negotiable language and money rules that shape every public surface, every chatbot reply, and every piece of marketing copy.
2. **Where they show up automatically.** Blog editor panel, TAV chatbot, admin warnings. Anything else (printed flyers, social posts) is human-enforced and the same rules apply.
3. **How to add a new banned word.** Open Word Rules tab, click "Add rule", fill in banned + preferred + reason + scope + severity, save. Change is live within the minute on the blog editor and on the next TAV invocation.
4. **How to retire a rule.** Click the row, toggle Active off. The rule is hidden from enforcement but kept in the audit history.
5. **How to handle a borderline case.** If the rule is sometimes okay (e.g. "client" is fine in legal documents but not in family copy), set scope appropriately rather than archiving the rule.
6. **Financial privacy quick reference.** What is allowed public (per-hour rates, subscription tier names) and what is never public (subscription dollar amounts, home preparation costs, household totals).
7. **Review cadence.** Quarterly review by the founder. The page surfaces "rules not reviewed in 90+ days" at the top of the list.
8. **What to do if TAV breaks a rule.** Add the failure pattern as a new word or tone rule, redeploy is automatic, screenshot the original failure for the audit note.

## Files touched

- New: `supabase/migrations/...` for the two tables, RLS, seed data.
- New: `src/pages/admin/AdminLanguageGuardrailsPage.tsx` — the management UI.
- New: `src/components/admin/guardrails/GuardrailsTable.tsx`, `GuardrailRuleDialog.tsx`, `GuardrailsAuditPanel.tsx`, `GuardrailsHowToUse.tsx`.
- Edit: `src/App.tsx` — register the new route under the existing admin section.
- Edit: `src/pages/admin/AdminDashboard.tsx` — add the dashboard card next to Blog Management.
- Edit: `src/pages/admin/AdminBlogEditorPage.tsx` — replace the hardcoded amber panel block with a component that queries the catalog. UI stays identical, content becomes dynamic.
- Edit: `supabase/functions/tav-chat-enhanced/index.ts` — replace the hardcoded LANGUAGE GUARDRAILS string with a fetch from the catalog at request time, with a sensible fallback to the current hardcoded text if the DB read fails (so TAV never goes silent).

## Open questions before building

1. **Audit trail depth** — do you want full before/after JSON snapshots stored, or just a one-line "X changed banned_term from Y to Z" log? Default plan: full JSON.
2. **Who can edit** — admin only, or do you want a separate "content editor" role that can suggest changes but not apply them? Default plan: admin only.
3. **Export to markdown action** — should it overwrite `docs/TAVARA_LANGUAGE_GUARDRAILS.md` directly (requires a server-side write) or just download a `.md` file for you to drop in manually? Default plan: download only, no repo writes.
