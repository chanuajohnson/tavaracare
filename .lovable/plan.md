

## Fix: COALESCE Type Mismatch for hourly_rate

### Problem
The `update_user_profile(jsonb)` function casts `hourly_rate` to `::numeric`, but the column is actually `text` type. This causes: `COALESCE types numeric and text cannot be matched`.

### Fix
Database migration to recreate `update_user_profile(profile_data jsonb)` with the `hourly_rate` line changed from:
```sql
hourly_rate = COALESCE((profile_data->>'hourly_rate')::numeric, hourly_rate),
```
to:
```sql
hourly_rate = COALESCE(profile_data->>'hourly_rate', hourly_rate),
```

Same fix needed in the two-param version `update_user_profile(user_id_param uuid, profile_data jsonb)` which also has `::numeric` cast.

### Files Changed

| Action | Target | Description |
|--------|--------|-------------|
| Migrate | `update_user_profile` (both versions) | Remove `::numeric` cast from `hourly_rate` since column is `text` |

