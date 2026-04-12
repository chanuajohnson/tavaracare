

## Plan: Fix Mismatched File Paths for Tricia's Documents

### Root Cause

The "Object not found" error is **not an RLS issue** — the storage policy is working correctly. The actual problem is that the `file_path` values stored in the `professional_documents` table no longer match any files in the `professional-documents` storage bucket.

**Evidence:**

| DB `file_path` (old timestamp) | Actual storage object (new timestamp) |
|---|---|
| `background_check/56922ef7-.../1748972633689_Police Char Cert.png` | `background_check/56922ef7-.../1749573858897_Police Char Cert.png` |
| `certificate/56922ef7-.../1748972625164_Chan Cert 1.png` | `certificate/56922ef7-.../1749573851561_Chan Cert 1.png` |
| `identification/56922ef7-.../1748972572860_Chan ID.png` | `identification/56922ef7-.../1749573846182_Chan ID.png` |

Tricia's files were re-uploaded at a later time (new timestamps), but the original DB records still point to the old paths. The old files no longer exist in storage.

### Solution

Run a migration to update the three stale `file_path` values in `professional_documents` to match the actual storage object paths.

### Migration SQL

```sql
UPDATE professional_documents 
SET file_path = 'background_check/56922ef7-6278-4f3f-b48c-fe309cd80ec9/1749573858897_Police Char Cert.png'
WHERE id = '1e3317e3-5ea8-427b-8062-ed4271558d14';

UPDATE professional_documents 
SET file_path = 'certificate/56922ef7-6278-4f3f-b48c-fe309cd80ec9/1749573851561_Chan Cert 1.png'
WHERE id = 'c62e9f69-21b0-44b7-b288-25bb334c23b1';

UPDATE professional_documents 
SET file_path = 'identification/56922ef7-6278-4f3f-b48c-fe309cd80ec9/1749573846182_Chan ID.png'
WHERE id = 'a07e8ee1-b505-4b7c-ae21-c07d2b90a62e';
```

### Result

- Admin (and Tricia herself) will be able to view and download all 3 documents
- The Eye and Download buttons on the onboarding checklist will work correctly
- No code changes needed — the component logic is correct, only the data was stale

