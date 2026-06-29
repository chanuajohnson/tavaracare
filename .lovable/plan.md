## Why activity won't load

The Activity tab runs two queries for the user:
1. `session_analytics` filtered by `user_id` — this works (it has `idx_session_analytics_user_id`).
2. `cta_engagement_tracking` filtered by `user_id`, ordered by `created_at desc`, limit 25 — this **times out**.

I checked `pg_indexes`: `cta_engagement_tracking` has only a primary-key index on `id`. The table is ~330k rows, so every Activity tab load does a full sequential scan + sort, which exceeds Postgres' statement timeout. That's the red "canceling statement due to statement timeout" error in the screenshot. It's not specific to Ana Maria — any user whose query hits the timeout will fail.

The "Login History" section already shows the last 10 sessions, so once Activity loads you'll see her prior logins below the most recent one.

## Fix

Add a composite index that matches the query shape:

```sql
CREATE INDEX idx_cta_engagement_user_created
  ON public.cta_engagement_tracking (user_id, created_at DESC);
```

This turns the 25-row lookup into an index range scan and resolves in milliseconds. No UI, RLS, or app-code changes needed — `UserActivityPanel.tsx` already does the right query, it just had no index to use.

### Technical notes
- Migration only (one `CREATE INDEX`). No table or policy changes.
- Index is on `(user_id, created_at DESC)` so the `ORDER BY created_at DESC LIMIT 25` per user is served directly from the index.
- I'm not running `CONCURRENTLY` because Lovable migrations run inside a transaction; a plain `CREATE INDEX` briefly locks writes to this analytics table, which is acceptable.
- Optional follow-up (not in this change): consider a retention policy on `cta_engagement_tracking` if it keeps growing — 330k rows today, unbounded over time.
