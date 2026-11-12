// @ts-ignore bun test runner types
import { describe, expect, test } from "bun:test";
import { PUBLIC_PATHS, PUBLIC_ROUTE_ALIASES } from "../publicRoutes";

describe("friendly public routes", () => {
  test("/caregiver opens the existing caregiver welcome page", () => {
    expect(PUBLIC_ROUTE_ALIASES.find(({ path }) => path === "/caregiver")?.target).toBe("/join-as-caregiver");
  });

  test("/register opens the existing sign-up tab", () => {
    expect(PUBLIC_ROUTE_ALIASES.find(({ path }) => path === "/register")?.target).toBe("/auth?tab=signup");
  });

  test("the existing /family page is not repurposed as an alias", () => {
    expect(PUBLIC_ROUTE_ALIASES.some(({ path }) => path === "/family")).toBe(false);
    expect(PUBLIC_PATHS.familyRegister).toBe("/register");
  });
});
