

## Backfill Ana's Nudge History in admin_communications

### Problem
Ana (9874b53e) was sent 2 nudges today (step_6 "Schedule Care" and "Budget Update") but the admin_communications table has zero records for her — because the nudges were sent before the logging fix was deployed. The smart alert incorrectly shows "Inactive 5 days, never nudged."

### Fix
Insert 2 records into `admin_communications` to reflect what was actually sent today:

| Template | Template ID | Sent At |
|----------|-------------|---------|
| Family Matched - Schedule Care | `55a35235-906c-4306-ac5a-25ce48e987e6` | 2026-03-22 09:40 (approx) |
| Family Budget Update | `93c237a5-29d9-422a-9fd8-66f69f9111dc` | 2026-03-22 09:44 (approx) |

Admin ID: `6d089663-8794-444e-99fa-ae480d3f3c35`

### Implementation
Single SQL migration inserting 2 rows into `admin_communications`. No code changes needed — after this, the Nudge tab alert will show "Last nudged 0 days ago" (green).

### Files Changed

| Action | Target | Description |
|--------|--------|-------------|
| Insert | `admin_communications` (database) | 2 records for Ana's nudges sent today |

