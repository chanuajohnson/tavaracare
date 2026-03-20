

## Fix Build Error: Duplicate lovable-tagger Plugin

### Root Cause

The build uses `.lovable/vite.config.ts` which:
1. Imports your `vite.config.ts` (which adds `componentTagger()` when mode is development)
2. Then adds its **own** `componentTagger()` instance

Result: the tagger runs twice, injecting duplicate `data-lov-id` attributes, causing esbuild to fail.

The `.lovable/vite.config.ts` tries to filter out duplicates (line 15: `p?.name !== "lovable-tagger"`), but the plugin from your config passes through because of how the conditional array works.

### Fix

**Modify `vite.config.ts`** — Remove the `componentTagger` import and usage entirely. The `.lovable/vite.config.ts` wrapper already handles adding it automatically.

Changes:
- Remove line 5: `import { componentTagger } from "lovable-tagger";`
- Remove lines 38-39: `mode === 'development' && componentTagger(),`
- Keep just `react()` in the plugins array

This is the only file change needed. Once the build succeeds, all your new components (JourneyVisualSummary, FamilyJourneyProgressPanel with collapsible, ActiveCaregiverMatchesPanel) will render on `/admin/user-journey`.

| Action | File | Description |
|--------|------|-------------|
| Modify | `vite.config.ts` | Remove duplicate componentTagger — .lovable wrapper handles it |

