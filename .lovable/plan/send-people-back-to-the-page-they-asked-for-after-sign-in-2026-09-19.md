# Send people back to the page they asked for after sign-in

## What happens today

Visiting https://tavara.care/family/care-costs while signed out shows the "Please sign in" card with a plain link to the sign-in page. Nothing records where the person was heading, so once they sign in they land on their dashboard and have to find the cost page again.

## What changes

Only the "came from a specific page" case changes. Normal sign-ins from the menu or home page keep landing on the dashboard exactly as they do now.

1. The "Please sign in" card on the cost page remembers the page the person wanted.
2. Right after a successful sign-in, if a remembered page exists and it is one of an approved short list of family pages, the person is taken straight there instead of the dashboard. The remembered page is then cleared so it never fires twice.
3. If no page was remembered, or it isn't on the approved list, behaviour is unchanged.

Approved list to start with (all sign-in-required family pages we send links to):
- /family/care-costs
- /family/onboarding-checklist
- /family/readiness-quiz
- /family/story
- /family/care-assessment

This means the links in Kerry-Anne's message work even when she isn't signed in yet: she clicks, signs in, and lands on the page she clicked.

## Technical notes

- `src/pages/family/FamilyCareCostsPage.tsx`: change the gate's sign-in link to `/auth?returnTo=/family/care-costs`.
- `src/pages/auth/AuthPage.tsx`: read `returnTo` from the query string and store it in `sessionStorage` under a dedicated key when the page mounts signed out. After login succeeds, validate the stored value against the allow-list above, then `navigate(path, { replace: true })` and remove the key. Anything not on the list is discarded, so this cannot be used as an open redirect.
- No change to `AuthProvider` and no change to its existing dashboard redirect, `requireAuth`, or redirect-lock logic, so no site-wide effect. `AuthPage.tsx` is a guardrailed file, so this plan is asking permission for that one scoped addition (an effect plus the redirect check) with no existing routes, tabs, or banners altered.
- Optional follow-up, not included: have the other gated family pages pass `returnTo` too, so the same behaviour applies when those links are opened cold.
