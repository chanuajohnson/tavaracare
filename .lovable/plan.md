

## Fix: Allow Re-generating AI Report

### Problem

The "Generate AI Report" button only appears when `ai_summary` is null. Tricia's session already has an old (incorrect) summary from before transcription was added, so the button is hidden. There's no way to re-run the AI analysis.

### Solution

**File: `src/components/admin/ScreeningSessionManager.tsx`**

Change the condition on line 485 from:

```tsx
{selectedSession.status === 'completed' && !selectedSession.ai_summary && (
```

To:

```tsx
{(selectedSession.status === 'completed' || selectedSession.status === 'reviewed') && (
```

This shows the button for any completed/reviewed session regardless of whether a summary already exists. The button label will change based on context:
- "Generate AI Summary" when no summary exists
- "Regenerate AI Summary" when a summary already exists

This lets the admin re-run the AI report to get an accurate summary now that voice transcription is working.

