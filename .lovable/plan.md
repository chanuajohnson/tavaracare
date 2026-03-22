

## Fix User Name + Urgency Visibility Issues

### Problems Found

1. **"User1 Family Family Family" should be "Leonie Peltier"**: Database record `7d850934` has wrong `full_name` and `care_urgency = null`.

2. **Urgency badge not visible in UserDetailModal**: The modal checks `user.care_urgency`, but the `user` prop comes from `admin_get_all_profiles_secure` RPC which does NOT return `care_urgency`. The urgency data is available via `comprehensiveData.profile.care_urgency` but is not being used.

3. **Admin user cards don't show urgency**: The `useAdminProfiles` hook calls `admin_get_all_profiles_secure` which doesn't include `care_urgency` in its return columns.

### Changes

#### 1. Database fix — correct Leonie's profile
- Update `profiles` row `7d850934-a44f-4348-944b-ae7182dca237`:
  - `full_name` → `'Leonie Peltier'`
  - `care_urgency` → the value the user set (need to confirm what urgency was intended)

#### 2. Update `admin_get_all_profiles_secure` RPC function
Add `care_urgency` to the return type so admin cards and the modal have access to it.

#### 3. Fix `UserDetailModal.tsx` urgency badge
Change the urgency badge to read from `comprehensiveData?.profile?.care_urgency` instead of `user.care_urgency`, since `comprehensiveData` fetches `SELECT *` from profiles and will always have the field.

#### 4. Update `useAdminProfiles.ts` interface
Add `care_urgency` to the `AdminProfile` interface so TypeScript is aware of the field.

### Files Changed

| Action | Target | Description |
|--------|--------|-------------|
| Update | `profiles` row `7d850934` (database) | Fix full_name to "Leonie Peltier", set care_urgency |
| Migrate | `admin_get_all_profiles_secure` function | Add `care_urgency` to return columns |
| Modify | `src/components/admin/UserDetailModal.tsx` | Read urgency from `comprehensiveData.profile` instead of `user` prop |
| Modify | `src/hooks/useAdminProfiles.ts` | Add `care_urgency` to `AdminProfile` interface |

