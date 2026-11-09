// @ts-ignore bun test runner types
import { describe, expect, test } from "bun:test";
import { sceneAt } from "../spec";
import { redact, generalizeArea, containsUnsafe, summarizeSchedule } from "../redact";
import { buildCaption, findBannedWords } from "../caption";

describe("privacy", () => {
  const raw = {
    requestRef: "TV-2611-08A", area: "Building #5, 2-3 East Maloney Gardens", region: "East Trinidad",
    careTypes: ["Memory care", "Dementia"], skills: ["Personal care", "Call 868 221 5310"],
    qualifications: ["RN or RNA"], schedule: "mon_fri_8am_4pm", urgency: "urgent",
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
  test("town only with 3+ families", () => {
    expect(generalizeArea("Chaguanas", "Central Trinidad", 3)).toBe("Chaguanas area");
    expect(generalizeArea("Chaguanas", "Central Trinidad", 2)).toBe("Central Trinidad");
  });
  test("unsafe detector", () => expect(containsUnsafe("Mrs at 12 Main Street")).toBe("street address"));
});

describe("scene timing", () => {
  test.each([[0, "hook"], [2.5, "map"], [5.5, "needs"], [9.5, "schedule"], [12, "cta"], [15, "cta"]])("t=%p -> %p", (t, id) => {
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
