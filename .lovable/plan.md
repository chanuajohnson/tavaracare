

## Two Changes: Personalize Professional Family Cards + Add Rate Info Blurb on Family Dashboard

### 1. Fix Family Match Cards on Professional Dashboard

**File**: `src/components/professional/DashboardFamilyMatches.tsx`

The `full_name` field already contains real names (e.g., "Garcia Family", "Colleen Wilson"). The component just hardcodes "FU" and "Family User" instead of using this data.

**Changes (around lines 267-278)**:
- **Avatar initials** (line 270): Replace hardcoded `FU` with initials derived from `family.full_name` — split by spaces, take first letter of each word, join and uppercase, max 2 chars
- **Name heading** (line 275): Replace `Family User` with `family.full_name?.split(' ')[0] || 'Family'` (show first name only)
- **Remove "Name protected" text** (lines 276-278): Replace with a muted subtitle showing location or care type context
- Keep the ID display for admin reference

### 2. Add Rate Information Blurb on Family Dashboard

**File**: `src/components/family/FamilyDashboard.tsx`

Insert a compact informational banner between the `FamilyShortcutMenuBar` and `FamilyMatchNotification` (after line 113).

**New inline component** — a simple blue-tinted info card:
- Icon: DollarSign or Info
- Heading: "Tavara Care Rates"
- Two-line description:
  - **$35/hr — Standard**: Companionship, medication reminders, light meal prep
  - **$40/hr — Full Service (Recommended)**: GAPP-certified care including meals, light cleaning, personal care
  - **$45+/hr — Premium**: Specialized or complex medical care needs
- Small muted note: "These rates reflect the professional standards of certified caregivers in Trinidad & Tobago."
- Dismissible (optional localStorage flag so it doesn't annoy repeat visitors)

### Files Changed

| Action | File | Description |
|--------|------|-------------|
| Modify | `src/components/professional/DashboardFamilyMatches.tsx` | Show first name + real initials, remove "Family User" and "Name protected" |
| Modify | `src/components/family/FamilyDashboard.tsx` | Add dismissible rate info blurb below Quick Access bar |

