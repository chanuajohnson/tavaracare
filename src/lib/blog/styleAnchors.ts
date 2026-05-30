// Style anchor library for blog cover image generation.
// Every anchor is a real Trinidad photograph stored at public/blog-style-refs/.
// The admin "Generate cover from prompt" flow picks one of these as the base
// image so every generated cover inherits the same real-life look.

export type BlogStyleAnchor = {
  id: string;
  label: string;
  subject: string;
  topics: string[];
};

export const BLOG_STYLE_ANCHORS: BlogStyleAnchor[] = [
  {
    id: "ref-kitchen-window",
    label: "Kitchen window + pothos",
    subject: "Hanging pothos, bougainvillea, subway tile, sink",
    topics: ["holiday", "everyday", "kitchen", "meal", "schedule", "family"],
  },
  {
    id: "ref-kitchen-window-2",
    label: "Kitchen window (alt)",
    subject: "Second angle of the kitchen with hanging pothos",
    topics: ["holiday", "everyday", "kitchen"],
  },
  {
    id: "ref-stairwell-block",
    label: "Stairwell with decorative block",
    subject: "Stairwell, turned mahogany balusters, decorative-block window",
    topics: ["livein", "household", "stairs", "fall"],
  },
  {
    id: "ref-stairwell-panel",
    label: "Stairwell landing + framed panorama",
    subject: "Landing ledge with framed sepia panorama, mahogany balusters",
    topics: ["paying", "budget", "money", "planning", "notebook"],
  },
  {
    id: "ref-front-door",
    label: "Wooden front door + terracotta tile",
    subject: "Wooden door, terracotta tile, mahogany rail, carved figurine",
    topics: ["finding", "arrival", "introduction", "trust"],
  },
  {
    id: "ref-front-door-2",
    label: "Front door (alt)",
    subject: "Second angle of the wooden front door",
    topics: ["finding", "arrival"],
  },
  {
    id: "ref-bedroom-pole",
    label: "Bedroom with mobility pole",
    subject: "Mobility pole next to four-poster bed, wooden floor",
    topics: ["livein", "hourly", "bedroom", "mobility", "transfer"],
  },
  {
    id: "ref-shower-grab",
    label: "Shower with grab bar",
    subject: "Grab bar, handheld shower, marble subway tile",
    topics: ["preparing", "home", "bathroom", "safety", "fall"],
  },
  {
    id: "ref-hospital-bed",
    label: "Home hospital bed",
    subject: "Home hospital bed, mosquito net, bed pad, drop ceiling",
    topics: ["livein", "dementia", "bedbound", "endoflife"],
  },
  {
    id: "ref-hallway-parquet",
    label: "Parquet hallway",
    subject: "Dark parquet hallway, yellow walls, hanging pendant",
    topics: ["dementia", "memory", "quiet", "cost"],
  },
  {
    id: "ref-ornate-mirror",
    label: "Ornate mirror reflecting kitchen",
    subject: "Carved wooden mirror reflecting kitchen window + cabinets",
    topics: ["finding", "professional", "reflection"],
  },
  {
    id: "ref-held-hands-light",
    label: "Held hands (pale shirt)",
    subject: "Intergenerational held hands, pale cotton shirt background",
    topics: ["finding", "trust", "companionship", "family"],
  },
  {
    id: "ref-held-hands-dark",
    label: "Held hands (sage sheet)",
    subject: "Held hands, darker arm, sage sheet background",
    topics: ["dementia", "endoflife", "companionship"],
  },
  {
    id: "ref-commode-bath",
    label: "Commode chair, basin, marble tile",
    subject: "Commode chair, blue basin, marble-tile bathroom",
    topics: ["preparing", "home", "bathroom", "incontinence", "equipment"],
  },
  {
    id: "ref-french-door",
    label: "French door onto parquet",
    subject: "Black-framed glass French door opening to parquet living room",
    topics: ["finding", "introduction", "household", "welcome"],
  },
  {
    id: "ref-bathroom-tub-grab",
    label: "Bathroom with tub + grab bar",
    subject: "Full bathroom with tub, grab bar, drop ceiling, curtain",
    topics: ["preparing", "home", "bathroom", "safety"],
  },
];

const TOPIC_MAP: Record<string, string> = {
  "caring-on-a-public-holiday-trinidad-tobago": "ref-kitchen-window",
  "live-in-vs-hourly-care-trinidad-tobago": "ref-bedroom-pole",
  "finding-a-caregiver-in-port-of-spain-or-san-fernando": "ref-held-hands-light",
  "cost-of-dementia-care-trinidad-tobago": "ref-hallway-parquet",
  "paying-for-care-without-going-broke-trinidad": "ref-stairwell-panel",
  "preparing-your-home-for-care-trinidad-tobago": "ref-bathroom-tub-grab",
};

export const TAVARA_PHOTO_RULEBOOK = [
  "iPhone-documentary feel with slight grain. Neutral-to-cool white balance, never warm orange.",
  "Soft natural daylight from a window. No studio lighting, no stock-photo bokeh.",
  "Caribbean architectural cues: decorative concrete-block screens, burglar-bar windows, white plaster walls, mahogany or teak doors and rails, parquet or terracotta floors, white subway or marble tile, drop ceilings, galvanized roofs.",
  "Real wear: cracks, scuffs, mismatched objects, dated fixtures, lived-in untidiness. Never magazine-staged.",
  "Care realism: grab bars, mobility poles, commode chairs, home hospital beds with bed pads and mosquito nets, hand-holding, walking sticks, basins. Shown matter-of-factly, never glamorized.",
  "If people appear: dark-skinned Trinidadian hands, ordinary cotton clothes, no scrubs, no Pinterest 'caregiver in white' cliché.",
  "Avoid: golden-hour beach shots, lab coats, glossy skin, drone palms, magazine staging, generic 'tropical' shorthand.",
  "No text, no logos, no captions inside the image.",
].join(" ");

export function pickAnchorForPost(
  slug: string | null | undefined,
  title: string,
  description: string,
  category: string,
): BlogStyleAnchor {
  if (slug && TOPIC_MAP[slug]) {
    const exact = BLOG_STYLE_ANCHORS.find((a) => a.id === TOPIC_MAP[slug]);
    if (exact) return exact;
  }
  const haystack = `${title} ${description} ${category}`.toLowerCase();
  let best: BlogStyleAnchor = BLOG_STYLE_ANCHORS[0];
  let bestScore = 0;
  for (const anchor of BLOG_STYLE_ANCHORS) {
    const score = anchor.topics.reduce(
      (acc, t) => (haystack.includes(t) ? acc + 1 : acc),
      0,
    );
    if (score > bestScore) {
      bestScore = score;
      best = anchor;
    }
  }
  return best;
}

export function anchorPublicUrl(id: string, origin: string): string {
  return `${origin.replace(/\/$/, "")}/blog-style-refs/${id}.jpg`;
}

export function anchorThumbUrl(id: string): string {
  return `/blog-style-refs/thumbs/${id}.jpg`;
}

export function buildStyledImagePrompt(
  userPrompt: string,
  anchor: BlogStyleAnchor,
): string {
  return [
    `Reframe the supplied reference photograph into a 16:9 horizontal blog cover.`,
    `Reference subject: ${anchor.subject}.`,
    `Article focus: ${userPrompt.trim()}`,
    `Style rules (mandatory): ${TAVARA_PHOTO_RULEBOOK}`,
    `Preserve the reference photo's original architecture, lighting, color temperature, and lived-in feel. Do not turn it into stock photography.`,
  ].join("\n\n");
}
