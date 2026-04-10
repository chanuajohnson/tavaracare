
import { OnboardingSectionDef } from "./onboardingSections";

export const PROFESSIONAL_ONBOARDING_SECTION_DEFS: OnboardingSectionDef[] = [
  {
    id: "pre_screening",
    title: "Pre-Screening Review",
    iconName: "ClipboardCheck",
    description: "Review background check, references, and screening session status",
    showProfessionalData: true,
    items: [
      "Review professional's registration data (name, experience, certifications)",
      "Check background check status and proof document",
      "Review submitted references (minimum 2 required)",
      "Confirm screening session outcome (head nurse interview)",
      "Verify ID and legal authorization to work",
      "Review any notes from initial inquiry or chat registration",
    ],
  },
  {
    id: "document_verification",
    title: "Document Verification",
    iconName: "FileText",
    description: "Certifications, ID, insurance, and training certificates",
    items: [
      "Valid government-issued ID uploaded and verified",
      "Professional certifications (CNA, LPN, RN, etc.) verified",
      "Background check proof document on file",
      "First aid / CPR certification current",
      "Insurance or bonding documentation (if applicable)",
      "Training certificates reviewed and filed",
    ],
  },
  {
    id: "platform_walkthrough",
    title: "Platform Walkthrough",
    iconName: "Monitor",
    description: "Login, professional dashboard, assignments, and schedule",
    items: [
      "How to log in (email + password or magic link)",
      "Professional dashboard layout and shortcuts",
      "How to view assigned families and care plans",
      "Calendar view and schedule management",
      "How to access the daily care checklist",
      "Profile hub — updating availability, certifications, and documents",
      "Message board and communication tools",
    ],
  },
  {
    id: "care_plan_training",
    title: "Care Plan & Assignment Training",
    iconName: "Heart",
    description: "How assignments work, care plan details, and care team coordination",
    items: [
      "How caregiver assignments are created (automatic vs admin-assigned)",
      "Understanding care plan details — schedule, tasks, special needs",
      "Care team members — who else is on the team",
      "How to view family profile and care recipient information",
      "Trial day process vs immediate start",
      "What to do if there's a scheduling conflict",
    ],
  },
  {
    id: "daily_checklist_sop",
    title: "Daily Checklist SOP",
    iconName: "ListChecks",
    description: "Shift check-in/out, daily log, medication admin, and incident reports",
    items: [
      "How to fill out the daily care checklist each shift",
      "One log per professional per care plan per day rule",
      "Time-in / time-out tracking requirements",
      "Shift notes and incident reporting procedures",
      "How the family sees completed daily logs",
      "Escalation protocol for urgent situations",
    ],
  },
  {
    id: "medication_meal_protocols",
    title: "Medication & Meal Protocols",
    iconName: "Pill",
    description: "Medication dashboard, meal plan access, and dietary requirements",
    items: [
      "How to access the medication dashboard for assigned care plans",
      "Administering and recording medications (conflict-aware system)",
      "Medication history and double-dosing prevention",
      "Printable medication cards for quick reference",
      "Meal plan access — weekly schedules and dietary notes",
      "Handling dietary restrictions and allergies",
    ],
  },
  {
    id: "rates_payment",
    title: "Rates, Payment & Policies",
    iconName: "DollarSign",
    description: "Rate tiers, holiday/overtime rates, payment schedule, and change orders",
    items: [
      "Review base rate tiers: Standard ($35/hr), Full Service ($40/hr), Premium ($45+/hr)",
      "Holiday rates — time and a half (1.5x); double time (2x) on Christmas",
      "Extended hours / overtime rates — time and a half beyond standard shifts",
      "Payment schedule and method (weekly/bi-weekly)",
      "Change orders — how care scope increases affect compensation",
      "Attendance and punctuality expectations",
      "Cancellation and no-show policy",
    ],
  },
  {
    id: "communication_support",
    title: "Communication & Support",
    iconName: "MessageSquare",
    description: "WhatsApp groups, coordinator contact, and escalation procedures",
    items: [
      "WhatsApp care group setup — how communication flows",
      "How to contact the care coordinator directly",
      "Emergency escalation procedures",
      "Professional message board for peer support",
      "Nurse Handbook & SOP resources (always accessible)",
      "How to report concerns or request support",
    ],
  },
  {
    id: "next_steps_assignment",
    title: "Next Steps & First Assignment",
    iconName: "CalendarCheck",
    description: "Confirm availability, first assignment prep, and 48hr check-in",
    items: [
      "Confirm availability and preferred schedule",
      "Review first assignment details (family, care plan, start date)",
      "Meet-and-greet with family (if applicable)",
      "Ensure all required documents are uploaded",
      "Schedule 48-hour post-first-shift check-in",
      "Share coordinator direct contact info and welcome packet",
    ],
  },
];

export function getProfessionalTotalItems(): number {
  return PROFESSIONAL_ONBOARDING_SECTION_DEFS.reduce((sum, s) => sum + s.items.length, 0);
}
