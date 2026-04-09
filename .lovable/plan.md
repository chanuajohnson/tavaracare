

## Comprehensive Daily Care Checklist Enhancement

### What Changes

#### 1. Select All per Section Card
Each checklist section card gets a "Select All" checkbox in the header next to the section title. Checking it toggles all items in that section. Unchecking it clears all items.

#### 2. Select All for Entire Day
A master "Select All Tasks" button/checkbox at the top of the checklist (in the header card) that toggles all 34 items across all sections at once.

#### 3. Enhanced WhatsApp Summary
Currently the WhatsApp message only shows incomplete sections. The improved message will:
- Show ALL sections with their completion status
- List completed tasks with details (not just checkmarks)
- Include the specific shift title (e.g., "Monday – Friday, 8 AM – 6 PM") instead of generic "morning"
- Include time in/out
- Add a "Handoff Notes" section
- Format as a proper shift handoff briefing

#### 4. Shift Type from Actual Assigned Shifts
Replace the generic Morning/Afternoon/Night dropdown with actual shifts from the `care_shifts` table for the selected family. When the nurse selects a client:
- Fetch their upcoming/today's shifts from `care_shifts` where `caregiver_id` = current user and `family_id` = selected family
- Show shifts by their real titles (e.g., "☀️ Monday – Friday, 8 AM – 4 PM") with actual start/end times
- Auto-populate Time In / Time Out from the selected shift
- Keep a fallback "Other" option for ad-hoc shifts

#### 5. Medication Management Link
The "Administer medications (under supervision)" checklist item gets a clickable link icon next to it. When a family is selected and has a care plan, this link navigates to `/family/care-management/{carePlanId}?tab=medications` — the Medications tab of that family's care plan.

#### 6. Enhanced `useCurrentAssignments` Hook
Add `carePlanId` and `familyId` data to enable fetching shifts. The hook already returns `carePlanId` — we just need to use it in the checklist to fetch relevant shifts.

### Files Modified

| File | Change |
|------|--------|
| `src/components/professional/DailyChecklist.tsx` | All UI changes: select all, shift dropdown from care_shifts, medication link, enhanced WhatsApp message |
| `src/hooks/useCurrentAssignments.ts` | No changes needed — already returns `carePlanId` and `familyId` |

### Technical Details

**Shift fetching logic** (in DailyChecklist):
- When `clientName` changes, find the matching assignment to get `familyId` and `carePlanId`
- Query `care_shifts` where `caregiver_id = user.id AND family_id = selectedFamilyId` and shifts are near the selected date
- Populate shift dropdown with real shift titles and times
- On shift selection, auto-fill `timeIn`/`timeOut` from `start_time`/`end_time`

**WhatsApp message format**:
```text
📋 *SHIFT HANDOFF REPORT*
━━━━━━━━━━━━━━━━━━━━━
👤 Nurse: Tricia Cumm
🏠 Client: Peltier Family
📅 Date: 2026-04-09
⏰ Shift: Monday – Friday, 8 AM – 4 PM (8:00 AM – 4:00 PM)
✅ Completed: 30/34 tasks (88%)

🌅 *Start of Shift* (6/6) ✅
  ✅ Greet and check in with client
  ✅ Review previous shift notes
  ...

🩺 *Care Tasks* (4/5)
  ✅ Assist with bathing/personal hygiene
  ❌ Administer medications — see meds log
  ...

📝 *Notes for Next Nurse:*
Client was in good spirits today...

⚠️ *Items Needing Attention:*
  - Administer medications (under supervision)
  ...
━━━━━━━━━━━━━━━━━━━━━
Logged via Tavara Care
```

**Medication link**: When the nurse checks "Administer medications", or clicks the link icon, it opens the care plan's medications tab in a new tab. The URL is constructed from the selected assignment's `carePlanId`.

### What This Does NOT Change
- The checklist sections/items themselves
- The database schema (daily_care_logs table)
- The save logic (same insert)
- Any routing or navigation files
- The useCurrentAssignments hook

