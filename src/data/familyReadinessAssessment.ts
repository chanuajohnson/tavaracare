/**
 * Family Readiness Assessment — question set and per-dimension derivation.
 *
 * This is the *pacing* layer. It is deliberately separate from:
 *   - the Care Needs Assessment (what the loved one needs, clinical)
 *   - Care Intake Completeness (do we have the required info to proceed?)
 *
 * Readiness is NEVER averaged into a single score. Each answer derives exactly
 * one dimension or is stored as a literal family instruction.
 *
 * Nine primary questions (Q1–Q9) plus one conditional (Q2b).
 */

import {
  Compass,
  History,
  HeartHandshake,
  BookOpen,
  Bell,
  MonitorSmartphone,
  DoorOpen,
  Home,
  Receipt,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Dimension value types                                               */
/* ------------------------------------------------------------------ */

export type CurrentJourneyStage =
  | "exploring"
  | "researching"
  | "preparing"
  | "action"
  | "established";

export type PriorCareExperience =
  | "none"
  | "individual_caregiver"
  | "agency"
  | "multiple_arrangements";

export type OutsideCareComfort =
  | "not_yet"
  | "mixed"
  | "willing"
  | "ready"
  | "living_it";

export type InformationCapacity = "low" | "moderate" | "high";
export type TrustPrivacySensitivity = "low" | "moderate" | "high";
export type HomeChangeReadiness = "low" | "moderate" | "high";
export type ObservedPlatformEngagement = "none" | "low" | "regular" | "high";

export type CommunicationFrequency =
  | "urgent_only"
  | "daily_summary"
  | "few_per_week"
  | "as_it_happens";

export type CommunicationWindow = "mornings" | "afternoons" | "evenings" | "anytime";

export type ManagementPreference =
  | "dashboard"
  | "whatsapp"
  | "email"
  | "phone"
  | "combination";

export type CostPresentationPreference =
  | "essentials_only"
  | "lower_cost_first"
  | "recommended_with_pricing"
  | "show_everything";

/** Every dimension that can be updated independently over time. */
export type ReadinessDimension =
  | "current_journey_stage"
  | "prior_care_experience"
  | "prior_arrangement_end_reasons"
  | "outside_care_comfort"
  | "information_capacity"
  | "communication_frequency"
  | "communication_window"
  | "management_preference"
  | "trust_privacy_sensitivity"
  | "home_change_readiness"
  | "cost_presentation_preference";

export type ReadinessUpdateSource =
  | "initial_quiz"
  | "post_placement"
  | "two_week"
  | "caregiver_change"
  | "self_update"
  | "periodic";

/* ------------------------------------------------------------------ */
/* The stored profile                                                  */
/* ------------------------------------------------------------------ */

export interface FamilyReadinessProfile {
  version: 2;
  assessed_at: string;
  /** Derived dimensions */
  current_journey_stage?: CurrentJourneyStage;
  prior_care_experience?: PriorCareExperience;
  prior_arrangement_end_reasons?: string[];
  prior_arrangement_note?: string;
  outside_care_comfort?: OutsideCareComfort;
  information_capacity?: InformationCapacity;
  trust_privacy_sensitivity?: TrustPrivacySensitivity;
  /** The raw privacy selections — needed so we honour each boundary literally */
  privacy_selections?: string[];
  home_change_readiness?: HomeChangeReadiness;
  /** Literal family instructions — preferences, never scored */
  communication_frequency?: CommunicationFrequency;
  communication_window?: CommunicationWindow;
  management_preference?: ManagementPreference;
  cost_presentation_preference?: CostPresentationPreference;
  /** Raw answers, kept for auditability */
  raw_answers?: Record<string, string | string[]>;
  /** Which questions the family chose to skip */
  skipped?: string[];
  /** Last source that touched the profile */
  last_source?: ReadinessUpdateSource;
}

/* ------------------------------------------------------------------ */
/* Question definitions                                                */
/* ------------------------------------------------------------------ */

export interface AssessmentOption {
  id: string;
  label: string;
}

export interface AssessmentQuestion {
  id: string;
  /** Which dimension this question feeds */
  dimension: ReadinessDimension;
  prompt: string;
  helper?: string;
  icon: LucideIcon;
  kind: "single" | "multi";
  options: AssessmentOption[];
  /** Optional free-text field shown under the options */
  freeText?: { label: string; placeholder: string };
  /** Follow-up shown on the same card (used for the communication window) */
  followUp?: {
    id: string;
    dimension: ReadinessDimension;
    label: string;
    options: AssessmentOption[];
  };
  /** Only show this question when the predicate passes */
  showWhen?: (answers: AssessmentAnswers) => boolean;
}

export type AssessmentAnswers = Record<string, string | string[] | undefined>;

export const READINESS_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "q1_current_journey",
    dimension: "current_journey_stage",
    prompt: "Where are you right now?",
    helper: "Whatever is true today — this can change, and that's fine.",
    icon: Compass,
    kind: "single",
    options: [
      { id: "exploring", label: "Just beginning to think about care" },
      { id: "researching", label: "Researching my options" },
      { id: "preparing", label: "Ready to arrange care" },
      { id: "action", label: "Actively arranging or replacing care" },
      { id: "established", label: "Care is already in place" },
    ],
  },
  {
    id: "q2_prior_experience",
    dimension: "prior_care_experience",
    prompt: "Have you arranged outside care before?",
    icon: History,
    kind: "single",
    options: [
      { id: "none", label: "No, this is our first time" },
      { id: "individual_caregiver", label: "Yes, with an individual caregiver" },
      { id: "agency", label: "Yes, through an agency or service" },
      { id: "multiple_arrangements", label: "Yes, we've tried several arrangements" },
    ],
  },
  {
    id: "q2b_prior_end_reasons",
    dimension: "prior_arrangement_end_reasons",
    prompt: "What brought the last arrangement to an end?",
    helper: "Select anything that applies. This helps us not repeat it.",
    icon: History,
    kind: "multi",
    showWhen: (a) => {
      const prior = a["q2_prior_experience"];
      return typeof prior === "string" && prior !== "none";
    },
    options: [
      { id: "unreliable", label: "Didn't show up reliably" },
      { id: "poor_fit", label: "Not the right fit for my loved one" },
      { id: "agency_problems", label: "Problems with the agency or service" },
      { id: "cost", label: "Cost" },
      { id: "communication", label: "Communication was difficult" },
      { id: "trust", label: "I didn't feel I could trust them" },
      { id: "needs_changed", label: "Our needs changed" },
      { id: "other", label: "Something else" },
    ],
    freeText: {
      label: "Anything you'd want us to know?",
      placeholder: "Only if you'd like to share — you can skip this.",
    },
  },
  {
    id: "q3_outside_care_comfort",
    dimension: "outside_care_comfort",
    prompt: "How does it feel to have someone come into your home to help?",
    icon: HeartHandshake,
    kind: "single",
    options: [
      { id: "not_yet", label: "Honestly, uncomfortable — I'm not there yet" },
      { id: "mixed", label: "Mixed. I know we need help but it's a lot" },
      { id: "willing", label: "I'm okay with it, I want to get it right" },
      { id: "ready", label: "Comfortable — I'm ready" },
      { id: "living_it", label: "We're already doing it, it's part of our routine now" },
    ],
  },
  {
    id: "q4_information_capacity",
    dimension: "information_capacity",
    prompt: "How would you like us to guide you right now?",
    icon: BookOpen,
    kind: "single",
    options: [
      { id: "today_only", label: "Just what I need for today, nothing more" },
      { id: "gradual", label: "One step at a time, gradually" },
      { id: "my_options", label: "Show me my options and let me choose" },
      { id: "full_picture", label: "Give me the full picture, I'm ready to move" },
    ],
  },
  {
    id: "q5_communication",
    dimension: "communication_frequency",
    prompt: "How often should we check in?",
    icon: Bell,
    kind: "single",
    options: [
      { id: "urgent_only", label: "Only when it's urgent" },
      { id: "daily_summary", label: "One short summary a day" },
      { id: "few_per_week", label: "A few updates during the week" },
      { id: "as_it_happens", label: "Keep me posted as things happen" },
    ],
    followUp: {
      id: "q5b_communication_window",
      dimension: "communication_window",
      label: "Best time to reach you?",
      options: [
        { id: "mornings", label: "Mornings" },
        { id: "afternoons", label: "Afternoons" },
        { id: "evenings", label: "Evenings" },
        { id: "anytime", label: "Anytime" },
      ],
    },
  },
  {
    id: "q6_management_preference",
    dimension: "management_preference",
    prompt: "How would you prefer to manage care and receive information?",
    icon: MonitorSmartphone,
    kind: "single",
    options: [
      { id: "dashboard", label: "The Tavara dashboard" },
      { id: "whatsapp", label: "WhatsApp" },
      { id: "email", label: "Email" },
      { id: "phone", label: "Phone" },
      { id: "combination", label: "A combination" },
    ],
  },
  {
    id: "q7_privacy",
    dimension: "trust_privacy_sensitivity",
    prompt:
      "When care involves people coming into your home, what feels comfortable to you?",
    helper: "Select anything that applies. We'll treat these as your boundaries.",
    icon: DoorOpen,
    kind: "multi",
    options: [
      { id: "chosen_caregiver_fine", label: "The caregiver we've chosen is fine" },
      { id: "approve_backup", label: "I'd want to approve any backup or stand-in caregiver first" },
      { id: "ask_before_others", label: "Please ask me before involving any other professional" },
      { id: "keep_household_private", label: "I'd rather keep household details private" },
      { id: "comfortable_all", label: "I'm comfortable with all of this" },
    ],
  },
  {
    id: "q8_home_change",
    dimension: "home_change_readiness",
    prompt:
      "If we notice something that could make care easier — routines, safety, how a room is set up — how should we handle it?",
    icon: Home,
    kind: "single",
    options: [
      { id: "no_changes", label: "No changes right now, please" },
      { id: "small_only", label: "Small things only" },
      { id: "recommend_i_decide", label: "Tell me your recommendations and I'll decide" },
      { id: "ready_for_changes", label: "I'm ready to make practical changes for care" },
    ],
  },
  {
    id: "q9_cost_presentation",
    dimension: "cost_presentation_preference",
    prompt: "How should we approach cost?",
    helper: "This is about how we present things, nothing more.",
    icon: Receipt,
    kind: "single",
    options: [
      { id: "essentials_only", label: "Keep everything to essentials unless I ask" },
      { id: "lower_cost_first", label: "Show me lower-cost options first" },
      { id: "recommended_with_pricing", label: "Show me what you recommend, with the pricing" },
      { id: "show_everything", label: "Show me everything, including premium support" },
    ],
  },
];

/** Questions visible for a given answer set (handles the conditional Q2b). */
export const visibleQuestions = (answers: AssessmentAnswers): AssessmentQuestion[] =>
  READINESS_QUESTIONS.filter((q) => (q.showWhen ? q.showWhen(answers) : true));

/* ------------------------------------------------------------------ */
/* Per-dimension derivation — no averaging, ever                       */
/* ------------------------------------------------------------------ */

const INFO_CAPACITY_MAP: Record<string, InformationCapacity> = {
  today_only: "low",
  gradual: "moderate",
  my_options: "moderate",
  full_picture: "high",
};

const HOME_CHANGE_MAP: Record<string, HomeChangeReadiness> = {
  no_changes: "low",
  small_only: "moderate",
  recommend_i_decide: "moderate",
  ready_for_changes: "high",
};

const RESTRICTIVE_PRIVACY = [
  "approve_backup",
  "ask_before_others",
  "keep_household_private",
];

export const derivePrivacySensitivity = (
  selections: string[] | undefined
): TrustPrivacySensitivity => {
  if (!selections || selections.length === 0) return "high"; // safest default
  if (selections.includes("comfortable_all") && selections.length === 1) return "low";
  const restrictive = selections.filter((s) => RESTRICTIVE_PRIVACY.includes(s)).length;
  if (restrictive >= 2) return "high";
  if (restrictive === 1) return "moderate";
  return "low";
};

const asString = (v: string | string[] | undefined): string | undefined =>
  typeof v === "string" ? v : undefined;

const asArray = (v: string | string[] | undefined): string[] | undefined =>
  Array.isArray(v) ? v : undefined;

/**
 * Builds the stored profile from raw answers.
 * Each dimension is derived independently. Nothing is combined or averaged.
 */
export const deriveReadinessProfile = (
  answers: AssessmentAnswers,
  opts?: { source?: ReadinessUpdateSource; freeText?: string }
): FamilyReadinessProfile => {
  const privacy = asArray(answers["q7_privacy"]);
  const infoAnswer = asString(answers["q4_information_capacity"]);
  const homeAnswer = asString(answers["q8_home_change"]);

  const visible = visibleQuestions(answers);
  const skipped = visible
    .filter((q) => {
      const v = answers[q.id];
      return v === undefined || (Array.isArray(v) && v.length === 0);
    })
    .map((q) => q.id);

  const raw: Record<string, string | string[]> = {};
  for (const [k, v] of Object.entries(answers)) {
    if (v !== undefined) raw[k] = v;
  }

  return {
    version: 2,
    assessed_at: new Date().toISOString(),
    current_journey_stage: asString(answers["q1_current_journey"]) as
      | CurrentJourneyStage
      | undefined,
    prior_care_experience: asString(answers["q2_prior_experience"]) as
      | PriorCareExperience
      | undefined,
    prior_arrangement_end_reasons: asArray(answers["q2b_prior_end_reasons"]),
    prior_arrangement_note: opts?.freeText || undefined,
    outside_care_comfort: asString(answers["q3_outside_care_comfort"]) as
      | OutsideCareComfort
      | undefined,
    information_capacity: infoAnswer ? INFO_CAPACITY_MAP[infoAnswer] : undefined,
    trust_privacy_sensitivity: privacy ? derivePrivacySensitivity(privacy) : undefined,
    privacy_selections: privacy,
    home_change_readiness: homeAnswer ? HOME_CHANGE_MAP[homeAnswer] : undefined,
    communication_frequency: asString(answers["q5_communication"]) as
      | CommunicationFrequency
      | undefined,
    communication_window: asString(answers["q5b_communication_window"]) as
      | CommunicationWindow
      | undefined,
    management_preference: asString(answers["q6_management_preference"]) as
      | ManagementPreference
      | undefined,
    cost_presentation_preference: asString(answers["q9_cost_presentation"]) as
      | CostPresentationPreference
      | undefined,
    raw_answers: raw,
    skipped,
    last_source: opts?.source ?? "initial_quiz",
  };
};

/**
 * Backward compatibility only: legacy `client_stage` (1–4) consumers keep
 * working. Derived from the journey stage alone — never from service appetite.
 */
export const journeyStageToLegacyStage = (
  stage: CurrentJourneyStage | undefined
): 1 | 2 | 3 | 4 => {
  switch (stage) {
    case "exploring":
    case "researching":
      return 1;
    case "preparing":
      return 2;
    case "action":
      return 3;
    case "established":
      return 4;
    default:
      return 1;
  }
};

/* ------------------------------------------------------------------ */
/* Human labels (shared by family result screen and coordinator view)  */
/* ------------------------------------------------------------------ */

export const JOURNEY_LABELS: Record<CurrentJourneyStage, string> = {
  exploring: "Just beginning",
  researching: "Researching options",
  preparing: "Ready to arrange care",
  action: "Actively arranging care",
  established: "Care already in place",
};

export const PRIOR_EXPERIENCE_LABELS: Record<PriorCareExperience, string> = {
  none: "First time",
  individual_caregiver: "Individual caregiver before",
  agency: "Agency or service before",
  multiple_arrangements: "Several arrangements before",
};

export const COMFORT_LABELS: Record<OutsideCareComfort, string> = {
  not_yet: "Not yet comfortable",
  mixed: "Mixed",
  willing: "Willing",
  ready: "Ready",
  living_it: "Living it already",
};

export const CAPACITY_LABELS: Record<InformationCapacity, string> = {
  low: "Low — essentials only",
  moderate: "Moderate",
  high: "High — full picture",
};

export const LEVEL_LABELS: Record<"low" | "moderate" | "high", string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
};

export const COMMUNICATION_LABELS: Record<CommunicationFrequency, string> = {
  urgent_only: "Only when urgent",
  daily_summary: "One summary a day",
  few_per_week: "A few times a week",
  as_it_happens: "As things happen",
};

export const WINDOW_LABELS: Record<CommunicationWindow, string> = {
  mornings: "Mornings",
  afternoons: "Afternoons",
  evenings: "Evenings",
  anytime: "Anytime",
};

export const MANAGEMENT_LABELS: Record<ManagementPreference, string> = {
  dashboard: "Tavara dashboard",
  whatsapp: "WhatsApp",
  email: "Email",
  phone: "Phone",
  combination: "A combination",
};

export const COST_LABELS: Record<CostPresentationPreference, string> = {
  essentials_only: "Essentials unless they ask",
  lower_cost_first: "Lower-cost options first",
  recommended_with_pricing: "Recommended, with pricing",
  show_everything: "Everything, including premium",
};

export const PRIVACY_SELECTION_LABELS: Record<string, string> = {
  chosen_caregiver_fine: "Chosen caregiver is fine",
  approve_backup: "Approve backup caregivers first",
  ask_before_others: "Ask before involving others",
  keep_household_private: "Keep household details private",
  comfortable_all: "Comfortable with all of it",
};

export const END_REASON_LABELS: Record<string, string> = {
  unreliable: "Unreliable attendance",
  poor_fit: "Poor fit",
  agency_problems: "Agency problems",
  cost: "Cost",
  communication: "Communication",
  trust: "Trust",
  needs_changed: "Needs changed",
  other: "Other",
};

/* ------------------------------------------------------------------ */
/* Local progress (anonymous-safe, resumable)                          */
/* ------------------------------------------------------------------ */

export const READINESS_ASSESSMENT_PROFILE_KEY = "tavara_readiness_profile";
export const READINESS_ASSESSMENT_PROGRESS_KEY = "tavara_readiness_assessment_progress";

const PROGRESS_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export interface AssessmentProgress {
  answers: AssessmentAnswers;
  currentIndex: number;
  freeText?: string;
  updatedAt: string;
}

export const readAssessmentProgress = (): AssessmentProgress | null => {
  try {
    const raw = localStorage.getItem(READINESS_ASSESSMENT_PROGRESS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AssessmentProgress;
    if (!parsed.updatedAt || !parsed.answers) return null;
    if (Date.now() - new Date(parsed.updatedAt).getTime() > PROGRESS_MAX_AGE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const writeAssessmentProgress = (
  answers: AssessmentAnswers,
  currentIndex: number,
  freeText?: string
) => {
  try {
    localStorage.setItem(
      READINESS_ASSESSMENT_PROGRESS_KEY,
      JSON.stringify({
        answers,
        currentIndex,
        freeText,
        updatedAt: new Date().toISOString(),
      } satisfies AssessmentProgress)
    );
  } catch {
    // ignore
  }
};

export const clearAssessmentProgress = () => {
  try {
    localStorage.removeItem(READINESS_ASSESSMENT_PROGRESS_KEY);
  } catch {
    // ignore
  }
};

export const countAssessmentAnswered = (answers: AssessmentAnswers) =>
  Object.values(answers).filter(
    (v) => v !== undefined && (!Array.isArray(v) || v.length > 0)
  ).length;
