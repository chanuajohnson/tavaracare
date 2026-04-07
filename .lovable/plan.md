

## Fix Create Session Button to Clearly Offer WhatsApp Nudge

### What is actually happening
The create session flow **already sends a WhatsApp nudge** after creation (line 157-158 in `ScreeningSessionManager.tsx`). When `onSendScreening` is provided and the candidate has a phone number, it opens WhatsApp automatically. The problem is:

1. The button label says **"Create & Copy Link"** which is misleading -- it should say **"Create & Send via WhatsApp"**
2. The fallback (no phone number) only copies the link silently, with no clear feedback

### What will change

**File: `src/components/admin/ScreeningSessionManager.tsx`**

1. Rename the create button from "Create & Copy Link" to **"Create & Send via WhatsApp"** with a Send icon, so it is clear that creating a session will immediately prompt you to nudge the candidate
2. Add a secondary button **"Create & Copy Link Only"** for cases where you just want the link without WhatsApp
3. The existing post-creation WhatsApp flow (lines 157-158) remains unchanged -- it already works correctly

### Specific code change (lines 425-428)

Replace:
```tsx
<Button onClick={handleCreateSession} className="flex-1">
  Create & Copy Link
</Button>
```

With:
```tsx
<Button onClick={handleCreateSession} className="flex-1">
  <Send className="h-4 w-4 mr-2" />
  Create & Send via WhatsApp
</Button>
```

This is a single-line label change. The underlying logic already opens WhatsApp after session creation.

