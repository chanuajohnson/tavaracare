

## Plan: Fix Medication Timestamp + Add Daily Care Quick View on Family Dashboard

### Problem Summary
Three issues identified:

1. **Medication timestamp always shows scheduled time, not actual time**: When administering via the Schedule View, the code uses `new Date(\`${date}T${dose.time}\`).toISOString()` — this records the *scheduled* time (e.g., 08:00) instead of the *actual* current time (e.g., 08:38). Confirmed in DB: APO Atenolol shows `12:00:00+00` (= 08:00 Trinidad time) instead of actual administration time.

2. **No daily quick view on family dashboard**: Families must navigate through Care Plans > select plan > Medications tab > scroll to see today's medication administrations and caregiver daily logs. There should be a quick-glance card right below the Quick Access bar.

3. **Daily checklist visibility for families**: When a nurse logs her daily checklist (Start of Shift, Care Tasks, etc.), the family should see a summary of which sections are in progress/completed — without needing to dig into the care plan.

---

### Changes

#### 1. Fix Medication Administration Timestamp
**File: `src/components/medication/MedicationScheduleView.tsx`**

Three locations where `administered_at` is constructed using scheduled time instead of actual time:
- **Line 192** (`handleIndividualAdministration`): Change from `new Date(\`${format(selectedDate, 'yyyy-MM-dd')}T${dose.time}\`).toISOString()` to `new Date().toISOString()`
- **Line 229** (`handleBatchAdministration`): Same fix — use `new Date().toISOString()`
- **Line 267** (`handleConflictResolution`): Same fix — use `new Date().toISOString()`

This ensures the recorded timestamp reflects when the nurse actually clicks "Administer," not when the dose was scheduled.

#### 2. Create Daily Care Quick View Card
**New file: `src/components/family/DailyCareQuickView.tsx`**

A card placed just below the Quick Access bar on the Family Dashboard showing today's activity at a glance:

**Section A — Today's Medication Administrations**
- Query `medication_administrations` joined with `medications` and `care_plans` for today's date, filtered by family's care plan(s)
- Display each administration: medication name, dosage, time, administered by (name + role badge)
- Shows "No medications administered today" if empty

**Section B — Caregiver Daily Log Progress**
- Query `daily_care_logs` where `family_id = auth.uid()` and `shift_date = today`
- Show the caregiver's name, shift time (time_in - time_out), and a section-by-section progress summary from `checklist_data`
- For each section (Start of Shift, Care Tasks, Home Tasks, etc.), show a small progress indicator (e.g., "3/5 tasks") with a checkmark if fully complete
- Show notes if present
- "No shift logs today" if empty

**Design**: Compact card with two collapsible sub-sections. Uses existing design patterns (Card, Badge components). Link at bottom "View Full Care Plan" pointing to the care management page.

#### 3. Add Quick View to Family Dashboard
**File: `src/components/family/FamilyDashboard.tsx`**

Import and render `DailyCareQuickView` directly after the Quick Access bar (after line 122), before the Rate Information blurb. This ensures it's the first substantive content families see.

---

### Files to modify

| File | Change |
|------|--------|
| `src/components/medication/MedicationScheduleView.tsx` | Fix 3 lines: use `new Date().toISOString()` instead of scheduled time |
| `src/components/family/DailyCareQuickView.tsx` | **New** — daily medication admin + nurse checklist quick view card |
| `src/components/family/FamilyDashboard.tsx` | Import and render `DailyCareQuickView` below Quick Access bar |

### No migration needed
Families already have SELECT access to `daily_care_logs` (via `family_id = auth.uid()`) and `medication_administrations` (via care plan joins). Frontend-only changes.

