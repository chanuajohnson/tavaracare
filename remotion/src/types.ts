export type VillageScenes = {
  scene1: string;
  scene2: string;
  scene3: { eyebrow: string; word: string };
  scene4: string[];
  scene5: { tagline: string; footer: string };
};

export const defaultScenes: VillageScenes = {
  scene1: "Caring for someone\nyou love…",
  scene2: "shouldn't mean\ncarrying it alone.",
  scene3: { eyebrow: "It takes a", word: "village." },
  scene4: [
    "A matched care team.",
    "A coordinator who knows",
    "your loved one.",
    "One plan. One village.",
  ],
  scene5: {
    tagline: "Care, coordinated.",
    footer: "All coordinated by your care coordinator. Tavara.",
  },
};
