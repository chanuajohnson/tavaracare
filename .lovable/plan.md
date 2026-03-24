

## Fix: Street Addresses Still Leaking on Family Cards

### Problem
"14-18 Lynch Drive, Maraval" has only 2 comma-separated parts, so both the RPC and client-side `getGeneralArea` return it unchanged. The logic only strips when there are 3+ parts.

### Root Cause
The RPC extracts the last 2 parts of `care_location`. For addresses with only 2 parts, both parts are returned — including the street number and name.

### Fix

**1. Client-side: `src/pages/UrgentFamiliesPage.tsx`** (line 34-38)

Update `getGeneralArea` to always strip street-level detail:
```typescript
const getGeneralArea = (location: string | null): string => {
  if (!location) return "Trinidad & Tobago";
  const parts = location.split(',').map(p => p.trim());
  // Always take only the last part (city/area) to avoid street addresses
  // If last part looks like a country or is too generic, take last 2
  if (parts.length >= 3) return parts.slice(-2).join(', ');
  if (parts.length === 2) {
    // Check if first part contains street indicators (numbers, "Drive", "Street", "Road", "Avenue", "Block")
    const streetPattern = /\d|drive|street|road|avenue|block|lane|crescent|close|terrace/i;
    if (streetPattern.test(parts[0])) return parts[1]; // Return only area/city
    return location; // Both parts are area-level, keep both
  }
  return location;
};
```

**2. Database RPC: `get_public_family_profiles()`**

Update the SQL to return only the LAST part (not last 2) when the address has 2 or fewer comma-separated parts, and apply a regex strip of street numbers/names:
```sql
-- Extract only the last comma-separated part (general area) from care_location
COALESCE(p.location,
  (SELECT trim(parts[array_length(parts, 1)])
   FROM (SELECT string_to_array(cn.care_location, ',') AS parts) sub),
  'Trinidad & Tobago'
) as location
```

This ensures "14-18 Lynch Drive, Maraval" returns just "Maraval", and "199 Monica Drive, Block 4, Palmiste, San Fernando" returns "San Fernando" or "Palmiste, San Fernando".

### Files Changed

| Action | Target | Description |
|--------|--------|-------------|
| Migrate | Database | Update `get_public_family_profiles()` to return only last part of address |
| Modify | `src/pages/UrgentFamiliesPage.tsx` | Update `getGeneralArea` to strip street-level data from 2-part addresses |
| Modify | `src/components/family/FamilyDetailModal.tsx` | Same `getGeneralArea` fix if duplicated there |

