

## Plan: Add "How Tavara Matching Works" card to the About page

A focused, additive change — drop a new card **above Our Story / Our Mission** on `/about` that explains the 5-step matching system with toggleable Family / Professional perspectives. No existing About content changes. No routes touched.

---

### Where it goes

`src/pages/about/AboutPage.tsx` — insert one new component **between the intro card and the `Our Story / Our Mission` grid** (between lines ~88 and ~91). Nothing existing is modified, removed, or restyled.

```text
[ Tavara logo + tagline ]
[ Intro card: "Tavara is a technology-driven platform…" ]
[ ★ NEW: How Tavara Matching Works card ]   ← inserted here
[ Our Story | Our Mission grid ]   ← unchanged
[ Vision section ]   ← unchanged
…rest of page unchanged…
```

---

### New file

**`src/components/about/HowMatchingWorksCard.tsx`** — self-contained card using existing UI primitives (`Card`, `Tabs`, `Button` from `src/components/ui/*`), `framer-motion` for subtle reveal, and lucide icons (`Heart`, `Sparkles`, `Users`, `Home`, `Repeat`).

**Structure:**
- Card header: *"How Tavara Matching Works"* + subhead *"A real match isn't a search result — it's a system that looks at your life, your home, and the people who'll show up."*
- Tabs toggle: **For Families** | **For Caregivers** (default Families)
- 5 numbered step blocks (vertical stack on mobile, 1-column readable layout on desktop — matches the existing `MissionCard` / `StoryCard` visual rhythm)
- Each step: number badge → icon → title → bullet list → italic pull-quote
- Closing band: *"A good match isn't enough — the whole system has to work."*

---

### Copy — Family perspective (your wording, terminology-aligned)

**1. Understand Your Reality** 💙
- Care needs and medical conditions
- Daily routine and schedule
- Family dynamics and relationship to the care recipient
- Stage of care — urgent now, planning ahead, or transitioning
- Your loved one's *Legacy Story* — who they are, not just what they need

> *We start with your real life — not just a request.*

**2. Match for Fit** ✨
Every caregiver is scored across four signals:
- Care types
- Schedule overlap
- Experience & specialised training
- Location

Families see one overall match score plus a clear explanation of why that caregiver fits.

> *Not just availability — actual fit, scored across what matters.*

**3. Meet Your Care Team** 🤝
- A care coordinator visits to confirm needs in person
- Your care team is confirmed (one main caregiver + supporting care team members)
- We facilitate an initial family meeting at your home
- An optional trial day may be arranged before you commit

> *A match on paper becomes a person at your door — with Tavara walking you through it.*

**4. Prepare the Home for Care** 🏡
Once care begins, your caregiver runs a Care Readiness Assessment covering:
- Hygiene, safety, accessibility
- Caregiver workflow and daily flow
- Decluttering & space optimisation recommendations

If additional support is needed: assessment included, guided reset available, full reset by quote.

> *Care depends on the environment — the home has to support the care, not work against it.*

**5. Coordinate and Sustain** 🔄
- Schedule changes, shift swaps, coverage
- Backup caregiver support
- Daily care logs and family visibility
- Escalations when care needs evolve
- Ongoing coordinator support for both the family and caregiver

> *So care continues — even when things change.*

**Closing:** *A good match isn't enough — the whole system has to work.*

---

### Copy — Caregiver perspective (mirrored, same 5 steps)

**1. We Get to Know You** 💙
- Your training, certifications & specialisations
- Shifts you can actually work
- Areas you can reach reliably
- Care types you're confident with

> *We match you to families where your skills genuinely fit — not just any open shift.*

**2. Matched for Fit** ✨
You're scored against family needs across the same four signals: care types, schedule, experience, location. You see why a family is a fit before you accept.

> *Real matches, not random assignments.*

**3. Meet Your Family** 🤝
- A Tavara coordinator introduces you
- Initial family meeting at the home
- Optional trial day to confirm mutual fit
- Care team structure confirmed (main caregiver + fill-in caregivers)

> *You're never sent in cold.*

**4. Set Up the Care Environment** 🏡
On your first week you complete a Care Readiness Assessment — your professional eyes on hygiene, safety, workflow, and what the home needs to support quality care.

> *You're the expert in the room — Tavara backs your recommendations.*

**5. Ongoing Support & Care Payments** 🔄
- Shift coverage and swap support when life happens
- Daily care logs (your record of work)
- Backup caregivers in your team
- Transparent **care payments** every cycle (no employer/employee framing — you're an independent care professional)
- Coordinator support whenever you need it

> *Tavara coordinates the system so you can focus on care.*

**Closing:** *A good match isn't enough — the whole system has to work.*

---

### Terminology guardrails (applied throughout the copy)

| ❌ Never use | ✅ Always use |
|---|---|
| Hire caregiver / Hire nurse | Match with caregiver / Assign caregiver |
| We hire | We coordinate |
| Hiring process | Care setup process |
| Employment / Staff | Care arrangement / Care team |
| Payroll / Wages / Salary | **Care payments** / Caregiver compensation |
| Employer NIS | **NIS Contribution (Caregiver)** |
| Staff cost | Care delivery cost |

This card uses *match*, *care team*, *care payments*, *care arrangement*, *coordinate* exclusively — consistent with the platform-positioning standard (Tavara is a coordination platform, never an agency or employer).

---

### Files touched

| File | Change |
|---|---|
| `src/components/about/HowMatchingWorksCard.tsx` | **NEW** — self-contained card with Tabs |
| `src/pages/about/AboutPage.tsx` | **+2 lines** — import + render once between the intro card (line ~88) and the Story/Mission grid (line ~91). No other edits. |

**Untouched:** All existing About sections (logo, intro, Story, Mission, Vision, Values, Platform Features, Podcast, CTA), routing, navigation, AuthProvider, registration flows, chat flow.

No DB changes. No edge functions. No new dependencies.

---

### Mobile / responsive

- Mobile (<640px): single-column step stack, tabs full-width
- Tablet (640–1024px): step number badge inline, tabs side-by-side
- Desktop (>1024px): max-width 4xl card matching the existing intro card width (`max-w-4xl mx-auto`)

Matches the viewport you're testing at (1189×853) and remains readable on phones.

---

### Acceptance test

1. Navigate to `/about` → between the blue intro card and the Story/Mission grid you see a new card titled **"How Tavara Matching Works"**
2. Card defaults to **For Families** tab — 5 numbered steps render with icons, bullets, italic pull-quotes, closing line
3. Click **For Caregivers** tab → content swaps to mirrored caregiver copy, no layout shift
4. All terminology audit: no occurrences of *hire, payroll, salary, employer, staff* — only *match, care team, care payments, coordinate*
5. Existing Story / Mission / Vision / Values / Platform Features / Podcast / CTA sections appear unchanged below
6. Mobile (375px wide): card stacks cleanly, tabs full-width, no horizontal scroll
7. Lighthouse: no new console errors, no layout shift on tab switch

