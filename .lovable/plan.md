

## Fix: Screening Links Should Use Production Domain

### Problem

`window.location.origin` returns the current browser URL (e.g., `https://6d6595e0-04bb-4870-8c48-286aef5b647f.lovableproject.com`), so WhatsApp messages contain development/preview URLs instead of the production domain `tavara.care`.

### Solution

**File: `src/components/admin/ScreeningSessionManager.tsx`**

Replace all three instances of `window.location.origin` with a constant that uses the production domain:

```ts
const SCREENING_BASE_URL = 'https://tavara.care';
```

Then update:
- Line 141: `const link = \`${SCREENING_BASE_URL}/screening/${data.access_token}\`;`
- Line 162 (`getScreeningLink`): `return \`${SCREENING_BASE_URL}/screening/${session.access_token}\`;`
- Line 265: `const link = \`${SCREENING_BASE_URL}/screening/${data.access_token}\`;`

This ensures all screening links shared via WhatsApp or copied to clipboard always point to `tavara.care`, regardless of which environment the admin is using.

