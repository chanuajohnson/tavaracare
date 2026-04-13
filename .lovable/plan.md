

## Plan: Fix RPC Fallback Not Being Applied Due to Truthy Empty Object

### Root Cause
When RLS blocks a profile join, Supabase returns `{}` (empty object) instead of `null`. The code correctly detects these missing profiles and calls the RPC, but when building the final result, the `||` operator treats `{}` as truthy, so the RPC-resolved data is never used.

**Line 85** (fetchCareTeamMembers):
```js
const profileData = member.profiles || rpcFallbackMap[member.caregiver_id] || {};
//                  ^^^^^^^^^^^^^^^ {} is truthy, so RPC result is skipped
```

**Line 223** (fetchAllCareTeamMembersForProfessional): Same issue.

### Fix
**File**: `src/services/care-plans/team/fetchServices.ts`

Change both lines to check whether `member.profiles` actually has a `full_name` before preferring it over the RPC fallback:

```js
// Instead of: member.profiles || rpcFallbackMap[...] || {}
// Use:
const rawProfile = member.profiles;
const hasValidProfile = rawProfile && typeof rawProfile === 'object' && (rawProfile as any).full_name;
const profileData = hasValidProfile ? rawProfile : (member.caregiver_id ? rpcFallbackMap[member.caregiver_id] : null) || {};
```

Apply this pattern to both `fetchCareTeamMembers` (line 85) and `fetchAllCareTeamMembersForProfessional` (line 223).

### Files to Update
| File | Change |
|------|--------|
| `src/services/care-plans/team/fetchServices.ts` | Fix lines 85 and 223 to prefer RPC result when joined profile lacks `full_name` |

### Expected Result
- Denise Narcis will show correctly in the care schedule instead of "Unknown"
- All other care team members blocked by RLS will resolve via RPC
- No other files need changes -- the detection and RPC call already work

