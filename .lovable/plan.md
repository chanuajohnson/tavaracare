

## Add Screening Progress Context to Nudge Messages and Screening Page

### Problem

When a professional receives a WhatsApp screening link, they have no idea how many total templates they need to complete or which one this is. Similarly, while on the screening page itself, they only see question progress within the current template -- not their overall multi-session progress.

### Solution

Two changes:

**1. WhatsApp Nudge Message (ProfessionalScreeningPage.tsx)**

Update `handleSendScreening` to accept session context (template position, total templates) and include it in the WhatsApp message. Before sending, query how many total sessions exist for this professional and which number this one is.

New message format:
```
Hi! It's the Tavara Team 💙

We'd like you to complete a brief screening questionnaire to help us finalize the evaluation for [Name].

📋 This is Template 2 of 6 — each template covers a different area and will be sent separately.

Please tap the link below to answer a few quick questions (voice or text):
[link]

Thank you! 🙏
```

This requires the `ScreeningSessionManager` to pass session metadata (session count, position) up to the send handler. The manager already has all sessions loaded -- it will compute the candidate's total session count and position, and pass them alongside the existing parameters.

**2. Screening Page Header (MobileScreeningPage.tsx)**

On page load, after fetching the current session, also query all sessions for the same `professional_id` to get:
- Total number of assigned templates
- How many are completed
- Which template number this one is

Add a subtitle line in the header:
```
📋 Template 2 of 6 — "Clinical Competency"
✅ 1 completed · 4 remaining after this one
```

This gives the professional full visibility into their screening journey from within each template.

### Files Changed

| File | Change |
|------|--------|
| `src/pages/admin/ProfessionalScreeningPage.tsx` | Update `handleSendScreening` signature to include session position/total and embed in WhatsApp message |
| `src/components/admin/ScreeningSessionManager.tsx` | Compute per-candidate session position and total; pass to `onSendScreening` callback |
| `src/pages/screening/MobileScreeningPage.tsx` | On load, fetch sibling sessions for the same professional; display template position and overall progress in header |

