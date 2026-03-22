

## Add Nudge Tab to Admin User Detail Modal

### What This Does
Adds a "Nudge" tab to the user detail modal (between Reports and Activity) that shows all nudge templates relevant to that user's role and journey stage, with the ability to send them directly via WhatsApp — plus a link to the full nudge management page and a create template shortcut.

### Implementation

#### 1. Create `src/components/admin/UserNudgeTab.tsx` (new component)

A self-contained tab component that receives the user object and their journey progress. It will:

- **Fetch templates** from `nudge_templates` filtered by the user's role
- **Group templates** into two sections:
  - "Recommended for this stage" — templates whose `stage` matches the user's current or next step (e.g., `step_5`, `step_6`)
  - "All available templates" — remaining templates for that role
- **Show each template** as a card with:
  - Template name + stage badge
  - Personalized message preview (auto-populated with `[Name]`, `[X]%`, `[Role]`)
  - "Send via WhatsApp" button that opens WhatsApp with the populated message to the Tavara business number (18687865357)
- **Footer links**:
  - "Manage All Templates" → navigates to `/admin/whatsapp-nudge`
  - "+ Create Template" → navigates to `/admin/whatsapp-nudge` (the create modal already exists there)
- **Empty state**: If no templates exist for the role, show a message with a link to create one

#### 2. Modify `src/components/admin/UserDetailModal.tsx`

- Import `UserNudgeTab`
- Add `<TabsTrigger value="nudge">Nudge</TabsTrigger>` before "Activity" in the tabs list (line 334)
- Update `grid-cols-5` to `grid-cols-6` to accommodate the new tab
- Add `<TabsContent value="nudge">` with the `UserNudgeTab` component, passing user data, phone, role, and journey progress

### Files Changed

| Action | File | Description |
|--------|------|-------------|
| Create | `src/components/admin/UserNudgeTab.tsx` | Nudge tab showing role-filtered templates with WhatsApp send |
| Modify | `src/components/admin/UserDetailModal.tsx` | Add Nudge tab trigger and content |

