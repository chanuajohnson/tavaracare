// Reel Studio: types, timeline and defaults.
// Rendering is a pure function of time; everything here is deterministic.

export type SceneId = "hook" | "map" | "needs" | "requirements" | "schedule" | "cta";

export type ReelSafeNeed = {
  requestRef: string;
  area: string;
  region: string;
  careTypes: string[]; // care categories, never diagnosis wording
  skills: string[];
  qualifications: string[];
  requirements: string[]; // fixed, privacy-safe labels derived from the family's deal breakers
  schedule: string; // raw schedule codes, e.g. "mon_fri_8am_4pm,sat_sun_8am_4pm"
  urgency: "standard" | "soon" | "urgent";
};

export type ReelText = {
  hook1: string;
  hook2: string;
  needsTitle: string;
  requirementsTitle: string;
  scheduleTitle: string;
  startLabel: string;
  cta1: string;
  ctaSub: string;
  cta2: string;
  ctaBody: string; // caregiver registration link
  cta3: string;
  cta3Body: string; // urgent families link
  cta4: string;
  cta4Body: string; // family registration link
  whatsappTitle: string;
  whatsappBody: string; // admin pastes the WhatsApp channel invite URL here
};

export type ScenePhoto = { url: string; focusY: number };

export type ReelSpec = {
  preset: "new_match_needed" | "urgent_need" | "general_recruit";
  need?: ReelSafeNeed;
  text: ReelText;
  photos: Partial<Record<SceneId, ScenePhoto>>;
  rateBand?: string; // only public per-hour care rates
  audio: { enabled: boolean; volume: number };
};

export const REEL_W = 1080;
export const REEL_H = 1920;
export const REEL_FPS = 30;
export const REEL_DURATION = 18;
export const SAFE_TOP = 220;
export const SAFE_BOTTOM = 380;

export const TIMELINE: { id: SceneId; start: number; end: number }[] = [
  { id: "hook", start: 0, end: 2.5 },
  { id: "map", start: 2.5, end: 5.5 },
  { id: "needs", start: 5.5, end: 8.5 },
  { id: "requirements", start: 8.5, end: 12 },
  { id: "schedule", start: 12, end: 14.5 },
  { id: "cta", start: 14.5, end: 18 },
];

/** Scene shown at time t (clamped to 0..18). Boundaries belong to the next scene. */
export function sceneAt(t: number): { id: SceneId; localT: number } {
  const tt = Math.min(Math.max(t, 0), REEL_DURATION);
  const s = TIMELINE.find((x) => tt >= x.start && tt < x.end) ?? TIMELINE[TIMELINE.length - 1];
  return { id: s.id, localT: Math.min(1, (tt - s.start) / (s.end - s.start)) };
}

export const STILL_TIMES = [1.5, 7.5, 16.5];

export const LEARN_MORE_URL = "tavara.care/urgent-families";

export function needLabel(need?: ReelSafeNeed): string {
  const q = need?.qualifications?.[0] ?? "";
  if (/RN/i.test(q)) return "a nurse";
  return "a caregiver";
}

export function defaultText(need?: ReelSafeNeed): ReelText {
  const area = need?.area ?? "your area";
  return {
    hook1: `A family in ${area}`,
    hook2: `needs ${needLabel(need)}.`,
    needsTitle: "Care needed",
    requirementsTitle: "Caregiver requirements",
    scheduleTitle: "Care schedule",
    startLabel: need?.urgency === "urgent" ? "Start: as soon as possible" : need?.urgency === "soon" ? "Start: this week" : "Start: flexible",
    cta1: "Could this be you?",
    ctaSub: "Are you a caregiver who can provide care in this home?",
    cta2: "Join the Tavara care team. Register here to be matched:",
    ctaBody: "tavara.care/join-as-caregiver",
    cta3: "Browse families in urgent need of care:",
    cta3Body: LEARN_MORE_URL,
    cta4: "Family needing a caregiver? Create your account:",
    cta4Body: "tavara.care/auth",
    whatsappTitle: "Families & caregivers: join Tavara.Care on WhatsApp",
    whatsappBody: "https://whatsapp.com/channel/0029VbALSFFKgsO0yyEfAA1H",
  };
}

export const TEXT_LIMITS: Record<keyof ReelText, number> = {
  hook1: 40, hook2: 40, needsTitle: 30, requirementsTitle: 36, scheduleTitle: 30, startLabel: 36,
  cta1: 32, ctaSub: 64, cta2: 64, ctaBody: 60, cta3: 56, cta3Body: 60, cta4: 56, cta4Body: 60,
  whatsappTitle: 64, whatsappBody: 120,
};
