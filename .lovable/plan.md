

## Fix: Auto-Populate Template Variables When Sending WhatsApp Nudges

### Problem
When admin clicks "Send WhatsApp" on a nudge template, the message is sent raw with `[Name]`, `[X]%` and other placeholders still visible. No variable substitution happens.

### Solution
In `SendNudgeModal.tsx`, replace placeholders with real user data before opening WhatsApp. Also fetch registration progress to populate `[X]%`.

### Variable Mapping

| Placeholder | Source |
|-------------|--------|
| `[Name]` | `user.full_name?.split(' ')[0]` (first name) |
| `[X]` | `registration_progress.completed_step_count / total_steps * 100` |
| `[Role]` | `user.role` |

### Changes

#### 1. `src/components/admin/SendNudgeModal.tsx`

**Expand user data fetch** (line 49-59): Also query `registration_progress` to get `completed_step_count` and `total_steps` per user. Store as a lookup map `progressMap[userId] = percentage`.

**Add `populateTemplate` function**: Takes the raw template message and a user object, returns the message with all `[Name]`, `[X]`, `[Role]` placeholders replaced with actual values. Falls back gracefully if data is missing (e.g. `[X]` → `100` if no progress record found, meaning they completed registration).

**Update `sendWhatsAppToUser`** (line 97-107): Call `populateTemplate(template.message, user)` before encoding into the WhatsApp URL.

**Update message preview** (line 151-153): When a single user is selected, show the populated preview instead of the raw template. When multiple or none are selected, show the raw template with a note that variables will be auto-filled per user.

### Files Changed

| Action | File | Description |
|--------|------|-------------|
| Modify | `src/components/admin/SendNudgeModal.tsx` | Add variable substitution, fetch progress data, populate preview |

