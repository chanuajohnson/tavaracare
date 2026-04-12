

## Plan: Fix "Object not found" for Admin Document View/Download

### Problem
The toast error "Failed to access document: Object not found" occurs because the **Supabase Storage** bucket `professional-documents` has SELECT policies that only allow users to view files where their own `auth.uid()` matches the folder path. The database RLS was fixed, but the **storage-level RLS** still blocks admin access.

### Root Cause
Storage file paths follow the pattern: `{document_type}/{user_id}/filename.png` (e.g., `identification/56922ef7-.../Chan_ID.png`). The existing storage policies check `(storage.foldername(name))[2] = auth.uid()` or `(storage.foldername(name))[1] = auth.uid()`, which fails for admins since their UID doesn't match the professional's folder.

### Solution
Add a storage SELECT policy on `storage.objects` allowing admins to access files in the `professional-documents` bucket.

### Changes

| Change | Detail |
|--------|--------|
| **New migration** | Add a SELECT policy on `storage.objects` for the `professional-documents` bucket using `public.has_role(auth.uid(), 'admin')` |

### Migration SQL

```sql
CREATE POLICY "Admins can view all professional documents in storage"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'professional-documents'
  AND public.has_role(auth.uid(), 'admin')
);
```

### Result
- Admin clicks Eye/Download icon on Tricia's documents and they open/download correctly
- No code changes needed — the component logic is already correct, it's purely a storage access issue
