
Goal: fix the NI 184 so the downloaded PDF is truly pre-filled in the correct boxes, not just “more centered.”

What I confirmed from your uploaded PDF
- The form is not blank anymore, so the earlier off-page rendering bug was partly fixed.
- But the overlay text is still wrong in a more important way:
  - the inserted values are rendering vertically/rotated
  - several values are landing in the wrong cells
  - the generated row content is not aligned to the government form grid
- I also confirmed the NI 184 template itself has `/Rotate 90`, and the current generator is still drawing directly onto that rotated page.

Root cause
- The current code in `src/services/care-plans/reports/ni184Generator.ts` only adjusted the Y-axis using a “visualHeight” workaround.
- That solved “invisible/off-page” text, but not the rotated drawing context.
- Because the page itself is rotated, `drawText()` is effectively being placed in a rotated coordinate space, which is why the text in your output appears vertical.
- There is also a second accuracy issue in the row logic:
  - `weeklyValues` is built with `Array.from(weekMap.values()).sort()`
  - that sorts contribution amounts, not weeks
  - so even if placement were correct, WK1–WK5 can still be assigned to the wrong columns.

What I would change
1. Normalize the NI 184 page before drawing
- Update `ni184Generator.ts` so we do not draw onto a rotated page as-is.
- Safer approach:
  - load the official page
  - create a new unrotated landscape page
  - draw the original NI 184 template page onto it
  - then overlay text onto the new normalized page
- This gives one stable coordinate system for all text placement.

2. Recalibrate NI 184 coordinates against the normalized page
- Re-map the header fields and table rows on the normalized landscape page.
- Specifically verify:
  - employer trade name
  - reg number
  - service centre
  - phone
  - period from/to
  - no. of weeks
  - first data row baseline
  - footer totals/date

3. Fix weekly column ordering
- Replace value-sorting with ordered week-slot placement.
- Map entries by actual week sequence within the selected period, then place them into WK1, WK2, WK3, WK4, WK5 in chronological order.

4. Tighten row text behavior
- Keep names horizontal and within the row.
- Add small per-column font/offset adjustments if needed for DOB, dates employed, salary, and totals.
- Preserve current 11-row max.

5. Validate NI 187 defensively
- NI 187 appears less affected because it is portrait, but I would still review it for the same normalized-page safety pattern so both generators behave consistently.

Files to update
- `src/services/care-plans/reports/ni184Generator.ts`
- likely minor follow-up in `src/services/care-plans/reports/ni187Generator.ts` for consistency only

Expected result after implementation
- NI 184 text will render horizontally
- values will sit inside the correct boxes/rows
- WK1–WK5 will reflect actual payroll week order instead of sorted dollar amounts
- the downloaded PDF will be the official form with usable pre-filled data, not a visually broken overlay

Important note
- This is not a copy tweak or “move 20px left” fix.
- The underlying fix is to normalize the rotated government PDF before drawing. That is the correct technical fix for what your uploaded result is showing.
