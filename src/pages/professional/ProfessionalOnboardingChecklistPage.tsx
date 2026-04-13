
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CHECKLIST_SECTIONS } from "@/components/professional/checklist/checklistSections";
import RateTierReferenceCard from "@/components/admin/onboarding/RateTierReferenceCard";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { format } from "date-fns";
import {
  ArrowLeft, ChevronDown, ClipboardCheck, Monitor, FileText,
  Pill, ListChecks, LayoutDashboard, MessageSquare,
  Heart, Users, CalendarCheck, Loader2, CheckCircle2, Circle, DollarSign,
  ExternalLink, CalendarIcon
} from "lucide-react";
import { PROFESSIONAL_ONBOARDING_SECTION_DEFS, getProfessionalTotalItems } from "@/components/admin/onboarding/professionalOnboardingSections";
import OnboardingNotesCard, { OnboardingNote } from "@/components/admin/onboarding/OnboardingNotesCard";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

/** Professional Readiness Approval – digital signature */
function ProfessionalReadinessApproval({
  checkedItems,
  professionalId,
  familyId,
  onApproved,
}: {
  checkedItems: Record<string, boolean | string>;
  professionalId: string | undefined;
  familyId: string | null;
  onApproved: (updated: Record<string, boolean | string>) => void;
}) {
  const isApproved = checkedItems["professional_approval_confirmed"] === true;
  const approvalDate = checkedItems["professional_approval_date"] as string | undefined;
  const approvalBy = checkedItems["professional_approval_by"] as string | undefined;
  const [saving, setSaving] = useState(false);

  const handleApprove = useCallback(async () => {
    if (!professionalId || !familyId || saving) return;
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const updated = {
        ...checkedItems,
        professional_approval_confirmed: true,
        professional_approval_date: now,
      };
      const { error } = await supabase
        .from("professional_onboarding_checklists")
        .update({ checked_items: updated as any })
        .eq("professional_id", professionalId)
        .eq("family_id", familyId);
      if (error) throw error;
      onApproved(updated);
      toast.success("Your digital approval has been recorded.");
    } catch (err) {
      console.error("Failed to save professional approval:", err);
      toast.error("Could not save approval. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [professionalId, familyId, saving, checkedItems, onApproved]);

  if (isApproved && approvalDate) {
    return (
      <div className="mb-4 rounded-lg border border-green-300 bg-green-50 p-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <div>
            <span className="text-sm font-semibold text-green-800">
              Approved — Digital signature recorded on{" "}
              {format(new Date(approvalDate), "PPP 'at' p")}
            </span>
            {approvalBy === "admin" && (
              <p className="text-xs text-green-700 mt-0.5 italic">Recorded by admin on behalf of professional</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 space-y-3">
      <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
        <p className="text-sm text-blue-800">
          💙 At the bottom of your checklist, you'll find this Readiness Approval.
          Checking the box below acts as your digital confirmation that you have reviewed
          everything and are ready to commence care as planned.
        </p>
      </div>
      <div className="flex items-start gap-3 rounded-lg border p-4">
        <Checkbox
          id="professional-approval"
          checked={false}
          onCheckedChange={(checked) => {
            if (checked) handleApprove();
          }}
          disabled={saving}
        />
        <label htmlFor="professional-approval" className="text-sm cursor-pointer leading-snug">
          I confirm I have reviewed my onboarding checklist and I am ready to commence care as planned.
        </label>
      </div>
    </div>
  );
}

/** Parse "YYYY-MM-DD" as local date (not UTC) */
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Care Summary header for post-onboarding */
function CareSummaryHeader({ checkedItems }: { checkedItems: Record<string, boolean | string> }) {
  const startDateStr = checkedItems["post_onboarding_3_date"] as string | undefined;
  return (
    <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-blue-900">
        💙 Your Care Summary
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
  ListChecks: <ListChecks className="h-5 w-5" />,
  LayoutDashboard: <LayoutDashboard className="h-5 w-5" />,
  Users: <Users className="h-5 w-5" />,
  CalendarCheck: <CalendarCheck className="h-5 w-5" />,
  MessageSquare: <MessageSquare className="h-5 w-5" />,
  DollarSign: <DollarSign className="h-5 w-5" />,
  CheckCircle2: <CheckCircle2 className="h-5 w-5" />,
};

export default function ProfessionalOnboardingChecklistPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean | string>>({});
  const [notes, setNotes] = useState<OnboardingNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [hasChecklist, setHasChecklist] = useState(false);
  const [assignedFamilyId, setAssignedFamilyId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      try {
        // Load the first available checklist row for this professional (family-specific)
        const { data, error } = await supabase
          .from("professional_onboarding_checklists")
          .select("checked_items, notes, family_id")
          .eq("professional_id", user.id)
          .limit(1)
          .maybeSingle();
        if (error) throw error;
        if (data) {
          setHasChecklist(true);
          setCheckedItems((data.checked_items as unknown as Record<string, boolean | string>) || {});
          setNotes((data.notes as unknown as OnboardingNote[]) || []);
          setAssignedFamilyId(data.family_id || null);
        }
      } catch (err) {
        console.error("Failed to load professional onboarding checklist:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Deep-link: scroll to hash target and auto-open section on mount
  useEffect(() => {
    if (!loading && hasChecklist && window.location.hash) {
      const hash = window.location.hash.substring(1);
      // Auto-open the section if hash matches a section id
      const matchingSection = PROFESSIONAL_ONBOARDING_SECTION_DEFS.find(s => s.id === hash);
      if (matchingSection) {
        setOpenSections(prev => ({ ...prev, [hash]: true }));
      }
      // Scroll to element after a short delay for rendering
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, [loading, hasChecklist]);

  const totalItems = getProfessionalTotalItems();
  const totalChecked = PROFESSIONAL_ONBOARDING_SECTION_DEFS.reduce((sum, section) => {
    return sum + section.items.filter((_, i) => !!checkedItems[`${section.id}_${i}`]).length;
  }, 0);

  const saveNotesToSupabase = useCallback(async (updatedNotes: OnboardingNote[]) => {
    if (!user?.id || !assignedFamilyId) return;
    try {
      await supabase
        .from("professional_onboarding_checklists")
        .update({ notes: updatedNotes as any })
        .eq("professional_id", user.id)
        .eq("family_id", assignedFamilyId);
    } catch (err) {
      console.error("Failed to save notes:", err);
    }
  }, [user?.id, assignedFamilyId]);

  const handleAcknowledgeNote = useCallback((index: number) => {
    const updatedNotes = [...notes];
    updatedNotes[index] = {
      ...updatedNotes[index],
      acknowledged_at: new Date().toISOString(),
      acknowledged_by: user?.user_metadata?.full_name || user?.email || "Professional",
    };
    setNotes(updatedNotes);
    saveNotesToSupabase(updatedNotes);
  }, [notes, user, saveNotesToSupabase]);

  const handleRespondToNote = useCallback((index: number, responseText: string) => {
    const updatedNotes = [...notes];
    updatedNotes[index] = {
      ...updatedNotes[index],
      response_text: responseText,
      response_at: new Date().toISOString(),
    };
    setNotes(updatedNotes);
    saveNotesToSupabase(updatedNotes);
  }, [notes, saveNotesToSupabase]);

  const handleCompleteNote = useCallback((index: number) => {
    const updatedNotes = [...notes];
    updatedNotes[index] = {
      ...updatedNotes[index],
      completed_at: new Date().toISOString(),
      completed_by: user?.user_metadata?.full_name || user?.email || "Professional",
    };
    setNotes(updatedNotes);
    saveNotesToSupabase(updatedNotes);
  }, [notes, user, saveNotesToSupabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader breadcrumbItems={[
          { label: "Professional Dashboard", path: "/dashboard/professional" },
          { label: "Onboarding Progress", path: "/professional/onboarding-checklist" }
        ]} />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!hasChecklist) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader breadcrumbItems={[
          { label: "Professional Dashboard", path: "/dashboard/professional" },
          { label: "Onboarding Progress", path: "/professional/onboarding-checklist" }
        ]} />
        <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
          <ClipboardCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Onboarding Not Started Yet</h2>
          <p className="text-muted-foreground mb-4">
            Your professional onboarding checklist will appear here once your care coordinator begins the process.
          </p>
          {user?.email && (
            <p className="text-xs text-muted-foreground mb-4">
              Signed in as <span className="font-medium">{user.email}</span>. Onboarding progress is tied to this account.
            </p>
          )}
          <Button onClick={() => navigate("/dashboard/professional")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader breadcrumbItems={[
        { label: "Professional Dashboard", path: "/dashboard/professional" },
        { label: "Onboarding Progress", path: "/professional/onboarding-checklist" }
      ]} />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/professional")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Your Onboarding Progress</h1>
            <p className="text-sm text-muted-foreground">
              Track what's been covered during your onboarding with Tavara.Care
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Progress</p>
            <p className="text-2xl font-bold">{totalChecked} / {totalItems}</p>
            <div className="w-32 h-2 bg-muted rounded-full mt-1">
              <div
                className="h-2 bg-primary rounded-full transition-all"
                style={{ width: `${totalItems ? (totalChecked / totalItems) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Section-by-section progress overview */}
        <Card className="mb-6">
          <CardContent className="pt-4 pb-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              Section Progress
            </h3>
            <div className="flex flex-wrap gap-2">
              {PROFESSIONAL_ONBOARDING_SECTION_DEFS.map((section) => {
                let checked = 0;
                section.items.forEach((_, i) => {
                  if (checkedItems[`${section.id}_${i}`] === true) checked++;
                });
                const total = section.items.length;
                const isComplete = checked === total && total > 0;
                return (
                  <Badge
                    key={section.id}
                    variant={isComplete ? "default" : "secondary"}
                    className="text-xs cursor-pointer"
                    onClick={() => {
                      setOpenSections(prev => ({ ...prev, [section.id]: true }));
                      setTimeout(() => {
                        document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }, 100);
                    }}
                  >
                    {isComplete ? "✓ " : ""}{section.title} ({checked}/{total})
                  </Badge>
                );
              })}
            </div>
            {checkedItems["professional_approval_confirmed"] === true && (
              <div className="mt-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-xs font-medium text-green-800">Readiness Approved</span>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-3">
          {PROFESSIONAL_ONBOARDING_SECTION_DEFS.map((section) => {
            let checked = 0;
            section.items.forEach((_, i) => {
              if (checkedItems[`${section.id}_${i}`] === true) checked++;
            });
            const total = section.items.length;
            const isOpen = openSections[section.id] ?? false;
            const isComplete = checked === total && total > 0;

            return (
              <Collapsible key={section.id} open={isOpen} onOpenChange={() => toggleSection(section.id)}>
                <Card id={section.id} className={isComplete ? "border-green-300 bg-green-50/50" : ""}>
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
                      {section.id === "post_onboarding" && (
                        <>
                          <CareSummaryHeader checkedItems={checkedItems} />
                          <ProfessionalReadinessApproval
                            checkedItems={checkedItems}
                            professionalId={user?.id}
                            onApproved={(updated) => setCheckedItems(updated)}
                          />
                        </>
                      )}
                      <div className="space-y-2 pl-2">
                        {section.items.map((item, i) => {
                          const isChecked = checkedItems[`${section.id}_${i}`] === true;
                          const dateKey = `${section.id}_${i}_date`;
                          const dateVal = checkedItems[dateKey] as string | undefined;
                          const dateLabel = section.dateFields?.[i];
                          const linkUrl = section.links?.[i];

                          return (
                            <div key={i} className="flex items-start gap-3">
                              {isChecked ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                              ) : (
                                <Circle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                              )}
                              <div className="flex-1">
                                {linkUrl ? (
                                  <Link to={linkUrl} className="text-sm text-primary hover:underline flex items-center gap-1">
                                    {item}
                                    <ExternalLink className="h-3 w-3" />
                                  </Link>
                                ) : (
                                  <span className={`text-sm ${isChecked ? "text-muted-foreground" : ""}`}>
                                    {item}
                                  </span>
                                )}
                                {dateLabel && dateVal && (
                                  <Badge variant="outline" className="mt-1 text-xs gap-1">
                                    <CalendarIcon className="h-3 w-3" />
                                    {dateLabel}: {format(parseLocalDate(dateVal), "PPP")}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {section.id === "daily_checklist_sop" && (
                        <div className="mt-6 border-t pt-4">
                          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                            <ListChecks className="h-4 w-4" />
                            Full Daily Checklist (SOP Reference)
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
                                      {sopSection.items.map((sopItem, j) => (
                                        <li key={j} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                          <span className="text-primary mt-0.5">•</span>
                                          {sopItem}
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

                      {section.id === "rates_payment" && (
                        <RateTierReferenceCard />
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}

          <div id="notes">
            <OnboardingNotesCard
              notes={notes}
              onAddNote={() => {}}
              readOnly
              onAcknowledgeNote={handleAcknowledgeNote}
              onRespondToNote={handleRespondToNote}
              onCompleteNote={handleCompleteNote}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
