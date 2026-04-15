

# Plan: Hardcode Bank Details + Fix Template Variable Population

## Problem
1. **Bank details are placeholders** (`{{bank_name}}`, `{{account_number}}`) — these should be hardcoded since Tavara always uses the same bank account.
2. **`{{family_name}}` not being replaced** — the `populateTemplate` functions in both `SendNudgeModal.tsx` and `UserNudgeTab.tsx` only handle `[Name]`/`[X]`/`[Role]` bracket syntax, not `{{curly brace}}` syntax.

## Changes

### 1. Database Migration — Update all billing templates
Replace placeholder bank details with actual values in all family billing templates:

- `{{bank_name}}` → `First Citizens Bank, Point Lisas`
- `{{account_number}}` → `2991223`
- Add account name: `Chanua Johnson`
- Add account type: `Savings`
- `{{family_name}}` → `[Name]` (to match existing replacement logic)
- Keep `{{amount}}` and `{{billing_period}}` as placeholders (these vary per family)

Example updated Weekly Payment Reminder:
```
💙 Hi [Name]!

This is a friendly reminder from Tavara Care.

Your weekly care payment of **{{amount}}** is due by Thursday to ensure your caregiver receives their compensation on time (Friday).

🏦 Bank Transfer Details:
Bank: First Citizens Bank, Point Lisas
Account: 2991223
Name: Chanua Johnson
Account Type: Savings
Reference: {{billing_period}}

When complete, send a screenshot to confirm the payment/bank transfer via WhatsApp or email.

Thank you for keeping our care team compensated on schedule! 🤝
— Chan, Tavara Care
```

Same bank detail hardcoding applied to: Monthly Payment Reminder, Payment Overdue, and any other template referencing bank info.

### 2. Fix `populateTemplate` in `SendNudgeModal.tsx`
Add `{{family_name}}` and `{{caregiver_name}}` replacement using user's first name (same as `[Name]`):
```typescript
.replace(/\{\{family_name\}\}/gi, user.full_name?.split(' ')[0] || 'there')
.replace(/\{\{caregiver_name\}\}/gi, user.full_name?.split(' ')[0] || 'there')
```

### 3. Fix `populateTemplate` in `UserNudgeTab.tsx`
Same curly-brace replacements added.

### 4. Memory update
Save the bank payment details to memory so future templates use them directly.

### Files Modified
1. **New migration** — UPDATE `nudge_templates` to hardcode bank details and use `[Name]` syntax
2. `src/components/admin/SendNudgeModal.tsx` — Extend `populateTemplate` for `{{}}` variables
3. `src/components/admin/UserNudgeTab.tsx` — Same extension
4. `mem://features/billing-bank-details` — Save bank details for future reference

