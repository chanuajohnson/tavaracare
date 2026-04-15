

# Plan: Fix Waived Items Filter Bug + Payment/Billing Nudge Templates

## Issue 1: Waived Items Still Showing Despite Checkbox

**Root cause**: String matching bug in `DocumentGenerationMenu.tsx` line 123.

The filter checks:
```
item.description.includes('[WAIVED]')
```

But the actual description text is:
```
Caregiver Matching & Placement [WAIVED — value: $299.00]
```

`'[WAIVED — value: $299.00]'.includes('[WAIVED]')` returns **false** because `includes` looks for the exact substring `[WAIVED]` (with closing bracket), but the text has `[WAIVED —` (no closing bracket at that position).

**Fix**: Change the filter to use a broader match — check for `[WAIVED` (without closing bracket):

```typescript
// Line 123 in DocumentGenerationMenu.tsx
item.description.includes('[WAIVED')
```

This one-character fix will correctly filter out all waived items when the checkbox is enabled.

**File**: `src/components/admin/care-plans/DocumentGenerationMenu.tsx` — line 123

---

## Issue 2: Payment & Billing Nudge Templates

Add new WhatsApp nudge templates to the existing `nudge_templates` table (already used by `WhatsAppTemplateManager.tsx`). These templates cover the full billing communication cycle.

### New Templates (stage: `billing`)

**For Families:**

1. **Weekly Payment Reminder (Thursday)** — Reminds family that bank transfer is due by Thursday to ensure Friday receipt for caregiver pay. Includes bank details.

2. **Monthly Payment Reminder** — Monthly billing reminder with total due, bank details, and Thursday deadline.

3. **Payment Overdue — Gentle Follow-up** — Sent when payment is late. Emphasizes caregiver compensation timing. Asks for transfer confirmation screenshot.

4. **Payment Received — Thank You + Receipt** — Confirms payment received, mentions receipt is attached/available on dashboard, thanks family.

5. **Care Readiness / Home Setup Support** — Nudge about preparing home for caregiver arrival (care readiness checklist reference).

**For Professionals:**

6. **New Match Available** — Notifies caregiver of a new family match opportunity with brief details.

7. **Match Confirmed — Welcome** — Confirms the caregiver has been matched, provides start date and family context.

8. **Payment Processed — Thank You** — Confirms their weekly/monthly pay has been processed, includes amount.

### Implementation

**Migration**: Insert these templates into `nudge_templates` with `stage: 'billing'` (families) and `stage: 'post_onboarding'` (professionals).

**UI Updates**:
- Add `'billing'` to `STAGE_ORDER` and `STAGE_LABELS` in `WhatsAppTemplateManager.tsx` so the new templates appear in the admin nudge system.
- Templates will include `{{family_name}}`, `{{amount}}`, `{{bank_name}}`, `{{account_number}}`, `{{caregiver_name}}`, `{{billing_period}}` placeholders that admins can fill before sending.

### Files Modified

1. `src/components/admin/care-plans/DocumentGenerationMenu.tsx` — Fix `[WAIVED]` filter (1 line)
2. `src/components/admin/WhatsAppTemplateManager.tsx` — Add `billing` stage to constants
3. **New migration** — Insert billing nudge templates into `nudge_templates` table

