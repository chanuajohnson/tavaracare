import { Heart, Sparkles, Users, Home, Repeat, LucideIcon } from 'lucide-react';

export interface MatchingStep {
  number: number;
  icon: LucideIcon;
  title: string;
  intro?: string;
  bullets: string[];
  outro?: string;
  quote: string;
}

export const familySteps: MatchingStep[] = [
  {
    number: 1,
    icon: Heart,
    title: 'Understand Your Reality',
    bullets: [
      'Care needs and medical conditions',
      'Daily routine and schedule',
      'Family dynamics and relationship to the care recipient',
      'Stage of care — urgent now, planning ahead, or transitioning',
      "Your loved one's Legacy Story — who they are, not just what they need",
    ],
    quote: 'We start with your real life — not just a request.',
  },
  {
    number: 2,
    icon: Sparkles,
    title: 'Match for Fit',
    intro: 'Every caregiver is scored across four signals:',
    bullets: [
      'Care types',
      'Schedule overlap',
      'Experience & specialised training',
      'Location',
    ],
    outro: 'Families see one overall match score plus a clear explanation of why that caregiver fits.',
    quote: 'Not just availability — actual fit, scored across what matters.',
  },
  {
    number: 3,
    icon: Users,
    title: 'Meet Your Care Team',
    bullets: [
      'A care coordinator visits to confirm needs in person',
      'Your care team is confirmed (one main caregiver + supporting care team members)',
      'We facilitate an initial family meeting at your home',
      'An optional trial day may be arranged before you commit',
    ],
    quote: 'A match on paper becomes a person at your door — with Tavara walking you through it.',
  },
  {
    number: 4,
    icon: Home,
    title: 'Prepare the Home for Care',
    intro: 'Once care begins, your caregiver runs a Care Readiness Assessment covering:',
    bullets: [
      'Hygiene, safety, accessibility',
      'Caregiver workflow and daily flow',
      'Decluttering & space optimisation recommendations',
    ],
    outro: 'If additional support is needed: assessment included, guided reset available, full reset by quote.',
    quote: 'Care depends on the environment — the home has to support the care, not work against it.',
  },
  {
    number: 5,
    icon: Repeat,
    title: 'Coordinate and Sustain',
    bullets: [
      'Schedule changes, shift swaps, coverage',
      'Backup caregiver support',
      'Daily care logs and family visibility',
      'Escalations when care needs evolve',
      'Ongoing coordinator support for both the family and caregiver',
    ],
    quote: 'So care continues — even when things change.',
  },
];

export const caregiverSteps: MatchingStep[] = [
  {
    number: 1,
    icon: Heart,
    title: 'We Get to Know You',
    bullets: [
      'Your training, certifications & specialisations',
      'Shifts you can actually work',
      'Areas you can reach reliably',
      "Care types you're confident with",
    ],
    quote: 'We match you to families where your skills genuinely fit — not just any open shift.',
  },
  {
    number: 2,
    icon: Sparkles,
    title: 'Matched for Fit',
    bullets: [
      "You're scored against family needs across the same four signals: care types, schedule, experience, location.",
      'You see why a family is a fit before you accept.',
    ],
    quote: 'Real matches, not random assignments.',
  },
  {
    number: 3,
    icon: Users,
    title: 'Meet Your Family',
    bullets: [
      'A Tavara coordinator introduces you',
      'Initial family meeting at the home',
      'Optional trial day to confirm mutual fit',
      'Care team structure confirmed (main caregiver + fill-in caregivers)',
    ],
    quote: "You're never sent in cold.",
  },
  {
    number: 4,
    icon: Home,
    title: 'Set Up the Care Environment',
    bullets: [
      'On your first week you complete a Care Readiness Assessment — your professional eyes on hygiene, safety, workflow, and what the home needs to support quality care.',
    ],
    quote: "You're the expert in the room — Tavara backs your recommendations.",
  },
  {
    number: 5,
    icon: Repeat,
    title: 'Ongoing Support & Care Payments',
    bullets: [
      'Shift coverage and swap support when life happens',
      'Daily care logs (your record of work)',
      'Backup caregivers in your team',
      "Transparent care payments every cycle (no employer/employee framing — you're an independent care professional)",
      'Coordinator support whenever you need it',
    ],
    quote: 'Tavara coordinates the system so you can focus on care.',
  },
];
