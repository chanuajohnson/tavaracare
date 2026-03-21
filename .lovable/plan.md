

## Fix Schedule Submit + Replace All Chat with WhatsApp to 8687865357

### Problem 1: Schedule Submit Fails
The `preferred_start_date` column doesn't exist on the `profiles` table. The update query fails silently.

**Fix:** Remove `preferred_start_date` from the update and store the date info inside `preferred_visit_type` as a combined string (e.g. `trial_day|2026-03-25`), or add it to an existing text field like `visit_scheduling_status` notes. Simplest: encode date into `preferred_visit_type` value like `trial_day` and put the date into `admin_scheduling_requested_at` field (already exists, currently stores timestamp).

Actually, cleaner: just remove `preferred_start_date` from the update and append the date to `preferred_visit_type` string: `trial_day - March 25, 2026`. Admin can read it directly.

### Problem 2: All Chat Buttons Open TAV Modal Instead of WhatsApp
Three files have chat buttons that open TAV-guided modals. Replace all with WhatsApp to `8687865357` with pre-loaded text identifying the caregiver.

WhatsApp URL pattern (from existing working code):
```
https://api.whatsapp.com/send/?phone=18687865357&text=...&type=phone_number&app_absent=0
```

Pre-loaded text should include the caregiver's professional type and match score so Tavara team knows who the family wants to discuss.

### Changes

#### 1. `src/components/family/ScheduleVisitModal.tsx` (~line 46-55)
Remove `preferred_start_date` from the update. Instead store date in `preferred_visit_type` as `trial_day - March 25, 2026` format so admin can read it.

#### 2. Create shared helper: `src/utils/whatsapp/openCaregiverWhatsApp.ts`
Simple function used by all 3 files:
```ts
export const openCaregiverWhatsApp = (professionalType: string, matchScore: number, location?: string) => {
  const text = `Hi Tavara! I'm interested in connecting with my matched caregiver: "${professionalType}" (${matchScore}% match${location ? `, ${location}` : ''}). I'd like to learn more about working with them.`;
  const url = `https://api.whatsapp.com/send/?phone=18687865357&text=${encodeURIComponent(text)}&type=phone_number&app_absent=0`;
  window.open(url, '_blank');
};
```

#### 3. `src/components/family/DashboardCaregiverMatches.tsx`
- Remove imports: `CaregiverChatModal`, `FamilyCaregiverLiveChatModal`, `checkChatEligibilityForFamily`, `shouldUseLiveChatForCaregiver`
- Remove state: `showChatModal`, `showLiveChatModal`, `selectedCaregiver` (keep for detail modal)
- Replace all chat button `onClick` handlers with `openCaregiverWhatsApp(professionalLabel(cg), cg.match_score, cg.location)`
- Remove `<CaregiverChatModal>` and `<FamilyCaregiverLiveChatModal>` JSX
- Update `MatchBrowserModal` `onStartChat` to use WhatsApp
- Update `MatchDetailModal` `onStartChat` to use WhatsApp

#### 4. `src/pages/family/FamilyMatchingPage.tsx`
- Remove imports: `CaregiverChatModal`, `FamilyCaregiverLiveChatModal`, `checkChatEligibilityForFamily`, `shouldUseLiveChatForCaregiver`
- Remove state: `showChatModal`, `showLiveChatModal`
- Replace `handleStartChat` with WhatsApp open using the caregiver's professional type
- Remove chat modal JSX
- Update `MatchDetailModal` `onStartChat` to use WhatsApp

#### 5. `src/components/family/FamilyMatchGrid.tsx`
No changes needed — it just calls `onChatClick` prop which will now trigger WhatsApp from the parent.

### Files Changed

| Action | File | Description |
|--------|------|-------------|
| Modify | `src/components/family/ScheduleVisitModal.tsx` | Fix submit by removing missing column, encode date into visit type string |
| Create | `src/utils/whatsapp/openCaregiverWhatsApp.ts` | Shared WhatsApp helper with pre-loaded caregiver text |
| Modify | `src/components/family/DashboardCaregiverMatches.tsx` | Replace TAV chat with WhatsApp, remove chat modals |
| Modify | `src/pages/family/FamilyMatchingPage.tsx` | Replace TAV chat with WhatsApp, remove chat modals |

