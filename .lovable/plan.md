

## Plan: Fix PDF Document Preview in Admin Onboarding Checklist

### Problem
The PDF document preview modal in `ProfessionalSubmissionReview.tsx` shows a broken/empty state. The file title "id +Dp identi.pdf" appears but the actual PDF content doesn't render. This is because `blob:` URLs inside `<iframe>` elements are unreliable across browsers and sandboxed preview environments.

### Solution
Replace the `<iframe>` PDF preview with a dual approach:
1. Use an `<object>` tag (more reliable for blob PDFs) with an `<iframe>` fallback inside it
2. Add a "Open in New Tab" button so the admin can always view the document even if inline preview fails
3. Show the professional's UUID on the Uploaded Documents section header for easy reference/debugging

### Files to modify

| File | Change |
|------|--------|
| `src/components/admin/onboarding/ProfessionalSubmissionReview.tsx` | Replace `<iframe>` with `<object>` + fallback, add "Open in New Tab" button, display professional ID |

### Specific changes

**1. Replace iframe with object tag for PDF preview (line ~288)**
```tsx
// Instead of:
<iframe src={previewBlobUrl} ... />

// Use:
<object data={previewBlobUrl} type="application/pdf" className="w-full h-[70vh]">
  <div className="text-center py-12 space-y-3">
    <p>PDF preview not available in this browser.</p>
    <Button onClick={() => window.open(previewBlobUrl, '_blank')}>
      Open in New Tab
    </Button>
  </div>
</object>
```

**2. Add "Open in New Tab" button alongside existing preview**
Always show a small button to open the document in a new tab as a reliable fallback.

**3. Display professional ID on the documents section**
Add the `professionalId` as a small copyable badge near the "Uploaded Documents" header so the admin can always reference it.

### No migration needed
This is a frontend-only fix for document rendering.

