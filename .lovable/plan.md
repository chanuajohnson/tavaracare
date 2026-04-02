

## Fix: Scroll to Top When Navigating Between Screening Questions

### Problem

When the caregiver clicks "Next" or "Previous" on the screening page, the question changes but the page doesn't scroll to the top. On desktop this is annoying; on mobile it would be worse since the question text could be off-screen entirely.

### Solution

**File: `src/pages/screening/MobileScreeningPage.tsx`**

In the navigation handler (around line 207), add `window.scrollTo({ top: 0, behavior: 'smooth' })` after updating `currentIndex` for both "next" and "prev" directions:

```tsx
if (direction === 'next' && currentIndex < questions.length - 1) {
  const nextIdx = currentIndex + 1;
  setCurrentIndex(nextIdx);
  setTextInput(updated[nextIdx]?.text_response || '');
  resetRecording();
  window.scrollTo({ top: 0, behavior: 'smooth' });
} else if (direction === 'prev' && currentIndex > 0) {
  const prevIdx = currentIndex - 1;
  setCurrentIndex(prevIdx);
  setTextInput(updated[prevIdx]?.text_response || '');
  resetRecording();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
```

This is a two-line addition. Both Next and Previous will smoothly scroll the page to the top so the question text is always visible.

