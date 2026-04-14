

## How This Plan Improves What's Already Built

### Current State (what exists now)
The current `ni184Generator.ts` and `ni187Generator.ts` use **jsPDF** to create brand-new PDFs from scratch with custom layouts. These look like generic reports, not the official government forms. The NI 184 generates a landscape table, and the NI 187 generates a portrait summary -- neither matches the actual government form layout that NIBTT expects.

### What the New Plan Does Differently

1. **Uses the actual government PDF as the template** -- instead of drawing a custom layout, we load the blank NI 184 / NI 187 PDFs and write data directly onto them. The output looks exactly like the official form, ready to submit.

2. **Moves PDF generation server-side** -- an edge function (`generate-nis-form`) handles the heavy lifting with `pdf-lib`, which is better suited for filling existing PDFs than jsPDF (which is designed for creating new ones).

3. **Proper field detection** -- uses the PDF skill scripts to detect whether the government forms have fillable fields (interactive PDF forms) or need coordinate-based text overlay. This determines the most accurate filling method.

4. **Adds manual adjustment inputs** -- the NI 187 has fields like "Balance Brought Forward", "Penalty", and "Interest" that can't come from payroll data. The new UI adds small inputs for these before generating.

### Implementation Plan

#### Step 1: Detect PDF Form Fields
- Copy uploaded NI 184 and NI 187 PDFs into sandbox
- Run `detect_fillable_fields.py` on both to determine filling approach
- If fillable: extract field metadata for direct field filling
- If not fillable: extract layout structure and map coordinates

#### Step 2: Store Blank PDFs
- Create a `nis-forms` Supabase Storage bucket (public read)
- Upload the blank NI 184 and NI 187 PDFs to it

#### Step 3: Create Edge Function `generate-nis-form`
- Accepts: `formType` (184 or 187), `carePlanId`, `familyId`, `periodStart`, `periodEnd`, and optional manual fields (balance_bf, penalty, interest, payment_method)
- Fetches blank PDF from storage
- Queries employer_settings, care_team_members (NIS-registered), payroll_entries for the period
- Uses `pdf-lib` to fill in the form (either via form fields or text overlay)
- Returns the completed PDF

#### Step 4: Update UI
**File: `src/components/care-plan/payroll/NISReportsSection.tsx`**
- Replace current jsPDF-based generators with calls to the edge function
- Add input fields for NI 187 manual values (balance b/f, penalty, interest)
- Keep the period selector as-is
- Download the returned PDF blob

#### Step 5: Remove Client-Side Generators
- Remove or deprecate `ni184Generator.ts` and `ni187Generator.ts` (replaced by edge function)

#### Step 6: Fix Current Errors
- The "No NIS-registered employees" error happens because `is_nis_registered` hasn't been toggled for existing employees
- Add better error messaging pointing users to the Care Team page to set the NIS flag

### Files to Create/Modify

| File | Change |
|------|--------|
| `supabase/functions/generate-nis-form/index.ts` | New edge function for PDF generation |
| `src/components/care-plan/payroll/NISReportsSection.tsx` | Call edge function instead of client-side generators; add NI 187 manual inputs |
| `src/services/care-plans/reports/ni184Generator.ts` | Remove (replaced by edge function) |
| `src/services/care-plans/reports/ni187Generator.ts` | Remove (replaced by edge function) |
| Storage migration | Create `nis-forms` bucket with blank PDFs |

### Result
Click "Download NI 184" or "Download NI 187" and get the actual government form pre-filled with all your payroll data. No manual transcription needed -- just print and submit.

