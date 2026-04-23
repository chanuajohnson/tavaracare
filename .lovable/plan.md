## Plan — Show all 4 stage results + give families a way back to their result

### Part 1: All 4 quiz result screens (so you can see what every user sees)

These are the actual final screens, by stage. Stage is **invisible to the user as a number** — only the title, badge, body, and CTAs are shown.

---

**🟢 STAGE 1 — "Just starting" (green)**

> **You're at the beginning — let's keep this simple.**
>
> Right now, the focus is just getting support in place and helping things feel more stable. There's no need to think about changing anything else yet. We'll take this step by step, together.

CTAs:

1. **Find a caregiver** → `/family/matching`
2. **Tell us about your loved one** → `/family/story` *(outline)*

---

**🟡 STAGE 2 — "Building trust" (amber)**

> **You're settling in — this stage is about building trust.**
>
> You're getting a feel for how things work and what your family needs. Right now, the focus is consistency and comfort — not big changes. Tavara will check in gently as you go.

CTAs:

1. **Build your care team** → `/family/care-management`
2. **Share their daily routine** → `/family/care-assessment` *(outline)*

---

**🟠 STAGE 3 — "Ready to expand" (orange)**

> **You're ready for support beyond the basics.**
>
> You're starting to see where things could be easier or more structured. This is a good time to introduce support that takes pressure off you.

CTAs:

1. **Guided Home Reset** → `/family/care-management`
2. **Care coordination** → `/subscription/features` *(outline)*
3. **NIS payroll support** → `/family/care-management` *(outline)*

---

**🔴 STAGE 4 — "Lifting the daily load" (rose)** *(what you saw)*

> **You're past the basics — let's lift the daily load.**
>
> Care is in place. What's draining you now isn't the caregiving — it's the running around. The bananas, the bread, the medication refills, the emergent pharmacy runs when no one feels well. Tavara can take this off your plate on a schedule you set, so the house stays stocked without you holding the whole list in your head.

CTAs:

1. **Set up recurring supply delivery** → `/errands#supplies`
2. **Book a one-off errand run** → `/errands` *(outline)*
3. **Talk to a care manager** → `/family/care-management` *(outline)*

---

### Part 2: Coverage gaps I'm fixing


| Gap                                                                                                                                            | Fix                                                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stage 1 "Find a caregiver" CTA — but the platform is also a coordination platform; some Stage 1 users actually need *guidance before matching* | Add tertiary outline CTA: **"Chat with TAV first"** → `/` (opens TAV chat). Lets overwhelmed Stage 1 users talk before matching.                                  |
| Stage 2 only has 2 CTAs (others have 3)                                                                                                        | Add tertiary outline CTA: **"See how scheduling works"** → `/family/care-management` so settling families can preview structure without committing                |
| Stage 3 routes "Guided Home Reset" + "NIS payroll" both to `/family/care-management` (same destination, confusing)                             | Point Guided Home Reset to `/family/care-management?tab=environment` and NIS payroll to `/family/care-management?tab=payroll` (existing tabs). Distinct outcomes. |
| No way back to result from dashboard or when back clicked or quiz reopened                                                                     | See Part 3.                                                                                                                                                       |


### Part 3: Persistent "Your readiness" quick-access card on the dashboard

This is the core ask. Once a family completes the quiz, the result becomes a **permanent compact card** on `/dashboard/family` that:

1. Shows their **stage badge + title** in the same color as the result screen (so they recognize it instantly — matches your screenshot)
2. Shows the **same 2–3 next-step CTAs** they saw on the result screen, so they can pick one anytime — not just immediately after the quiz
3. Has a small **"Retake"** link in the corner if life changed
4. Replaces the existing `ReadinessQuizBanner` (which only shows when no stage is set)

**Visual mock (compact):**

```text
┌───────────────────────────────────────────────────┐
│ ✦  Your readiness · Lifting the daily load    ⟲   │  ← rose accent, badge, retake icon
│    "You're past the basics — let's lift the       │
│     daily load."                                   │
│                                                    │
│  [Set up recurring delivery →] [Book errand →]    │  ← same CTAs as result screen
│  [Talk to a care manager →]                        │
└───────────────────────────────────────────────────┘
```

Component: `**FamilyReadinessQuickAccess**` — new file at `src/components/family/FamilyReadinessQuickAccess.tsx`. Reads `useFamilyStage()`, looks up `readinessStages[stage]`, renders title + truncated body + CTAs. Hidden if `!hasStage` (banner takes over).

### Part 4: Incomplete quiz recovery

Today, if a family starts the quiz and bails on Q3, their progress is lost — next visit they start over from Q1.

**Fix:** The quiz already keeps `answers[]` in component state. We'll **persist the in-progress answers** to `localStorage` under `tavara_readiness_quiz_progress` (key: `{ answers, currentIndex, updatedAt }`) on every selection.

When the user revisits `/family/readiness-quiz`:

- If a saved progress exists *and* it's incomplete *and* less than 30 days old → show a soft prompt at the top of Q1:
  > **Pick up where you left off?** *You answered 3 of 6 last time.*
  > [Continue] [Start over]
- Cleared on completion (when result is shown) and on "Start over"

Also adds the same prompt to the **dashboard banner** for users who bailed:

- Banner copy changes from *"Take our 60-second readiness check"* to *"Finish your readiness check (3 of 6 answered)"* when in-progress data exists.

### Part 5: After "Go to my dashboard" — clear path back to result

Two changes solidify the loop:

1. The new `**FamilyReadinessQuickAccess` card** (Part 3) is the primary path back — it's always sitting on the dashboard.
2. Add a tiny **"View my full result"** link inside the quick-access card that opens `/family/readiness-quiz?view=result` — a new query param the quiz page recognizes to **skip straight to the result screen** (using their saved stage from `useFamilyStage()`) instead of restarting the quiz. This is read-only mode — full result with all CTAs, no quiz UI.

### Files touched


| File                                                   | Change                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/data/familyReadinessQuiz.ts`                      | Add 3rd CTA to Stage 1 ("Chat with TAV first") and Stage 2 ("See how scheduling works"); split Stage 3's two duplicate care-management links into `?tab=environment` and `?tab=payroll`                                                                                    |
| `src/pages/family/FamilyReadinessQuizPage.tsx`         | Persist in-progress `{ answers, currentIndex }` to localStorage on every select; on mount, restore + offer "Continue / Start over" if incomplete data <30 days old; clear on completion. Recognize `?view=result` query param to render result directly using saved stage. |
| `src/components/family/FamilyReadinessQuickAccess.tsx` | **NEW** — compact stage card with title, body, CTAs, "Retake" + "View full result" links. Reads `useFamilyStage()`. Hidden when `!hasStage`.                                                                                                                               |
| `src/components/family/FamilyDashboard.tsx`            | Replace `<ReadinessQuizBanner />` with conditional render: `hasStage ? <FamilyReadinessQuickAccess /> : <ReadinessQuizBanner />`. Banner copy becomes progress-aware ("Finish your readiness check (X of 6 answered)") when in-progress localStorage exists.               |


**No** changes to: scoring logic, `useFamilyStage`, AppRoutes, FamilyRegistration, AuthProvider, App.tsx, chat flow, errands page, schema, or RLS.

### Acceptance test

1. New family visits `/family/readiness-quiz`, answers 3 questions, closes tab → returns next day → sees *"Pick up where you left off? You answered 3 of 6 last time."* with Continue / Start over
2. Same family on dashboard → banner now reads *"Finish your readiness check (3 of 6 answered)"*
3. Family completes quiz, lands on result, taps *"Go to my dashboard"* → dashboard shows new `**FamilyReadinessQuickAccess` card** with their stage's title, body, and same CTAs as the result screen
4. Family taps **Retake** in quick-access card → quiz restarts from Q1 with no saved progress
5. Family taps **"View full result"** in quick-access card → lands on `/family/readiness-quiz?view=result` showing the full-size result screen (no quiz UI), with all CTAs and the same "Go to dashboard" / "Retake" actions
6. Stage 1 family sees 3 CTAs including "Chat with TAV first"; Stage 2 sees 3 CTAs including "See how scheduling works"; Stage 3 sees Guided Home Reset and NIS payroll routing to **different** care-management tabs
7. All 4 stages render with their correct color accent (green / amber / orange / rose) on both the result screen *and* the dashboard quick-access card

### Out of scope

- Adding more questions (still 6 — the existing ones cover all signals)
- Changing scoring math
- Admin override UI for `client_stage` (separate workstream)
- Push notifications to retake
- TAV tone variants per stage (separate workstream)