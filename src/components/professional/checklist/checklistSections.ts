
export interface ChecklistSection {
  title: string;
  items: string[];
}

export const CHECKLIST_SECTIONS: ChecklistSection[] = [
  {
    title: '🌅 Start of Shift',
    items: [
      'Greet and check in with client',
      'Review previous shift notes',
      'Check medication schedule',
      'Assess client mood and comfort',
      'Inspect home environment for safety',
      'Confirm emergency contacts are accessible',
      'Caregivers are assigned to the primary client. Support to other household members is limited to approved, scoped services only'
    ]
  },
  {
    title: '🩺 Care Tasks',
    items: [
      'Assist with bathing/personal hygiene',
      'Assist with dressing and grooming',
      'Oral care completed',
      'Assist with toileting / incontinence care',
      'Administer medications (under supervision)'
    ]
  },
  {
    title: '💙 Emotional Support',
    items: [
      'Provide companionship and conversation',
      'Engage in mental stimulation activities',
      'Monitor mood and emotional wellbeing',
      'Encourage social interaction'
    ]
  },
  {
    title: '🏠 Home Tasks',
    items: [
      'Light cooking of pre-prepared meals (family provides meal prep and ingredients)',
      'Assist with feeding if needed',
      'Light housekeeping / tidy patient areas',
      'Laundry support',
      'Take out trash'
    ]
  },
  {
    title: '📊 Monitoring',
    items: [
      'Take vital signs (BP, temp, pulse)',
      'Monitor mobility and fall risk',
      'Check for skin integrity / pressure areas'
    ]
  },
  {
    title: '🩺 First Aid & Emergency Support (Recommended)',
    items: [
      '— Basic First Aid —',
      'Adhesive bandages (plasters – assorted sizes)',
      'Sterile gauze pads',
      'Medical tape',
      'Antiseptic solution (Dettol or similar)',
      'Rubbing alcohol',
      'Hydrogen peroxide',
      'Antibiotic ointment (e.g. Polysporin)',
      '— Wound & Skin Care —',
      'Disposable medical gloves',
      'Cotton balls / cotton pads',
      'Saline solution (for gentle cleaning)',
      'Barrier cream / zinc cream (for skin protection)',
      '— Pain & General Relief (as approved by family) —',
      'Panadol / Paracetamol',
      'Advil / Ibuprofen',
      'Aspirin (if already prescribed/used)',
      'Milk of Magnesia (digestive support)',
      '— Monitoring & Basic Tools —',
      'Digital thermometer',
      'Blood pressure machine (if available)',
      'Pulse oximeter (optional but helpful)',
      '— Emergency & Support Items —',
      'Ice packs / cold compress',
      'Small flashlight',
      'Emergency contact list (printed and visible)',
      '— Optional (Helpful Additions) —',
      'Pill organizer',
      'Notepad for quick observations',
      'Extra disposable masks'
    ]
  },
  {
    title: '📞 Communication',
    items: [
      'Update WhatsApp care group',
      'Communicate with family as needed',
      'Report any concerns to care coordinator'
    ]
  },
  {
    title: '📝 Documentation & Logging',
    items: [
      'Complete daily care log entry',
      'Document medication administration',
      'Note any behavioral changes',
      'Record meals and fluid intake',
      'Document any incidents or concerns'
    ]
  },
  {
    title: '🌙 End of Shift',
    items: [
      'Brief incoming nurse on client status',
      'Ensure client is comfortable and safe',
      'Update shift notes for next nurse',
      'Confirm next shift coverage'
    ]
  }
];

export const MEDICATION_ITEM_TEXT = 'Administer medications (under supervision)';
