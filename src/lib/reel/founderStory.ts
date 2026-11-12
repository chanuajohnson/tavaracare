import type { ReelSafeNeed } from "./spec";
import { summarizeSchedule } from "./redact";
import { LINKS } from "./caption";

export const GENERAL_PORTFOLIO_PARTICIPATION_NOTE = [
  "Portfolio note: Tavara, The Garden Ohm and NuaChat are live portfolio projects. Using, sharing, or commenting helps demonstrate real-world value and improve the work.",
  "That participation is not a financial investment and gives no equity, ownership, repayment, profit, or right to a financial return. Any paid product or service is a purchase under its own terms and does not buy an ownership interest.",
].join(" ");

export function defaultFounderScript(need?: ReelSafeNeed): string {
  const opening = need?.area ? `A family in ${need.area} needs care.` : "A family needs care.";
  return `${opening} I built Tavara while caring for ageing parents, raising the next generation, and growing The Garden Ohm. It is live and part of my portfolio. Use it, share it, and help this work bloom.`;
}

export const DEFAULT_FOUNDER_STORY = [
  "I am a millennial in my forties, rebuilding after a global crisis while caring for ageing parents, raising the next generation, tending the land, and showing up for friends and family. As a teenager in convent, I was determined my purpose was to be a homemaker. Now I have come full circle. I chose this life, and it is a calling, but it is hard, and much of this work is unpaid and unseen.",
  "Seven years ago, given the gift of time on the outskirts of a global crisis, I found myself in a position where working remotely was the only way. I attempted to move my engineering skills into tech. Those roles asked for experience I had not yet had, coming from a background in plant work in oil and gas. So I built a portfolio by scratching my own itches.",
  "Tavara came from needing better care coordination. The Garden Ohm grew from my love of plants and home. NuaChat came from another need I could not ignore. They were too late to make my career change easier, but they can help other people now.",
  "Tavara is live. This anonymous appeal, shared with permission, is part of that portfolio. Every use, share, and piece of feedback is a proof point.",
  "Build and Bloom. That is The Garden Ohm's line, and it fits here too. Use it, share it, and help this work bloom.",
].join("\n\n");
const FOUNDER_STORY = DEFAULT_FOUNDER_STORY;

function founderInvitationBlock(whatsappUrl?: string): string[] {
  const lines = [
    `Caregiver or nurse? Join: ${LINKS.caregiverSignup}`,
    `Browse families needing care: ${LINKS.urgentFamilies}`,
    `Need care? Register your family: ${LINKS.familySignup}`,
    `Browse caregivers: ${LINKS.urgentCaregivers}`,
  ];
  if (whatsappUrl?.trim()) lines.push(`Join Tavara.Care on WhatsApp: ${whatsappUrl.trim()}`);
  return lines;
}

/** Founder-led post caption. The same safe care details remain visible below the story. */
export function buildFounderCaption(
  need?: ReelSafeNeed,
  rateBand?: string,
  whatsappUrl?: string,
  caregiver = false,
  story: string = FOUNDER_STORY,
): string {
  const lines = [story.trim() || FOUNDER_STORY, ""];
  if (need) {
    const who = need.qualifications[0] ?? "caregiver";
    lines.push(caregiver
      ? `📍 ${need.area}: a ${who.toLowerCase()} is ready to support a family`
      : `📍 ${need.area}: a family needs a ${who.toLowerCase()}`);
    lines.push("", caregiver ? "Care they provide:" : "Care needed, so there are no surprises:");
    const careItems = caregiver ? need.skills : [...need.careTypes, ...need.skills];
    for (const item of careItems) lines.push(`• ${item}`);
    if (!careItems.length) lines.push("• Details shared when you are matched");
    if (!caregiver && need.requirements.length) {
      lines.push("", "Caregiver requirements:");
      for (const requirement of need.requirements) lines.push(`• ${requirement}`);
    }
    if (caregiver && need.qualifications.length) {
      lines.push("", "Training and experience:");
      for (const qualification of need.qualifications) lines.push(`• ${qualification}`);
    }
    const schedule = summarizeSchedule(need.schedule);
    lines.push("", `🗓️ ${caregiver ? "Available" : "Schedule"}: ${schedule.label}${schedule.hours ? `, ${schedule.hours}` : ""}`);
    lines.push("⏱️ Care is arranged in full 8-hour shifts");
    if (!caregiver && rateBand) lines.push(`💵 Care rate: ${rateBand}`);
    lines.push("");
  } else {
    lines.push("Families across Trinidad and Tobago need care, and caregivers are ready to help.", "");
  }
  lines.push(...founderInvitationBlock(whatsappUrl));
  lines.push("", GENERAL_PORTFOLIO_PARTICIPATION_NOTE);
  lines.push("", "#TavaraCare #BuildAndBloom #TheGardenOhm #NuaChat #CaregiversTT");
  return lines.join("\n");
}
