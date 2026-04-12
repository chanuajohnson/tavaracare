

## Plan: Preserve Note Formatting + Add "Action By" with Completion Tracking

### Problem 1: Notes lose formatting
Currently, note text is rendered with `<p className="text-sm">{note.text}</p>` (line 189). This collapses all whitespace, newlines, and indentation into a single blob of text. The fix is simple: add `whitespace-pre-wrap` to preserve the formatting exactly as the admin typed it.

### Problem 2: No "Action By" accountability loop
Admin wants to assign a specific person (e.g., "Chan", "Nurse Trisha") as the responsible party for each note/action item, and that person should be able to check it off as completed. This creates a full accountability loop: assign -> action -> completion -> visible to admin.

### Changes

**1. Preserve note formatting (`OnboardingNotesCard.tsx`)**
- Change `<p className="text-sm">` to `<p className="text-sm whitespace-pre-wrap">` for note text display
- Same treatment for response text display

**2. Extend `OnboardingNote` interface with action tracking fields**
```typescript
export interface OnboardingNote {
  text: string;
  assigned_to: string;
  created_by: string;
  created_at: string;
  // Existing acknowledgment fields...
  acknowledged_at?: string;
  acknowledged_by?: string;
  response_text?: string;
  response_at?: string;
  // NEW: Action assignment and completion
  action_by?: string;        // Free-text name: "Chan", "Trisha", etc.
  completed_at?: string;     // Timestamp when marked done
  completed_by?: string;     // Who checked it off
}
```

**3. Add "Action By" input when creating/editing notes (admin view)**
- Add an optional text input field next to the "Assign to" dropdown: "Action By (person name)"
- When set, the note displays a badge like "Action by: Chan"
- The action_by field is saved into the note JSON

**4. Add completion checkbox for the assigned action person**
- **Admin view**: Shows completion status -- green checkmark with timestamp if completed, or "Pending" label if not. Admin can also mark it complete.
- **Professional/Family view (readOnly)**: If the note has an `action_by` value, show a checkbox labeled "Mark as completed". Once checked, it records `completed_at` and `completed_by` and becomes read-only.
- This is separate from the existing "Acknowledge" flow. Acknowledge = "I've read this." Completed = "I've done this."

**5. Wire up completion handlers**
- New prop: `onCompleteNote?: (index: number) => void`
- In `AdminOnboardingChecklistPage.tsx`: add `handleCompleteNote` that sets `completed_at` and `completed_by` on the note and saves
- In `ProfessionalOnboardingChecklistPage.tsx` and `FamilyOnboardingChecklistPage.tsx`: same handler for their respective views

### UI mockup (admin creating a note)
```text
┌─────────────────────────────────────────────┐
│ [Textarea: Type a note or action item...]   │
│                                             │
│ Assign to: [Caregiver ▾]                    │
│ Action by: [Chan____________]  (optional)   │
│                              [+ Add Note]   │
└─────────────────────────────────────────────┘
```

### UI mockup (note displayed)
```text
┌─────────────────────────────────────────────┐
│ Please confirm podiatry needs               │
│   with family and update care plan.         │
│                                             │
│ 👤 Family · Action by: Chan                │
│ Apr 12, 2026 11:26 AM                       │
│ ✅ Completed by Chan · Apr 12, 11:45 AM    │
│  — or if pending —                          │
│ ☐ Mark as completed                         │
└─────────────────────────────────────────────┘
```

### Files to modify

| File | Change |
|------|--------|
| `OnboardingNotesCard.tsx` | `whitespace-pre-wrap` on note text, add `action_by` input, add completion checkbox/display, new `onCompleteNote` prop |
| `AdminOnboardingChecklistPage.tsx` | Wire `handleCompleteNote` for both family and professional notes |
| `ProfessionalOnboardingChecklistPage.tsx` | Wire `onCompleteNote` handler |
| `FamilyOnboardingChecklistPage.tsx` | Wire `onCompleteNote` handler |

### No migration needed
All data is stored in the `checked_items` JSON column. Adding `action_by`, `completed_at`, and `completed_by` fields requires no schema change.

