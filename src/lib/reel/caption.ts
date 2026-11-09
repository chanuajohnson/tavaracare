import type { ReelSafeNeed } from "./spec";
import { LEARN_MORE_URL } from "./spec";
import { summarizeSchedule } from "./redact";

// Tavara language guardrails: these never go in public copy.
export const BANNED_CAPTION_WORDS = [
  "hire", "patient", "staff", "case", "placement", "payroll", "agency", "client", "customer", "worker", "employee",
  "delve", "leverage", "holistic", "journey", "landscape", "transformative",
];

export function findBannedWords(text: string): string[] {
  const s = text.toLowerCase();
  return BANNED_CAPTION_WORDS.filter((w) => new RegExp(`\\b${w}s?\\b`).test(s));
}

const tag = (s: string) => "#" + s.replace(/&/g, "and").replace(/[^a-z0-9]/gi, "");

export function buildCaption(need?: ReelSafeNeed, rateBand?: string): string {
  if (!need) {
    return [
      "Caregivers and nurses in Trinidad & Tobago: families on Tavara are looking for steady, trusted care.",
      `Learn more: ${LEARN_MORE_URL}`,
      "#TavaraCare #NursesTT #CaregiversTT #HomeCareTT",
    ].join("\n");
  }
  const sched = summarizeSchedule(need.schedule);
  const who = need.qualifications[0] ?? "Caregiver";
  const care = need.careTypes[0] ?? need.skills[0] ?? "Home care";
  const lines = [
    `📍 ${need.area} · ${care}`,
    `A family on Tavara is looking for ${who.toLowerCase()} support. ${sched.label}${sched.hours ? `, ${sched.hours}` : ""}.`,
  ];
  if (need.urgency === "urgent") lines.push("Care is needed as soon as possible.");
  if (need.skills.length) lines.push(`Care needed: ${need.skills.join(" · ")}`);
  if (rateBand) lines.push(`Care rate: ${rateBand}`);
  lines.push(`Learn more: ${LEARN_MORE_URL}`);
  lines.push(["#TavaraCare", "#NursesTT", "#CaregiversTT", tag(need.region), "#HomeCareTT"].join(" "));
  return lines.join("\n").slice(0, 2200);
}
