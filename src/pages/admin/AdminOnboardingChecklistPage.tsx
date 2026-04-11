
import React, { useState, useEffect, useCallback, useRef } from "react";
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
import OnboardingNotesCard, { OnboardingNote } from "@/components/admin/onboarding/OnboardingNotesCard";
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
          <span className="font-medium">$35/hr (Standard)</span>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">Plan:</span>{" "}
          <span className="font-medium">Tavara Family Care Plan (weekly)</span>
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
  const M = 12; // margin
  let y = M;

  // --- Header ---
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(30, 64, 120);
  pdf.text("TAVARA.CARE — Family Onboarding Report", M, y);
  y += 6;
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(80);
  pdf.text(`Family: ${familyName}    |    Generated: ${format(new Date(), "PPP")}`, M, y);
  y += 7;

  // --- Divider ---
  pdf.setDrawColor(200);
  pdf.line(M, y, W - M, y);
  y += 5;

  // --- Care Summary ---
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(30, 64, 120);
  pdf.text("Care Summary", M, y);
  y += 5;

  const startDateStr = checkedItems["post_onboarding_3_date"] as string | undefined;
  const startDateFmt = startDateStr ? format(parseLocalDate(startDateStr), "PPP") : "Not set";

  pdf.setFontSize(8.5);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(50);
  const summaryLines = [
    `Rate: $35/hr (Standard)   |   Plan: Tavara Family Care Plan (weekly)   |   Start Date: ${startDateFmt}`,
    `Payment: Weekly (due every Friday)   |   Late Fee: 5% after 3 business days   |   Holiday/OT: 1.5x (2x Christmas)`,
  ];
  summaryLines.forEach((line) => {
    pdf.text(line, M, y);
    y += 4;
  });
  y += 3;

  // --- Onboarding Progress ---
  let totalChecked = 0;
  let totalItems = 0;
  sectionDefs.forEach((s) => {
    s.items.forEach((_, i) => {
      totalItems++;
      if (checkedItems[`${s.id}_${i}`]) totalChecked++;
    });
  });
  const pct = totalItems ? Math.round((totalChecked / totalItems) * 100) : 0;

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(30, 64, 120);
  pdf.text(`Onboarding Progress: ${totalChecked}/${totalItems} (${pct}%)`, M, y);
  y += 5;

  // Two-column section listing
  const colW = (W - M * 2 - 8) / 2;
  const startY = y;
  let col = 0;
  let colY = startY;

  pdf.setFontSize(8);
  sectionDefs.forEach((section) => {
    let checked = 0;
    section.items.forEach((_, i) => {
      if (checkedItems[`${section.id}_${i}`]) checked++;
    });
    const total = section.items.length;
    const isComplete = checked === total && total > 0;
    const icon = isComplete ? "✓" : "○";
    const x = M + col * (colW + 8);

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(isComplete ? 34 : 100, isComplete ? 139 : 100, isComplete ? 34 : 100);
    pdf.text(`${icon}  ${section.title}`, x, colY);

    pdf.setTextColor(120);
    pdf.text(`${checked}/${total}`, x + colW - 2, colY, { align: "right" });

    colY += 4.2;
    if (colY > startY + (sectionDefs.length / 2) * 4.2 + 2 && col === 0) {
      col = 1;
      colY = startY;
    }
  });

  y = startY + Math.ceil(sectionDefs.length / 2) * 4.2 + 3;

  // --- Key Dates ---
  const introDate = checkedItems["post_onboarding_1_date"] as string | undefined;
  const meetingDate = checkedItems["post_onboarding_2_date"] as string | undefined;

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(30, 64, 120);
  pdf.text("Key Dates", M, y);
  y += 5;

  pdf.setFontSize(8.5);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(50);
  const dates = [
    `Introduction: ${introDate ? format(parseLocalDate(introDate), "PPP") : "Not set"}`,
    `Meeting: ${meetingDate ? format(parseLocalDate(meetingDate), "PPP") : "Not set"}`,
    `Start: ${startDateFmt}`,
  ].join("   |   ");
  pdf.text(dates, M, y);
  y += 7;

  // --- Notes ---
  if (notes.length > 0) {
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(30, 64, 120);
    pdf.text("Onboarding Notes", M, y);
    y += 5;

    pdf.setFontSize(7.5);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(60);
    const maxNotes = Math.min(notes.length, 8);
    for (let i = 0; i < maxNotes; i++) {
      const note = notes[i];
      const dateFmt = format(new Date(note.created_at), "MMM d");
      const truncated = note.text.length > 100 ? note.text.substring(0, 100) + "…" : note.text;
      const line = `•  [${dateFmt}] [${note.assigned_to}] ${truncated}`;
      if (y > H - 12) break; // prevent overflow
      pdf.text(line, M, y);
      y += 3.8;
    }
    if (notes.length > maxNotes) {
      pdf.text(`   ... and ${notes.length - maxNotes} more notes`, M, y);
      y += 3.8;
    }
  }

  // --- Footer ---
  pdf.setFontSize(7);
  pdf.setTextColor(150);
  pdf.text("Generated from tavara.care/admin/onboarding-checklist", M, H - 5);
  pdf.text(`Page 1 of 1`, W - M, H - 5, { align: "right" });

  // Download
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
  const M = 12;
  let y = M;

  // --- Header ---
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(30, 64, 120);
  pdf.text("TAVARA.CARE — Professional Onboarding Report", M, y);
  y += 6;
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(80);
  pdf.text(`Professional: ${professionalName}    |    Assigned Family: ${assignedFamilyName || "Not assigned"}    |    Generated: ${format(new Date(), "PPP")}`, M, y);
  y += 7;

  pdf.setDrawColor(200);
  pdf.line(M, y, W - M, y);
  y += 5;

  // --- Care Summary ---
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(30, 64, 120);
  pdf.text("Care Summary", M, y);
  y += 5;

  const startDateStr = (linkedFamilyCheckedItems["post_onboarding_3_date"] || checkedItems["post_onboarding_3_date"]) as string | undefined;
  const startDateFmt = startDateStr ? format(parseLocalDate(startDateStr), "PPP") : "Not set";

  pdf.setFontSize(8.5);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(50);
  const summaryLines = [
    `Rate: $35/hr (Standard)   |   Plan: Tavara Family Care Plan (weekly)   |   Start Date: ${startDateFmt}`,
    `Payment: Weekly by Tavara (every Friday)   |   Processing: Up to 3 business days   |   Holiday/OT: 1.5x (2x Christmas)`,
    `NIS: Covered by Tavara   |   Probationary Period: 30 days   |   Rotation Pool: Yes`,
  ];
  summaryLines.forEach((line) => {
    pdf.text(line, M, y);
    y += 4;
  });
  y += 3;

  // --- Terms & Conditions Status ---
  const tcSection = sectionDefs.find((s) => s.id === "terms_conditions");
  if (tcSection) {
    let tcChecked = 0;
    tcSection.items.forEach((_, i) => {
      if (checkedItems[`terms_conditions_${i}`]) tcChecked++;
    });
    const allAccepted = tcChecked === tcSection.items.length;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(allAccepted ? 34 : 180, allAccepted ? 139 : 50, allAccepted ? 34 : 50);
    pdf.text(`Terms & Conditions: ${allAccepted ? "ALL ACCEPTED ✓" : `${tcChecked}/${tcSection.items.length} acknowledged`}`, M, y);
    y += 5;

    pdf.setFontSize(7.5);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(60);
    tcSection.items.forEach((item, i) => {
      const checked = !!checkedItems[`terms_conditions_${i}`];
      const icon = checked ? "✓" : "○";
      pdf.setTextColor(checked ? 34 : 150, checked ? 139 : 150, checked ? 34 : 150);
      const truncated = item.length > 90 ? item.substring(0, 90) + "…" : item;
      pdf.text(`${icon}  ${truncated}`, M + 2, y);
      y += 3.5;
    });
    y += 2;
  }

  // --- Onboarding Progress ---
  let totalChecked = 0;
  let totalItems = 0;
  sectionDefs.forEach((s) => {
    s.items.forEach((_, i) => {
      totalItems++;
      if (checkedItems[`${s.id}_${i}`]) totalChecked++;
    });
  });
  const pct = totalItems ? Math.round((totalChecked / totalItems) * 100) : 0;

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(30, 64, 120);
  pdf.text(`Onboarding Progress: ${totalChecked}/${totalItems} (${pct}%)`, M, y);
  y += 5;

  const colW = (W - M * 2 - 8) / 2;
  const startY = y;
  let col = 0;
  let colY = startY;

  pdf.setFontSize(8);
  sectionDefs.forEach((section) => {
    let checked = 0;
    section.items.forEach((_, i) => {
      if (checkedItems[`${section.id}_${i}`]) checked++;
    });
    const total = section.items.length;
    const isComplete = checked === total && total > 0;
    const icon = isComplete ? "✓" : "○";
    const x = M + col * (colW + 8);

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(isComplete ? 34 : 100, isComplete ? 139 : 100, isComplete ? 34 : 100);
    pdf.text(`${icon}  ${section.title}`, x, colY);
    pdf.setTextColor(120);
    pdf.text(`${checked}/${total}`, x + colW - 2, colY, { align: "right" });

    colY += 4.2;
    if (colY > startY + (sectionDefs.length / 2) * 4.2 + 2 && col === 0) {
      col = 1;
      colY = startY;
    }
  });

  y = startY + Math.ceil(sectionDefs.length / 2) * 4.2 + 3;

  // --- Key Dates ---
  const introDate = checkedItems["post_onboarding_1_date"] as string | undefined;
  const meetingDate = checkedItems["post_onboarding_2_date"] as string | undefined;

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(30, 64, 120);
  pdf.text("Key Dates", M, y);
  y += 5;

  pdf.setFontSize(8.5);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(50);
  const dates = [
    `Introduction: ${introDate ? format(parseLocalDate(introDate), "PPP") : "Not set"}`,
    `Meeting: ${meetingDate ? format(parseLocalDate(meetingDate), "PPP") : "Not set"}`,
    `Start: ${startDateFmt}`,
  ].join("   |   ");
  pdf.text(dates, M, y);
  y += 7;

  // --- Notes ---
  if (notes.length > 0 && y < H - 20) {
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(30, 64, 120);
    pdf.text("Onboarding Notes", M, y);
    y += 5;

    pdf.setFontSize(7.5);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(60);
    const maxNotes = Math.min(notes.length, 6);
    for (let i = 0; i < maxNotes; i++) {
      const note = notes[i];
      const dateFmt = format(new Date(note.created_at), "MMM d");
      const truncated = note.text.length > 100 ? note.text.substring(0, 100) + "…" : note.text;
      if (y > H - 12) break;
      pdf.text(`•  [${dateFmt}] [${note.assigned_to}] ${truncated}`, M, y);
      y += 3.8;
    }
  }

  // --- Footer ---
  pdf.setFontSize(7);
  pdf.setTextColor(150);
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
}) {
  const publicGuideUrl = `${window.location.origin}/onboarding-guide`;
  const copyPublicLink = () => {
    navigator.clipboard.writeText(publicGuideUrl);
    toast.success("Public onboarding guide link copied!");
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
                              {dateFieldLabel && onDateChange && (
                                <DateFieldPicker
                                  dateFieldLabel={dateFieldLabel}
                                  storedDate={storedDate}
                                  onDateChange={(val) => onDateChange(dateKey, val)}
                                />
                              )}
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
                            <div key={idx} className="bg-muted/50 rounded-lg p-3">
                              <p className="font-medium text-sm mb-2">{sopSection.title}</p>
                              <ul className="space-y-1">
                                {sopSection.items.map((item, j) => (
                                  <li key={j} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                    <span className="text-primary mt-0.5">•</span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(section.id === "rates_payment" || section.id === "rates_and_changes") && (
                      <RateTierReferenceCard />
                    )}

                    {section.id === "post_onboarding" && (
                      <CareSummaryHeader checkedItems={checkedItems} />
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}

        <OnboardingNotesCard notes={notes} onAddNote={handleAddNote} />
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
          .select("id, full_name")
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

  // Load professional checklist
  useEffect(() => {
    if (!selectedProfessionalId) {
      setProfCheckedItems({});
      setProfNotes([]);
      setProfAssignedFamilyId("");
      return;
    }
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("professional_onboarding_checklists")
          .select("checked_items, notes")
          .eq("professional_id", selectedProfessionalId)
          .maybeSingle();
        if (error) throw error;
        if (data) {
          const items = (data.checked_items as unknown as Record<string, boolean | string>) || {};
          setProfCheckedItems(items);
          setProfNotes((data.notes as unknown as OnboardingNote[]) || []);
          setProfAssignedFamilyId((items.assigned_family_id as string) || "");
        } else {
          setProfCheckedItems({});
          setProfNotes([]);
          setProfAssignedFamilyId("");
        }
      } catch (err) {
        console.error("Failed to load professional checklist:", err);
        setProfCheckedItems({});
        setProfNotes([]);
        setProfAssignedFamilyId("");
      }
    };
    load();
  }, [selectedProfessionalId]);

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

  // Professional save
  const saveProfToSupabase = useCallback(
    (items: Record<string, boolean | string>, notesList: OnboardingNote[]) => {
      if (!selectedProfessionalId) return;
      if (profSaveTimerRef.current) clearTimeout(profSaveTimerRef.current);
      profSaveTimerRef.current = setTimeout(async () => {
        try {
          const { error } = await supabase
            .from("professional_onboarding_checklists")
            .upsert(
              {
                professional_id: selectedProfessionalId,
                checked_items: items as unknown as Record<string, never>,
                notes: notesList as unknown as Record<string, never>[],
              },
              { onConflict: "professional_id" }
            );
          if (error) throw error;
        } catch (err) {
          console.error("Failed to save professional checklist:", err);
        }
      }, 800);
    },
    [selectedProfessionalId]
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

  const handleProfAddNote = (note: OnboardingNote) => {
    setProfNotes((prev) => {
      const next = [...prev, note];
      saveProfToSupabase(profCheckedItems, next);
      return next;
    });
  };

  const familyTotalItems = getTotalItems();
  const familyTotalChecked = Object.values(familyCheckedItems).filter(Boolean).length;
  const profTotalItems = getProfessionalTotalItems();
  const profTotalChecked = Object.values(profCheckedItems).filter(Boolean).length;

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
                        setProfAssignedFamilyId(val);
                        const next = { ...profCheckedItems, assigned_family_id: val };
                        setProfCheckedItems(next);
                        saveProfToSupabase(next, profNotes);
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
