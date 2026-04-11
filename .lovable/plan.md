

## Plan: Sync Professional Dates from Family + Make Reports Informative

### Problem 1: Professional post-onboarding dates duplicate family entries
The professional `post_onboarding` section has its own `dateFields` (Introduction Date, Meeting Date, Start Date) requiring manual entry, even though these dates already exist on the linked family's checklist. When a family is assigned, the professional side should display the family's dates as read-only instead of requiring duplicate entry.

### Problem 2: Reports are uninformative
The current PDF reports show only section titles with completion counts (e.g., "Pre-Call Preparation 6/6"). For stakeholders and professionals, the report needs to show **what was actually covered** -- the individual checklist items with their status. This is the whole purpose: the nurse sees what she agreed to, the family sees what was discussed.

---

### Changes

**1. Sync professional post_onboarding dates from linked family (no duplicate entry)**

In `ChecklistTabContent`, when rendering the professional `post_onboarding` section's date fields:
- If `linkedCheckedItems` has the corresponding date value, display it as a read-only badge (not a date picker)
- Only show the date picker if no linked family date exists
- This means Introduction Date, Meeting Date, and Start Date on the professional side auto-populate from the family

**2. Redesign both PDF reports to show actual checklist items**

Replace the current "section title + count" format with a compact, informative layout that lists every checklist item with a check/uncheck indicator. To fit on one page:

- Use 6.5-7pt font for items (compact but readable in landscape A4)
- Group items under their section header in a 2-column layout
- Each item gets a ✓ or ○ prefix, truncated if too long
- T&C section on professional report stays prominent (already done)
- Notes section: show up to 5 most recent, truncated to fit
- Dynamically reduce font size or note count if content is close to overflowing

```text
TAVARA.CARE — Family Onboarding Report
Family: Ana Maria Aimey  |  Generated: April 11, 2026

── Care Summary ──
Rate: $35/hr | Plan: Family Care (weekly) | Start: Apr 13, 2026
Payment: Weekly (Fri) | Late Fee: 5% after 3 days | Holiday: 1.5x/2x

── Onboarding Progress: 78/91 (86%) ──

Pre-Call Preparation (6/6)              | Platform Overview (7/7)
✓ Review family account status          | ✓ How to log in
✓ Review existing care plan             | ✓ Family dashboard layout
✓ Note care recipient details           | ✓ Care Plans quick link
✓ Have phone/WhatsApp ready             | ...
✓ Review notes from inquiry             |
✓ Prepare walkthrough materials         | Medication Management (7/7)
                                        | ✓ How family adds medications
Care Plan Review (8/8)                  | ✓ Medication schedule view
✓ Review existing care plan details     | ...
✓ Care plan types                       |
...                                     |

── Key Dates ──
Introduction: Apr 10  |  Meeting: Apr 11  |  Start: Apr 13

── Notes ──
• [Apr 10] [Admin] Family prefers morning shifts...
```

### Files Modified

| File | Changes |
|------|---------|
| `src/pages/admin/AdminOnboardingChecklistPage.tsx` | (1) In `ChecklistTabContent`, show linked family dates as read-only badges for professional post_onboarding date fields. (2) Rewrite `generateFamilyReport()` to list individual items per section in 2-column layout. (3) Rewrite `generateProfessionalReport()` similarly, keeping T&C detail section. |

### Technical Details

- Date syncing: In the date field rendering logic (line ~737), check if `section.id === "post_onboarding" && linkedCheckedItems?.[dateKey]` exists; if so, render a static badge instead of `DateFieldPicker`
- PDF layout: 2-column flow where each section lists its items. Use 6.5pt font, 3mm line height. Sections flow naturally across columns. If a section won't fit in current column, move to next column or truncate last items with "..."
- Page overflow protection: track Y position, stop rendering items when approaching footer zone (H - 15mm)

