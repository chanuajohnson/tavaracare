

## Plan: Categorize WhatsApp Nudge Templates by Role and Stage

### Problem
The WhatsApp Nudge System page (`/admin/whatsapp-nudge`) shows all templates in a flat, unsorted grid. With many templates now, it's hard to find the right one. The user needs templates grouped by **role** (Professional / Family / Community) and **stage** (e.g., registration, onboarding, post-onboarding, ready to commence).

### Solution
Reorganize the `WhatsAppTemplateManager` to display templates in collapsible sections grouped by role, then sub-grouped by stage within each role.

### Changes to `src/components/admin/WhatsAppTemplateManager.tsx`

**1. Fetch the `stage` field from the database**
Currently `stage` is stored in `nudge_templates` but not mapped to the UI interface. Add `stage` to the `WhatsAppTemplate` interface and include it in the mapped data.

**2. Add role filter tabs**
Add filter buttons at the top: **All** | **Professional** | **Family** | **Community** so the admin can quickly narrow down.

**3. Group templates by stage within the selected role**
Within each role filter, group templates by their `stage` field (e.g., "Registration", "Screening", "Onboarding", "Post-Onboarding", "Ready to Commence", "Manual"). Each group gets a clear heading with a count badge.

**4. Add a search input**
A simple text search to filter templates by title or message content for quick lookup.

**5. Sort order**
Templates sorted by role, then by stage in a logical journey order (registration -> screening -> onboarding -> post-onboarding -> manual).

### UI Layout
```text
[Search: _______________]  [All | Professional | Family | Community]  [+ Create Template]

── Professional (8 templates) ──────────────────────────
  📋 Registration (2)
    [Card] [Card]
  
  📋 Post-Onboarding (3)
    [Card] [Card] [Card]
  
  📋 Ready to Commence (1)
    [Card]

── Family (5 templates) ────────────────────────────────
  📋 Registration (2)
    [Card] [Card]
  ...
```

### Files to modify

| File | Change |
|------|--------|
| `src/components/admin/WhatsAppTemplateManager.tsx` | Add stage to interface, add role filter tabs, group by stage, add search, add stage to create/edit form |

### No migration needed
The `stage` field already exists in `nudge_templates`. This is frontend-only.

