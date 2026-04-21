

## Plan — Fix: `{{name}}` placeholder not personalizing in the NIS nudge

### What you saw (confirmed)

In your screenshot Ana was selected, but the WhatsApp window that opened still read literally `Hi {{name}},` — her first name was never substituted.

### Root cause (verified in code + DB)

The nudge modal (`src/components/admin/SendNudgeModal.tsx` line 38–46) personalizes messages with a whitelist of tokens:

| Token in template | Replaced? |
|---|---|
| `[Name]` | ✅ yes |
| `{{family_name}}` | ✅ yes |
| `{{caregiver_name}}` | ✅ yes |
| `[X]` (progress %) | ✅ yes |
| `[Role]` | ✅ yes |
| **`{{name}}`** | ❌ **NO — falls through as literal text** |

The NIS template I inserted into `nudge_templates` uses `{{name}}` (verified in DB, row id `5b4cc4d6-…`: *"Hi {{name}}, one of the setup items…"*). That token isn't in the replacer's list, so it stays raw.

The modal's own help text advertises `[Name]` as the convention — so the bug is in the template, not the replacer.

### Fix (one DB migration, no code change)

Normalize the NIS template to use the project-standard `[Name]` token, which the replacer already handles for every user role. Also normalize a second stray `{{name}}` in the body.

```sql
UPDATE public.nudge_templates
SET message_template = REPLACE(message_template, '{{name}}', '[Name]')
WHERE name = 'NIS Employer Registration Support';
```

Result: Ana's preview/sent message becomes `Hi Ana, one of the setup items…` (first-name only, matching the rest of the admin nudge system).

### Why not extend the code to also accept `{{name}}`?

Rejected — would fragment conventions. The modal's UI, help copy, and every other template in the DB use `[Name]`. Keeping one standard avoids drift. If we ever do extend the replacer, it's a separate cleanup task across all templates.

### Acceptance test

1. Admin → WhatsApp Nudge → open **NIS Employer Registration Support** template
2. Recipients list → tick **Ana Maria Aimey** only
3. Preview card at top now reads `Hi Ana, one of the setup items…` (Personalized badge shown)
4. Click **Send WhatsApp** → WhatsApp opens with `Hi Ana, …` in the message body (no `{{name}}` remaining)
5. Deselect Ana → preview reverts to raw `Hi [Name], …` template text
6. Re-test with a different family (e.g., Sarina Bland) → WhatsApp opens with `Hi Sarina, …`

### Files touched

| File | Change |
|---|---|
| `supabase/migrations/<ts>_fix_nis_nudge_name_placeholder.sql` | **NEW** — single UPDATE as above |

**Untouched:** `SendNudgeModal.tsx`, `populateTemplate()` logic, any other templates, any UI copy.

### Out of scope

- Auditing other templates for stray `{{name}}` tokens (none found — only this one template has it, it was the one I wrote in an earlier step)
- Adding `{{name}}` as a supported alias in `populateTemplate` (would hide future template-authoring bugs of this type; better to enforce `[Name]` as the one standard)
- Changes to the modal UI, help text, or the recipient selection behavior

