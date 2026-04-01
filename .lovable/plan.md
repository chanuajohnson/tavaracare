

## Plan: Fix Duplicate Sessions, CORS Error, and Quick Assessment Clarity

### Three Issues to Fix

1. **Duplicate sessions**: The admin can currently create multiple sessions for the same professional + template combination. Need to add a uniqueness check before inserting.

2. **AI Summary CORS failure**: The edge function imports `corsHeaders` from an invalid path (`https://esm.sh/@supabase/supabase-js@2/cors` doesn't exist). Need to define CORS headers manually. Also the system prompt still says "head nurse" — should say "professional caregiver".

3. **Quick Assessment clarification**: The Pass/Neutral/Concern buttons are tapped by the **person filling out the screening** (the evaluator/admin who opens the link). They are NOT automatic. The admin sees these ratings in the detail dialog. Currently the rating badge has no color coding — needs color-coded badges for scannability.

---

### Changes

#### 1. Prevent duplicate sessions (`ScreeningSessionManager.tsx`)

In `handleCreateSession`, before the insert, query for existing sessions with the same `professional_id` and `template_id`. If one exists, show a toast error: "A screening session already exists for this candidate with this template. Use the resend button instead." and return early.

#### 2. Fix CORS headers in edge function (`supabase/functions/transcribe-screening/index.ts`)

- Replace the broken `import { corsHeaders }` with a local `corsHeaders` constant:
  ```ts
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
  ```
- Update the system prompt: change "head nurse's screening responses" to "professional caregiver screening responses"

#### 3. Color-code rating badges in admin detail dialog (`ScreeningSessionManager.tsx`)

In the detail dialog where `r.rating` is displayed, replace the generic `<Badge variant="outline">` with color-mapped styling:
- `pass` → green badge
- `neutral` → gray badge
- `concern` → amber/red badge

---

### Technical Detail

- Duplicate prevention: client-side check via `supabase.from('screening_sessions').select('id').eq('professional_id', candidateId).eq('template_id', templateId)` before insert
- CORS fix: the `corsHeaders` import path `https://esm.sh/@supabase/supabase-js@2/cors` is not a valid export — Supabase edge function examples define CORS headers locally or import from a shared `_shared/cors.ts` file
- The edge function will be auto-deployed after the code change
- No database schema changes needed

