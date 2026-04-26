## Where the artifacts live

All in `/mnt/documents/`:
- `tavara-lifecycle-cost.pdf` — Apr 24 (original, pre-changes) — **stale**
- `tavara-lifecycle-cost.pptx` — Apr 24 (original, pre-changes) — **stale**
- `tavara-lifecycle-cost_v2.pdf` — Apr 25 12:47 (before today's repricing/terminology/accordion work) — **stale**

The in-app "1-page PDF" button on `/admin/lifecycle-cost` currently links to the original (v1), not even v2.

## What needs to flow into v3

1. **Secondary support repricing**
   - Light Secondary: **$350/wk** (was $150)
   - Standard Secondary: **Custom quote** (was $250/wk) — note: caregiver consultation, possible doubled care payments
   - High-Need Secondary: **Custom quote** (was $400/wk) — note: re-assessment or additional caregiver recommended
2. **Terminology**: "Wages" → "Care payments", "Payroll" → "Care payment records"
3. **Day 5 billing copy**: "Day 5 (Friday of week 1) = first **full** week of care payments + first week of subscription fees. Weeks 2–13 settle into the stable weekly rhythm."
4. **"Before Day 0" free-plan value section** — anonymous "one of our families recently registered, completed care assessment, captured Legacy Story, drafted a care plan, reviewed auto-matches — all before paying a cent."
5. **Optional services notes** — NIS coordination scope, SOP activation real-time visibility, Guided Home Reset = coordination of contractors
6. **Custom-quote badging** for Standard/High-Need secondary (no auto-price in scenario totals)
7. **Updated disclaimer** — Tavara as Care Coordination & Management Platform, never an agency; TTD primary, USD bracketed at 6.78

## Files to create

| File | Purpose |
|---|---|
| `/mnt/documents/tavara-lifecycle-cost_v3.pdf` | 1-page A4 landscape PDF — full lifecycle on one page (Before Day 0 strip → Day 0 bundle → 3 scenarios table → Optional services row → Disclaimer) |
| `/mnt/documents/tavara-lifecycle-cost_v3.pptx` | ~6-slide deck mirroring the on-screen accordion sections, suitable for prospect calls |

## Generation approach

- **PDF**: ReportLab (Python), landscape A4, single page. Use Tavara primary color palette (existing brand blue), Arial/Calibri stack, smart quotes, no Unicode subs/sups. Pull live pricing constants from `src/utils/lifecycleScenarios.ts` so the artifact matches what prospects see in-app.
- **PPTX**: pptxgenjs (Node), 6 slides:
  1. Title — "Care Lifecycle Cost — Day 0 → Month 3"
  2. Before Day 0 — free-plan value (anonymous family story + 6 free capabilities)
  3. Day 0 — mandatory setup bundle (3 items + total in TTD/USD)
  4. Three scenarios — Conservative / Typical / Premium side-by-side, weeks 1-13 stable rhythm
  5. Optional services — opt-in menu with custom-quote badges where applicable
  6. Disclaimer + bank/legal positioning
  
  Embed any images as base64. Use a content-informed palette (Tavara brand blues + warm neutrals), header font with personality, body font clean. Visual motif: rounded cards with thin colored top border. No accent lines under titles.

## Mandatory QA pass (per skill instructions)

For both artifacts:
1. Generate → convert each page/slide to JPEG at 150 DPI via LibreOffice + pdftoppm
2. Inspect every page using read tool — look for: overlapping text, clipped content, edge bleeding, low contrast, misaligned columns, leftover placeholders, font glyph issues (black boxes), uneven spacing
3. List issues found explicitly (assume issues exist on first pass)
4. Fix script → re-render → re-verify affected pages only
5. Repeat until a full pass is clean
6. Final textual verification: `python -m markitdown` on PPTX, `pdftotext` on PDF, grep for "wages", "payroll", "Anna", "Lorem", placeholder strings — must all return zero hits
7. Summarize QA findings + fixes in the final reply

Temporary QA images stay in `/tmp/`, not `/mnt/documents/`.

## In-app link update (small code change)

Update `src/pages/admin/LifecycleCostPage.tsx` header button:
- Change `href="/mnt/documents/tavara-lifecycle-cost.pdf"` → `href="/mnt/documents/tavara-lifecycle-cost_v3.pdf"`
- Add a second link/button for the PPTX (`tavara-lifecycle-cost_v3.pptx`) so prospects can grab both formats

That is the only code edit. No component, logic, or pricing changes.

## Deliverables in final reply

- Two `<lov-artifact>` tags (v3 PDF + v3 PPTX)
- QA summary listing what was checked and any issues found + fixed
- Confirmation that in-app download button now points at v3

## What does NOT change

- No database changes
- No logic changes in `lifecycleScenarios.ts`, `OptionalServicesRow`, `LifecycleCostBuilder`, `ScenarioComparisonGrid`, `FreePlanValueCard`
- v1 and v2 artifacts stay in place as version history
