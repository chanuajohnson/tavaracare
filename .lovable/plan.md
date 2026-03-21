

## Fix: Remove Emergency Contact Relationship from Anonymous Report

The anonymous report currently includes "Emergency Contact Relationship: Son of Carol Glenn-Aimey" — which reveals the care recipient's name, defeating the purpose of anonymity.

### Change

**Modify `src/services/admin/userReportGenerator.ts`** (lines 451-455)

Remove the anonymous-mode block that outputs `emergency_contact_relationship`. This field often contains names embedded in the relationship description (e.g., "Son of Carol Glenn-Aimey"), so it cannot be safely shown anonymously.

Simply delete the `else` block (lines 451-455) so that in anonymous mode, no emergency contact information is shown at all.

| Action | File | Description |
|--------|------|-------------|
| Modify | `src/services/admin/userReportGenerator.ts` | Remove emergency contact relationship from anonymous reports |

