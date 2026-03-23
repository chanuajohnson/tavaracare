

## Fix: Missing Columns in Profiles Table

### Problem
The `update_user_profile(jsonb)` function references two columns that don't exist in the `profiles` table:
- `drivers_license` (boolean)
- `own_transportation` (boolean)

This causes a `400 Bad Request` error when any professional tries to complete registration.

### Fix

#### Option A (Recommended): Add the missing columns
Create a migration to add both columns to the profiles table:

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS drivers_license boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS own_transportation boolean DEFAULT false;
```

This is the correct approach since the registration form already collects transportation data (the "Transportation" dropdown in the screenshot shows "Own vehicle"), and these columns are needed to store that data properly.

### Files Changed

| Action | Target | Description |
|--------|--------|-------------|
| Migrate | `profiles` table | Add `drivers_license` and `own_transportation` boolean columns |

