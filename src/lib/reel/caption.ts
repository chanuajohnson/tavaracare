import type { ReelSafeNeed } from "./spec";
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

// All links use the production domain.
export const LINKS = {
  caregiverSignup: "https://tavara.care/auth?tab=signup&role=professional",
  urgentFamilies: "https://tavara.care/urgent-families",
  familySignup: "https://tavara.care/auth?tab=signup&role=family",
  urgentCaregivers: "https://tavara.care/urgent-caregivers",
};

const tag = (s: string) => "#" + s.replace(/&/g, "and").replace(/[^a-z0-9]/gi, "");

function startText(u: ReelSafeNeed["urgency"]) {
  return u === "urgent" ? "As soon as possible" : u === "soon" ? "Within a week" : "To be confirmed with the family";
}

function invitationBlock(): string[] {
  return [
    "👩‍⚕️ Are you a caregiver or nurse?",
    "Join the Tavara care team. If you are looking for steady care work, Tavara Care Coordination can match you with a home that fits your skills and hours.",
    `Join here: ${LINKS.caregiverSignup}`,
    `Browse families in urgent need of care: ${LINKS.urgentFamilies}`,
    "",
    "🏡 Are you a family in urgent need of care?",
    "Sign up and register your loved one's needs, then browse caregivers ready to start so you can match quickly and easily.",
    `Register here: ${LINKS.familySignup}`,
    `Browse available caregivers: ${LINKS.urgentCaregivers}`,
  ];
}

export function buildCaption(need?: ReelSafeNeed, rateBand?: string): string {
  if (!need) {
    return [
      "Families across Trinidad & Tobago are looking for steady, trusted care.",
      "",
      ...invitationBlock(),
      "",
      "#TavaraCare #NursesTT #CaregiversTT #HomeCareTT",
    ].join("\n").slice(0, 2200);
  }
  const sched = summarizeSchedule(need.schedule);
  const who = need.qualifications[0] ?? "Caregiver";
  const lines = [
    `📍 ${need.area}: a family needs a ${who.toLowerCase()}`,
    "",
    "What this home needs (so there are no surprises):",
  ];
  // Full, real list: care categories first, then every care task the family ticked.
  for (const c of need.careTypes) lines.push(`• ${c}`);
  for (const s of need.skills) lines.push(`• ${s}`);
  if (!need.careTypes.length && !need.skills.length) lines.push("• Details shared when you are matched");
  lines.push("");
  lines.push(`🗓️ Schedule: ${sched.label}${sched.hours ? `, ${sched.hours}` : ""}`);
  lines.push("⏱️ Care is arranged in full 8-hour shifts");
  lines.push(`🚀 Start: ${startText(need.urgency)}`);
  if (rateBand) lines.push(`💵 Care rate: ${rateBand}`);
  lines.push("");
  lines.push(...invitationBlock());
  lines.push("");
  lines.push(["#TavaraCare", "#NursesTT", "#CaregiversTT", tag(need.region), "#HomeCareTT"].join(" "));
  return lines.join("\n").slice(0, 2200);
}
