

## Fix: Join as Caregiver buttons should open signup tab

### Changes

**1. `src/pages/JoinAsCaregiver.tsx`**
- Update `handleSignUp` to navigate to `/auth?tab=signup&role=professional&from=join-as-caregiver`

**2. `src/pages/auth/AuthPage.tsx`**
- In the `useEffect`, add fallback: if `role` URL param exists and no explicit `tab` param, default `activeTab` to `"signup"`

| File | Change |
|------|--------|
| `src/pages/JoinAsCaregiver.tsx` | Add `tab=signup` to navigate URL |
| `src/pages/auth/AuthPage.tsx` | Default to signup tab when `role` param present |

