

## Plan: Compact the "How Tavara Matching Works" card with accordions

You're right — current card is a wall of text. Tighten it visually so users skim, click what interests them, and move on.

---

### What changes

**File:** `src/components/about/HowMatchingWorksCard.tsx` (existing — refactor only)

No new files. No other pages touched. Same copy, same Family/Caregiver tabs, same closing line — just a denser, click-to-expand layout.

---

### Visual changes

**Before:** All 5 steps fully expanded, ~600px tall per tab, vertical timeline with connecting lines.

**After:** All 5 steps collapsed by default, ~50px each = ~250px tab body. One click expands the step you want.

```text
┌─ How Tavara Matching Works ────────────────────┐
│ A real match isn't a search result…            │
│                                                 │
│ [ For Families ] [ For Caregivers ]            │
│                                                 │
│ ▸ 1  💙 Understand Your Reality                │
│ ▸ 2  ✨ Match for Fit                          │
│ ▾ 3  🤝 Meet Your Care Team                    │  ← clicked open
│      • Care coordinator visits…                │
│      • Care team confirmed…                    │
│      • Initial family meeting…                 │
│      • Optional trial day…                     │
│      "A match on paper becomes a person…"      │
│ ▸ 4  🏡 Prepare the Home for Care              │
│ ▸ 5  🔄 Coordinate and Sustain                 │
│                                                 │
│  A good match isn't enough — the whole         │
│  system has to work.                            │
└─────────────────────────────────────────────────┘
```

---

### Implementation details

- Swap the current `StepBlock` mapped layout for **shadcn `Accordion`** (`type="single"`, `collapsible`, no default open value) — already in your codebase at `src/components/ui/accordion.tsx`
- Each step = one `AccordionItem`
- **AccordionTrigger** (the always-visible row): number badge + icon + title only
- **AccordionContent**: bullets + intro/outro paragraphs + italic pull-quote
- Drop the vertical connector line between steps (was visually heavy and not needed once collapsed)
- Reduce card header padding slightly (`py-4` instead of default `p-6`) so the whole card feels tighter
- Tighten step typography: title `text-base` instead of `text-lg/xl`
- Closing line band: keep but smaller padding (`py-3 px-4`)
- Both tabs (Family + Caregiver) use the same accordion structure with their own copy
- All 5 collapsed = ~250–300px card body height vs. current ~600–700px

---

### What stays exactly the same

- All copy (5 family steps, 5 caregiver steps, all bullets, intros, outros, pull-quotes, closing line)
- Tabs toggle (Family default, Caregiver alternate)
- Card placement on `/about` between intro and Story/Mission grid
- Framer-motion fade-in on the card
- Color palette (primary-50/100/600/700/800)
- Lucide icons per step (`Heart`, `Sparkles`, `Users`, `Home`, `Repeat`)
- Terminology (care payments, care team, coordinate, match — never hire/payroll/employer)

---

### Acceptance test

1. `/about` → "How Tavara Matching Works" card is now visibly shorter (≈40% of previous height)
2. All 5 steps appear collapsed by default — only number + icon + title visible
3. Click step 2 → smoothly expands showing 4 bullets + pull-quote, chevron rotates
4. Click step 4 → step 2 collapses, step 4 opens (single-open mode)
5. Click step 4 again → it collapses, no step open (collapsible mode)
6. Switch to **For Caregivers** tab → all 5 caregiver steps render collapsed, same behaviour
7. Closing line *"A good match isn't enough — the whole system has to work."* stays visible at the bottom
8. Mobile (375px): accordion triggers stay tappable, content reflows cleanly, no horizontal scroll

