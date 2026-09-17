/**
 * CANONICAL family journey definition.
 *
 * Single source of truth for the family journey steps used by:
 *  - the family dashboard (useSharedFamilyJourneyData → useEnhancedJourneyProgress)
 *  - the admin family cards (MiniJourneyProgress)
 *  - the admin user detail Journey tab
 *  - TAV (useFamilyProgress)
 *
 * Step IDs are STABLE identifiers (completion logic and button labels switch on
 * them). Display order is the array order — the Care Readiness Check (id 18)
 * therefore sits second even though its id is highest. Do not renumber ids.
 */

export type FamilyJourneyCategory =
  | 'foundation'
  | 'scheduling'
  | 'care_environment'
  | 'trial'
  | 'conversion';

export interface FamilyJourneyStepDefinition {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  optional?: boolean;
  category: FamilyJourneyCategory;
  accessible?: boolean;
}

export const FAMILY_JOURNEY_STEPS: FamilyJourneyStepDefinition[] = [
  // Foundation
  {
    id: 1,
    title: "Complete Your Profile",
    description: "Add your contact information and care preferences.",
    completed: false,
    category: 'foundation',
    accessible: true
  },
  {
    id: 18,
    title: "Take Your Care Readiness Check",
    description: "Nine short questions about where you are right now, so we pace support to suit your household.",
    completed: false,
    category: 'foundation',
    accessible: true
  },
  {
    id: 2,
    title: "Complete Initial Care Assessment",
    description: "Help us understand your care needs better.",
    completed: false,
    category: 'foundation',
    accessible: true
  },
  {
    id: 3,
    title: "Complete Your Loved One's Legacy Story",
    description: "Because care is more than tasks—our Legacy Story feature honors the voices, memories, and wisdom of those we care for.",
    completed: false,
    optional: true,
    category: 'foundation',
    accessible: true
  },
  {
    id: 4,
    title: "See Your Instant Caregiver Matches",
    description: "Now that your loved one's profile is complete, unlock personalized caregiver recommendations.",
    completed: false,
    category: 'foundation',
    accessible: false
  },
  {
    id: 5,
    title: "Set Up Medication Management",
    description: "Add medications and set up schedules for your care plan.",
    completed: false,
    category: 'foundation',
    accessible: true
  },
  {
    id: 6,
    title: "Set Up Meal Management",
    description: "Plan meals and create grocery lists for your care plan.",
    completed: false,
    category: 'foundation',
    accessible: true
  },
  {
    id: 7,
    title: "Get Started with Care",
    description: "Begin your care journey with a scheduled visit from our care coordinators",
    completed: false,
    category: 'foundation',
    accessible: true
  },
  // Scheduling / coordination
  {
    id: 8,
    title: "Confirm Your Visit",
    description: "Your visit has been scheduled and confirmed with our care coordinator.",
    completed: false,
    category: 'scheduling',
    accessible: false
  },
  {
    id: 9,
    title: "Care Team Confirmed",
    description: "A care team member has been selected and coordinated for your family. View your care team.",
    completed: false,
    category: 'scheduling',
    accessible: false
  },
  {
    id: 10,
    title: "Initial Family Meeting",
    description: "Meet and greet with your care team member at your home.",
    completed: false,
    category: 'scheduling',
    accessible: false
  },
  {
    id: 11,
    title: "Care Begins",
    description: "Your care team begins providing support. View your care plan for schedules and details.",
    completed: false,
    category: 'scheduling',
    accessible: false
  },
  // Care environment
  {
    id: 12,
    title: "Home Safety Walkthrough",
    description: "Your caregiver walks through the home with you during the first week of care to check safety and set-up.",
    completed: false,
    category: 'care_environment',
    accessible: false
  },
  {
    id: 13,
    title: "Home Environment Optimization",
    description: "Guided or full care environment coordination to prepare your home for safe, comfortable caregiving.",
    completed: false,
    optional: true,
    category: 'care_environment',
    accessible: false
  },
  // Trial
  {
    id: 14,
    title: "Schedule Trial Day (Optional)",
    description: "Choose a trial date with your matched caregiver. This is an optional step before choosing your care model.",
    completed: false,
    optional: true,
    category: 'trial',
    accessible: false
  },
  {
    id: 15,
    title: "Pay for Trial Day (Optional)",
    description: "Complete payment for an optional 8-hour caregiver trial experience.",
    completed: false,
    optional: true,
    category: 'trial',
    accessible: false
  },
  {
    id: 16,
    title: "Begin Your Trial (Optional)",
    description: "Your caregiver begins the scheduled trial session.",
    completed: false,
    optional: true,
    category: 'trial',
    accessible: false
  },
  // Conversion
  {
    id: 17,
    title: "Rate & Choose Your Path",
    description: "Choose your care model — view subscription plans or hire directly.",
    completed: false,
    category: 'conversion',
    accessible: false
  }
];

/** Fresh copy so consumers can mutate their own state safely. */
export const getFamilyJourneySteps = (): FamilyJourneyStepDefinition[] =>
  FAMILY_JOURNEY_STEPS.map(step => ({ ...step }));

export const FAMILY_JOURNEY_READINESS_STEP_ID = 18;
