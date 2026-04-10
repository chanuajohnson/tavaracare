
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ArrowLeft, ChevronDown, RotateCcw, ClipboardCheck, Monitor, FileText,
  Pill, UtensilsCrossed, ListChecks, LayoutDashboard, MessageSquare,
  Heart, Users, ExternalLink, CalendarCheck, PhoneForwarded
} from "lucide-react";
import { CHECKLIST_SECTIONS } from "@/components/professional/checklist/checklistSections";

const STORAGE_KEY_PREFIX = "tavara_onboarding_checklist_";

interface OnboardingSectionLink {
  label: string;
  url: string;
  icon: React.ReactNode;
}

interface OnboardingSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  items: string[];
  links?: OnboardingSectionLink[];
}

const ONBOARDING_SECTIONS: OnboardingSection[] = [
  {
    id: "pre_call",
    title: "Pre-Call Preparation",
    icon: <ClipboardCheck className="h-5 w-5" />,
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
    icon: <Heart className="h-5 w-5" />,
    description: "Review what the family already submitted — registration, care assessment, and legacy story",
    links: [
      { label: "View Registration", url: "/registration/family", icon: <ExternalLink className="h-4 w-4" /> },
      { label: "View Care Assessment", url: "/family/care-assessment?mode=edit", icon: <ExternalLink className="h-4 w-4" /> },
      { label: "View Legacy Story", url: "/family/story", icon: <ExternalLink className="h-4 w-4" /> },
    ],
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
    icon: <Monitor className="h-5 w-5" />,
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
    icon: <FileText className="h-5 w-5" />,
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
    icon: <Pill className="h-5 w-5" />,
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
    icon: <UtensilsCrossed className="h-5 w-5" />,
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
    icon: <ListChecks className="h-5 w-5" />,
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
    icon: <LayoutDashboard className="h-5 w-5" />,
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
    icon: <Users className="h-5 w-5" />,
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
    id: "next_steps",
    title: "Next Steps & Follow-Up",
    icon: <CalendarCheck className="h-5 w-5" />,
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
    icon: <MessageSquare className="h-5 w-5" />,
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

export default function AdminOnboardingChecklistPage() {
  const navigate = useNavigate();
  const [familyName, setFamilyName] = useState("");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (familyName.trim()) {
      const key = STORAGE_KEY_PREFIX + familyName.trim().toLowerCase().replace(/\s+/g, "_");
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          setCheckedItems(JSON.parse(saved));
        } catch {
          setCheckedItems({});
        }
      } else {
        setCheckedItems({});
      }
    }
  }, [familyName]);

  useEffect(() => {
    if (familyName.trim() && Object.keys(checkedItems).length > 0) {
      const key = STORAGE_KEY_PREFIX + familyName.trim().toLowerCase().replace(/\s+/g, "_");
      localStorage.setItem(key, JSON.stringify(checkedItems));
    }
  }, [checkedItems, familyName]);

  const toggleItem = (sectionId: string, index: number) => {
    const itemKey = `${sectionId}_${index}`;
    setCheckedItems((prev) => ({ ...prev, [itemKey]: !prev[itemKey] }));
  };

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const getSectionProgress = (section: OnboardingSection) => {
    let checked = 0;
    section.items.forEach((_, i) => {
      if (checkedItems[`${section.id}_${i}`]) checked++;
    });
    return { checked, total: section.items.length };
  };

  const totalItems = ONBOARDING_SECTIONS.reduce((sum, s) => sum + s.items.length, 0);
  const totalChecked = Object.values(checkedItems).filter(Boolean).length;

  const handleReset = () => {
    if (window.confirm("Reset all checkboxes for this onboarding session?")) {
      setCheckedItems({});
      if (familyName.trim()) {
        const key = STORAGE_KEY_PREFIX + familyName.trim().toLowerCase().replace(/\s+/g, "_");
        localStorage.removeItem(key);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/admin")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Family Onboarding Checklist</h1>
          <p className="text-sm text-muted-foreground">
            Structured guide for onboarding calls with new families
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="familyName">Family Name</Label>
              <Input
                id="familyName"
                placeholder="e.g. Ana Marie"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
              />
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
        {ONBOARDING_SECTIONS.map((section) => {
          const { checked, total } = getSectionProgress(section);
          const isOpen = openSections[section.id] ?? false;
          const isComplete = checked === total && total > 0;

          return (
            <Collapsible key={section.id} open={isOpen} onOpenChange={() => toggleSection(section.id)}>
              <Card className={isComplete ? "border-green-300 bg-green-50/50" : ""}>
                <CollapsibleTrigger className="w-full text-left">
                  <CardHeader className="py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isComplete ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                        {section.icon}
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
                    {/* Quick-link buttons */}
                    {section.links && section.links.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4 pl-2">
                        {section.links.map((link, idx) => (
                          <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="gap-2">
                              {link.icon}
                              {link.label}
                            </Button>
                          </a>
                        ))}
                      </div>
                    )}

                    <div className="space-y-3 pl-2">
                      {section.items.map((item, i) => {
                        const itemKey = `${section.id}_${i}`;
                        return (
                          <div key={i} className="flex items-start gap-3">
                            <Checkbox
                              checked={!!checkedItems[itemKey]}
                              onCheckedChange={() => toggleItem(section.id, i)}
                              className="mt-0.5"
                            />
                            <span className={`text-sm ${checkedItems[itemKey] ? "line-through text-muted-foreground" : ""}`}>
                              {item}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {section.id === "daily_checklist" && (
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
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}
