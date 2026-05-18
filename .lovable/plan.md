## Scope

Two surgical edits + one guardrail update. No business logic, no new components.

## 1. `src/content/blog/posts.ts` — `senior-care-costs-trinidad-tobago-2026` post

Update the rate table (line 179-185) so Live-in shows a concrete floor and Day 0 is listed (no $ figure):

```
| Care type | Typical rate (TTD) |
|---|---|
| Companion / standard care | **$40 / hour** |
| Full service personal care | **$45 / hour** |
| Premium / specialised care | **$50+ / hour** |
| Live-in care | **Starts from $2,400 / week**, quoted by complexity |
| One-time Matching & Placement | **$1,399** |
| Day 0 setup (Care Administrator concierge layer) | Quoted at onboarding |
```

Update the prose in the "Live-in care: how it's actually priced" section (line 223-234) so the floor is also stated inline:

- Add one sentence after line 225: "As a floor, plan for **$2,400 / week** for a basic single-caregiver live-in arrangement; rotation, sleep cover, and complexity move it up from there."
- Keep line 234 ("We always quote live-in arrangements individually…") as the final word.

Also update the FAQ answer at line 317 from "Live-in care is quoted weekly." to "Live-in care starts from $2,400 / week and is quoted by complexity."

No other table, scenario, subscription dollar, or household-total figures change.

## 2. `mem://constraints/financial-privacy-public-surfaces` — guardrail update

The current rule on line 13 forbids any live-in number publicly. Replace that single bullet to permit one floor figure only:

- Allow-list: change "Live-in care is 'quoted weekly, varies by complexity' (no number)." → "Live-in care: a single **'starts from $X / week'** floor figure is permitted, paired with 'quoted by complexity'. No upper bound, no rotation math, no household totals."
- Deny-list: add explicit "Live-in upper-bound, rotation arithmetic, or 2-caregiver weekly totals."
- Why section: add one line — "A single floor anchor prevents 'no number = expensive' bounce; capping it at the floor still blocks wage-inflation pressure from a public ceiling."

Also update the Core line in `mem://index.md` that reads "Public surfaces show ONLY per-hour care tier rates ($40/$45/$50+) and subscription tier NAMES" to append "...plus a single 'starts from' weekly floor for Live-in."

## 3. Verification

- `grep -n "Live-in\|live-in" src/content/blog/posts.ts` shows the new floor in both the table and the prose, FAQ answer updated, no other weekly totals introduced.
- `rg "2,?400" src/content/blog/posts.ts` matches only in the two intended locations + FAQ.
- Manually re-read the surrounding paragraphs for tone (no banned words, no em-dashes, no "It's not just X, it's Y", "care rate" wording preserved).
- Visit `/blog/cost-of-care-trinidad-tobago-2026` in the preview to confirm the table renders cleanly and the FAQ block matches.

## Out of scope

- No edits to `/admin/lifecycle-cost`, `pricing_catalog`, or any scenario math.
- No change to subscription dollar amounts, Day 0 figure, or Home Preparation figures on public pages.
- No edits to `public/llms.txt` unless it carries the same table (will check during execution and only mirror the same two-line change if it does).
