import {
  Heart,
  Calendar,
  Home,
  HandHeart,
  Sparkles,
  Compass,
  type LucideIcon,
} from "lucide-react";

export type ReadinessStage = 1 | 2 | 3 | 4;

export interface QuizOption {
  /** 1 = stage 1 leaning … 4 = stage 4 leaning */
  score: ReadinessStage;
  label: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  /** short helper line under the prompt */
  helper?: string;
  icon: LucideIcon;
  options: [QuizOption, QuizOption, QuizOption, QuizOption];
}

export const readinessQuizQuestions: QuizQuestion[] = [
  {
    id: "q1_emotional_entry",
    prompt: "How are you feeling about your situation right now?",
    helper: "There's no wrong answer — just what's true today.",
    icon: Heart,
    options: [
      { score: 1, label: "I feel overwhelmed and just need help to start" },
      { score: 2, label: "I'm managing, but it's a lot to keep up with" },
      { score: 3, label: "I'm starting to see where I need more support" },
      { score: 4, label: "I'm ready for someone to take more off my plate" },
    ],
  },
  {
    id: "q2_immediate_pressure",
    prompt: "What feels hardest right now?",
    helper: "Pick the one that stands out most.",
    icon: Compass,
    options: [
      { score: 1, label: "Getting consistent care in place" },
      { score: 2, label: "Keeping up with daily routines" },
      { score: 3, label: "Managing the home around care" },
      { score: 4, label: "Feeling mentally and emotionally stretched" },
    ],
  },
  {
    id: "q3_trust_readiness",
    prompt: "How comfortable are you having support in your home?",
    icon: HandHeart,
    options: [
      { score: 1, label: "Still getting used to the idea" },
      { score: 2, label: "Open, but I need to go slowly" },
      { score: 3, label: "Comfortable and open to guidance" },
      { score: 4, label: "Ready for structured, ongoing support" },
    ],
  },
  {
    id: "q4_environment",
    prompt: "How would you describe your home in relation to care?",
    icon: Home,
    options: [
      { score: 1, label: "It's fine for now, we'll figure it out" },
      { score: 2, label: "It works, but some things could be easier" },
      { score: 3, label: "I'm noticing areas that need attention" },
      { score: 4, label: "It needs proper setup to support care" },
    ],
  },
  {
    id: "q5_support_preference",
    prompt: "What kind of support feels most helpful right now?",
    icon: Sparkles,
    options: [
      { score: 1, label: "Just the basics to get started" },
      { score: 2, label: "Help staying organized and on track" },
      { score: 3, label: "Step-by-step guidance to improve things" },
      { score: 4, label: "A real person to handle errands, supplies, and restocking" },
    ],
  },
  {
    id: "q6_priority_anchor",
    prompt: "What matters most to you right now?",
    icon: Calendar,
    options: [
      { score: 1, label: "My loved one's comfort" },
      { score: 2, label: "Keeping things manageable for me" },
      { score: 3, label: "Getting things properly set up" },
      { score: 4, label: "Less running around — knowing groceries, meds & supplies just show up" },
    ],
  },
];

export interface StageNextStep {
  label: string;
  href: string;
  variant?: "default" | "outline";
}

export interface StageDefinition {
  stage: ReadinessStage;
  name: string;
  title: string;
  body: string;
  /** Tailwind color family used for soft accents — must be present in safelist below */
  accent: "green" | "amber" | "orange" | "rose";
  borderClass: string;
  bgClass: string;
  iconBgClass: string;
  iconTextClass: string;
  badgeText: string;
  nextSteps: StageNextStep[];
  /** Stage-specific placeholder for the open-text reflection field */
  reflectionPlaceholder: string;
}

/**
 * Note: Tailwind classes are written in full so the JIT picks them up
 * (don't construct color classes from variables).
 */
export const readinessStages: Record<ReadinessStage, StageDefinition> = {
  1: {
    stage: 1,
    name: "Entry",
    title: "You're at the beginning — let's keep this simple.",
    body: "Right now, the focus is just getting support in place and helping things feel more stable. There's no need to think about changing anything else yet. We'll take this step by step, together.",
    accent: "green",
    borderClass: "border-l-green-500",
    bgClass: "bg-green-50/70",
    iconBgClass: "bg-green-100",
    iconTextClass: "text-green-700",
    badgeText: "Just starting",
    nextSteps: [
      { label: "Find a caregiver", href: "/family/matching" },
      {
        label: "Tell us about your loved one",
        href: "/family/story",
        variant: "outline",
      },
      {
        label: "Chat with TAV first",
        href: "/",
        variant: "outline",
      },
    ],
    reflectionPlaceholder:
      "e.g. \"I just need someone to help me get started — I don't even know what I need yet…\"",
  },
  2: {
    stage: 2,
    name: "Settling",
    title: "You're settling in — this stage is about building trust.",
    body: "You're getting a feel for how things work and what your family needs. Right now, the focus is consistency and comfort — not big changes. Tavara will check in gently as you go.",
    accent: "amber",
    borderClass: "border-l-amber-500",
    bgClass: "bg-amber-50/70",
    iconBgClass: "bg-amber-100",
    iconTextClass: "text-amber-700",
    badgeText: "Building trust",
    nextSteps: [
      { label: "Build your care team", href: "/family/care-management" },
      {
        label: "Share their daily routine",
        href: "/family/care-assessment",
        variant: "outline",
      },
      {
        label: "See how scheduling works",
        href: "/family/care-management",
        variant: "outline",
      },
    ],
    reflectionPlaceholder:
      "e.g. \"The caregiver is great but mornings still feel rushed — we haven't found a rhythm yet…\"",
  },
  3: {
    stage: 3,
    name: "Readiness",
    title: "You're ready for support beyond the basics.",
    body: "You're starting to see where things could be easier or more structured. This is a good time to introduce support that takes pressure off you.",
    accent: "orange",
    borderClass: "border-l-orange-500",
    bgClass: "bg-orange-50/70",
    iconBgClass: "bg-orange-100",
    iconTextClass: "text-orange-700",
    badgeText: "Ready to expand",
    nextSteps: [
      { label: "Guided Home Reset", href: "/family/care-management?tab=environment" },
      {
        label: "Care coordination",
        href: "/subscription/features",
        variant: "outline",
      },
      {
        label: "NIS payroll support",
        href: "/family/care-management?tab=payroll",
        variant: "outline",
      },
    ],
    reflectionPlaceholder:
      "e.g. \"The room layout makes transfers hard, and payroll is taking too much of my evenings…\"",
  },
  4: {
    stage: 4,
    name: "Optimization",
    title: "You're past the basics — let's lift the daily load.",
    body: "Care is in place. What's draining you now isn't the caregiving — it's the running around. The bananas, the bread, the medication refills, the emergent pharmacy runs when no one feels well. Tavara can take this off your plate on a schedule you set, so the house stays stocked without you holding the whole list in your head.",
    accent: "rose",
    borderClass: "border-l-rose-500",
    bgClass: "bg-rose-50/70",
    iconBgClass: "bg-rose-100",
    iconTextClass: "text-rose-700",
    badgeText: "Lifting the daily load",
    nextSteps: [
      { label: "Set up recurring supply delivery", href: "/errands#supplies" },
      {
        label: "Book a one-off errand run",
        href: "/errands",
        variant: "outline",
      },
      {
        label: "Talk to a care manager",
        href: "/family/care-management",
        variant: "outline",
      },
    ],
    reflectionPlaceholder:
      "e.g. \"Bananas and bread every other day, plus pharmacy runs when I'm not feeling well…\"",
  },
};

export const READINESS_REFLECTION_LOCAL_KEY = "tavara_readiness_reflection";
export const READINESS_LEAD_LOCAL_KEY = "tavara_readiness_lead";

export interface ReadinessReflection {
  text: string;
  submitted_at: string;
}

/**
 * Maps the average of the user's quiz answers to a final stage.
 * answers = array of 1..4 values (one per question).
 */
export const scoreQuiz = (answers: number[]): ReadinessStage => {
  if (!answers.length) return 1;
  const sum = answers.reduce((acc, n) => acc + n, 0);
  const avg = sum / answers.length;
  const rounded = Math.round(avg);
  return Math.max(1, Math.min(4, rounded)) as ReadinessStage;
};

export const READINESS_LOCAL_STORAGE_KEY = "tavara_readiness_stage";
export const READINESS_RESPONSES_LOCAL_KEY = "tavara_readiness_responses";
export const READINESS_PROGRESS_LOCAL_KEY = "tavara_readiness_quiz_progress";

export interface ReadinessQuizProgress {
  answers: (ReadinessStage | undefined)[];
  currentIndex: number;
  updatedAt: string;
}

const PROGRESS_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export const readQuizProgress = (): ReadinessQuizProgress | null => {
  try {
    const raw = localStorage.getItem(READINESS_PROGRESS_LOCAL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ReadinessQuizProgress;
    if (!parsed.updatedAt) return null;
    const age = Date.now() - new Date(parsed.updatedAt).getTime();
    if (age > PROGRESS_MAX_AGE_MS) return null;
    if (!Array.isArray(parsed.answers)) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const writeQuizProgress = (
  answers: (ReadinessStage | undefined)[],
  currentIndex: number
) => {
  try {
    const payload: ReadinessQuizProgress = {
      answers,
      currentIndex,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(READINESS_PROGRESS_LOCAL_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
};

export const clearQuizProgress = () => {
  try {
    localStorage.removeItem(READINESS_PROGRESS_LOCAL_KEY);
  } catch {
    // ignore
  }
};

export const countAnswered = (answers: (ReadinessStage | undefined)[]) =>
  answers.filter((a) => !!a).length;
