

## Fix "schema 'net' does not exist" Error

The error occurs because a database trigger (`handle_caregiver_availability_change`) is trying to use the `pg_net` extension which isn't enabled.

---

## Root Cause

A migration from August 2025 created a trigger on the `profiles` table that fires when `available_for_matching` changes. It uses `net.http_post()` to call an edge function, but the `pg_net` extension was never enabled.

**File:** `supabase/migrations/20250806153934_56012795-ba1d-4b4d-b236-4ba69d3a07c8.sql`

---

## Two Fix Options

### Option A: Enable pg_net Extension (Recommended if you want auto-recalculation)

Run this SQL in Supabase SQL Editor:

```sql
-- Enable the pg_net extension
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
```

This enables the HTTP extension so the trigger can call edge functions.

**Pros:** Automatic match recalculation works as intended
**Cons:** Requires the edge function to be deployed and working

---

### Option B: Remove the Trigger (Quick Fix)

Run this SQL in Supabase SQL Editor:

```sql
-- Drop the problematic trigger
DROP TRIGGER IF EXISTS trigger_caregiver_availability_change ON profiles;

-- Optionally drop the function too
DROP FUNCTION IF EXISTS handle_caregiver_availability_change();
```

**Pros:** Immediate fix, no dependencies
**Cons:** Loses automatic match recalculation on availability changes

---

## Recommended Action

I recommend **Option B** (removing the trigger) because:

1. The automatic recalculation feature can be triggered manually via admin dashboard
2. It's simpler and doesn't require additional extension configuration
3. You can always add it back later with proper pg_net setup

---

## SQL to Run (Option B - Quick Fix)

```sql
-- Fix: Remove trigger that uses unavailable pg_net extension
DROP TRIGGER IF EXISTS trigger_caregiver_availability_change ON profiles;
DROP FUNCTION IF EXISTS handle_caregiver_availability_change();
```

After running this, the matching toggle will work immediately.

---

## Also Run: Add the 3 Spotlight Caregivers

While you're in the SQL Editor, run this too:

```sql
-- Mark caregivers as available
UPDATE profiles 
SET available_for_matching = true, updated_at = NOW()
WHERE id IN (
  '11a77842-32a0-482b-b3eb-e4c7ed7c5b83',
  '150ede63-32f4-4c2b-bf2d-2a66344055f6'
);

-- Add to spotlight
INSERT INTO caregiver_spotlight (caregiver_id, headline, description, display_order, is_active)
VALUES 
  ('4dedfad6-be2b-4923-b117-37b403f7ac9d', 'Specialized Care Expert', 
   'Experienced caregiver in Arima with expertise in cognitive care, memory support, and special needs. Over 10 years of dedicated service.', 3, true),
  ('11a77842-32a0-482b-b3eb-e4c7ed7c5b83', 'Compassionate Memory Care Specialist', 
   '6-10 years experience providing household and memory care support in Chase Village.', 4, true),
  ('150ede63-32f4-4c2b-bf2d-2a66344055f6', 'Trusted In-Home Caregiver', 
   'Reliable care professional based in Princess Town with 6-10 years of in-home care experience.', 5, true);
```

---

## Summary

| Task | SQL Command | Purpose |
|------|-------------|---------|
| Fix toggle error | `DROP TRIGGER...` | Removes broken pg_net dependency |
| Add spotlight caregivers | `INSERT INTO caregiver_spotlight...` | Shows 5 caregivers on /urgent-caregivers |

Run both in the Supabase SQL Editor and the issues will be resolved.

