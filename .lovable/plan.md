

## Include Template Name in Screening WhatsApp Nudges

### Problem
The WhatsApp nudge message says "Template 6 of 6" but does not include the **template name** (e.g., "Logistics, Transport & Professionalism"). Denise sees a generic message without knowing which specific screening area the link covers. Additionally, the total count is based on sessions already created for that candidate rather than a fixed total, which can be misleading.

### Changes

#### 1. Update callback signatures to include template name (2 files)

**`src/components/admin/ScreeningSessionManager.tsx`**
- Update the `Props` interface to add `templateName?: string` parameter to both `onSendScreening` and `onResendScreening`
- In `handleCreateSession` (line 158): pass the selected template's title as `templateName`
- In `handleResendScreening` (line 190): pass `session.template_title` as `templateName`
- In the resubmission handler (~line 294): pass the template title as `templateName`

**`src/pages/admin/ProfessionalScreeningPage.tsx`**
- Update `handleSendScreening` and `handleResendScreening` signatures to accept `templateName?: string`
- Include template name in the WhatsApp message:
  - Before: `📋 This is Template 6 of 6 — each template covers a different area...`
  - After: `📋 This is Template 6 of 6: "Logistics, Transport & Professionalism" — each template covers a different area...`

### Technical Detail

The `ScreeningSession` interface already has `template_title?: string` (line 25), and sessions are enriched with template titles during fetch. So the data is available -- it just needs to be threaded through the callback to the WhatsApp message builder.

No database changes. Two files modified. Approximately 10 lines changed total.

