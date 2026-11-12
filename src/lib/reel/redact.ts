// Client-side privacy guard. The server lookup already returns a cleaned-up
// summary; this is a second check so nothing identifying reaches the canvas,
// caption, filenames or the export log.
import type { ReelSafeNeed } from "./spec";

const ALLOWED_KEYS: (keyof ReelSafeNeed)[] = [
  "requestRef", "area", "region", "careTypes", "skills", "qualifications", "requirements", "schedule", "urgency",
];

// Diagnosis wording that must never appear (care categories are used instead).
const DIAGNOSIS_WORDS = [
  "dementia", "alzheimer", "parkinson", "diabetes mellitus", "diabetic", "stroke", "cancer", "tumour", "tumor",
  "heart disease", "copd", "asthma", "incontinence", "hiv", "insulin", "brain bleed", "haemorrhage", "hemorrhage",
];

const PHONE_RE = /\+?\d[\d\s-]{6,}\d/;
const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const STREET_RE = /\b(street|st\.|road|rd\.|avenue|ave|lane|drive|building|apt|#\d)/i;

export function containsUnsafe(text: string): string | null {
  const s = text.toLowerCase();
  if (PHONE_RE.test(text)) return "phone number";
  if (EMAIL_RE.test(text)) return "email address";
  if (STREET_RE.test(text)) return "street address";
  const d = DIAGNOSIS_WORDS.find((w) => s.includes(w));
  if (d) return `diagnosis wording ("${d}")`;
  return null;
}

/** Keep only allowed keys and drop any value that looks identifying. */
export function redact(raw: Record<string, unknown>): ReelSafeNeed {
  const pick = <T,>(v: unknown, fallback: T): T => (v === undefined || v === null ? fallback : (v as T));
  const cleanList = (v: unknown) =>
    (Array.isArray(v) ? v : []).map(String).filter((x) => x && !containsUnsafe(x));
  const cleanStr = (v: unknown, fallback: string) => {
    const s = String(pick(v, fallback));
    return containsUnsafe(s) ? fallback : s;
  };
  const urgency = raw.urgency === "urgent" || raw.urgency === "soon" ? raw.urgency : "standard";
  const out: ReelSafeNeed = {
    requestRef: /^TV-[A-Z0-9-]{3,16}$/.test(String(raw.requestRef ?? "")) ? String(raw.requestRef) : "TV-REEL",
    area: cleanStr(raw.area, "Trinidad & Tobago"),
    region: cleanStr(raw.region, "Trinidad & Tobago"),
    careTypes: cleanList(raw.careTypes),
    skills: cleanList(raw.skills),
    qualifications: cleanList(raw.qualifications),
    requirements: cleanList(raw.requirements),
    schedule: String(pick(raw.schedule, "")).replace(/[^a-z0-9_,]/gi, ""),
    urgency,
  };
  // Explicitly prove nothing extra slipped through.
  for (const k of Object.keys(out)) if (!ALLOWED_KEYS.includes(k as keyof ReelSafeNeed)) delete (out as any)[k];
  return out;
}

/** Area rule: town only when at least 3 families share it, otherwise region. */
export function generalizeArea(town: string | null, region: string, familiesInTown: number): string {
  return town && familiesInTown >= 3 ? `${town} area` : region;
}

// ----- Schedule summary -----
export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export type ScheduleSummary = { days: boolean[]; hours: string; label: string };

export function summarizeSchedule(codes: string): ScheduleSummary {
  const list = codes.split(",").map((s) => s.trim()).filter(Boolean);
  const days = [false, false, false, false, false, false, false];
  const hours = new Set<string>();
  let label = "";
  const fmt = (h: string) => h.replace(/(\d+)(am|pm)/i, (_m, n, ap) => `${n} ${ap.toUpperCase()}`);
  for (const c of list) {
    const m = c.match(/^(mon_fri|sat_sun|weekday_evening|weekend_evening)_(\d+(?:am|pm))_(\d+(?:am|pm))$/);
    if (m) {
      const weekday = m[1] === "mon_fri" || m[1] === "weekday_evening";
      for (let i = weekday ? 0 : 5; i < (weekday ? 5 : 7); i++) days[i] = true;
      hours.add(`${fmt(m[2])} to ${fmt(m[3])}`);
    } else if (c === "live_in_care" || c === "24_7_care" || c === "around_clock_shifts") {
      days.fill(true);
      label = c === "live_in_care" ? "Live-in care" : "Around the clock";
    } else if (c === "flexible") {
      label = label || "Flexible days";
    }
  }
  const hoursText = [...hours].join(", ");
  if (!label) {
    const n = days.filter(Boolean).length;
    label = n === 7 ? "7 days a week" : n === 5 && days.slice(0, 5).every(Boolean) ? "Weekdays" : n === 2 && days[5] && days[6] ? "Weekends" : n ? `${n} days a week` : "Schedule to be agreed";
  }
  return { days, hours: hoursText, label };
}
