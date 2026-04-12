

## Plan: Fix Admin Access to Professional Documents on Onboarding Checklist

### Problem
The `professional_documents` table RLS policies only allow `auth.uid() = user_id` for SELECT. When an admin views Tricia's documents on `/admin/onboarding-checklist`, the query returns 0 rows because the admin's `auth.uid()` does not match Tricia's `user_id`.

**Tricia has 3 documents in the database** (ID, certificate, background check) — they just can't be read by the admin due to RLS.

### Solution
Add an RLS policy allowing admins to read all professional documents.

### Changes

| Change | Detail |
|--------|--------|
| **New migration** | Add a SELECT policy on `professional_documents`: "Admins can view all documents" using the existing `public.has_role(auth.uid(), 'admin')` function |

### Migration SQL

```sql
CREATE POLICY "Admins can view all professional documents"
ON public.professional_documents
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
```

### Result
- Admin will see Tricia's 3 uploaded documents (Police Char Cert, Chan Cert 1, Chan ID) in the onboarding checklist
- No code changes needed — the component query is already correct, it's purely an RLS access issue

