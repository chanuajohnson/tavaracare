

User wants Full Care Environment Reset to be **$399 one-time** (not $0/custom-quote). Same override system as other fees. This is a simple data update — no UI changes needed since the existing render path already handles non-zero one-time prices correctly.

## Plan: Set Full Care Environment Reset to $399 one-time

### Change
Update the `billable_service_items` row for **Full Care Environment Reset** in `care_environment_support`:
- `unit_price`: `0.00` → **`399.00`**
- All other fields unchanged (`billing_type = 'one_time'`, `is_active = true`, label, description, sort_order)

### Why this is enough
The existing `ServiceSelectionBlock.tsx` already renders any one-time service identically:
- Shows `$399.00 One-time` badge
- Supports family-approved checkbox
- Supports per-instance **Override $** input (the same waive/discount mechanism used for Tier 1 Care Readiness Assessment and Tier 2 Guided Reset)
- Notes field
- Quantity not shown (correct — one-time)

So Tavara admins can still discount it to $0 (waive) or any custom amount per family using the existing override flow — no new code paths needed.

### Implementation
1. **Single data UPDATE** via the insert/update tool:
   ```sql
   UPDATE billable_service_items
   SET unit_price = 399.00, updated_at = now()
   WHERE category = 'care_environment_support'
     AND label = 'Full Care Environment Reset';
   ```

### Files touched
**None.** Pure data update — UI already handles it.

### What stays the same
- Care Readiness Assessment ($199), Guided Home Reset ($499) — untouched
- Override / waive / approval / notes flow — untouched
- BillingSummaryCard, ServiceCommencementConfirmation rendering — untouched
- Public-facing care environment copy (`CareEnvironmentIntroCard`, journey step) — these currently say "Custom"; flagging as a follow-up but not changing in this scope unless you confirm

### Follow-up to confirm (NOT in this scope)
The two public-facing components (`CareEnvironmentIntroCard.tsx`, `CareEnvironmentJourneyStepContent.tsx`) currently display Tier 3 as "Custom". Want me to update those to "$399" in a separate small change after this lands? They're family-facing so worth aligning.

