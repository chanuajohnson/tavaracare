/**
 * Family Readiness — protective / pacing rule engine.
 *
 * Pure functions only, so this is unit-testable and has exactly one home.
 * Constraints ALWAYS override stage. Nothing here averages dimensions.
 *
 * Rules 1–8 map one-to-one onto the approved specification.
 */

import {
  type FamilyReadinessProfile,
  type InformationCapacity,
  type TrustPrivacySensitivity,
  type HomeChangeReadiness,
  type ObservedPlatformEngagement,
  type CurrentJourneyStage,
  type ManagementPreference,
  type CostPresentationPreference,
  type PriorCareExperience,
} from "@/data/familyReadinessAssessment";

export const PACE_SUPPORT_FLAG = "PACE_SUPPORT_REQUIRED";
export const PACE_SUPPORT_LABEL = "PACE SUPPORT REQUIRED";
export const PACE_SUPPORT_GUIDANCE =
  "Care is in motion. Introduce information and change gradually.";

export interface ReadinessRuleInput {
  profile: FamilyReadinessProfile | null;
  /** Behavioural, never self-reported. */
  observedEngagement?: ObservedPlatformEngagement;
  /** True only when a genuine safety concern exists in the home. */
  safetyConcern?: boolean;
}

export interface ReadinessDecisions {
  hasProfile: boolean;

  /* Resolved dimensions, with safe defaults when unknown */
  journeyStage: CurrentJourneyStage | null;
  priorExperience: PriorCareExperience | null;
  informationCapacity: InformationCapacity;
  trustPrivacy: TrustPrivacySensitivity;
  homeChangeReadiness: HomeChangeReadiness;
  costPreference: CostPresentationPreference;
  managementPreference: ManagementPreference | null;
  observedEngagement: ObservedPlatformEngagement;

  /* Rule 1 */
  maxNonUrgentRecommendations: number;
  useCondensedSummaries: boolean;
  /* Rule 2 */
  requireApprovalForBackupCaregiver: boolean;
  requireApprovalForAdditionalProfessional: boolean;
  keepHouseholdDetailsPrivate: boolean;
  /* Rule 3 */
  showHomeEnvironmentRecommendations: boolean;
  homeRecommendationsSafetyOnly: boolean;
  /* Rule 4 / 5 */
  provideFoundationalEducation: boolean;
  askWhatEndedPreviousArrangement: boolean;
  emphasiseContinuityInMatching: boolean;
  /* Rule 6 */
  showOptionalServices: boolean;
  orderCostLowestFirst: boolean;
  /* Rule 7 */
  deliveryChannels: ManagementPreference[];
  primaryChannel: ManagementPreference | null;
  dashboardAloneIsSufficient: boolean;
  /* Rule 8 */
  paceSupportRequired: boolean;
  paceSupportGuidance: string | null;

  /** Coordinator-facing discrepancy notes (never shown to families). */
  discrepancies: string[];
  /** Plain-language coordination guidance lines. */
  guidance: string[];
}

const CAUTIOUS = {
  informationCapacity: (v: InformationCapacity) => v === "low",
  trustPrivacy: (v: TrustPrivacySensitivity) => v === "high",
  homeChangeReadiness: (v: HomeChangeReadiness) => v === "low",
  cost: (v: CostPresentationPreference) => v === "essentials_only",
  comfort: (v: FamilyReadinessProfile["outside_care_comfort"]) =>
    v === "not_yet" || v === "mixed",
};

/**
 * Channels that critical / action-required information must go out on.
 * "combination" fans out to every channel we can actually reach them on.
 */
export const resolveChannels = (
  pref: ManagementPreference | null
): { channels: ManagementPreference[]; primary: ManagementPreference | null } => {
  if (!pref) return { channels: ["whatsapp"], primary: null };
  if (pref === "combination") {
    return {
      channels: ["dashboard", "whatsapp", "email", "phone"],
      primary: null,
    };
  }
  return { channels: [pref], primary: pref };
};

export const evaluateReadiness = (input: ReadinessRuleInput): ReadinessDecisions => {
  const p = input.profile;
  const hasProfile = !!p;

  // Safe defaults when a dimension is unknown: absence of data never unlocks
  // a recommendation.
  const informationCapacity: InformationCapacity = p?.information_capacity ?? "moderate";
  const trustPrivacy: TrustPrivacySensitivity = p?.trust_privacy_sensitivity ?? "high";
  const homeChangeReadiness: HomeChangeReadiness = p?.home_change_readiness ?? "low";
  const costPreference: CostPresentationPreference =
    p?.cost_presentation_preference ?? "recommended_with_pricing";
  const managementPreference = p?.management_preference ?? null;
  const journeyStage = p?.current_journey_stage ?? null;
  const priorExperience = p?.prior_care_experience ?? null;
  const observedEngagement = input.observedEngagement ?? "none";
  const privacySelections = p?.privacy_selections ?? [];

  /* Rule 1 — information capacity */
  const lowCapacity = informationCapacity === "low";
  const maxNonUrgentRecommendations =
    informationCapacity === "low" ? 1 : informationCapacity === "moderate" ? 2 : 4;

  /* Rule 2 — privacy boundaries, honoured literally per selection */
  const comfortableAll = privacySelections.includes("comfortable_all");
  const requireApprovalForBackupCaregiver =
    !comfortableAll && (trustPrivacy === "high" || privacySelections.includes("approve_backup"));
  const requireApprovalForAdditionalProfessional =
    !comfortableAll &&
    (trustPrivacy === "high" || privacySelections.includes("ask_before_others"));
  const keepHouseholdDetailsPrivate = privacySelections.includes("keep_household_private");

  /* Rule 3 — home change */
  const safetyConcern = !!input.safetyConcern;
  const showHomeEnvironmentRecommendations =
    homeChangeReadiness !== "low" || safetyConcern;
  const homeRecommendationsSafetyOnly = homeChangeReadiness === "low" && safetyConcern;

  /* Rules 4 & 5 — prior experience */
  const provideFoundationalEducation = priorExperience === "none" || !hasProfile;
  const askWhatEndedPreviousArrangement =
    priorExperience === "agency" || priorExperience === "multiple_arrangements";
  const emphasiseContinuityInMatching =
    priorExperience === "agency" ||
    priorExperience === "multiple_arrangements" ||
    priorExperience === "individual_caregiver";

  /* Rule 6 — cost presentation, obeyed literally */
  const essentialsOnly = costPreference === "essentials_only";
  const orderCostLowestFirst = costPreference === "lower_cost_first";

  /* Rule 8 — pacing flag */
  const cautiousCount = [
    CAUTIOUS.informationCapacity(informationCapacity),
    CAUTIOUS.trustPrivacy(trustPrivacy),
    CAUTIOUS.homeChangeReadiness(homeChangeReadiness),
    CAUTIOUS.cost(costPreference),
    CAUTIOUS.comfort(p?.outside_care_comfort),
  ].filter(Boolean).length;

  const inMotion = journeyStage === "action" || journeyStage === "established";
  const paceSupportRequired = hasProfile && inMotion && cautiousCount >= 2;

  /* Rule 6 + 8 — what optional services may surface */
  const showOptionalServices = !essentialsOnly && !paceSupportRequired;

  /* Rule 7 — channels vs receipt vs understanding */
  const { channels, primary } = resolveChannels(managementPreference);
  const dashboardAloneIsSufficient =
    primary === "dashboard" && (observedEngagement === "regular" || observedEngagement === "high");

  /* Coordinator discrepancies */
  const discrepancies: string[] = [];
  if (managementPreference === "dashboard" && observedEngagement === "none") {
    discrepancies.push(
      "Prefers the dashboard but hasn't used it — check whether they need help getting in."
    );
  }

  /* Guidance lines */
  const guidance: string[] = [];
  if (lowCapacity) guidance.push("One issue or action per contact");
  if (informationCapacity === "low") guidance.push("Keep dashboard summaries short");
  if (!showOptionalServices)
    guidance.push("No optional or add-on recommendations right now");
  if (essentialsOnly) guidance.push("Essentials only until they ask about more");
  if (orderCostLowestFirst)
    guidance.push("Lead with lower-cost options, but do not hide the others");
  if (requireApprovalForAdditionalProfessional)
    guidance.push("Ask permission before introducing another provider");
  if (requireApprovalForBackupCaregiver)
    guidance.push("Approve any backup or stand-in caregiver with them first");
  if (keepHouseholdDetailsPrivate)
    guidance.push("Keep household details out of wider notes");
  if (!showHomeEnvironmentRecommendations)
    guidance.push("Home-change recommendations paused");
  if (homeRecommendationsSafetyOnly)
    guidance.push("Home changes only if genuinely a safety matter — raise once, plainly");
  if (provideFoundationalEducation)
    guidance.push("First-time family: explain terms, employer and NIS side");
  if (askWhatEndedPreviousArrangement)
    guidance.push("Ask what ended the last arrangement before proposing anything");
  if (emphasiseContinuityInMatching)
    guidance.push("Lead with reliability, continuity and backup cover");
  if (!dashboardAloneIsSufficient)
    guidance.push(
      `Confirm on ${channels.filter((c) => c !== "dashboard").join(" / ") || "their chosen channel"} — a dashboard notice is not confirmation`
    );

  return {
    hasProfile,
    journeyStage,
    priorExperience,
    informationCapacity,
    trustPrivacy,
    homeChangeReadiness,
    costPreference,
    managementPreference,
    observedEngagement,
    maxNonUrgentRecommendations,
    useCondensedSummaries: lowCapacity,
    requireApprovalForBackupCaregiver,
    requireApprovalForAdditionalProfessional,
    keepHouseholdDetailsPrivate,
    showHomeEnvironmentRecommendations,
    homeRecommendationsSafetyOnly,
    provideFoundationalEducation,
    askWhatEndedPreviousArrangement,
    emphasiseContinuityInMatching,
    showOptionalServices,
    orderCostLowestFirst,
    deliveryChannels: channels,
    primaryChannel: primary,
    dashboardAloneIsSufficient,
    paceSupportRequired,
    paceSupportGuidance: paceSupportRequired ? PACE_SUPPORT_GUIDANCE : null,
    discrepancies,
    guidance,
  };
};

/** Maps raw dashboard activity to observed engagement. Behavioural only. */
export const deriveObservedEngagement = (
  eventsLast30Days: number
): ObservedPlatformEngagement => {
  if (eventsLast30Days <= 0) return "none";
  if (eventsLast30Days < 5) return "low";
  if (eventsLast30Days < 20) return "regular";
  return "high";
};
