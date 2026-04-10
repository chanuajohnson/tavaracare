
import React from "react";

export interface OnboardingSectionLink {
  label: string;
  url: string;
}

export interface OnboardingSectionDef {
  id: string;
  title: string;
  iconName: string; // lucide icon name for portability
  description: string;
  items: string[];
  showFamilyData?: boolean;
  showProfessionalData?: boolean;
}

export const ONBOARDING_SECTION_DEFS: OnboardingSectionDef[] = [
  {
    id: "pre_call",
    title: "Pre-Call Preparation",
    iconName: "ClipboardCheck",
    description: "Admin review tasks before the onboarding call",
    items: [
      "Review family account status (registered, profile complete?)",
      "Review existing care plan (if family already created one) OR note: care plan to be created during/after call",
      "Note care recipient name, relationship, and primary conditions",
      "Have family's phone number / WhatsApp ready",
      "Review any notes from initial inquiry or chat registration data",
      "Prepare screen-share or walkthrough materials",
    ],
  },
  {
    id: "review_submissions",
    title: "Review Client Submissions",
    iconName: "Heart",
    description: "Review what the family already submitted — registration, care assessment, and legacy story",
    showFamilyData: true,
    items: [
      "Review registration: care recipient name, relationship, care types, special needs",
      "Review care assessment: ADLs, conditions, care location",
      "Review legacy story: personality, hobbies, daily routine, joyful things",
      "Discuss what prompted them to seek care",
      "Confirm family's expectations and care goals",
      "Note any updates to cultural, dietary, or language preferences",
      "Confirm emergency contacts and physician information",
      "Note any edits needed for follow-up",
    ],
  },
  {
    id: "platform_overview",
    title: "Platform Overview for Family",
    iconName: "Monitor",
    description: "Walk the family through core navigation",
    items: [
      "How to log in (email + password or magic link)",
      "Family dashboard layout and shortcuts",
      "Care Plans quick link on dashboard",
      "How to view their care plan details",
      "Care team members and assigned professionals",
      "How to access the medication dashboard",
      "How to access the meal planner",
    ],
  },
  {
    id: "care_plan",
    title: "Care Plan Review & Setup",
    iconName: "FileText",
    description: "Collaboratively review and finalize the care plan with the family",
    items: [
      "Review existing care plan details (if already created by family)",
      "Care plan types (Scheduled Care, On-Demand)",
      "Discuss and confirm weekday coverage: 8am-4pm / 8am-6pm / 6am-6pm / 6pm-8am / none",
      "Discuss and confirm weekend coverage: 6am-6pm / 8am-4pm / none",
      "Additional shifts if needed (evening/overnight options)",
      "How to view / edit care plan details",
      "Care team members tab — who's assigned",
      "Daily care logs tab — how family views completed logs",
    ],
  },
  {
    id: "medication",
    title: "Medication Management",
    iconName: "Pill",
    description: "How the medication system works for families and caregivers",
    items: [
      "How family adds medications (name, dosage, frequency, schedule)",
      "Medication schedule view — today's medications at a glance",
      "How professionals administer and record medications",
      "Conflict-aware administration — prevents double-dosing",
      "Medication history and reports",
      "Export features (PDF / print)",
      "Printable medication cards for the caregiver",
    ],
  },
  {
    id: "meals",
    title: "Meal Management",
    iconName: "UtensilsCrossed",
    description: "Meal planning and nutrition features",
    items: [
      "Meal planner — weekly meal scheduling",
      "Recipe library — browse and save recipes",
      "Grocery list manager — auto-generate from meal plan",
      "Nutrition tracker — monitor dietary intake",
      "How to share meal plans with the caregiver",
    ],
  },
  {
    id: "daily_checklist",
    title: "Daily Care Checklist (Caregiver SOP)",
    iconName: "ListChecks",
    description: "The standard operating procedure caregivers follow each shift",
    items: [
      "How the professional fills out the checklist each shift",
      "One log per professional per care plan per day rule",
      "How family sees the completed daily logs",
      "Time-in / time-out tracking",
      "Shift notes and incident reporting",
    ],
  },
  {
    id: "professional_dashboard",
    title: "Professional Dashboard Overview",
    iconName: "LayoutDashboard",
    description: "What the caregiver sees on their side",
    items: [
      "Care assignments and client details",
      "Calendar view with daily log entries",
      "Medication dashboard for assigned care plans",
      "Document management and training modules",
      "Nurse Handbook & SOP resources (always accessible)",
    ],
  },
  {
    id: "caregiver_matching",
    title: "Caregiver Matching & Introduction",
    iconName: "Users",
    description: "Match the right caregiver and plan introductions",
    items: [
      "Discuss caregiver preferences (skills, personality, language)",
      "Explain matching process and timeline",
      "Offer trial day option vs immediate start",
      "Tentatively assign caregiver (confirm after call)",
      "Arrange meet-and-greet if applicable",
    ],
  },
  {
    id: "rates_and_changes",
    title: "Rates, Care Changes & Escalation",
    iconName: "DollarSign",
    description: "Pricing transparency, holiday/overtime rates, and how costs evolve as care needs change",
    items: [
      "Review rate tiers: Standard ($35/hr) — GAPP-certified personal care, medication admin & logging, vitals monitoring, basic daily dietary meal prep, daily care documentation, specialized care (dementia, palliative, post-surgical)",
      "Full Service ($40/hr) — Everything in Standard + advanced specialist-directed meal prep (holidays & special occasions), complex medical needs (wound care, catheter care, oxygen management), overnight/live-in shifts, advanced certifications (RN, LPN), behavioral health support",
      "Premium ($45+/hr) — Everything in Full Service + change-in-care-plan management, disease progression support, multi-specialist coordination, 24/7 on-call availability, advanced palliative/end-of-life care, family training & transition planning",
      "Holiday rates apply — time and a half (1.5x) on recognized holidays; double time (2x) on Christmas",
      "Extended hours / overtime rates — time and a half for shifts beyond standard coverage",
      "Change orders: any increase in service scope is recorded and discussed before taking effect",
      "Care escalation triggers — bedridden status, wheelchair/lift needs, increased fall risk",
      "Dietary changes — stricter dietary requirements may increase care complexity and cost",
      "Medication changes — new prescriptions or regimen changes require updated care documentation",
      "Errands and personal runs (grocery, market) — arranged privately with nurse at agreed stipend, outside Tavara scope",
      "Baseline care level is established at onboarding; all changes from baseline are documented",
      "Family will be notified and consulted before any rate or care level adjustment takes effect",
    ],
  },
  {
    id: "next_steps",
    title: "Next Steps & Follow-Up",
    iconName: "CalendarCheck",
    description: "Confirm start date, set up communication, and plan first-week check-in",
    items: [
      "Confirm care start date (or trial day date)",
      "Set up WhatsApp care group",
      "Schedule 24-48 hour post-first-visit check-in",
      "Share admin/coordinator direct contact info",
      "Confirm family knows how to reach support",
      "Send welcome summary via email/WhatsApp after call",
    ],
  },
  {
    id: "communication",
    title: "Communication & Notifications",
    iconName: "MessageSquare",
    description: "How everyone stays connected",
    items: [
      "Care plan edit notifications (bidirectional)",
      "Daily log visibility for family",
      "WhatsApp care group updates",
      "How to contact the care coordinator",
      "Emergency contact setup and visibility",
    ],
  },
];

export function getTotalItems(): number {
  return ONBOARDING_SECTION_DEFS.reduce((sum, s) => sum + s.items.length, 0);
}
