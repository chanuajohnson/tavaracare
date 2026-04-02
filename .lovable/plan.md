

## Add Contextual Hints to Screening Questions

### Problem

Some screening questions (like "How do you keep the main family contact updated about medication needs...") imply the caregiver can use any method they want. But Tavara has a **built-in digital system** for medication logging and care reporting that caregivers are **required** to use. The screening page doesn't communicate this, so caregivers answer without knowing about the platform's tools.

### Also: Quick Assessment Buttons Still Showing

The screenshot confirms the Pass/Neutral/Concern buttons are still visible on the live site. The earlier removal was applied to the codebase but may not have been deployed yet. This plan keeps that removal in place.

### Solution

**File: `src/pages/screening/MobileScreeningPage.tsx`**

Add a **contextual hint system** that displays a brief informational note below certain questions. The hints are matched by keyword patterns in the question text.

**How it works:**

1. Define a small array of hint rules, each with a keyword pattern and a short message:
   - Questions mentioning "medication", "stock", or "supply" show: *"Tavara provides a built-in medication log where you record each administration in real time. This is a required part of the care workflow."*
   - Questions mentioning "report", "e-report", or "digital" show: *"Tavara has a digital care reporting system that all caregivers are required to use for logging activities, notes, and handovers."*
   - Questions mentioning "handwritten" or "documentation" show: *"All documentation at Tavara is done through our digital platform -- no handwritten logs required."*

2. Render the matching hint as a small info card (light blue/muted background, with an info icon) directly below the question text, before the voice/text input area.

**UI example (below the question box):**
```text
┌─────────────────────────────────────────────────┐
│ ℹ️ Tavara provides a built-in medication log    │
│ where you record each administration in real    │
│ time. This is a required part of the care       │
│ workflow.                                       │
└─────────────────────────────────────────────────┘
```

### Technical Details

- Add a `getQuestionHint(questionText: string): string | null` helper function inside the component
- It checks the question text against keyword patterns (case-insensitive) and returns the first matching hint
- In the JSX, after the question `<div>`, conditionally render the hint if one exists
- Styled as a subtle `bg-blue-50 border-blue-200 text-blue-800` card with an `Info` icon from lucide-react
- No database changes needed -- hints are purely UI-side based on question text matching

### Files Changed

| File | Change |
|------|--------|
| `src/pages/screening/MobileScreeningPage.tsx` | Add `getQuestionHint()` function + render hint card below question |

