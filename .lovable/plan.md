# Tavara Language & Communication Guardrails — Always-On

Goal: make the guardrail text you wrote impossible to ignore — by Lovable when generating code/copy, by the blog editor, by the chatbot, and by any future contributor. Also fold in the existing **financial privacy on public surfaces** rule so it travels with the language rules as one unified contract.

## What gets created / updated

### 1. Canonical doc — `docs/TAVARA_LANGUAGE_GUARDRAILS.md` (new)
Single source of truth. Contains the full guardrail you wrote, lightly structured:
- Core operating philosophy ("emotionally intelligent care coordination")
- Tone rules
- What Tavara is NOT
- Banned words → preferred replacements table (hire, patient, staff, case, placement, clean-up, hoarding, burnout pipeline, payroll, agency, training oversight, "families engage caregivers directly")
- Preferred framing vocabulary
- Core beliefs
- DO / DO NOT communication rules
- Social media guardrails
- Brand position ("not selling caregiver hours — selling continuity, coordination, reduced chaos")
- **Financial privacy on public surfaces** section (copied from `mem://constraints/financial-privacy-public-surfaces`) so the language + money rules live together
- Cross-link to existing `docs/TAVARA_WRITING_STYLE.md` (anti-AI-tell rules, no em-dashes, banned AI words)

### 2. Project memory — always in context
Update `mem://index.md` Core block with the non-negotiables (one-liners, since Core is loaded every action):
- "Tavara language: never 'hire a caregiver / patient / staff / case / placement / clean-up / payroll / agency'. Use 'arrange care / loved one / care team / household / match / home preparation / caregiver payment coordination / care coordination platform'. See mem://constraints/tavara-language-guardrails."
- "Tavara sells continuity and coordination, not caregiver hours. Never sound like Uber-for-caregivers, gig staffing, or corporate healthcare."
- Keep existing financial-privacy Core line; add cross-reference.

Create new detailed memory file `mem://constraints/tavara-language-guardrails` with the full banned/preferred table + tone rules. Reference it from the index Memories list.

### 3. Chatbot system prompt — `supabase/functions/tav-chat-enhanced/index.ts`
Inject a "Language guardrails" block into the system prompt so TAV itself never uses banned words live:
- Banned terms list with substitutions
- Tone reminder (calm, observant, operationally competent, not corporate, not gig-economy)
- Financial-privacy reminder (no subscription dollar figures, Home Preparation dollar figures, household monthly totals, or lifecycle projections in public chat — only the per-hour care rates $40/$45/$50+ and subscription tier names)

### 4. Blog editor affordance — `src/pages/admin/AdminBlogEditorPage.tsx`
Add a small **"Language guardrails"** collapsible panel above the body editor showing the banned-words list and replacements at a glance. Pure presentation, no validation gate — just keeps the rules in front of the editor's eyes every time they write a post. Link to the full doc.

### 5. Public-facing financial guardrail — reinforce
Re-affirm the existing `mem://constraints/financial-privacy-public-surfaces` rule inside the new combined doc and chatbot prompt so the "no public dollar figures except per-hour care rate" line is enforced alongside the language rules. No code change to existing public pages — they already comply per memory.

## What this does NOT change
- No edits to registration flows, routing, App.tsx, or any protected components in your guardrail list.
- No rewriting of existing blog posts. The new doc + memory are forward-looking; you can run a copy audit later as a separate task.
- No database changes.

## Open questions before I build
1. **Scope of chatbot prompt update** — TAV is your conversational front door, so I'd inject the guardrails there. Want me to also update `tav-core/services/CoreTAVService.ts` (the embedded widget) the same way, or keep that for a later pass?
2. **Blog editor panel** — collapsible info panel (always visible, closed by default) vs. a tooltip on a "Guardrails" link in the toolbar? I'd go collapsible-closed-by-default.
3. **Anything to add to the banned list I haven't captured?** The list above is verbatim from your message plus financial-privacy. If there are extras (e.g. "client", "customer", "user" in family-facing copy), tell me now and I'll fold them in.

If 1–3 are "yes / collapsible / nothing to add", I'll implement exactly as planned.
