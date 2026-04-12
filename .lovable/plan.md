

## Plan: Add Document View/Download to Admin Onboarding Checklist

### Problem
The admin onboarding checklist shows Tricia's 3 uploaded documents but they are not clickable. Admins cannot view or download them, unlike the professional's own `DocumentManager` which has download via signed URLs.

### Changes

| File | Change |
|------|--------|
| **`src/components/admin/onboarding/ProfessionalSubmissionReview.tsx`** | Add `Eye` and `Download` icon buttons to each document row. On click, create a signed URL from the `professional-documents` storage bucket using `doc.file_path`, then either open in a new tab (view) or trigger a download. Add `Button` import and `Eye`/`Download` to icon imports. |

### Technical Detail

Each document row (lines 233-245) will get two small icon buttons:

1. **View** (Eye icon) — creates a signed URL and opens it in a new tab via `window.open()`
2. **Download** (Download icon) — creates a signed URL and triggers download via a temporary `<a>` element

Both use `supabase.storage.from('professional-documents').createSignedUrl(doc.file_path, 300)` (5-minute expiry). A toast will show on error.

The `file_path` field already exists on each document record and points to the storage object path. The new admin RLS policy we just added ensures the admin can access the document metadata; storage access uses signed URLs which bypass storage RLS.

