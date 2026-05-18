## Problem

TAV currently auto-opens on every page via three effects in `src/components/tav/TavaraAssistantPanel.tsx`:

1. **Session magic auto-greeting** (lines ~138–184) — fires once per session on first load, opens the panel after a brief greeting.
2. **Navigation auto-greeting** (lines ~187–216) — fires every time the user lands on a "journey touchpoint" (any route in `FORM_MAPPINGS` from `useFormDetection.ts`, which includes `/dashboard/*`, `/registration/*`, `/family/*`, `/professional/*`, etc.).
3. **Nudge auto-open** (lines ~219–223) — opens the panel any time `nudges.length > 0`.

Result: on `/dashboard/family`, `/dashboard/professional`, `/dashboard/admin`, blog pages, and the home page, TAV pops itself open repeatedly. This is the behavior the user is complaining about.

The user wants:
- High-traffic / repeat-visit pages → TAV stays **closed**; bubble visible, opens only on click.
- Low-traffic informational pages (e.g. `/about`, `/faq`, feature pages) → keep current auto-open greeting behavior.

## Scope

Frontend-only change. Single file edit: `src/components/tav/TavaraAssistantPanel.tsx`. No changes to TAV state, message bus, nudge fetching, demo mode, form detection, or any registration/chat-flow code.

## Approach

Introduce a `SILENT_ROUTES` allow-list of route prefixes where TAV must not auto-open. When the current `location.pathname` matches, all three auto-open effects no-op, but:
- The floating bubble still renders.
- Clicking the bubble still opens the panel (manual `openPanel()` path is untouched).
- Demo mode (`/demo/*`, `/tav-demo`) is **exempt** from the silence rule — demos still need the magic auto-open.
- Unread nudges still update the bubble's unread indicator; they just don't force the panel open.

### Silent routes (initial list)

```text
/                          (exact match only — home page)
/dashboard                 (all dashboards: family, professional, admin, community)
/blog                      (blog index + all posts)
```

Implemented as: exact match for `/`, prefix match for `/dashboard` and `/blog`. Easy to extend later.

### Code change outline

In `TavaraAssistantPanel.tsx`:

1. Add a small helper near the top of the component:
   ```ts
   const SILENT_ROUTE_PREFIXES = ['/dashboard', '/blog'];
   const isSilentRoute = (path: string) =>
     !isDemoMode && (path === '/' || SILENT_ROUTE_PREFIXES.some(p => path === p || path.startsWith(p + '/')));
   ```
2. In the **session magic auto-greeting** effect: early-return when `isSilentRoute(location.pathname)` is true. Still record the session-greeted flag so we don't fire later when the user navigates to a non-silent page mid-session? → No, leave the flag alone so a later visit to e.g. `/about` can still greet once.
3. In the **navigation auto-greeting** effect: early-return on silent routes.
4. In the **nudge auto-open** effect: skip `openPanel()` on silent routes (nudge count / unread badge logic elsewhere is untouched, so the bubble can still show an indicator).

### Out of scope

- No changes to `TavaraStateContext`, `useFormDetection`, nudge fetching, or the chat-flow system.
- No new settings UI / user preference toggle (can add later if desired).
- No change to greeting copy, timings, or demo behavior.
- No change to the FAB bubble's visual presence on silent routes.

## Verification

- Load `/dashboard/admin` (current route) → TAV bubble visible, panel stays closed, clicking bubble opens it.
- Navigate `/dashboard/admin` → `/dashboard/family` → `/blog` → `/blog/some-post` → `/` → panel never auto-opens.
- Navigate to `/about` (or any non-silent route) → greeting + auto-open still fire once per session as today.
- Demo routes (`/demo/family`, `/tav-demo`) → magic auto-open still fires.
- Console logs in the existing effects will show the early-return decision for debugging.

## Open question (optional)

Should the home page `/` truly be silent? It's the first impression for anonymous visitors and the current "loud mode" greeting may be intentional marketing. If you'd rather keep `/` greeting on, I'll drop it from the silent list and only silence `/dashboard/*` and `/blog/*`. Default in this plan: silence `/` too, since you listed "home page" in the request.
