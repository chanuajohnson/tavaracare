/**
 * Short public addresses used in videos, captions and other shared material.
 * These are aliases only: the destination routes remain the canonical app pages.
 */
export const PUBLIC_PATHS = {
  caregiverJoin: "/caregiver",
  familyRegister: "/register",
  urgentFamilies: "/urgent-families",
  urgentCaregivers: "/urgent-caregivers",
} as const;

export const PUBLIC_ROUTE_ALIASES = [
  { path: PUBLIC_PATHS.caregiverJoin, target: "/join-as-caregiver" },
  { path: PUBLIC_PATHS.familyRegister, target: "/join-as-family" },
] as const;

export const PUBLIC_ROUTE_ALIAS_PATHS = PUBLIC_ROUTE_ALIASES.map(({ path }) => path);
