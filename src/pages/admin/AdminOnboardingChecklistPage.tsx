
import React, { useState, useEffect, useCallback, useRef } from "react";
import { PRODUCTION_BASE_URL } from '@/utils/urlConstants';
import DocumentGenerationMenu from "@/components/admin/care-plans/DocumentGenerationMenu";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  ArrowLeft, ChevronDown, RotateCcw, ClipboardCheck, Monitor, FileText,
  Pill, UtensilsCrossed, ListChecks, LayoutDashboard, MessageSquare,
  Heart, Users, CalendarCheck, Loader2, Copy, DollarSign, CheckCircle2,
  CalendarIcon, ExternalLink, Download
} from "lucide-react";
import { CHECKLIST_SECTIONS } from "@/components/professional/checklist/checklistSections";
import { ONBOARDING_SECTION_DEFS, getTotalItems, OnboardingSectionDef } from "@/components/admin/onboarding/onboardingSections";
import { PROFESSIONAL_ONBOARDING_SECTION_DEFS, getProfessionalTotalItems } from "@/components/admin/onboarding/professionalOnboardingSections";
import FamilySubmissionReview from "@/components/admin/onboarding/FamilySubmissionReview";
import ProfessionalSubmissionReview from "@/components/admin/onboarding/ProfessionalSubmissionReview";
import RateTierReferenceCard from "@/components/admin/onboarding/RateTierReferenceCard";
import CareSuppliesCard from "@/components/admin/onboarding/CareSuppliesCard";
import OnboardingNotesCard, { OnboardingNote } from "@/components/admin/onboarding/OnboardingNotesCard";
import ServiceSelectionBlock from "@/components/admin/onboarding/ServiceSelectionBlock";
import BillingSummaryCard from "@/components/admin/onboarding/BillingSummaryCard";
import CaregiverRateSelector, { parseRateFromString, getWeeklyHoursFromSchedule } from "@/components/admin/onboarding/CaregiverRateSelector";
import ServiceCommencementConfirmation from "@/components/admin/onboarding/ServiceCommencementConfirmation";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import jsPDF from "jspdf";

/** Parse "YYYY-MM-DD" as local date (not UTC) */
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Format a local date string to "YYYY-MM-DD" */
function formatLocalDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Controlled date picker that closes after selection */
function DateFieldPicker({
  dateFieldLabel,
  storedDate,
  onDateChange,
}: {
  dateFieldLabel: string;
  storedDate: string | undefined;
  onDateChange: (val: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="mt-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8 text-xs gap-1.5",
              !storedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            {storedDate
              ? `${dateFieldLabel}: ${format(parseLocalDate(storedDate), "PPP")}`
              : `Set ${dateFieldLabel}`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={storedDate ? parseLocalDate(storedDate) : undefined}
            onSelect={(date) => {
              if (date) {
                onDateChange(formatLocalDate(date));
                setOpen(false);
              }
            }}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

/** Summary header for Post-Onboarding section */
function CareSummaryHeader({ checkedItems, linkedCheckedItems, assignedFamilyName }: {
  checkedItems: Record<string, boolean | string>;
  linkedCheckedItems?: Record<string, boolean | string>;
  assignedFamilyName?: string;
}) {
  const startDateStr = (linkedCheckedItems?.["post_onboarding_3_date"] || checkedItems["post_onboarding_3_date"]) as string | undefined;
  return (
    <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-blue-900">
        💙 Care Summary
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="text-sm">
          <span className="text-muted-foreground">Rate:</span>{" "}
          <span className="font-medium">{(checkedItems["care_rate"] as string) || "Not set — update in checklist"}</span>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">Plan:</span>{" "}
          <span className="font-medium">Active Care Management (weekly)</span>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">Start Date:</span>{" "}
          <span className="font-medium">
            {startDateStr ? format(parseLocalDate(startDateStr), "PPP") : "Not set"}
          </span>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">Payment:</span>{" "}
          <span className="font-medium">Weekly (due every Friday)</span>
        </div>
        <div className="text-sm col-span-full">
          <span className="text-xs text-blue-700 italic">💡 Complete transactions by Thursday to ensure Friday receipt.</span>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">Late Fee:</span>{" "}
          <span className="font-medium">5% after 3 business days</span>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">Holiday/OT:</span>{" "}
          <span className="font-medium">1.5× (2× Christmas)</span>
        </div>
        {assignedFamilyName && (
          <div className="text-sm">
            <span className="text-muted-foreground">Assigned Family:</span>{" "}
            <span className="font-medium">{assignedFamilyName}</span>
          </div>
        )}
      </div>
      <div className="mt-3 pt-3 border-t border-blue-200">
        <p className="text-xs text-blue-800 font-medium">
          👤 Caregivers are assigned to the primary client — support to other household members is limited to approved, scoped services only.
        </p>
      </div>
    </div>
  );
}

const ICON_MAP: Record<string, React.ReactNode> = {
  ClipboardCheck: <ClipboardCheck className="h-5 w-5" />,
  Heart: <Heart className="h-5 w-5" />,
  Monitor: <Monitor className="h-5 w-5" />,
  FileText: <FileText className="h-5 w-5" />,
  Pill: <Pill className="h-5 w-5" />,
  UtensilsCrossed: <UtensilsCrossed className="h-5 w-5" />,
  ListChecks: <ListChecks className="h-5 w-5" />,
  LayoutDashboard: <LayoutDashboard className="h-5 w-5" />,
  Users: <Users className="h-5 w-5" />,
  CalendarCheck: <CalendarCheck className="h-5 w-5" />,
  MessageSquare: <MessageSquare className="h-5 w-5" />,
  DollarSign: <DollarSign className="h-5 w-5" />,
  CheckCircle2: <CheckCircle2 className="h-5 w-5" />,
};

interface ProfileOption {
  id: string;
  full_name: string | null;
  care_schedule?: string | null;
}

/** Map raw checklist items to past-tense, agreement-focused language */
const REPORT_ITEM_MAP: Record<string, string> = {
  // Pre-Call
  "pre_call_0": "Reviewed family account status and registration completeness",
  "pre_call_1": "Reviewed existing care plan (or noted: to be created post-call)",
  "pre_call_2": "Noted care recipient name, relationship, and primary conditions",
  "pre_call_3": "Family contact details (phone/WhatsApp) confirmed and ready",
  "pre_call_4": "Reviewed notes from initial inquiry or chat registration",
  "pre_call_5": "Screen-share and walkthrough materials prepared",
  // Review Submissions
  "review_submissions_0": "Reviewed: care recipient name, relationship, care types, special needs",
  "review_submissions_1": "Reviewed: ADLs, conditions, care location from assessment",
  "review_submissions_2": "Reviewed: personality, hobbies, daily routine, joyful things (legacy story)",
  "review_submissions_3": "Discussed what prompted the family to seek care",
  "review_submissions_4": "Confirmed family expectations and care goals",
  "review_submissions_5": "Noted cultural, dietary, and language preferences",
  "review_submissions_6": "Confirmed emergency contacts and physician information",
  "review_submissions_7": "Noted any edits needed for follow-up",
  // Platform Overview
  "platform_overview_0": "Covered: login methods (email + password or magic link)",
  "platform_overview_1": "Covered: family dashboard layout and shortcuts",
  "platform_overview_2": "Covered: Care Plans quick link on dashboard",
  "platform_overview_3": "Covered: how to view care plan details",
  "platform_overview_4": "Covered: care team members and assigned professionals",
  "platform_overview_5": "Covered: medication dashboard access",
  "platform_overview_6": "Covered: meal planner access",
  // Care Plan
  "care_plan_0": "Existing care plan details reviewed and confirmed",
  "care_plan_1": "Care plan type confirmed (Scheduled Care / On-Demand)",
  "care_plan_2": "Weekday coverage confirmed",
  "care_plan_3": "Weekend coverage confirmed",
  "care_plan_4": "Additional shift needs discussed (evening/overnight)",
  "care_plan_5": "Covered: how to view/edit care plan details",
  "care_plan_6": "Covered: care team members tab — who's assigned",
  "care_plan_7": "Covered: daily care logs tab — how to view completed logs",
  // Medication
  "medication_0": "Covered: how family adds medications (name, dosage, frequency, schedule)",
  "medication_1": "Covered: medication schedule view — today's medications at a glance",
  "medication_2": "Covered: how professionals administer and record medications",
  "medication_3": "Covered: conflict-aware administration — prevents double-dosing",
  "medication_4": "Covered: medication history and reports",
  "medication_5": "Covered: export features (PDF/print)",
  "medication_6": "Covered: printable medication cards for the caregiver",
  // Meals
  "meals_0": "Covered: weekly meal scheduling",
  "meals_1": "Covered: recipe library — browse and save recipes",
  "meals_2": "Covered: grocery list manager — auto-generate from meal plan",
  "meals_3": "Covered: nutrition tracker — monitor dietary intake",
  "meals_4": "Covered: how to share meal plans with the caregiver",
  // Daily Checklist
  "daily_checklist_0": "Covered: how the professional fills out the checklist each shift",
  "daily_checklist_1": "Covered: one log per professional per care plan per day rule",
  "daily_checklist_2": "Covered: how family sees the completed daily logs",
  "daily_checklist_3": "Covered: time-in / time-out tracking",
  "daily_checklist_4": "Covered: shift notes and incident reporting",
  // Professional Dashboard
  "professional_dashboard_0": "Covered: care assignments and client details",
  "professional_dashboard_1": "Covered: calendar view with daily log entries",
  "professional_dashboard_2": "Covered: medication dashboard for assigned care plans",
  "professional_dashboard_3": "Covered: document management and training modules",
  "professional_dashboard_4": "Covered: Nurse Handbook & SOP resources",
  // Caregiver Matching
  "caregiver_matching_0": "Discussed caregiver preferences (skills, personality, language)",
  "caregiver_matching_1": "Explained matching process and timeline",
  "caregiver_matching_2": "Discussed trial day option vs immediate start",
  "caregiver_matching_3": "Tentatively assigned caregiver (pending confirmation)",
  "caregiver_matching_4": "Meet-and-greet arranged if applicable",
  // Rates
  "rates_and_changes_0": "Agreed: Standard rate tier ($35/hr) — GAPP-certified personal care, medication admin, vitals, meal prep, documentation, specialized care",
  "rates_and_changes_1": "Agreed: Full Service rate ($40/hr) — Standard + advanced meal prep, complex medical, overnight/live-in, advanced certs, behavioral health",
  "rates_and_changes_2": "Agreed: Premium rate ($45+/hr) — Full Service + change-in-care management, multi-specialist coordination, 24/7, palliative, family training",
  "rates_and_changes_3": "Agreed: Holiday rates — 1.5x on recognized holidays, 2x on Christmas",
  "rates_and_changes_4": "Agreed: Overtime rates — 1.5x for shifts beyond standard coverage",
  "rates_and_changes_5": "Acknowledged: Change orders documented and discussed before taking effect",
  "rates_and_changes_6": "Acknowledged: Care escalation triggers — bedridden status, wheelchair/lift, fall risk",
  "rates_and_changes_7": "Acknowledged: Dietary changes may increase care complexity and cost",
  "rates_and_changes_8": "Acknowledged: Medication changes require updated care documentation",
  "rates_and_changes_9": "Acknowledged: Errands/personal runs arranged privately with nurse, outside Tavara scope",
  "rates_and_changes_10": "Agreed: Baseline care level established at onboarding; changes documented",
  "rates_and_changes_11": "Agreed: Family notified before any rate or care level adjustment",
  // Next Steps
  "next_steps_0": "Care start date confirmed (or trial day date set)",
  "next_steps_1": "WhatsApp care group set up",
  "next_steps_2": "24-48 hour post-first-visit check-in scheduled",
  "next_steps_3": "Admin/coordinator direct contact info shared",
  "next_steps_4": "Family knows how to reach support",
  "next_steps_5": "Welcome summary sent via email/WhatsApp after call",
  // Communication
  "communication_0": "Covered: care plan edit notifications (bidirectional)",
  "communication_1": "Covered: daily log visibility for family",
  "communication_2": "Covered: WhatsApp care group updates",
  "communication_3": "Covered: how to contact the care coordinator",
  "communication_4": "Covered: emergency contact setup and visibility",
  // Family T&C
   "family_terms_0": "Agreed: Family engages caregivers directly, with Tavara providing coordination and support",
  "family_terms_1": "Agreed: Care team member is part of coordinated rotation pool managed by Tavara",
  "family_terms_2": "Agreed: Subscribing to the Family Care Plan (weekly) — as per quotation",
  "family_terms_3": "Agreed: Payment due weekly (every Friday) per billing terms",
  "family_terms_4": "Agreed: Family responsible for NIS contributions — Tavara provides guidance and tools",
  "family_terms_5": "Agreed: Rate adjustments may apply if care needs change, with prior notice",
  "family_terms_6": "Agreed: Wi-Fi access (if available) provided to caregiver for platform use",
  "family_terms_7": "Agreed: Quotation reviewed and all terms accepted (digital approval)",
  // Post Onboarding
  "post_onboarding_0": "Onboarding completed — welcome to Tavara.Care!",
  "post_onboarding_1": "Care team member confirmed and introduced to family",
  "post_onboarding_2": "First meeting: Tavara coordinator, care team member, and family at client residence",
  "post_onboarding_3": "Care team member commences work (start date confirms billing period)",
  "post_onboarding_4": "Care team member compensation coordinated weekly by Tavara",
  "post_onboarding_5": "Tavara subscription: Family Care Plan (weekly)",
  "post_onboarding_6": "NIS contributions are the family's responsibility — Tavara provides tools and guidance",
  "post_onboarding_7": "Care plan and team accessible via dashboard",
  "post_onboarding_8": "Onboarding progress viewable via dashboard",
  "post_onboarding_9": "Quote generated",
  "post_onboarding_10": "Invoice generated",
  "post_onboarding_11": "Receipt generated",
};

/** Sections that are always expanded (never compressed) */
const ALWAYS_EXPAND_SECTIONS = ["family_terms", "rates_and_changes", "terms_conditions"];

/** Render sections with smart compression */
function renderSmartSections(
  pdf: jsPDF,
  sectionDefs: OnboardingSectionDef[],
  checkedItems: Record<string, boolean | string>,
  startY: number,
  M: number,
  W: number,
  H: number,
  fontSize: number = 6.5,
  lineH: number = 3,
  skipSectionId?: string,
) {
  const colW = (W - M * 2 - 6) / 2;
  let col = 0;
  let colY = [startY, startY];
  const footerZone = H - 14;
  const maxItemLen = Math.floor(colW / (fontSize * 0.22));

  for (const section of sectionDefs) {
    if (section.id === skipSectionId) continue;
    let checked = 0;
    section.items.forEach((_, i) => { if (checkedItems[`${section.id}_${i}`]) checked++; });
    const total = section.items.length;
    const isComplete = checked === total && total > 0;
    const alwaysExpand = ALWAYS_EXPAND_SECTIONS.includes(section.id);

    // Smart compression: if all items checked AND not a critical section, show one line
    if (isComplete && !alwaysExpand) {
      // Pick column with more room
      if (colY[col] + 5 > footerZone) {
        col = colY[0] <= colY[1] ? 0 : 1;
        if (colY[col] + 5 > footerZone) break;
      }
      const x = M + col * (colW + 6);
      pdf.setFontSize(fontSize);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(34, 120, 34);
      pdf.text(`✓ ${section.title} — all ${total} items covered`, x, colY[col]);
      colY[col] += lineH + 1;
      if (colY[col] > colY[1 - col] + 8) col = 1 - col;
      continue;
    }

    // Estimate height for expanded section
    const sectionHeight = 4 + total * lineH;
    if (col === 0 && colY[0] + sectionHeight > footerZone && colY[1] + sectionHeight <= footerZone) {
      col = 1;
    } else if (col === 1 && colY[1] + sectionHeight > footerZone && colY[0] + sectionHeight <= footerZone) {
      col = 0;
    }
    if (colY[col] + 6 > footerZone) {
      col = colY[0] <= colY[1] ? 0 : 1;
      if (colY[col] + 6 > footerZone) break;
    }

    const x = M + col * (colW + 6);

    // Section header
    pdf.setFontSize(fontSize + 1);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(isComplete ? 34 : 60, isComplete ? 120 : 60, isComplete ? 34 : 80);
    pdf.text(`${section.title} (${checked}/${total})`, x, colY[col]);
    colY[col] += lineH + 0.8;

    // Items with mapped text
    pdf.setFontSize(fontSize);
    pdf.setFont("helvetica", "normal");
    for (let i = 0; i < total; i++) {
      if (colY[col] > footerZone) break;
      const itemChecked = !!checkedItems[`${section.id}_${i}`];
      const icon = itemChecked ? "✓" : "○";
      const prefix = itemChecked ? "" : "Pending: ";
      // Use mapped text if available, otherwise fallback to raw
      const mappedKey = `${section.id}_${i}`;
      let text = REPORT_ITEM_MAP[mappedKey] || (prefix + section.items[i]);
      if (!itemChecked && REPORT_ITEM_MAP[mappedKey]) {
        text = "Pending: " + text;
      }
      if (text.length > maxItemLen) text = text.substring(0, maxItemLen - 1) + "…";
      pdf.setTextColor(itemChecked ? 34 : 130, itemChecked ? 130 : 130, itemChecked ? 34 : 130);
      pdf.text(`${icon} ${text}`, x + 1, colY[col]);
      colY[col] += lineH;
    }
    colY[col] += 1.5;
    if (colY[col] > colY[1 - col] + sectionHeight * 0.5) {
      col = 1 - col;
    }
  }

  return Math.max(colY[0], colY[1]);
}

/** Generate a single-page landscape PDF report for the selected family */
function generateFamilyReport(
  familyName: string,
  checkedItems: Record<string, boolean | string>,
  notes: OnboardingNote[],
  sectionDefs: OnboardingSectionDef[],
) {
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297;
  const H = 210;
  const M = 10;
  let y = M;

  // --- Header ---
  pdf.setFontSize(13);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(30, 64, 120);
  pdf.text("TAVARA.CARE — Family Onboarding Agreement Record", M, y);
  y += 5.5;
  pdf.setFontSize(8.5);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(80);
  pdf.text(`Family: ${familyName}    |    Generated: ${format(new Date(), "PPP")}`, M, y);
  y += 5;

  pdf.setDrawColor(200);
  pdf.line(M, y, W - M, y);
  y += 4;

  // --- Care Summary ---
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(30, 64, 120);
  pdf.text("Care Summary", M, y);
  y += 4;

  const startDateStr = checkedItems["post_onboarding_3_date"] as string | undefined;
  const startDateFmt = startDateStr ? format(parseLocalDate(startDateStr), "PPP") : "Not set";

  pdf.setFontSize(7.5);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(50);
  const careRate = (checkedItems["care_rate"] as string) || "$40/hr (Standard)";
  pdf.text(`Rate: ${careRate}   |   Plan: Active Care Management (weekly)   |   Start Date: ${startDateFmt}`, M, y);
  y += 3.5;
  pdf.text(`Payment: Weekly (due every Friday) — Complete transactions by Thursday for Friday receipt   |   Late Fee: 5% after 3 business days`, M, y);
  y += 5;

  // --- Onboarding Progress header ---
  let totalChecked = 0;
  let totalItems = 0;
  sectionDefs.forEach((s) => {
    s.items.forEach((_, i) => { totalItems++; if (checkedItems[`${s.id}_${i}`]) totalChecked++; });
  });
  const pct = totalItems ? Math.round((totalChecked / totalItems) * 100) : 0;

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(30, 64, 120);
  pdf.text(`Onboarding Coverage: ${totalChecked}/${totalItems} items (${pct}%)`, M, y);
  y += 4;

  // --- Smart sections in 2-column layout ---
  const afterSections = renderSmartSections(pdf, sectionDefs, checkedItems, y, M, W, H);
  y = afterSections + 2;

  // --- Key Dates ---
  if (y < H - 22) {
    const introDate = checkedItems["post_onboarding_1_date"] as string | undefined;
    const meetingDate = checkedItems["post_onboarding_2_date"] as string | undefined;
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(30, 64, 120);
    pdf.text("Key Dates", M, y);
    y += 4;
    pdf.setFontSize(7.5);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(50);
    pdf.text([
      `Introduction: ${introDate ? format(parseLocalDate(introDate), "PPP") : "Not set"}`,
      `Meeting: ${meetingDate ? format(parseLocalDate(meetingDate), "PPP") : "Not set"}`,
      `Start: ${startDateFmt}`,
    ].join("   |   "), M, y);
    y += 5;
  }

  // --- Notes ---
  if (notes.length > 0 && y < H - 18) {
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(30, 64, 120);
    pdf.text("Onboarding Notes", M, y);
    y += 4;
    pdf.setFontSize(6.5);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(60);
    const maxNotes = Math.min(notes.length, 5);
    for (let i = 0; i < maxNotes; i++) {
      if (y > H - 12) break;
      const note = notes[i];
      const dateFmt = format(new Date(note.created_at), "MMM d");
      const truncated = note.text.length > 120 ? note.text.substring(0, 120) + "…" : note.text;
      pdf.text(`•  [${dateFmt}] [${note.assigned_to}] ${truncated}`, M, y);
      y += 3.2;
    }
    if (notes.length > maxNotes) {
      pdf.text(`   ... and ${notes.length - maxNotes} more notes`, M, y);
    }
  }

  // --- Footer ---
  pdf.setFontSize(6.5);
  pdf.setTextColor(150);
  pdf.text("This document serves as a baseline agreement record of what was covered during onboarding.", M, H - 8);
  pdf.text("Generated from tavara.care/admin/onboarding-checklist", M, H - 5);
  pdf.text(`Page 1 of 1`, W - M, H - 5, { align: "right" });

  const safeName = familyName.replace(/[^a-zA-Z0-9]/g, "_");
  pdf.save(`Onboarding_Report_${safeName}_${format(new Date(), "yyyy-MM-dd")}.pdf`);
}

/** Generate a single-page landscape PDF report for the selected professional */
function generateProfessionalReport(
  professionalName: string,
  assignedFamilyName: string,
  checkedItems: Record<string, boolean | string>,
  linkedFamilyCheckedItems: Record<string, boolean | string>,
  notes: OnboardingNote[],
  sectionDefs: OnboardingSectionDef[],
) {
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297;
  const H = 210;
  const M = 10;
  let y = M;

  // --- Header ---
  pdf.setFontSize(13);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(30, 64, 120);
  pdf.text("TAVARA.CARE — Professional Onboarding Agreement Record", M, y);
  y += 5.5;
  pdf.setFontSize(8.5);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(80);
  pdf.text(`Professional: ${professionalName}    |    Assigned Family: ${assignedFamilyName || "Not assigned"}    |    Generated: ${format(new Date(), "PPP")}`, M, y);
  y += 5;

  pdf.setDrawColor(200);
  pdf.line(M, y, W - M, y);
  y += 4;

  // --- Care Summary ---
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(30, 64, 120);
  pdf.text("Care Summary", M, y);
  y += 4;

  const startDateStr = (linkedFamilyCheckedItems["post_onboarding_3_date"] || checkedItems["post_onboarding_3_date"]) as string | undefined;
  const startDateFmt = startDateStr ? format(parseLocalDate(startDateStr), "PPP") : "Not set";

  pdf.setFontSize(7.5);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(50);
  const careRatePro = (linkedFamilyCheckedItems["care_rate"] || checkedItems["care_rate"] || "$40/hr (Standard)") as string;
  pdf.text(`Rate: ${careRatePro}   |   Plan: Active Care Management (weekly)   |   Start Date: ${startDateFmt}`, M, y);
  y += 3.5;
  pdf.text(`Payment: Weekly by Tavara (every Friday)   |   Holiday/OT: 1.5x (2x Christmas)`, M, y);
  y += 3.5;
  pdf.text(`NIS: Covered by Tavara   |   Probationary Period: 30 days   |   Rotation Pool: Yes`, M, y);
  y += 5;

  // --- Terms & Conditions Status (prominent) ---
  const tcSection = sectionDefs.find((s) => s.id === "terms_conditions");
  if (tcSection) {
    let tcChecked = 0;
    tcSection.items.forEach((_, i) => { if (checkedItems[`terms_conditions_${i}`]) tcChecked++; });
    const allAccepted = tcChecked === tcSection.items.length;

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(allAccepted ? 34 : 180, allAccepted ? 120 : 50, allAccepted ? 34 : 50);
    pdf.text(`Terms & Conditions: ${allAccepted ? "ALL ACCEPTED" : `${tcChecked}/${tcSection.items.length} acknowledged`}`, M, y);
    y += 4;

    pdf.setFontSize(6.5);
    pdf.setFont("helvetica", "normal");
    tcSection.items.forEach((item, i) => {
      const checked = !!checkedItems[`terms_conditions_${i}`];
      pdf.setTextColor(checked ? 34 : 150, checked ? 130 : 150, checked ? 34 : 150);
      // Use agreement language for T&C items
      const prefix = checked ? "Agreed: " : "Pending: ";
      const truncated = item.length > 105 ? item.substring(0, 105) + "…" : item;
      pdf.text(`${checked ? "✓" : "○"} ${prefix}${truncated}`, M + 1, y);
      y += 3;
    });
    y += 2;
  }

  // --- Onboarding Progress header ---
  let totalChecked = 0;
  let totalItems = 0;
  sectionDefs.forEach((s) => {
    s.items.forEach((_, i) => { totalItems++; if (checkedItems[`${s.id}_${i}`]) totalChecked++; });
  });
  const pct = totalItems ? Math.round((totalChecked / totalItems) * 100) : 0;

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(30, 64, 120);
  pdf.text(`Onboarding Coverage: ${totalChecked}/${totalItems} items (${pct}%)`, M, y);
  y += 4;

  // --- Smart sections (skip T&C since already shown above) ---
  const afterSections = renderSmartSections(pdf, sectionDefs, checkedItems, y, M, W, H, 6.5, 3, "terms_conditions");
  y = afterSections + 2;

  // --- Key Dates (synced from family) ---
  if (y < H - 22) {
    const introDate = (linkedFamilyCheckedItems["post_onboarding_1_date"] || checkedItems["post_onboarding_1_date"]) as string | undefined;
    const meetingDate = (linkedFamilyCheckedItems["post_onboarding_2_date"] || checkedItems["post_onboarding_2_date"]) as string | undefined;
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(30, 64, 120);
    pdf.text("Key Dates", M, y);
    y += 4;
    pdf.setFontSize(7.5);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(50);
    pdf.text([
      `Introduction: ${introDate ? format(parseLocalDate(introDate), "PPP") : "Not set"}`,
      `Meeting: ${meetingDate ? format(parseLocalDate(meetingDate), "PPP") : "Not set"}`,
      `Start: ${startDateFmt}`,
    ].join("   |   "), M, y);
    y += 5;
  }

  // --- Notes ---
  if (notes.length > 0 && y < H - 18) {
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(30, 64, 120);
    pdf.text("Onboarding Notes", M, y);
    y += 4;
    pdf.setFontSize(6.5);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(60);
    const maxNotes = Math.min(notes.length, 5);
    for (let i = 0; i < maxNotes; i++) {
      if (y > H - 12) break;
      const note = notes[i];
      const dateFmt = format(new Date(note.created_at), "MMM d");
      const truncated = note.text.length > 120 ? note.text.substring(0, 120) + "…" : note.text;
      pdf.text(`•  [${dateFmt}] [${note.assigned_to}] ${truncated}`, M, y);
      y += 3.2;
    }
  }

  // --- Footer ---
  pdf.setFontSize(6.5);
  pdf.setTextColor(150);
  pdf.text("This document serves as a baseline agreement record of what was covered during onboarding.", M, H - 8);
  pdf.text("Generated from tavara.care/admin/onboarding-checklist", M, H - 5);
  pdf.text(`Page 1 of 1`, W - M, H - 5, { align: "right" });

  const safeName = professionalName.replace(/[^a-zA-Z0-9]/g, "_");
  pdf.save(`Professional_Onboarding_Report_${safeName}_${format(new Date(), "yyyy-MM-dd")}.pdf`);
}

// Reusable checklist tab content
function ChecklistTabContent({
  profiles,
  loadingProfiles,
  selectedId,
  setSelectedId,
  checkedItems,
  toggleItem,
  onDateChange,
  notes,
  handleAddNote,
  handleEditNote,
  handleDeleteNote,
  handleCompleteNote,
  openSections,
  toggleSection,
  handleReset,
  sectionDefs,
  totalItems,
  totalChecked,
  profileLabel,
  tableName,
  idColumn,
  showFamilyData,
  showProfessionalData,
  onDownloadReport,
  linkedCheckedItems,
  assignedFamilyName,
  familyMedications,
  familyCarePlanId,
  onToggleApproval,
}: {
  profiles: ProfileOption[];
  loadingProfiles: boolean;
  selectedId: string;
  setSelectedId: (id: string) => void;
  checkedItems: Record<string, boolean | string>;
  toggleItem: (sectionId: string, index: number) => void;
  onDateChange?: (key: string, value: string) => void;
  notes: OnboardingNote[];
  handleAddNote: (note: OnboardingNote) => void;
  handleEditNote: (index: number, updatedNote: OnboardingNote) => void;
  handleDeleteNote: (index: number) => void;
  handleCompleteNote?: (index: number) => void;
  openSections: Record<string, boolean>;
  toggleSection: (id: string) => void;
  handleReset: () => void;
  sectionDefs: OnboardingSectionDef[];
  totalItems: number;
  totalChecked: number;
  profileLabel: string;
  tableName: string;
  idColumn: string;
  showFamilyData?: boolean;
  showProfessionalData?: boolean;
  onDownloadReport?: () => void;
  linkedCheckedItems?: Record<string, boolean | string>;
  assignedFamilyName?: string;
  familyMedications?: Array<{ id: string; name: string; dosage?: string; medication_type?: string; instructions?: string; schedule?: any }>;
  familyCarePlanId?: string | null;
  onToggleApproval?: (approvalKey: string) => void;
}) {
  const publicGuideUrl = `${window.location.origin}/onboarding-guide`;
  const copyPublicLink = () => {
    navigator.clipboard.writeText(publicGuideUrl);
    toast.success("Public onboarding guide link copied!");
  };

  const publishedBase = PRODUCTION_BASE_URL;
  const checklistPath = profileLabel === "Family"
    ? "/family/onboarding-checklist"
    : "/professional/onboarding-checklist";

  const copyNotesLink = () => {
    navigator.clipboard.writeText(`${publishedBase}${checklistPath}#notes`);
    toast.success(`${profileLabel} notes link copied!`);
  };

  const copyPostOnboardingLink = () => {
    navigator.clipboard.writeText(`${publishedBase}${checklistPath}#post_onboarding`);
    toast.success(`${profileLabel} post-onboarding link copied!`);
  };

  return (
    <>
      <div className="flex justify-end gap-2 mb-4 flex-wrap">
        {onDownloadReport && (
          <Button variant="outline" size="sm" onClick={onDownloadReport} className="gap-1">
            <Download className="h-4 w-4" />
            Download Report
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={copyPublicLink} className="gap-1" title="Copy shareable link">
          <Copy className="h-4 w-4" />
          Share Guide
        </Button>
        <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor={`${idColumn}Select`}>Select {profileLabel}</Label>
              {loadingProfiles ? (
                <div className="flex items-center gap-2 h-10">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading…</span>
                </div>
              ) : (
                <>
                  <Select value={selectedId} onValueChange={setSelectedId}>
                    <SelectTrigger id={`${idColumn}Select`}>
                      <SelectValue placeholder={`Choose a ${profileLabel.toLowerCase()} to begin onboarding`} />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.full_name || `Unnamed ${profileLabel.toLowerCase()}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedId && (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground font-mono truncate">
                        Profile ID: {selectedId}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1.5 text-xs"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedId);
                          toast.success(`${profileLabel} profile ID copied!`);
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Overall Progress</p>
              <p className="text-2xl font-bold">
                {totalChecked} / {totalItems}
              </p>
              <div className="w-40 h-2 bg-muted rounded-full mt-1">
                <div
                  className="h-2 bg-primary rounded-full transition-all"
                  style={{ width: `${totalItems ? (totalChecked / totalItems) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Feedback Summary Card */}
      {showProfessionalData && selectedId && (() => {
        const approvalConfirmed = checkedItems["professional_approval_confirmed"] === true;
        const approvalDate = checkedItems["professional_approval_date"] as string | undefined;
        const notesList = notes || [];
        const acknowledgedCount = notesList.filter((n: any) => n.acknowledged_at).length;
        const respondedCount = notesList.filter((n: any) => n.response_text).length;
        const completedCount = notesList.filter((n: any) => n.completed_at).length;
        const hasAnyActivity = approvalConfirmed || acknowledgedCount > 0 || respondedCount > 0;

        return (
          <Card className={`mb-4 ${hasAnyActivity ? "border-green-200 bg-green-50/30" : "border-amber-200 bg-amber-50/30"}`}>
            <CardContent className="pt-4 pb-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                {hasAnyActivity ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <MessageSquare className="h-4 w-4 text-amber-600" />
                )}
                Professional Feedback Summary
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center p-2 rounded bg-background border">
                  <p className="text-lg font-bold">{totalChecked}/{totalItems}</p>
                  <p className="text-xs text-muted-foreground">Items Covered</p>
                </div>
                <div className="text-center p-2 rounded bg-background border">
                  <p className="text-lg font-bold">{acknowledgedCount}/{notesList.length}</p>
                  <p className="text-xs text-muted-foreground">Notes Acknowledged</p>
                </div>
                <div className="text-center p-2 rounded bg-background border">
                  <p className="text-lg font-bold">{respondedCount}</p>
                  <p className="text-xs text-muted-foreground">Responses Sent</p>
                </div>
                <div className="text-center p-2 rounded bg-background border">
                  <div className="flex flex-col items-center gap-1">
                    {approvalConfirmed ? (
                      <>
                        <Badge variant="default" className="bg-green-600 text-xs">Approved</Badge>
                        {approvalDate && (
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(approvalDate), "MMM d, yyyy")}
                          </p>
                        )}
                        {(checkedItems["professional_approval_by"] as string) === "admin" && (
                          <p className="text-xs text-muted-foreground italic">by Admin</p>
                        )}
                      </>
                    ) : (
                      <>
                        <Badge variant="secondary" className="text-xs">Pending</Badge>
                        <p className="text-xs text-muted-foreground mt-1">Readiness Approval</p>
                      </>
                    )}
                    {onToggleApproval && (
                      <label className="flex items-center gap-1.5 mt-1 cursor-pointer">
                        <Checkbox
                          checked={!!approvalConfirmed}
                          onCheckedChange={() => onToggleApproval("professional_approval_confirmed")}
                          className="h-3.5 w-3.5"
                        />
                        <span className="text-xs text-muted-foreground">Admin toggle</span>
                      </label>
                    )}
                  </div>
                </div>
              </div>
              {completedCount > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  {completedCount} note action(s) marked complete by professional
                </p>
              )}
            </CardContent>
          </Card>
        );
      })()}

      {/* Family Feedback Summary Card */}
      {showFamilyData && selectedId && (() => {
        const approvalConfirmed = checkedItems["family_approval_confirmed"] === true;
        const approvalDate = checkedItems["family_approval_date"] as string | undefined;
        const notesList = notes || [];
        const acknowledgedCount = notesList.filter((n: any) => n.acknowledged_at).length;
        const respondedCount = notesList.filter((n: any) => n.response_text).length;
        const completedCount = notesList.filter((n: any) => n.completed_at).length;
        const hasAnyActivity = approvalConfirmed || acknowledgedCount > 0 || respondedCount > 0;

        return (
          <Card className={`mb-4 ${hasAnyActivity ? "border-green-200 bg-green-50/30" : "border-amber-200 bg-amber-50/30"}`}>
            <CardContent className="pt-4 pb-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                {hasAnyActivity ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <MessageSquare className="h-4 w-4 text-amber-600" />
                )}
                Family Feedback Summary
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center p-2 rounded bg-background border">
                  <p className="text-lg font-bold">{totalChecked}/{totalItems}</p>
                  <p className="text-xs text-muted-foreground">Items Covered</p>
                </div>
                <div className="text-center p-2 rounded bg-background border">
                  <p className="text-lg font-bold">{acknowledgedCount}/{notesList.length}</p>
                  <p className="text-xs text-muted-foreground">Notes Acknowledged</p>
                </div>
                <div className="text-center p-2 rounded bg-background border">
                  <p className="text-lg font-bold">{respondedCount}</p>
                  <p className="text-xs text-muted-foreground">Responses Sent</p>
                </div>
                <div className="text-center p-2 rounded bg-background border">
                  <div className="flex flex-col items-center gap-1">
                    {approvalConfirmed ? (
                      <>
                        <Badge variant="default" className="bg-green-600 text-xs">Approved</Badge>
                        {approvalDate && (
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(approvalDate), "MMM d, yyyy")}
                          </p>
                        )}
                        {(checkedItems["family_approval_by"] as string) === "admin" && (
                          <p className="text-xs text-muted-foreground italic">by Admin</p>
                        )}
                      </>
                    ) : (
                      <>
                        <Badge variant="secondary" className="text-xs">Pending</Badge>
                        <p className="text-xs text-muted-foreground mt-1">Service Approval</p>
                      </>
                    )}
                    {onToggleApproval && (
                      <label className="flex items-center gap-1.5 mt-1 cursor-pointer">
                        <Checkbox
                          checked={!!approvalConfirmed}
                          onCheckedChange={() => onToggleApproval("family_approval_confirmed")}
                          className="h-3.5 w-3.5"
                        />
                        <span className="text-xs text-muted-foreground">Admin toggle</span>
                      </label>
                    )}
                  </div>
                </div>
              </div>
              {completedCount > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  {completedCount} note action(s) marked complete by family
                </p>
              )}
            </CardContent>
          </Card>
        );
      })()}

      <div className="space-y-3">
        {sectionDefs.map((section) => {
          let checked = 0;
          section.items.forEach((_, i) => {
            if (checkedItems[`${section.id}_${i}`]) checked++;
          });
          const total = section.items.length;
          const isOpen = openSections[section.id] ?? false;
          const isComplete = checked === total && total > 0;

          return (
            <Collapsible key={section.id} open={isOpen} onOpenChange={() => toggleSection(section.id)}>
              <Card className={isComplete ? "border-green-300 bg-green-50/50" : ""}>
                <CollapsibleTrigger className="w-full text-left">
                  <CardHeader className="py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isComplete ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                        {ICON_MAP[section.iconName] || <ClipboardCheck className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base flex items-center gap-2">
                          {section.title}
                          <Badge variant={isComplete ? "default" : "secondary"} className="text-xs">
                            {checked}/{total}
                          </Badge>
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
                      </div>
                      <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 pb-4">
                    {showFamilyData && section.showFamilyData && selectedId && (
                      <div className="mb-4">
                        <FamilySubmissionReview familyId={selectedId} />
                      </div>
                    )}
                    {showFamilyData && section.showFamilyData && !selectedId && (
                      <div className="mb-4 p-4 border border-dashed rounded-lg text-center text-sm text-muted-foreground">
                        Select a family above to view their submitted registration, care assessment, and legacy story.
                      </div>
                    )}
                    {showProfessionalData && section.showProfessionalData && selectedId && (
                      <div className="mb-4">
                        <ProfessionalSubmissionReview professionalId={selectedId} />
                      </div>
                    )}
                    {showProfessionalData && section.showProfessionalData && !selectedId && (
                      <div className="mb-4 p-4 border border-dashed rounded-lg text-center text-sm text-muted-foreground">
                        Select a professional above to view their registration data, documents, references, and screening results.
                      </div>
                    )}

                    {/* Helper text banner */}
                    {section.helperText && (
                      <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50/50 p-3 text-xs text-blue-800 flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">ℹ️</span>
                        <span>{section.helperText}</span>
                      </div>
                    )}

                    {/* Service Selection Block for relevant sections */}
                    {section.serviceCategory && showFamilyData && familyCarePlanId && (
                      <div className="mb-4">
                        <ServiceSelectionBlock
                          carePlanId={familyCarePlanId}
                          filterCategory={section.serviceCategory}
                        />
                      </div>
                    )}
                    {section.serviceCategory && showFamilyData && !familyCarePlanId && (
                      <div className="mb-4 p-3 bg-muted/50 border border-border rounded-md text-sm text-muted-foreground flex items-center gap-2">
                        <span>ℹ️</span>
                        <span>Service selection requires a linked care plan. Create a care plan for this family to enable billing items.</span>
                      </div>
                    )}

                    <div className="space-y-3 pl-2">
                      {section.items.map((item, i) => {
                        const itemKey = `${section.id}_${i}`;
                        const dateFieldLabel = section.dateFields?.[i];
                        const dateKey = `${section.id}_${i}_date`;
                        const storedDate = checkedItems[dateKey] as string | undefined;
                        const linkUrl = section.links?.[i];

                        return (
                          <div key={i} className="flex items-start gap-3 flex-wrap">
                            <Checkbox
                              checked={!!checkedItems[itemKey]}
                              onCheckedChange={() => toggleItem(section.id, i)}
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <span className={`text-sm ${checkedItems[itemKey] ? "line-through text-muted-foreground" : ""}`}>
                                {item}
                              </span>
                              {linkUrl && (
                                <a
                                  href={linkUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 ml-2 text-xs text-primary hover:underline"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Open
                                </a>
                              )}
                              {dateFieldLabel && onDateChange && (() => {
                                const linkedDate = linkedCheckedItems?.[dateKey] as string | undefined;
                                if (linkedDate && section.id === "post_onboarding") {
                                  return (
                                    <Badge variant="outline" className="mt-1.5 text-xs gap-1.5">
                                      <CalendarIcon className="h-3 w-3" />
                                      {dateFieldLabel}: {format(parseLocalDate(linkedDate), "PPP")}
                                      <span className="text-muted-foreground ml-1">(from family)</span>
                                    </Badge>
                                  );
                                }
                                return (
                                  <DateFieldPicker
                                    dateFieldLabel={dateFieldLabel}
                                    storedDate={storedDate}
                                    onDateChange={(val) => onDateChange(dateKey, val)}
                                  />
                                );
                              })()}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {(section.id === "daily_checklist" || section.id === "daily_checklist_sop") && (
                      <div className="mt-6 border-t pt-4">
                        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                          <ListChecks className="h-4 w-4" />
                          Full Caregiver Daily Checklist (SOP Reference)
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {CHECKLIST_SECTIONS.map((sopSection, idx) => (
                            <Collapsible key={idx}>
                              <div className="bg-muted/50 rounded-lg p-3">
                                <CollapsibleTrigger className="w-full text-left flex items-center justify-between">
                                  <p className="font-medium text-sm">{sopSection.title}</p>
                                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform data-[state=open]:rotate-180" />
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <ul className="space-y-1 mt-2">
                                    {sopSection.items.map((item, j) => (
                                      <li key={j} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                        <span className="text-primary mt-0.5">•</span>
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                </CollapsibleContent>
                              </div>
                            </Collapsible>
                          ))}
                        </div>
                      </div>
                    )}

                    {(section.id === "daily_checklist" || section.id === "daily_checklist_sop") && (
                      <CareSuppliesCard />
                    )}

                    {(section.id === "rates_payment" || section.id === "rates_and_changes") && showFamilyData && (
                      <CaregiverRateSelector
                        careSchedule={profiles.find(p => p.id === selectedId)?.care_schedule || undefined}
                        currentRate={(checkedItems["care_rate"] as string) || ''}
                        onRateChange={(rateStr) => {
                          onDateChange?.("care_rate", rateStr);
                        }}
                        onWeeklyHoursChange={setSelectedCaregiverWeeklyHours}
                      />
                    )}

                    {(section.id === "rates_payment" || section.id === "rates_and_changes") && (
                      <RateTierReferenceCard />
                    )}

                    {section.id === "medication_confirmation" && showFamilyData && selectedId && (
                      <div className="mt-4 border-t pt-4">
                        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                          <Pill className="h-4 w-4" />
                          Active Medications on File
                        </h4>
                        {familyMedications && familyMedications.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {familyMedications.map((med) => (
                              <div key={med.id} className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                                <p className="font-medium text-sm text-blue-900">{med.name}</p>
                                {med.dosage && <p className="text-xs text-blue-700">Dosage: {med.dosage}</p>}
                                {med.medication_type && <p className="text-xs text-blue-700">Type: {med.medication_type}</p>}
                                {med.instructions && <p className="text-xs text-blue-700">Instructions: {med.instructions}</p>}
                                {med.schedule && typeof med.schedule === 'object' && med.schedule.times && (
                                  <p className="text-xs text-blue-700">
                                    Schedule: {Array.isArray(med.schedule.times) ? med.schedule.times.join(', ') : String(med.schedule.times)}
                                    {med.schedule.frequency && ` (${med.schedule.frequency})`}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                            ⚠️ No medications found for this family. The family has not yet added any medications to their care plan.
                          </div>
                        )}
                      </div>
                    )}

                    {section.id === "post_onboarding" && (
                      <>
                        <CareSummaryHeader
                          checkedItems={checkedItems}
                          linkedCheckedItems={linkedCheckedItems}
                          assignedFamilyName={assignedFamilyName}
                        />

                        {/* Billing & Care Structure Summary */}
                        {showFamilyData && familyCarePlanId && (
                          <div className="mb-4">
                            <BillingSummaryCard
                              carePlanId={familyCarePlanId}
                              careRate={(checkedItems["care_rate"] as string) || undefined}
                              weeklyHours={selectedCaregiverWeeklyHours}
                            />
                          </div>
                        )}

                        {/* Service Commencement Confirmation */}
                        {showFamilyData && familyCarePlanId && (
                          <div className="mb-4">
                            <ServiceCommencementConfirmation
                              carePlanId={familyCarePlanId}
                              familyName={assignedFamilyName}
                              startDate={
                                (checkedItems["billing_start_date"] || checkedItems["post_onboarding_3_date"]) as string | undefined
                                  ? format(parseLocalDate((checkedItems["billing_start_date"] || checkedItems["post_onboarding_3_date"]) as string), "PPP")
                                  : undefined
                              }
                              billingCadence={
                                (checkedItems["billing_cadence"] as string) === "monthly" ? "Monthly" : "Weekly (every Friday)"
                              }
                            />
                          </div>
                        )}

                        {/* Family: Service Commencement Approval block */}
                        {showFamilyData && (() => {
                          const famApproved = checkedItems["family_approval_confirmed"] === true;
                          const famApprovalDate = checkedItems["family_approval_date"] as string | undefined;
                          const famApprovalBy = checkedItems["family_approval_by"] as string | undefined;
                          const startDateStr = (checkedItems["billing_start_date"] || checkedItems["post_onboarding_3_date"]) as string | undefined;

                          return (
                            <div className="mb-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
                              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                ✅ Service Commencement Approval
                              </h4>
                              {startDateStr && (
                                <p className="text-sm text-muted-foreground mb-3">
                                  Care start date: <span className="font-medium text-foreground">{format(parseLocalDate(startDateStr), "PPP")}</span>
                                </p>
                              )}
                              {famApproved ? (
                                <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-md p-3">
                                  <CheckCircle2 className="h-5 w-5" />
                                  <div>
                                    <p className="font-medium text-sm">Approved — Digital signature recorded</p>
                                    {famApprovalDate && (
                                      <p className="text-xs text-green-600 mt-0.5">
                                        {format(new Date(famApprovalDate), "PPP 'at' p")}
                                      </p>
                                    )}
                                    {famApprovalBy === "admin" && (
                                      <p className="text-xs text-green-600 mt-0.5 italic">Recorded by admin on behalf of family</p>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 rounded-md bg-amber-50 border border-amber-200 p-3">
                                  <Badge variant="secondary" className="text-xs">Pending</Badge>
                                  <span className="text-sm text-amber-800">Family has not yet approved service commencement</span>
                                </div>
                              )}
                              {onToggleApproval && (
                                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                                  <Checkbox
                                    checked={!!famApproved}
                                    onCheckedChange={() => onToggleApproval("family_approval_confirmed")}
                                    className="h-4 w-4"
                                  />
                                  <span className="text-xs text-muted-foreground">Admin toggle — approve on behalf of family</span>
                                </label>
                              )}
                            </div>
                          );
                        })()}

                        {/* Professional: Readiness Approval block */}
                        {showProfessionalData && (() => {
                          const profApproved = checkedItems["professional_approval_confirmed"] === true;
                          const profApprovalDate = checkedItems["professional_approval_date"] as string | undefined;
                          const profApprovalBy = checkedItems["professional_approval_by"] as string | undefined;

                          return (
                            <div className="mb-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
                              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                ✅ Readiness Approval
                              </h4>
                              {profApproved ? (
                                <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-md p-3">
                                  <CheckCircle2 className="h-5 w-5" />
                                  <div>
                                    <p className="font-medium text-sm">Approved — Digital signature recorded</p>
                                    {profApprovalDate && (
                                      <p className="text-xs text-green-600 mt-0.5">
                                        {format(new Date(profApprovalDate), "PPP 'at' p")}
                                      </p>
                                    )}
                                    {profApprovalBy === "admin" ? (
                                      <p className="text-xs text-green-600 mt-0.5 italic">Recorded by admin on behalf of professional</p>
                                    ) : (
                                      <p className="text-xs text-green-600 mt-0.5 italic">Self-approved by professional</p>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 rounded-md bg-amber-50 border border-amber-200 p-3">
                                  <Badge variant="secondary" className="text-xs">Pending</Badge>
                                  <span className="text-sm text-amber-800">Professional has not yet confirmed readiness</span>
                                </div>
                              )}
                              {onToggleApproval && (
                                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                                  <Checkbox
                                    checked={!!profApproved}
                                    onCheckedChange={() => onToggleApproval("professional_approval_confirmed")}
                                    className="h-4 w-4"
                                  />
                                  <span className="text-xs text-muted-foreground">Admin toggle — approve on behalf of professional</span>
                                </label>
                              )}
                            </div>
                          );
                        })()}
                      </>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}

        {/* Copy link helpers for admin */}
        <div className="flex flex-wrap gap-2 mb-2">
          <Button variant="outline" size="sm" onClick={copyNotesLink} className="gap-1 text-xs">
            <Copy className="h-3.5 w-3.5" />
            Copy Notes Link
          </Button>
          <Button variant="outline" size="sm" onClick={copyPostOnboardingLink} className="gap-1 text-xs">
            <Copy className="h-3.5 w-3.5" />
            Copy Post-Onboarding Link
          </Button>
        </div>

        <OnboardingNotesCard
          notes={notes}
          onAddNote={handleAddNote}
          onEditNote={handleEditNote}
          onDeleteNote={handleDeleteNote}
          onCompleteNote={handleCompleteNote}
        />
      </div>
    </>
  );
}

export default function AdminOnboardingChecklistPage() {
  const navigate = useNavigate();

  // Family state
  const [families, setFamilies] = useState<ProfileOption[]>([]);
  const [loadingFamilies, setLoadingFamilies] = useState(true);
  const [selectedFamilyId, setSelectedFamilyId] = useState("");
  const [familyCheckedItems, setFamilyCheckedItems] = useState<Record<string, boolean | string>>({});
  const [familyNotes, setFamilyNotes] = useState<OnboardingNote[]>([]);
  const [familyOpenSections, setFamilyOpenSections] = useState<Record<string, boolean>>({});
  const [familyMedications, setFamilyMedications] = useState<Array<{ id: string; name: string; dosage?: string; medication_type?: string; instructions?: string; schedule?: any }>>([]);
  const [familyCarePlanId, setFamilyCarePlanId] = useState<string | null>(null);
  const [selectedCaregiverWeeklyHours, setSelectedCaregiverWeeklyHours] = useState<number>(40);
  const familySaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Professional state
  const [professionals, setProfessionals] = useState<ProfileOption[]>([]);
  const [loadingProfessionals, setLoadingProfessionals] = useState(true);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState("");
  const [profCheckedItems, setProfCheckedItems] = useState<Record<string, boolean | string>>({});
  const [profNotes, setProfNotes] = useState<OnboardingNote[]>([]);
  const [profOpenSections, setProfOpenSections] = useState<Record<string, boolean>>({});
  const profSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [profAssignedFamilyId, setProfAssignedFamilyId] = useState("");
  const [linkedFamilyCheckedItems, setLinkedFamilyCheckedItems] = useState<Record<string, boolean | string>>({});

  // Load families
  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, care_schedule")
          .eq("role", "family")
          .order("full_name");
        if (error) throw error;
        setFamilies(data || []);
      } catch (err) {
        console.error("Failed to load families:", err);
      } finally {
        setLoadingFamilies(false);
      }
    };
    load();
  }, []);

  // Load professionals
  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name")
          .eq("role", "professional")
          .order("full_name");
        if (error) throw error;
        setProfessionals(data || []);
      } catch (err) {
        console.error("Failed to load professionals:", err);
      } finally {
        setLoadingProfessionals(false);
      }
    };
    load();
  }, []);

  // Load family checklist
  useEffect(() => {
    if (!selectedFamilyId) {
      setFamilyCheckedItems({});
      setFamilyNotes([]);
      return;
    }
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("onboarding_checklists")
          .select("checked_items, notes")
          .eq("family_id", selectedFamilyId)
          .maybeSingle();
        if (error) throw error;
        if (data) {
          setFamilyCheckedItems((data.checked_items as unknown as Record<string, boolean>) || {});
          setFamilyNotes((data.notes as unknown as OnboardingNote[]) || []);
        } else {
          setFamilyCheckedItems({});
          setFamilyNotes([]);
        }
      } catch (err) {
        console.error("Failed to load family checklist:", err);
        setFamilyCheckedItems({});
        setFamilyNotes([]);
      }
    };
    load();
  }, [selectedFamilyId]);

  // Load family medications and care plan ID
  useEffect(() => {
    if (!selectedFamilyId) {
      setFamilyMedications([]);
      setFamilyCarePlanId(null);
      return;
    }
    const loadMeds = async () => {
      try {
        const { data: carePlans } = await supabase
          .from("care_plans")
          .select("id, status")
          .eq("family_id", selectedFamilyId)
          .in("status", ["active", "draft", "pending"]);
        if (!carePlans || carePlans.length === 0) {
          setFamilyMedications([]);
          setFamilyCarePlanId(null);
          return;
        }
        // Prefer active plans, fall back to draft/pending
        const activePlan = carePlans.find(cp => cp.status === 'active');
        const bestPlan = activePlan || carePlans[0];
        setFamilyCarePlanId(bestPlan.id);
        const carePlanIds = carePlans.map(cp => cp.id);
        const { data: meds, error } = await supabase
          .from("medications")
          .select("id, name, dosage, medication_type, instructions, schedule")
          .in("care_plan_id", carePlanIds)
          .order("name");
        if (error) throw error;
        setFamilyMedications(meds || []);
      } catch (err) {
        console.error("Failed to load family medications:", err);
        setFamilyMedications([]);
        setFamilyCarePlanId(null);
      }
    };
    loadMeds();
  }, [selectedFamilyId]);


  useEffect(() => {
    if (!selectedProfessionalId) {
      setProfCheckedItems({});
      setProfNotes([]);
      setProfAssignedFamilyId("");
      return;
    }
    // If no family selected yet, try to load the first checklist for this professional
    const load = async () => {
      try {
        if (profAssignedFamilyId) {
          // Load checklist for specific professional+family pair
          const { data, error } = await supabase
            .from("professional_onboarding_checklists")
            .select("checked_items, notes, family_id")
            .eq("professional_id", selectedProfessionalId)
            .eq("family_id", profAssignedFamilyId)
            .maybeSingle();
          if (error) throw error;
          if (data) {
            const items = (data.checked_items as unknown as Record<string, boolean | string>) || {};
            setProfCheckedItems(items);
            setProfNotes((data.notes as unknown as OnboardingNote[]) || []);
          } else {
            setProfCheckedItems({});
            setProfNotes([]);
          }
        } else {
          // No family selected — load first available checklist to get the assigned family
          const { data, error } = await supabase
            .from("professional_onboarding_checklists")
            .select("checked_items, notes, family_id")
            .eq("professional_id", selectedProfessionalId)
            .limit(1)
            .maybeSingle();
          if (error) throw error;
          if (data) {
            const items = (data.checked_items as unknown as Record<string, boolean | string>) || {};
            setProfCheckedItems(items);
            setProfNotes((data.notes as unknown as OnboardingNote[]) || []);
            // Set the family from the DB column or fallback to JSON
            const familyFromDb = data.family_id as string | null;
            const familyFromJson = (items.assigned_family_id as string) || "";
            setProfAssignedFamilyId(familyFromDb || familyFromJson);
          } else {
            setProfCheckedItems({});
            setProfNotes([]);
            setProfAssignedFamilyId("");
          }
        }
      } catch (err) {
        console.error("Failed to load professional checklist:", err);
        setProfCheckedItems({});
        setProfNotes([]);
      }
    };
    load();
  }, [selectedProfessionalId, profAssignedFamilyId]);

  // Load linked family's checklist data when assigned family changes
  useEffect(() => {
    if (!profAssignedFamilyId) {
      setLinkedFamilyCheckedItems({});
      return;
    }
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("onboarding_checklists")
          .select("checked_items")
          .eq("family_id", profAssignedFamilyId)
          .maybeSingle();
        if (error) throw error;
        setLinkedFamilyCheckedItems(
          (data?.checked_items as unknown as Record<string, boolean | string>) || {}
        );
      } catch {
        setLinkedFamilyCheckedItems({});
      }
    };
    load();
  }, [profAssignedFamilyId]);

  // Family save
  const saveFamilyToSupabase = useCallback(
    (items: Record<string, boolean | string>, notesList: OnboardingNote[]) => {
      if (!selectedFamilyId) return;
      if (familySaveTimerRef.current) clearTimeout(familySaveTimerRef.current);
      familySaveTimerRef.current = setTimeout(async () => {
        try {
          const { error } = await supabase
            .from("onboarding_checklists")
            .upsert(
              {
                family_id: selectedFamilyId,
                checked_items: items as unknown as Record<string, never>,
                notes: notesList as unknown as Record<string, never>[],
              },
              { onConflict: "family_id" }
            );
          if (error) throw error;
        } catch (err) {
          console.error("Failed to save family checklist:", err);
        }
      }, 800);
    },
    [selectedFamilyId]
  );

  // Professional save — now uses family_id for composite unique
  const saveProfToSupabase = useCallback(
    (items: Record<string, boolean | string>, notesList: OnboardingNote[]) => {
      if (!selectedProfessionalId || !profAssignedFamilyId) return;
      if (profSaveTimerRef.current) clearTimeout(profSaveTimerRef.current);
      profSaveTimerRef.current = setTimeout(async () => {
        try {
          const { error } = await supabase
            .from("professional_onboarding_checklists")
            .upsert(
              {
                professional_id: selectedProfessionalId,
                family_id: profAssignedFamilyId,
                checked_items: items as unknown as Record<string, never>,
                notes: notesList as unknown as Record<string, never>[],
              },
              { onConflict: "professional_id,family_id" }
            );
          if (error) throw error;
        } catch (err) {
          console.error("Failed to save professional checklist:", err);
        }
      }, 800);
    },
    [selectedProfessionalId, profAssignedFamilyId]
  );

  const toggleFamilyItem = (sectionId: string, index: number) => {
    const itemKey = `${sectionId}_${index}`;
    setFamilyCheckedItems((prev) => {
      const next = { ...prev, [itemKey]: !prev[itemKey] };
      saveFamilyToSupabase(next, familyNotes);
      return next;
    });
  };

  const toggleProfItem = (sectionId: string, index: number) => {
    const itemKey = `${sectionId}_${index}`;
    setProfCheckedItems((prev) => {
      const next = { ...prev, [itemKey]: !prev[itemKey] };
      saveProfToSupabase(next, profNotes);
      return next;
    });
  };

  const handleFamilyAddNote = (note: OnboardingNote) => {
    setFamilyNotes((prev) => {
      const next = [...prev, note];
      saveFamilyToSupabase(familyCheckedItems, next);
      return next;
    });
  };

  const handleFamilyEditNote = (index: number, updatedNote: OnboardingNote) => {
    setFamilyNotes((prev) => {
      const next = [...prev];
      next[index] = updatedNote;
      saveFamilyToSupabase(familyCheckedItems, next);
      return next;
    });
  };

  const handleFamilyDeleteNote = (index: number) => {
    setFamilyNotes((prev) => {
      const next = prev.filter((_, i) => i !== index);
      saveFamilyToSupabase(familyCheckedItems, next);
      return next;
    });
  };

  const handleFamilyCompleteNote = (index: number) => {
    setFamilyNotes((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], completed_at: new Date().toISOString(), completed_by: "Admin" };
      saveFamilyToSupabase(familyCheckedItems, next);
      return next;
    });
  };

  const handleProfAddNote = (note: OnboardingNote) => {
    setProfNotes((prev) => {
      const next = [...prev, note];
      saveProfToSupabase(profCheckedItems, next);
      return next;
    });
  };

  const handleProfEditNote = (index: number, updatedNote: OnboardingNote) => {
    setProfNotes((prev) => {
      const next = [...prev];
      next[index] = updatedNote;
      saveProfToSupabase(profCheckedItems, next);
      return next;
    });
  };

  const handleProfDeleteNote = (index: number) => {
    setProfNotes((prev) => {
      const next = prev.filter((_, i) => i !== index);
      saveProfToSupabase(profCheckedItems, next);
      return next;
    });
  };

  const handleProfCompleteNote = (index: number) => {
    setProfNotes((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], completed_at: new Date().toISOString(), completed_by: "Admin" };
      saveProfToSupabase(profCheckedItems, next);
      return next;
    });
  };

  const familyTotalItems = getTotalItems();
  const familyTotalChecked = ONBOARDING_SECTION_DEFS.reduce((sum, section) => {
    return sum + section.items.filter((_, i) => !!familyCheckedItems[`${section.id}_${i}`]).length;
  }, 0);
  const profTotalItems = getProfessionalTotalItems();
  const profTotalChecked = PROFESSIONAL_ONBOARDING_SECTION_DEFS.reduce((sum, section) => {
    return sum + section.items.filter((_, i) => !!profCheckedItems[`${section.id}_${i}`]).length;
  }, 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/admin")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Onboarding Checklist</h1>
          <p className="text-sm text-muted-foreground">
            Structured guide for onboarding calls with new families and professionals
          </p>
        </div>
      </div>

      <Tabs defaultValue="family" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="family">Family</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
        </TabsList>

        <TabsContent value="family">
          {selectedFamilyId && (
            <Card className="mb-4">
              <CardContent className="pt-4 pb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold">Billing Configuration</h3>
                    <p className="text-xs text-muted-foreground">Set the service start date and billing cadence for this family</p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs whitespace-nowrap">Start Date</Label>
                      <input
                        type="date"
                        className="border rounded px-2 py-1 text-sm"
                        value={familyCheckedItems.billing_start_date as string || ''}
                        onChange={(e) => {
                          const next = { ...familyCheckedItems, billing_start_date: e.target.value };
                          setFamilyCheckedItems(next);
                          saveFamilyToSupabase(next, familyNotes);
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs whitespace-nowrap">Cadence</Label>
                      <Select
                        value={(familyCheckedItems.billing_cadence as string) || 'weekly'}
                        onValueChange={(v) => {
                          const next = { ...familyCheckedItems, billing_cadence: v };
                          setFamilyCheckedItems(next);
                          saveFamilyToSupabase(next, familyNotes);
                        }}
                      >
                        <SelectTrigger className="w-[120px] h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {selectedFamilyId && (
            <Card className="mb-4">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Billing Documents</h3>
                    <p className="text-xs text-muted-foreground">Generate a quote, invoice, or receipt for this family</p>
                  </div>
                  <DocumentGenerationMenu
                    familyName={families.find(f => f.id === selectedFamilyId)?.full_name || 'Family'}
                    carePlanTitle="Care Services"
                    careRate={(familyCheckedItems["care_rate"] as string) || undefined}
                    weeklyHours={getWeeklyHoursFromSchedule(
                      families.find(f => f.id === selectedFamilyId)?.care_schedule || undefined
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}
          <ChecklistTabContent
            profiles={families}
            loadingProfiles={loadingFamilies}
            selectedId={selectedFamilyId}
            setSelectedId={setSelectedFamilyId}
            checkedItems={familyCheckedItems}
            toggleItem={toggleFamilyItem}
            onDateChange={(key, value) => {
              const next = { ...familyCheckedItems, [key]: value };
              setFamilyCheckedItems(next);
              saveFamilyToSupabase(next, familyNotes);
            }}
            notes={familyNotes}
            handleAddNote={handleFamilyAddNote}
            handleEditNote={handleFamilyEditNote}
            handleDeleteNote={handleFamilyDeleteNote}
            handleCompleteNote={handleFamilyCompleteNote}
            openSections={familyOpenSections}
            toggleSection={(id) => setFamilyOpenSections((prev) => ({ ...prev, [id]: !prev[id] }))}
            handleReset={() => {
              if (window.confirm("Reset all checkboxes and notes for this family onboarding session?")) {
                setFamilyCheckedItems({});
                setFamilyNotes([]);
                saveFamilyToSupabase({}, []);
              }
            }}
            sectionDefs={ONBOARDING_SECTION_DEFS}
            totalItems={familyTotalItems}
            totalChecked={familyTotalChecked}
            profileLabel="Family"
            tableName="onboarding_checklists"
            idColumn="family_id"
            showFamilyData
            familyMedications={familyMedications}
            familyCarePlanId={familyCarePlanId}
            onToggleApproval={(approvalKey) => {
              setFamilyCheckedItems((prev) => {
                const isCurrentlyApproved = prev[approvalKey] === true;
                const next = {
                  ...prev,
                  [approvalKey]: !isCurrentlyApproved,
                  family_approval_date: !isCurrentlyApproved ? new Date().toISOString() : undefined,
                  family_approval_by: !isCurrentlyApproved ? "admin" : undefined,
                };
                if (isCurrentlyApproved) {
                  delete next.family_approval_date;
                  delete next.family_approval_by;
                }
                saveFamilyToSupabase(next, familyNotes);
                return next;
              });
            }}
            onDownloadReport={selectedFamilyId ? () => {
              const familyName = families.find(f => f.id === selectedFamilyId)?.full_name || "Family";
              generateFamilyReport(familyName, familyCheckedItems, familyNotes, ONBOARDING_SECTION_DEFS);
            } : undefined}
          />
        </TabsContent>

        <TabsContent value="professional">
          {selectedProfessionalId && (
            <Card className="mb-4">
              <CardContent className="pt-4 pb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="assignedFamilySelect">Assigned Family</Label>
                    <Select
                      value={profAssignedFamilyId}
                      onValueChange={(val) => {
                        // Changing family will trigger the useEffect to load
                        // the checklist for this professional+family pair
                        setProfAssignedFamilyId(val);
                      }}
                    >
                      <SelectTrigger id="assignedFamilySelect">
                        <SelectValue placeholder="Link this professional to a family" />
                      </SelectTrigger>
                      <SelectContent>
                        {families.map((f) => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.full_name || "Unnamed family"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {profAssignedFamilyId && (
                      <p className="text-xs text-muted-foreground">
                        Linked to: <span className="font-medium">{families.find(f => f.id === profAssignedFamilyId)?.full_name || profAssignedFamilyId}</span>
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          <ChecklistTabContent
            profiles={professionals}
            loadingProfiles={loadingProfessionals}
            selectedId={selectedProfessionalId}
            setSelectedId={setSelectedProfessionalId}
            checkedItems={profCheckedItems}
            toggleItem={toggleProfItem}
            onDateChange={(key, value) => {
              const next = { ...profCheckedItems, [key]: value };
              setProfCheckedItems(next);
              saveProfToSupabase(next, profNotes);
            }}
            notes={profNotes}
            handleAddNote={handleProfAddNote}
            handleEditNote={handleProfEditNote}
            handleDeleteNote={handleProfDeleteNote}
            handleCompleteNote={handleProfCompleteNote}
            openSections={profOpenSections}
            toggleSection={(id) => setProfOpenSections((prev) => ({ ...prev, [id]: !prev[id] }))}
            handleReset={() => {
              if (window.confirm("Reset all checkboxes and notes for this professional onboarding session?")) {
                setProfCheckedItems({});
                setProfNotes([]);
                setProfAssignedFamilyId("");
                saveProfToSupabase({}, []);
              }
            }}
            sectionDefs={PROFESSIONAL_ONBOARDING_SECTION_DEFS}
            totalItems={profTotalItems}
            totalChecked={profTotalChecked}
            profileLabel="Professional"
            tableName="professional_onboarding_checklists"
            idColumn="professional_id"
            showProfessionalData
            linkedCheckedItems={linkedFamilyCheckedItems}
            assignedFamilyName={families.find(f => f.id === profAssignedFamilyId)?.full_name}
            onToggleApproval={(approvalKey) => {
              setProfCheckedItems((prev) => {
                const isCurrentlyApproved = prev[approvalKey] === true;
                const next = {
                  ...prev,
                  [approvalKey]: !isCurrentlyApproved,
                  professional_approval_date: !isCurrentlyApproved ? new Date().toISOString() : undefined,
                  professional_approval_by: !isCurrentlyApproved ? "admin" : undefined,
                };
                if (isCurrentlyApproved) {
                  delete next.professional_approval_date;
                  delete next.professional_approval_by;
                }
                saveProfToSupabase(next, profNotes);
                return next;
              });
            }}
            onDownloadReport={selectedProfessionalId ? () => {
              const profName = professionals.find(p => p.id === selectedProfessionalId)?.full_name || "Professional";
              const familyName = families.find(f => f.id === profAssignedFamilyId)?.full_name || "";
              generateProfessionalReport(profName, familyName, profCheckedItems, linkedFamilyCheckedItems, profNotes, PROFESSIONAL_ONBOARDING_SECTION_DEFS);
            } : undefined}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
