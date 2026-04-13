

## Plan: Make Tavara Care Rates Card Collapsible

Replace the fully-expanded card with a collapsible version that shows just the title "Tavara Care Rates" with a brief subtitle like "$35-$45+/hr" by default, and expands to show the full tier details on click.

### Changes

| File | Change |
|------|--------|
| `src/components/family/FamilyDashboard.tsx` | Import `Collapsible, CollapsibleTrigger, CollapsibleContent` from `@/components/ui/collapsible`; wrap the rate detail content in a `Collapsible` with `defaultOpen={false}`; show the title + a `ChevronDown`/`ChevronUp` toggle as the trigger; move the three tier paragraphs into `CollapsibleContent`; keep the dismiss X button |

The collapsed state will show:
- Dollar icon + "Tavara Care Rates" heading + "$35–$45+/hr" summary
- Chevron icon to expand

The expanded state shows the full tier breakdown as it does today.

