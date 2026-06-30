## What I found

Ana Maria Aimey does have activity records, but she has zero rows in `session_analytics`:

- `cta_engagement_tracking`: 34 activity events across 3 session IDs
- `session_analytics`: 0 login/session rows for her
- The admin profile list is currently showing “last login” from `profiles.updated_at`, not from real login history

That is why the Activity Trail shows rows, but “Last Login & Device” and “Login History” say no session data recorded.

## Plan

1. Update `UserActivityPanel.tsx` only.
2. Keep the existing `session_analytics` query for users who have real session rows.
3. Add a fallback that groups `cta_engagement_tracking` by `session_id` when `session_analytics` is empty.
4. Render those grouped activity sessions in the Login History section so Ana Maria shows:
   - first activity time as session start
   - last activity time as session end
   - event count as page/actions count
   - device and browser from tracked `additional_data` when available
5. Add a clear helper note in the login section when the row is inferred from activity tracking, so it is not mistaken for a Supabase auth login audit.

## Technical details

The fallback will use Ana Maria’s existing tracked session IDs:

```text
77de2f1e-0fff-4a05-8284-8b1433c1a1e1
f2f38c06-6c04-41f8-8910-50a2df22100d
ea24ff1c-7423-4181-86e8-cc88f436ac80
```

No database migration is needed for this display fix. The missing data is not caused by the new index anymore; it is caused by `session_analytics` never being populated in the app, while `cta_engagement_tracking` is populated.