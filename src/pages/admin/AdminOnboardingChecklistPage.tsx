
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ArrowLeft, ChevronDown, RotateCcw, ClipboardCheck, Monitor, FileText,
  Pill, UtensilsCrossed, ListChecks, LayoutDashboard, MessageSquare,
  Heart, Users, CalendarCheck, Loader2, ExternalLink, Copy, DollarSign
} from "lucide-react";
import { CHECKLIST_SECTIONS } from "@/components/professional/checklist/checklistSections";
import { ONBOARDING_SECTION_DEFS, getTotalItems } from "@/components/admin/onboarding/onboardingSections";
import FamilySubmissionReview from "@/components/admin/onboarding/FamilySubmissionReview";
import OnboardingNotesCard, { OnboardingNote } from "@/components/admin/onboarding/OnboardingNotesCard";
import { toast } from "sonner";

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
};

interface FamilyProfile {
  id: string;
  full_name: string | null;
}

export default function AdminOnboardingChecklistPage() {
  const navigate = useNavigate();
  const [families, setFamilies] = useState<FamilyProfile[]>([]);
  const [loadingFamilies, setLoadingFamilies] = useState(true);
  const [selectedFamilyId, setSelectedFamilyId] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<OnboardingNote[]>([]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load families on mount
  useEffect(() => {
    const loadFamilies = async () => {
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
    loadFamilies();
  }, []);

  // When family is selected, load from Supabase
  useEffect(() => {
    if (selectedFamilyId) {
      const family = families.find((f) => f.id === selectedFamilyId);
      setFamilyName(family?.full_name || "");

      const loadChecklist = async () => {
        try {
          const { data, error } = await supabase
            .from("onboarding_checklists")
            .select("checked_items, notes")
            .eq("family_id", selectedFamilyId)
            .maybeSingle();
          if (error) throw error;
          if (data) {
            setCheckedItems((data.checked_items as unknown as Record<string, boolean>) || {});
            setNotes((data.notes as unknown as OnboardingNote[]) || []);
          } else {
            setCheckedItems({});
            setNotes([]);
          }
        } catch (err) {
          console.error("Failed to load checklist:", err);
          setCheckedItems({});
          setNotes([]);
        }
      };
      loadChecklist();
    } else {
      setFamilyName("");
      setCheckedItems({});
      setNotes([]);
    }
  }, [selectedFamilyId, families]);

  // Debounced save to Supabase
  const saveToSupabase = useCallback(
    (items: Record<string, boolean>, notesList: OnboardingNote[]) => {
      if (!selectedFamilyId) return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
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
          console.error("Failed to save checklist:", err);
        }
      }, 800);
    },
    [selectedFamilyId]
  );

  const toggleItem = (sectionId: string, index: number) => {
    const itemKey = `${sectionId}_${index}`;
    setCheckedItems((prev) => {
      const next = { ...prev, [itemKey]: !prev[itemKey] };
      saveToSupabase(next, notes);
      return next;
    });
  };

  const handleAddNote = (note: OnboardingNote) => {
    setNotes((prev) => {
      const next = [...prev, note];
      saveToSupabase(checkedItems, next);
      return next;
    });
  };

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const totalItems = getTotalItems();
  const totalChecked = Object.values(checkedItems).filter(Boolean).length;

  const handleReset = () => {
    if (window.confirm("Reset all checkboxes and notes for this onboarding session?")) {
      setCheckedItems({});
      setNotes([]);
      saveToSupabase({}, []);
    }
  };

  const publicGuideUrl = `${window.location.origin}/onboarding-guide`;
  const copyPublicLink = () => {
    navigator.clipboard.writeText(publicGuideUrl);
    toast.success("Public onboarding guide link copied!");
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
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyPublicLink} className="gap-1" title="Copy shareable link">
            <Copy className="h-4 w-4" />
            Share Guide
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="familySelect">Select Family</Label>
              {loadingFamilies ? (
                <div className="flex items-center gap-2 h-10">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading families…</span>
                </div>
              ) : (
                <>
                  <Select value={selectedFamilyId} onValueChange={setSelectedFamilyId}>
                    <SelectTrigger id="familySelect">
                      <SelectValue placeholder="Choose a family to begin onboarding" />
                    </SelectTrigger>
                    <SelectContent>
                      {families.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.full_name || "Unnamed family"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedFamilyId && (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground font-mono truncate">
                        Profile ID: {selectedFamilyId}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1.5 text-xs"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedFamilyId);
                          toast.success("Family profile ID copied!");
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
        {ONBOARDING_SECTION_DEFS.map((section) => {
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
                    {/* Inline family data review for the submissions section */}
                    {section.showFamilyData && selectedFamilyId && (
                      <div className="mb-4">
                        <FamilySubmissionReview familyId={selectedFamilyId} />
                      </div>
                    )}

                    {section.showFamilyData && !selectedFamilyId && (
                      <div className="mb-4 p-4 border border-dashed rounded-lg text-center text-sm text-muted-foreground">
                        Select a family above to view their submitted registration, care assessment, and legacy story.
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

        {/* Notes & Action Items — always visible at the bottom */}
        <OnboardingNotesCard notes={notes} onAddNote={handleAddNote} />
      </div>
    </div>
  );
}
