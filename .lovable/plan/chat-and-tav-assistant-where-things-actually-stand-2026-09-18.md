# Chat and TAV assistant: where things actually stand

Status audit of every chat surface, for signed-out visitors and signed-in users. Findings first, then what I propose fixing. Kerry-Anne's nudge is pinned and untouched.

## What is live and working

**TAV assistant panel** — mounted site-wide (every page except the demo routes, which run their own copy). Signed-out and signed-in both get the blue bubble bottom-left. It opens only when someone clicks it, on purpose; it no longer auto-pops on ordinary pages, and the open-then-instantly-close bug is fixed.

**Signed out:** the panel shows a welcome, a Sign In button, and three guest routes — Find Care Now, Get Hired, Join The Village. On the demo pages it shows the demo menu instead. This part is complete and useful: it does its one job, which is turning a visitor into a sign-up.

**Signed in:** the panel shows the person's real journey — their percentage, current step and next action, pulled from the same live figures the dashboard now uses, plus any nudges you've sent them. Family, professional, community and admin each get their own version. This is the strongest part of TAV.

## What is broken

**TAV's chat box does not work.** Anyone who types a message gets a canned line back, never a real answer. I called the chat service directly and it failed with an error; it falls back to "I'm here to help you with your caregiving needs. What would you like assistance with today?" every single time, for signed-out and signed-in users alike.

The cause: that service is still wired to a private OpenAI account key that isn't set on this project. There are no recorded calls to it at all, which fits — it has been quietly failing rather than being used.

So today TAV is a working progress-and-nudge panel with a chat box that is decoration.

## What is dead code

The original Tavara registration chat — the conversational flow that walked people through sign-up question by question, with the role picker, multi-select handling and validation — is still fully present in the codebase but **is not connected to any page**. Nothing mounts it. Its small hover bubble isn't used anywhere either. It is not reachable by any visitor, signed in or out.

This is protected chat-flow code, so I am not proposing to delete or restructure any of it. I only want you to know it is currently unreachable.

## What I propose

1. **Make TAV's chat actually answer.** Move the chat service onto the platform's own AI access (the key is already present on this project) instead of the missing private key, and keep the existing TAV personality, tone rules and context exactly as written. Then test a real question as a signed-out visitor and as a signed-in family, and show you both answers.

2. **Give the signed-in panel its real context.** Once chat answers, pass the person's live journey position into the conversation so TAV can say "your care assessment is done, the readiness check is next" rather than talking in generalities.

3. **Decide what happens to the registration chat.** Three honest options, your call: leave it parked as-is, reconnect it as the sign-up helper it was built to be, or fold its question flow into TAV so there's one assistant instead of two. I would not touch it without you choosing.

4. **Hide the chat box until it works.** If you'd rather not fix the chat this week, the safer interim move is to hide the "chat with TAV" opener so no one types into a box that can't reply. Never let someone feel stuck talking to nothing.

## Technical notes

- Panel mounted in `src/components/layout/Layout.tsx`; state in `TavaraStateContext.tsx`; content in `RoleBasedContent.tsx`. Signed-out branch is the `!user || role === 'guest'` block.
- Chat calls the `tav-chat-enhanced` edge function via `tavAIService.ts` / `enhancedTAVService.ts`. That function reads `OPENAI_API_KEY`, which is not configured; a direct POST returns 500 with the fallback body. Fix is to switch it to the Lovable AI Gateway (`LOVABLE_API_KEY`, already present) using the `openai/gpt-6-astra` model, keeping the existing system prompt.
- Progress context comes from `useEnhancedJourneyProgress` / `useEnhancedProfessionalProgress`, which are now the canonical live sources.
- Unreachable: `ChatbotSystem`, `ChatbotLauncher`, `ChatProvider`, `ChatbotWidget`, `MicroChatBubble` — no imports outside their own folder. Protected under the chat-flow guardrail; no edits proposed.
- No changes to routing, `App.tsx`, registration fields, or the chat flow engine.
