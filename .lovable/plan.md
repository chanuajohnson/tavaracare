

## Plan: Note Acknowledgment & Response System for Professionals

### Context
Currently, admin notes on the professional's onboarding checklist are read-only. The professional (e.g., Trisha) can see notes like "Test Note" but has no way to signal she's read them or respond. The user wants a respectful, lightweight acknowledgment system -- not a full chat thread.

### Research-Informed Design Decision

After considering common patterns for this kind of one-directional communication with acknowledgment:

1. **Read receipts only** (e.g., Slack "seen by") -- too passive, no way to ask a question
2. **Full comment threads** -- too heavy, creates back-and-forth the user explicitly doesn't want
3. **Acknowledge + single reply** (best fit) -- professional can mark "Acknowledged" and optionally leave one brief response. Admin sees the status change and response. No further threading.

This mirrors patterns used in medical/care handoff systems: the sender posts an instruction, the receiver acknowledges and can add a brief clarifying note. It's respectful, bounded, and auditable.

### What changes

**1. Extend the `OnboardingNote` interface**

Add two new optional fields:
- `acknowledged_at?: string` -- timestamp when professional marked it read
- `acknowledged_by?: string` -- who acknowledged (user ID or name)
- `response_text?: string` -- optional brief response from professional
- `response_at?: string` -- timestamp of response

**2. Update `OnboardingNotesCard` component**

When `readOnly` is true (professional/family view), each note will show:
- An "Acknowledge" button (checkmark icon) if not yet acknowledged
- A green "Acknowledged" badge with timestamp if already acknowledged
- A small "Add Response" text button that expands a single-line textarea (max 280 chars) for one brief reply
- Once a response is submitted, it shows below the note as an indented reply with the professional's name and timestamp
- Response is one-time only -- once submitted, it becomes read-only

When `readOnly` is false (admin view), admin sees:
- The acknowledgment status (pending/acknowledged) for each note
- Any response the professional left, displayed below the note

**3. Add callbacks for professional-side persistence**

New props on `OnboardingNotesCard`:
- `onAcknowledgeNote?: (index: number) => void`
- `onRespondToNote?: (index: number, responseText: string) => void`

**4. Update `ProfessionalOnboardingChecklistPage.tsx`**

- Wire up `onAcknowledgeNote` and `onRespondToNote` to update the notes array in the checklist's `checked_items` JSON and save to Supabase
- Professional can only acknowledge/respond to notes assigned to "caregiver"

**5. Update `FamilyOnboardingChecklistPage.tsx`**

- Same pattern: family members can acknowledge/respond to notes assigned to "family"

### UI mockup (professional view)

```text
┌─────────────────────────────────────────────┐
│ 📝 Notes & Action Items                    │
├─────────────────────────────────────────────┤
│ Please confirm podiatry needs with family   │
│ 🏢 Admin · Apr 12, 2026 11:26 AM          │
│                                             │
│   [✓ Acknowledge]  [Reply]                  │
├─────────────────────────────────────────────┤
│ After acknowledgment:                       │
│                                             │
│ Please confirm podiatry needs with family   │
│ 🏢 Admin · Apr 12, 2026 11:26 AM          │
│ ✅ Acknowledged · Apr 12, 2026 11:30 AM    │
│                                             │
│   ↳ "Confirmed with Mrs. Chan, noted in     │
│      care plan." — Trisha · 11:31 AM        │
└─────────────────────────────────────────────┘
```

### Files to modify

| File | Change |
|------|--------|
| `src/components/admin/onboarding/OnboardingNotesCard.tsx` | Add acknowledge/response UI, new props, extended note rendering |
| `src/pages/professional/ProfessionalOnboardingChecklistPage.tsx` | Wire up acknowledge/respond handlers, save to Supabase |
| `src/pages/family/FamilyOnboardingChecklistPage.tsx` | Same handlers for family-assigned notes |

### No database migration needed
The notes are stored as a JSON array inside `checked_items`. Adding `acknowledged_at`, `acknowledged_by`, `response_text`, and `response_at` fields to each note object in JSON requires no schema change.

