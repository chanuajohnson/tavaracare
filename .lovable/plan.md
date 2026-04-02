

## Fix: AI Summary Ignores Voice Answers (No Transcription)

### Root Cause

The edge function `transcribe-screening` builds the AI prompt using `r.text_response || r.transcript || "(no response)"`. When the candidate records voice answers, the response object has a `voice_url` (audio file in Supabase storage) but no `text_response` or `transcript`. So the AI sees "(no response)" for every question and generates an incorrect summary like "failed to provide substantive information."

### Solution

Add audio transcription to the edge function. For each response that has a `voice_url` but no text, the function will:

1. Download the audio file from Supabase storage
2. Send it to Gemini (via Lovable AI gateway) as base64 audio for transcription
3. Store the transcript back into the response object
4. Then feed the full transcripts to the existing AI summarization step

### Changes

**File: `supabase/functions/transcribe-screening/index.ts`**

Before the summary-building loop (line 49), add a transcription step:

1. Loop through responses looking for entries with `voice_url` but no `text_response` and no `transcript`
2. For each, fetch the audio file from the public URL, convert to base64
3. Call Lovable AI gateway with the audio as a multimodal content part (Gemini supports `input_audio` in the OpenAI-compatible format) with prompt: "Transcribe this audio recording verbatim"
4. Store the returned text in `r.transcript`
5. After all transcriptions complete, save the updated responses back to the DB (so transcripts persist for future reference)
6. Then proceed with the existing summary generation using the now-populated transcripts

The summary prompt loop already reads `r.transcript` as a fallback, so once transcripts are populated, the AI summary will be based on actual spoken content.

### Technical Details

- Audio files are stored as `audio/webm` in the `screening-recordings` bucket
- Gemini models support audio input via the OpenAI-compatible API using `input_audio` content parts with base64 data
- The transcription calls will be sequential (one per voice response, typically 2-5 questions)
- Transcripts are saved back to the `responses` JSONB column so they're available immediately in the admin UI without re-processing
- The admin detail dialog already renders `r.transcript` when available (line 447 in ScreeningSessionManager.tsx)

### What This Fixes

- AI summary will now reflect the actual spoken answers (e.g., "10 years experience," "dementia care predominantly")
- Transcripts will appear in the admin detail dialog alongside the audio player
- Future "Generate AI Report" clicks won't need to re-transcribe (transcripts persist)

