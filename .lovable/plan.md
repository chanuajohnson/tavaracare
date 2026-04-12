

## Plan: Fix Document Preview by Using Signed URLs Directly

### Problem
The current implementation fetches document content via a Supabase signed URL, converts it to a `blob:` URL, then tries to render/open that blob URL. Chrome blocks `blob:` URLs opened in new tabs (`ERR_BLOCKED_BY_CLIENT`), and the `<object>` tag also fails to render PDFs from blob URLs in the Lovable preview sandbox.

### Solution
Store the **signed URL directly** alongside the blob URL. Use the signed URL for:
- The `<object data="...">` PDF embed (signed URLs work cross-origin)
- The "Open in New Tab" buttons (signed URLs open normally in Chrome)
- Keep blob URL only for image previews (which work fine inline)

### Changes to `src/components/admin/onboarding/ProfessionalSubmissionReview.tsx`

**1. Add `previewSignedUrl` state** to store the direct Supabase signed URL.

**2. Update `fetchDocBlob`** to also return the `signedUrl` string.

**3. Update `handleView`** to store the signed URL in state.

**4. Update the PDF preview section** (~line 288-316):
- Use `previewSignedUrl` for the `<object data="...">` tag instead of `previewBlobUrl`
- Use `previewSignedUrl` for all "Open in New Tab" buttons
- Keep `previewBlobUrl` for inline image rendering only

**5. Update cleanup** to also clear `previewSignedUrl` when dialog closes.

### Result
- PDFs will render directly in the `<object>` tag using the signed URL
- "Open in New Tab" will open the actual Supabase file URL (not a blob)
- No more `ERR_BLOCKED_BY_CLIENT` errors
- Downloads continue working via blob URL (which is fine for programmatic downloads)

### No migration needed
Frontend-only fix.

