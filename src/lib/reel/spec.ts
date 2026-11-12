// Reel Studio: types, timeline and defaults.
// Rendering is a pure function of time; everything here is deterministic.

export type SceneId = "hook" | "map" | "needs" | "schedule" | "cta";

export type ReelSafeNeed = {
  requestRef: string;
  area: string;
  region: string;
  careTypes: string[]; // care categories, never diagnosis wording
  skills: string[];
  qualifications: string[];
  schedule: string; // raw schedule codes, e.g. "mon_fri_8am_4pm,sat_sun_8am_4pm"
  urgency: "standard" | "soon" | "urgent";
};

export type ReelText = {
  hook1: string;
  hook2: string;
  needsTitle: string;
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
export const REEL_DURATION = 15;
export const SAFE_TOP = 220;
export const SAFE_BOTTOM = 380;

export const TIMELINE: { id: SceneId; start: number; end: number }[] = [
  { id: "hook", start: 0, end: 2.5 },
  { id: "map", start: 2.5, end: 5.5 },
  { id: "needs", start: 5.5, end: 9.5 },
  { id: "schedule", start: 9.5, end: 12 },
  { id: "cta", start: 12, end: 15 },
];

/** Scene shown at time t (clamped to 0..15). Boundaries belong to the next scene. */
export function sceneAt(t: number): { id: SceneId; localT: number } {
  const tt = Math.min(Math.max(t, 0), REEL_DURATION);
  const s = TIMELINE.find((x) => tt >= x.start && tt < x.end) ?? TIMELINE[TIMELINE.length - 1];
  return { id: s.id, localT: Math.min(1, (tt - s.start) / (s.end - s.start)) };
}

export const STILL_TIMES = [1.5, 7.5, 13.5];

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
  };
}

export const TEXT_LIMITS: Record<keyof ReelText, number> = {
  hook1: 40, hook2: 40, needsTitle: 30, scheduleTitle: 30, startLabel: 36,
  cta1: 32, ctaSub: 64, cta2: 64, ctaBody: 60, cta3: 56, cta3Body: 60, cta4: 56, cta4Body: 60,
};
