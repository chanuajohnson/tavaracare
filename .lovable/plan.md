

## Fix PDF Access & Enhance Daily Checklist

### Problems Identified
1. **PDFs blocked**: The `ERR_BLOCKED_BY_CLIENT` error is a Chrome ad-blocker or content blocker issue. The PDFs exist and are valid in `public/documents/`. The URLs use the Lovable preview domain which some browser extensions block. The fix is to host the actual branded PDFs from the user's uploads (which may differ from the placeholder copies) and ensure links use the published domain `tavaracare.lovable.app`. However, since this is a client-side blocker issue, a more practical fix is to offer the PDFs as **download links** (`download` attribute) and also provide an in-app viewer fallback using an iframe/embed, giving nurses multiple ways to access them.

2. **Client Name should be a dropdown**: Currently a free-text `Input`. It should be a `Select` dropdown populated from the professional's assigned families via the existing `useCurrentAssignments` hook, which already fetches family names from care team, manual, and automatic assignments.

3. **Three buttons needed**: Currently only "Save Daily Log" and "Send Shift Summary via WhatsApp" exist. The third button should be **"Save & Send"** — a combined action that saves the log to the database AND then opens WhatsApp with the summary.

### Changes

#### 1. Replace uploaded PDFs with real branded versions
- Copy `user-uploads://Tavara_Nurse_Handbook_Branded_1.pdf` → `public/documents/Tavara_Nurse_Handbook.pdf`
- Copy `user-uploads://Tavara_Daily_Checklist_Branded.pdf` → `public/documents/Tavara_Daily_Checklist.pdf`
- These replace the placeholder copies with the actual branded documents

#### 2. Update `DailyChecklist.tsx`
- Import `useCurrentAssignments` hook
- Replace the `clientName` free-text `Input` with a `Select` dropdown populated from the nurse's assigned families
- Include a fallback "Other" option with a text input for unassigned clients
- Add a third button: **"Save & Send via WhatsApp"** that calls `handleSave` then `handleSendWhatsApp` on success

#### 3. Update PDF links in `AdminAssistantCard.tsx` and `DailyChecklist.tsx`
- Add `download` attribute to PDF links as fallback for blocked inline viewing
- Optionally use the published domain URL (`https://tavaracare.lovable.app/documents/...`) for links to avoid preview-domain blocking

### Files Modified
| File | Change |
|------|--------|
| `public/documents/*.pdf` | Replace with real branded uploads |
| `src/components/professional/DailyChecklist.tsx` | Client dropdown from assignments, 3 buttons |
| `src/components/professional/profile/AdminAssistantCard.tsx` | PDF link fixes |

