
## Fix: User Deletion Fails — Missing `public.sql` RPC Function

### Problem

The `admin-users` edge function tries to delete users by calling `admin.rpc('sql', { query: deletionSQL })`, but there is no `public.sql()` database function. The error from logs:

```
Could not find the function public.sql(query) in the schema cache
```

### Solution

Rewrite the `delete-user` action in the edge function to use the Supabase admin client's `.from().delete()` methods for each table, and `admin.auth.admin.deleteUser()` for removing the auth user. This avoids needing a raw SQL execution function entirely.

**File: `supabase/functions/admin-users/index.ts`**

Replace the monolithic SQL block (lines 67-173) with sequential delete calls using the service-role admin client:

```typescript
// Delete in FK-safe order using admin client
// 1. Chat messages (via session IDs)
const { data: sessions } = await admin.from('caregiver_chat_sessions')
  .select('id')
  .or(`family_user_id.eq.${user_id},caregiver_id.eq.${user_id}`);
const sessionIds = (sessions || []).map(s => s.id);
if (sessionIds.length > 0) {
  await admin.from('caregiver_chat_messages').delete().in('session_id', sessionIds);
}

// 2. Chat sessions
await admin.from('caregiver_chat_sessions').delete()
  .or(`family_user_id.eq.${user_id},caregiver_id.eq.${user_id}`);

// 3-N. Each related table...
// ... (all tables from the existing SQL block)

// Finally: delete profile, then auth user
await admin.from('profiles').delete().eq('id', user_id);
await admin.auth.admin.deleteUser(user_id);
```

Key changes:
- No more `admin.rpc('sql', ...)` — uses standard Supabase client methods
- Auth user deleted via `admin.auth.admin.deleteUser()` instead of `DELETE FROM auth.users` (which shouldn't be done from public schema anyway)
- Each delete is wrapped with error logging but non-blocking (a missing table row shouldn't stop the whole deletion)
- Removes the RAISE NOTICE logging (not useful via client SDK)

### Files Changed

| File | Change |
|------|--------|
| `supabase/functions/admin-users/index.ts` | Replace `rpc('sql')` with sequential `.from().delete()` calls and `auth.admin.deleteUser()` |
