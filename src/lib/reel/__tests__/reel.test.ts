// @ts-ignore bun test runner types
import { describe, expect, test } from "bun:test";
import { sceneAt } from "../spec";
import { redact, generalizeArea, containsUnsafe, summarizeSchedule } from "../redact";
import { buildCaption, findBannedWords } from "../caption";
import { defaultText } from "../spec";
import { layoutCareCard } from "../engine";
import { reelLocationPoint, TRINIDAD_OUTLINE, TOBAGO_OUTLINE } from "../geo";

describe("privacy", () => {
  const raw = {
    requestRef: "TV-2611-08A", area: "Building #5, 2-3 East Maloney Gardens", region: "East Trinidad",
    careTypes: ["Memory care", "Dementia"], skills: ["Personal care", "Call 868 221 5310"],
    qualifications: ["RN or RNA"], requirements: ["Own car required", "Call 868 221 5310"], schedule: "mon_fri_8am_4pm", urgency: "urgent",
    full_name: "Merle Myers", phone_number: "447817801392", email: "x@y.com",
  };
  const out = redact(raw) as any;
  const blob = JSON.stringify(out);
  test("drops names, phone and email fields", () => {
    expect(out.full_name).toBeUndefined(); expect(out.phone_number).toBeUndefined(); expect(out.email).toBeUndefined();
    expect(blob).not.toContain("Merle"); expect(blob).not.toContain("447817801392");
  });
  test("street address replaced by fallback", () => expect(out.area).toBe("Trinidad & Tobago"));
  test("diagnosis wording removed", () => { expect(out.careTypes).toEqual(["Memory care"]); expect(blob.toLowerCase()).not.toContain("dementia"); });
  test("phone inside a chip removed", () => expect(out.skills).toEqual(["Personal care"]));
  test("phone inside a requirement removed", () => expect(out.requirements).toEqual(["Own car required"]));
  test("town only with 3+ families", () => {
    expect(generalizeArea("Chaguanas", "Central Trinidad", 3)).toBe("Chaguanas area");
    expect(generalizeArea("Chaguanas", "Central Trinidad", 2)).toBe("Central Trinidad");
  });
  test("unsafe detector", () => expect(containsUnsafe("Mrs at 12 Main Street")).toBe("street address"));
});

describe("scene timing", () => {
  test.each([[0, "hook"], [2.5, "map"], [5.5, "needs"], [8.5, "requirements"], [12, "schedule"], [14.5, "cta"], [18, "cta"]])("t=%p -> %p", (t, id) => {
    expect(sceneAt(t as number).id).toBe(id as string);
  });
});

describe("schedule", () => {
  test("weekdays + weekends = 7 days", () => expect(summarizeSchedule("mon_fri_8am_4pm,sat_sun_8am_4pm").label).toBe("7 days a week"));
  test("weekdays only", () => expect(summarizeSchedule("mon_fri_8am_4pm").label).toBe("Weekdays"));
});

describe("caption", () => {
  const need = redact({ requestRef: "TV-2611-08A", area: "Arima area", region: "East Trinidad", careTypes: ["Recovery support"], skills: ["Personal care"], qualifications: ["RN or RNA"], schedule: "mon_fri_8am_4pm", urgency: "standard" });
  const c = buildCaption(need);
  test("no blanks", () => { expect(c).not.toContain("undefined"); expect(c).not.toContain("null"); });
  test("length limit", () => expect(c.length).toBeLessThanOrEqual(2200));
  test("no banned words", () => expect(findBannedWords(c)).toEqual([]));
  test("banned detector works", () => expect(findBannedWords("hire a worker for the patient")).toEqual(["hire", "patient", "worker"]));
});

describe("caption content", () => {
  const need = redact({ requestRef: "TV-2611-08A", area: "East Trinidad", region: "East Trinidad", careTypes: ["Diabetes support", "Recovery support"], skills: ["Personal care", "Medication support", "Meal preparation"], qualifications: ["Trained caregiver"], schedule: "mon_fri_8am_4pm,sat_sun_8am_4pm", urgency: "standard" });
  const c = buildCaption(need);
  test("lists every care need", () => { for (const n of ["Diabetes support", "Recovery support", "Personal care", "Medication support", "Meal preparation"]) expect(c).toContain(n); });
  test("states schedule and 8-hour shifts", () => { expect(c).toContain("7 days a week"); expect(c).toContain("8-hour shifts"); });
  test("has both invitations and all four links", () => {
    expect(c).toContain("https://tavara.care/join-as-caregiver");
    expect(c).toContain("https://tavara.care/urgent-families");
    expect(c).toContain("https://tavara.care/auth");
    expect(c).toContain("https://tavara.care/urgent-caregivers");
  });
  test("includes every safe caregiver requirement and the channel invite", () => {
    const withRequirements = { ...need, requirements: ["Own car required", "Female caregiver preferred", "First aid certification required", "References required", "Relevant care experience", "Background checks accepted", "Reliable and punctual", "Respectful care essential"] };
    const caption = buildCaption(withRequirements, undefined, "https://whatsapp.com/channel/ABC123");
    for (const requirement of withRequirements.requirements) expect(caption).toContain(requirement);
    expect(caption).toContain("https://whatsapp.com/channel/ABC123");
  });
});

describe("friendly reel links", () => {
  const text = defaultText();
  test("caregiver link uses the existing welcome page", () => expect(text.ctaBody).toBe("tavara.care/join-as-caregiver"));
  test("family link has no query string", () => expect(text.cta4Body).toBe("tavara.care/auth"));
});

describe("map and care card layout", () => {
  test("uses detailed real island outlines", () => {
    expect(TRINIDAD_OUTLINE.length).toBeGreaterThan(100);
    expect(TOBAGO_OUTLINE.length).toBeGreaterThan(30);
  });
  test("does not place a pin before a family is chosen", () => expect(reelLocationPoint()).toBeNull());
  test("uses Maloney only when that safe town label is available", () => {
    const regional = reelLocationPoint("East Trinidad", "East Trinidad")!;
    const town = reelLocationPoint("Maloney area", "East Trinidad")!;
    expect(town).not.toEqual(regional);
  });
  test("keeps all eight care chips inside the white card", () => {
    const items = ["Continence care", "Diabetes support", "Mobility support", "Recovery support", "Personal care", "Medication support", "Mobility assistance", "Meal preparation"];
    const layout = layoutCareCard(items, (label, size) => label.length * size * 0.55);
    const placed = layout.rows.flat();
    expect(placed).toHaveLength(8);
    for (const chip of placed) {
      expect(chip.x).toBeGreaterThanOrEqual(140);
      expect(chip.x + chip.width).toBeLessThanOrEqual(940);
      expect(chip.y + layout.chipH).toBeLessThanOrEqual(layout.cardY + layout.cardH - 60);
    }
  });
});
