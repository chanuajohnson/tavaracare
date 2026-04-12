

## Plan: Add First Aid & Emergency Support Section to Daily Checklist SOP

### What Changes

Add a new section to the `CHECKLIST_SECTIONS` array in `src/components/professional/checklist/checklistSections.ts` titled **"🩺 First Aid & Emergency Support (Recommended)"** with all the items specified, organized into sub-groups within the flat items list.

### Why Only One File

The `CHECKLIST_SECTIONS` constant is imported and rendered automatically by all consumers:
- Admin onboarding checklist (family tab + professional tab)
- Professional onboarding checklist (self-view)
- Daily checklist (caregiver shift tool)
- Daily care logs (review view)

Adding the section to the source array propagates it everywhere — no other files need changes.

### Items to Add

The section will be inserted after the existing "📊 Monitoring" section (position 5) and will contain these items grouped with clear labels:

- **Basic First Aid**: Adhesive bandages, sterile gauze pads, medical tape, antiseptic solution, rubbing alcohol, hydrogen peroxide, antibiotic ointment
- **Wound & Skin Care**: Disposable medical gloves, cotton balls/pads, saline solution, barrier cream/zinc cream
- **Pain & General Relief** (as approved by family): Panadol/Paracetamol, Advil/Ibuprofen, Aspirin (if prescribed), Milk of Magnesia
- **Monitoring & Basic Tools**: Digital thermometer, blood pressure machine, pulse oximeter
- **Emergency & Support Items**: Ice packs/cold compress, small flashlight, emergency contact list (printed and visible)
- **Optional (Helpful Additions)**: Pill organizer, notepad for observations, extra disposable masks

### Technical Details

| File | Change |
|------|--------|
| `src/components/professional/checklist/checklistSections.ts` | Add new `ChecklistSection` entry with title "🩺 First Aid & Emergency Support (Recommended)" and 22 items |

This is a single-file, data-only change. All UI rendering is already handled by existing components that map over `CHECKLIST_SECTIONS`.

