## Voice Screening Questionnaire — Mobile-First Feature

### What We're Building

An admin-created screening questionnaire that gets sent to any registered professional nursevia the existing nudge system. The nurse opens it on her phone, sees the candidate's name and a list of screening questions, and can either tap-to-record a voice answer or type a text response for each one. After completion, AI transcribes voice recordings and generates a summary with recommendation. Admin sees both raw transcripts and the AI summary.

---

### User Flow

```text
Admin Dashboard                    Head Nurse (Mobile)
─────────────                      ───────────────────
1. Create question template        
   (reusable across candidates)    
                                   
2. Assign template to candidate    
   → Send via nudge/WhatsApp link  
                                   
                                   3. Opens link on phone
                                   4. Sees: "Screening for Denise Narciss"
                                   5. For each question:
                                      - Tap 🎙️ to record voice answer
                                      - OR tap ✏️ to type text
                                      - Optional: select Pass/Neutral/Concern
                                   6. Submit responses
                                   
7. View completed screening        
   - Raw transcripts per question  
   - AI-generated summary          
   - Overall recommendation        
8. Mark candidate passed/failed    
```

---

### Database Changes (2 new tables)

`**screening_question_templates**` — Reusable question sets

- `id`, `title` (e.g. "Standard Caregiver Screening"), `questions` (JSONB array of {question, category}), `created_by`, `is_active`, timestamps

`**screening_sessions**` — One per candidate-nurse pairing

- `id`, `template_id` (FK), `professional_id` (FK to profiles — the candidate), `assigned_to` (FK to profiles — the nurse), `candidate_name`, `status` (pending/in_progress/completed/reviewed), `responses` (JSONB array of {question_index, voice_url, transcript, text_response, rating}), `ai_summary`, `ai_recommendation`, `access_token` (UUID for unauthenticated mobile access), timestamps

---

### Technical Plan (8 files)

**1. Migration SQL** — Create the 2 tables with RLS policies. Storage bucket `screening-recordings` for voice files.

**2. `src/components/admin/ScreeningTemplateBuilder.tsx**` — Admin UI to create/edit reusable question templates. Add/remove/reorder questions with categories (Clinical, Team Fit, Reliability, Red Flags).

**3. `src/components/admin/ScreeningSessionManager.tsx**` — Admin UI on the Professional Screening page to: assign a template to a candidate, generate a shareable link, send via nudge. Shows completed sessions with transcripts + AI summary.

**4. `src/pages/screening/MobileScreeningPage.tsx**` — Public mobile-optimized page accessed via `access_token` in URL (no login required for the nurse). Shows questions one-at-a-time (swipeable cards). Each card has:

- Question text + category badge
- Record button (uses browser MediaRecorder API)
- Text input fallback
- Optional quick-rating (thumbs up/neutral/concern)

**5. `src/hooks/useVoiceRecorder.ts**` — Custom hook wrapping MediaRecorder API. Returns `{isRecording, startRecording, stopRecording, audioBlob, duration}`. Handles permissions prompt gracefully.

**6. `supabase/functions/transcribe-screening/index.ts**` — Edge function that:

- Takes a screening session ID
- Pulls voice recordings from storage
- Sends each to Lovable AI for transcription (or uses a speech-to-text approach)
- Updates `screening_sessions.responses` with transcripts
- Generates AI summary + recommendation from all responses
- Updates `ai_summary` and `ai_recommendation`

**7. Route addition in `AppRoutes.tsx**` — `/screening/:token` for the public mobile page (requires your approval per guardrail).

**8. Integration with existing `ProfessionalScreeningPanel.tsx**` — Add a "Send Voice Screening" button that opens the template selector and generates the session link.

---

### Voice Recording Approach (Mobile-First)

- Uses browser's native `MediaRecorder` API — works on all modern mobile browsers
- Records as WebM/Opus (compact, good quality)
- Uploads each recording to Supabase Storage bucket
- Visual waveform indicator while recording
- Playback button to review before submitting

### AI Processing

- **Transcription**: Lovable AI processes voice recordings and returns text transcripts
- **Summary**: After all questions are answered, AI generates a structured summary highlighting strengths, concerns, and an overall recommendation (Approve / Conditional / Reject)
- Uses the existing `LOVABLE_API_KEY` — no new secrets needed

### Nudge Integration

- Admin clicks "Send Voice Screening" on a candidate
- Selects a question template
- System generates a `screening_sessions` record with a unique `access_token`
- Creates a WhatsApp nudge message with the link: `tavaracare.lovable.app/screening/{token}`
- Nurse taps the link on her phone and starts answering

---

### What Makes This Innovative

- **Zero login friction** — nurse accesses via token link, no account needed
- **Voice-first for mobile** — tap and talk, no typing on small screens
- **AI-assisted evaluation** — automatic transcription + summary saves admin time
- **Integrated into existing pipeline** — ties directly into Step 6 (Head Nurse Screening) of the 8-step vetting pipeline
- **Reusable templates** — create once, use for every candidate