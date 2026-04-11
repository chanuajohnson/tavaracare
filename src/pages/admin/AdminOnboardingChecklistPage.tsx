
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
  CalendarIcon, ExternalLink
} from "lucide-react";
import { CHECKLIST_SECTIONS } from "@/components/professional/checklist/checklistSections";
import { ONBOARDING_SECTION_DEFS, getTotalItems, OnboardingSectionDef } from "@/components/admin/onboarding/onboardingSections";
import { PROFESSIONAL_ONBOARDING_SECTION_DEFS, getProfessionalTotalItems } from "@/components/admin/onboarding/professionalOnboardingSections";
import FamilySubmissionReview from "@/components/admin/onboarding/FamilySubmissionReview";
import ProfessionalSubmissionReview from "@/components/admin/onboarding/ProfessionalSubmissionReview";
import RateTierReferenceCard from "@/components/admin/onboarding/RateTierReferenceCard";
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
  CheckCircle2: <CheckCircle2 className="h-5 w-5" />,
};

interface ProfileOption {
  id: string;
  full_name: string | null;
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
}) {
  const publicGuideUrl = `${window.location.origin}/onboarding-guide`;
  const copyPublicLink = () => {
    navigator.clipboard.writeText(publicGuideUrl);
    toast.success("Public onboarding guide link copied!");
  };

  return (
    <>
      <div className="flex justify-end gap-2 mb-4">
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
                                <div className="mt-1.5">
                                  <Popover>
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
                                          ? `${dateFieldLabel}: ${format(new Date(storedDate), "PPP")}`
                                          : `Set ${dateFieldLabel}`}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <Calendar
                                        mode="single"
                                        selected={storedDate ? new Date(storedDate) : undefined}
                                        onSelect={(date) => {
                                          if (date) {
                                            onDateChange(dateKey, date.toISOString().split("T")[0]);
                                          }
                                        }}
                                        initialFocus
                                        className={cn("p-3 pointer-events-auto")}
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>
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
  const [profCheckedItems, setProfCheckedItems] = useState<Record<string, boolean>>({});
  const [profNotes, setProfNotes] = useState<OnboardingNote[]>([]);
  const [profOpenSections, setProfOpenSections] = useState<Record<string, boolean>>({});
  const profSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

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
          setProfCheckedItems((data.checked_items as unknown as Record<string, boolean>) || {});
          setProfNotes((data.notes as unknown as OnboardingNote[]) || []);
        } else {
          setProfCheckedItems({});
          setProfNotes([]);
        }
      } catch (err) {
        console.error("Failed to load professional checklist:", err);
        setProfCheckedItems({});
        setProfNotes([]);
      }
    };
    load();
  }, [selectedProfessionalId]);

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
    (items: Record<string, boolean>, notesList: OnboardingNote[]) => {
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
          />
        </TabsContent>

        <TabsContent value="professional">
          <ChecklistTabContent
            profiles={professionals}
            loadingProfiles={loadingProfessionals}
            selectedId={selectedProfessionalId}
            setSelectedId={setSelectedProfessionalId}
            checkedItems={profCheckedItems}
            toggleItem={toggleProfItem}
            notes={profNotes}
            handleAddNote={handleProfAddNote}
            openSections={profOpenSections}
            toggleSection={(id) => setProfOpenSections((prev) => ({ ...prev, [id]: !prev[id] }))}
            handleReset={() => {
              if (window.confirm("Reset all checkboxes and notes for this professional onboarding session?")) {
                setProfCheckedItems({});
                setProfNotes([]);
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
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
