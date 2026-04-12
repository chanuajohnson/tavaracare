
## Plan: Fix Denise Narcis Document Viewing in Admin Onboarding Checklist

### What the issue actually is
I reviewed the admin document flow and your latest screenshots. The failure for Denise Narcis is no longer a missing-path or storage-policy problem.

The current problem is this:

- Denise’s profile is `24fe4121-89e6-4a3a-ba9c-c56e768afc05`
- The admin checklist is generating a signed Supabase Storage URL for her document
- Chrome then opens that signed URL in a new tab
- That new tab is being blocked client-side with `ERR_BLOCKED_BY_CLIENT`

Your screenshot proves the signed URL is already pointing to Denise’s actual storage object path:
```text
.../object/sign/professional-documents/identification/24fe4121-89e6-4a3a-ba9c-c56e768afc05/1774840149728_...
```

So this is not the old Tricia stale-path issue, and not the admin storage-RLS issue either.

### Root cause
The admin UI in `src/components/admin/onboarding/ProfessionalSubmissionReview.tsx` currently does this for View:

- calls `createSignedUrl(doc.file_path, 300)`
- then runs `window.open(data.signedUrl, '_blank')`

That sends the browser directly to the Supabase signed URL domain. In your environment, Chrome/client tooling is blocking that navigation.

### Fix to implement
Update the admin document viewer so it does **not** rely on opening the signed Supabase URL in a separate browser tab.

Instead:

1. Keep using `createSignedUrl` to authorize access
2. Fetch the file content in-app
3. Create a local blob URL with `URL.createObjectURL(...)`
4. Show the file inside a Tavara dialog/modal for viewing
5. Keep Download as a blob-based download as well

### Files to update
- `src/components/admin/onboarding/ProfessionalSubmissionReview.tsx`

### Implementation details
#### 1. Add an in-app document preview flow
For each document action:

- Request signed URL from Supabase
- `fetch()` the signed URL
- Convert response to `Blob`
- Build a local blob URL
- Open a dialog instead of `window.open(...)`

#### 2. Support both PDFs and images
Use the document MIME type already stored on `professional_documents`:

- If PDF: render with `<iframe src={blobUrl} />`
- If image: render with `<img src={blobUrl} />`
- If unsupported: show a clear message and offer download only

#### 3. Replace direct-tab download with safer blob download
For download:

- fetch signed URL
- convert to blob
- create object URL
- trigger `<a download>` using the object URL

This avoids the blocked direct navigation to the Supabase domain.

#### 4. Clean up object URLs
When preview closes or changes:

- revoke blob URLs with `URL.revokeObjectURL(...)`

### Why this should solve Denise’s issue
Your screenshot shows the app is already reaching the correct Denise storage object path. The break happens when the browser is asked to navigate directly to the Supabase signed URL in a new tab. Rendering the file inside the app from a fetched blob avoids that blocked navigation path.

### Expected result after implementation
For Denise Narcis on `/admin/onboarding-checklist`:

- Eye button opens her ID/certificate/background-check inside a Tavara modal
- Download button downloads the same file without sending the browser to the blocked Supabase URL tab
- Admin can review documents the same way professionals effectively can after upload

### Technical notes
- Existing storage and DB policy work already done should remain in place
- No route, auth provider, or registration flow changes are needed
- No core protected files need to be touched
- This is an isolated UI fix in the admin onboarding review component only
