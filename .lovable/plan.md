# Fix TAV reappearing + scroll loss + breadcrumb on blog → CTA → back

Three independent issues, all triggered by the flow: blog post → click "Start your family readiness" → land on `/registration/family` → browser back.

## 1. TAV pops up when returning to a blog post

**Root cause:** `/blog/*` is in `SILENT_ROUTE_PREFIXES` so TAV never *auto-opens* there. But `/registration/family` is NOT silent — TAV auto-opens there (it's a journey touchpoint). TAV's `isOpen` lives in `TavaraStateContext` and persists across navigation, so when the user hits Back to `/blog/...`, the panel is still open from the registration page.

**Fix (in `TavaraAssistantPanel.tsx` only):** Add a new effect that runs on `location.pathname` change. If the new route is a silent route (`/blog/*`, `/dashboard/*`, `/`) AND `state.isOpen` is true AND the panel was not user-opened on this route, call `closePanel()` and clear `showGreeting`. This preserves: explicit user opens on blog (clicking the bubble still works), demo mode (exempt from silent rules), and TAV's behavior on every non-silent route.

No changes to `useTavaraState`, no global guardrail edits, no provider edits.

## 2. Back from CTA scrolls to top of blog instead of CTA position

**Root cause:** `src/components/common/ScrollToTop.tsx` force-scrolls to `(0,0)` on every `pathname` change, including browser back/forward (POP). This kills the browser's built-in scroll restoration.

**Fix (in `ScrollToTop.tsx` only):** Use `useNavigationType()` from `react-router-dom`. Skip the manual scroll when `navigationType === 'POP'` so the browser restores the prior scroll position naturally. PUSH/REPLACE keeps current behavior (scroll to top on forward navigation). Zero impact on any other page — every route already relies on this same component.

## 3. Breadcrumb on `/registration/family` should reflect blog origin

**Constraint:** Project guardrail says do not modify *fields* in `FamilyRegistration.tsx`. The breadcrumb prop is not a form field, but it is in that protected file. I want explicit approval before touching it.

**Proposed fix (scoped, minimal):**
- In `BlogInlineCTA.tsx` and `BlogEndCTABlock.tsx`, when navigating to `/registration/family`, pass `state={{ referringPagePath: '/blog/<slug>', referringPageLabel: '<post title>' }}` via `<Link>`. (These two files are blog-owned, not in the protected zone.)
- In `FamilyRegistration.tsx`, read `location.state` and, if `referringPagePath` is present AND starts with `/blog/`, prepend that crumb to `breadcrumbItems`. Default behavior (Family Dashboard → Family Registration) is unchanged for every other entry path.

No other registration page is touched, no other breadcrumb on the platform is affected.

## Files to edit

1. `src/components/tav/TavaraAssistantPanel.tsx` — add silent-route auto-close effect (~10 lines)
2. `src/components/common/ScrollToTop.tsx` — skip scroll on POP nav (~3 line change)
3. `src/components/blog/BlogInlineCTA.tsx` — add `state` to family `<Link>`
4. `src/components/blog/BlogEndCTABlock.tsx` — add `state` to family `<Link>`
5. `src/pages/registration/FamilyRegistration.tsx` — read `location.state`, conditionally prepend a blog crumb to `breadcrumbItems` (breadcrumb prop only, no form fields touched)

## Approval needed

Item 5 touches the protected `FamilyRegistration.tsx`. Confirm I may modify only its `breadcrumbItems` array (no form fields, no submit logic, no auth) before I implement.
