

## Fix: Privacy Violations on /urgent-families Page

### Problem
The `/urgent-families` page is publicly displaying:
- **Full street addresses** (e.g., "199 Monica Drive, Palmiste, San Fernando")
- **Care recipient full names** (e.g., "Care for: Carol Glenn-Aimey")
- Full address repeated in the location pin section

This is a serious privacy breach for a privacy-first company. The page should follow the same pattern as caregiver cards: first name + last initial only, general area only.

### Fix

**File: `src/pages/UrgentFamiliesPage.tsx`**

1. **Replace full address with general area only** — Parse `location` or `address` to extract just the area/city (e.g., "Palmiste, San Fernando" instead of "199 Monica Drive, Palmiste, San Fernando"). Use a helper that strips street numbers and specific addresses.

2. **Replace care recipient full name with first name + last initial** — e.g., "Carol G." instead of "Carol Glenn-Aimey"

3. **Update card heading** — Show "Family in Palmiste" not "Family in 199 Monica Drive, Palmiste, San Fernando"

4. **Remove `address` from the Supabase query** — Only fetch `location` (general area). Don't fetch raw `address` at all to prevent accidental exposure.

5. **Update WhatsApp message** — Use general area only, not full address

### Helper Functions

```typescript
const getFirstNameLastInitial = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
};

const getGeneralArea = (location: string | null) => {
  if (!location) return "Trinidad & Tobago";
  // Remove street numbers and specific addresses, keep area/city
  const parts = location.split(',').map(p => p.trim());
  // Take last 1-2 parts (area/city) rather than full address
  return parts.length > 2 ? parts.slice(-2).join(', ') : location;
};
```

### Files Changed

| Action | Target | Description |
|--------|--------|-------------|
| Modify | `src/pages/UrgentFamiliesPage.tsx` | Remove `address` from query, add privacy helpers, show first name + last initial for care recipient, show general area only for location |

