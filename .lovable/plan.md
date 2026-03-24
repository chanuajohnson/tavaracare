
Fix the family details modal so mobile users never get trapped and the close control stays reachable.

1. Update the shared dialog container for safer mobile behavior
- In `src/components/ui/dialog.tsx`, make the default `DialogContent` mobile-safe by:
  - anchoring it with viewport-aware sizing (`w-[calc(100%-1rem)]`, `max-h-[calc(100dvh-1rem)]`, `overflow-hidden`)
  - using `top-[50%]` only when content fits, while allowing full-height modal variants to remain stable
  - moving the built-in close button above scrollable content with a stronger z-index and an opaque background so it never disappears over long content
  - adding safer padding on small screens so the close button is not clipped by mobile browser chrome

2. Refactor `FamilyDetailModal` to use an internal scroll region
- In `src/components/family/FamilyDetailModal.tsx`, stop making the whole dialog content scroll.
- Switch to a structure like:
  - outer `DialogContent` = fixed shell, `p-0`, `overflow-hidden`, responsive width/height
  - sticky/fixed top header inside the modal with title + explicit close button area always visible
  - inner scrollable content area for the long details only
- This prevents the close button from scrolling out of view and avoids the “stuck” state shown in the screenshot.

3. Make the modal responsive across phone/tablet/desktop
- Use mobile-first sizing:
  - mobile: nearly full-screen sheet/modal (`h-[calc(100dvh-1rem)]`)
  - tablet/desktop: centered modal with bounded max height
- Reduce header/avatar overlap spacing on small screens so important content starts higher.
- Ensure CTA/button stack wraps cleanly and doesn’t get hidden behind mobile browser UI.

4. Add explicit close affordances
- Keep overlay click and Escape close behavior.
- Add a visible close button inside `FamilyDetailModal`’s own header instead of relying only on the shared absolute close icon.
- Optionally add a footer-safe close/back action on small screens if needed after implementation review.

5. Keep background locking but remove the trapped UX
- The page behind should remain non-scrollable while the modal is open; that is correct modal behavior.
- The real fix is to ensure the modal itself scrolls correctly and always exposes a reachable close control.
- Preserve focus/accessibility behavior from Radix while improving layout only.

6. Align this modal with existing successful modal patterns
- Reuse the same “shell + internal scroll area” pattern already used in `SpotlightCaregiverDetailModal.tsx` and `MatchDetailModal.tsx`, but improve it for smaller mobile heights by making the header sticky and the close action persistent.
- If needed, create a small reusable modal-header pattern so other long dialogs can adopt the same mobile-safe behavior later.

Technical details
- Current problem in `FamilyDetailModal.tsx`: `DialogContent` uses `max-h-[90vh] overflow-y-auto`, so the entire modal scrolls and the shared absolute close button in `dialog.tsx` can drift out of reach or be visually obscured on mobile.
- Current shared dialog button in `dialog.tsx` is absolutely positioned inside scrollable content, which is fragile for long mobile dialogs.
- Recommended target layout:
```text
DialogContent (fixed shell, overflow-hidden, p-0)
├─ Sticky modal header (title/status/close always visible)
└─ Scrollable body (family details)
   ├─ gradient hero
   ├─ avatar/title/location
   ├─ schedule/care needs/medical info
   └─ sticky or normal CTA footer
```
- Files to modify:
  - `src/components/ui/dialog.tsx`
  - `src/components/family/FamilyDetailModal.tsx`

Validation after implementation
- Test on narrow mobile width like 390px with long medical/care content.
- Confirm:
  - modal opens fully within viewport
  - content scrolls inside modal
  - close button remains visible at all times
  - WhatsApp CTA remains reachable
  - no clipped top/bottom content on tablet/desktop

