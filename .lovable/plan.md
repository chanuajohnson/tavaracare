

## Plan: Add Download PDF Report for Family Onboarding Checklist

### What It Does
Adds a "Download Report" button next to the existing "Share Guide" and "Reset" buttons on the Family tab. When clicked, it generates a single-page PDF summarizing the selected family's entire onboarding status -- checklist progress, dates, care summary, payment terms, and onboarding notes -- formatted for stakeholders.

### PDF Layout (single page, landscape A4 for space)

```text
┌──────────────────────────────────────────────────────────────────┐
│  TAVARA.CARE — Family Onboarding Report                         │
│  Family: Ava Johnson    Generated: April 11, 2026               │
│                                                                  │
│  ── Care Summary ──────────────────────────────────────────────  │
│  Rate: $35/hr | Plan: Family Care (weekly) | Start: Apr 13      │
│  Payment: Weekly (Fri) | Late Fee: 5% | Holiday: 1.5x/2x       │
│                                                                  │
│  ── Onboarding Progress: 45/72 (63%) ─────────────────────────  │
│  ✅ Pre-Call Preparation          6/6                            │
│  ✅ Review Client Submissions     8/8                            │
│  ⬜ Platform Overview             3/7                            │
│  ... (all 13 sections as compact rows)                           │
│                                                                  │
│  ── Key Dates ─────────────────────────────────────────────────  │
│  Introduction: Apr 11, 2026 | Meeting: Apr 13 | Start: Apr 14   │
│                                                                  │
│  ── Onboarding Notes ─────────────────────────────────────────   │
│  • [Apr 10] Family prefers morning shifts...                     │
│  • [Apr 11] Nurse assigned: Sandra M...                          │
└──────────────────────────────────────────────────────────────────┘
```

### Implementation

**File: `src/pages/admin/AdminOnboardingChecklistPage.tsx`**

1. Import `jsPDF` (already a project dependency)
2. Add a `generateFamilyReport()` function that:
   - Creates a landscape jsPDF document
   - Renders the Tavara header with family name and date
   - Renders the Care Summary block (rate, plan, start date, payment terms)
   - Iterates over `ONBOARDING_SECTION_DEFS`, counting checked items per section, rendering each as a compact row with check/uncheck icon and progress count
   - Renders key dates (Introduction, Meeting, Start) extracted from `familyCheckedItems`
   - Renders onboarding notes (truncated if too many to fit)
   - Uses small font sizes (8-10pt) and tight spacing to fit on one page
3. Add a "Download Report" button in the `ChecklistTabContent` toolbar (next to Share Guide and Reset), only visible when a family is selected
4. The button calls `generateFamilyReport()` which saves the PDF

### Files Modified

| File | Change |
|------|--------|
| `src/pages/admin/AdminOnboardingChecklistPage.tsx` | Add `generateFamilyReport` function + Download Report button |

### Technical Details
- Uses `jsPDF` directly (no html2canvas needed -- pure text/drawing for crisp output)
- Landscape orientation gives ~280mm width for readable tables
- Compact 8-9pt font for section rows, 10pt for headers
- Color-coded: green for complete sections, gray for incomplete
- Single dependency already in project: `jspdf`

