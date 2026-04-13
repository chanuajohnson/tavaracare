
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
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
  Pill, UtensilsCrossed, ListChecks, LayoutDashboard, MessageSquare,
  Heart, Users, CalendarCheck, Loader2, CheckCircle2, Circle, DollarSign,
  ExternalLink, CalendarIcon, AlertCircle, FileCheck, Phone
} from "lucide-react";
import { ONBOARDING_SECTION_DEFS, getTotalItems } from "@/components/admin/onboarding/onboardingSections";
import OnboardingNotesCard, { OnboardingNote } from "@/components/admin/onboarding/OnboardingNotesCard";

/** Parse "YYYY-MM-DD" as local date (not UTC) */
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Read-only summary header for Post-Onboarding section */
function CareSummaryHeader({ checkedItems }: { checkedItems: Record<string, boolean | string> }) {
  const startDateStr = (checkedItems["billing_start_date"] || checkedItems["post_onboarding_3_date"]) as string | undefined;
  const careRate = (checkedItems["care_rate"] as string) || "$35/hr (Standard)";
  const billingCadence = (checkedItems["billing_cadence"] as string) || "weekly";
  const isWeekly = billingCadence.toLowerCase() === "weekly";
  const planLabel = isWeekly ? "Tavara Family Care Plan (weekly)" : "Tavara Family Care Plan (monthly)";
  const paymentLabel = isWeekly ? "Weekly (due every Friday)" : "Monthly";

  return (
    <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-blue-900">
        💙 Your Care Summary
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="text-sm">
          <span className="text-muted-foreground">Rate:</span>{" "}
          <span className="font-medium">{careRate}</span>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">Plan:</span>{" "}
          <span className="font-medium">{planLabel}</span>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">Start Date:</span>{" "}
          <span className="font-medium">
            {startDateStr ? format(parseLocalDate(startDateStr), "PPP") : "Not set"}
          </span>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">Payment:</span>{" "}
          <span className="font-medium">{paymentLabel}</span>
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
      <div className="mt-3 pt-3 border-t border-blue-200">
        <p className="text-xs text-blue-800 font-medium">
          👤 Caregivers are assigned to the primary client — support to other household members is limited to approved, scoped services only.
        </p>
      </div>
    </div>
  );
}

/** Service Commencement Approval — digital signature for family */
function ServiceCommencementApproval({
  checkedItems,
  familyId,
  onApproved,
}: {
  checkedItems: Record<string, boolean | string>;
  familyId?: string;
  onApproved: (updated: Record<string, boolean | string>) => void;
}) {
  const [saving, setSaving] = useState(false);
  const isApproved = !!checkedItems["family_approval_confirmed"];
  const approvalDate = checkedItems["family_approval_date"] as string | undefined;

  const handleApprove = async () => {
    if (!familyId || isApproved) return;
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const updated = {
        ...checkedItems,
        family_approval_confirmed: true,
        family_approval_date: now,
      };
      const { error } = await supabase
        .from("onboarding_checklists")
        .update({ checked_items: updated as any })
        .eq("family_id", familyId);
      if (error) throw error;
      onApproved(updated);
    } catch (err) {
      console.error("Failed to save approval:", err);
      toast.error("Failed to save your approval. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const startDateStr = (checkedItems["billing_start_date"] || checkedItems["post_onboarding_3_date"]) as string | undefined;
  const hasStartDate = !!startDateStr;

  const formattedStartDate = hasStartDate ? format(parseLocalDate(startDateStr!), "EEEE, MMMM do") : null;
  const firstBillableWeekEnd = hasStartDate
    ? format(new Date(parseLocalDate(startDateStr!).getTime() + 4 * 86400000), "MMMM do, yyyy")
    : null;
  const firstBillableWeekStart = hasStartDate
    ? format(parseLocalDate(startDateStr!), "MMMM do")
    : null;

  return (
    <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
        ✅ Service Commencement Approval
      </h4>
      {!hasStartDate ? (
        <div className="rounded-md bg-amber-50 border border-amber-200 p-3">
          <p className="text-sm text-amber-800 leading-relaxed">
            Your care start date has not been set yet. Please check back once your coordinator has finalized your schedule.
          </p>
        </div>
      ) : (
        <>
          {!isApproved && (
            <div className="mb-3 rounded-md bg-blue-50 border border-blue-200 p-3">
              <p className="text-sm text-blue-800 leading-relaxed">
                💙 At the bottom of your checklist, you'll find this <span className="font-semibold">Service Commencement Approval</span>.
                Checking the box below acts as your <span className="font-semibold">digital approval</span> for us to commence care
                starting <span className="font-semibold">{formattedStartDate}</span>. This confirms the first billable week ({firstBillableWeekStart}–{firstBillableWeekEnd})
                as outlined in your quotation.
              </p>
            </div>
          )}
          <p className="text-sm text-muted-foreground mb-3">
            Care start date: <span className="font-medium text-foreground">{format(parseLocalDate(startDateStr!), "PPP")}</span>
            {" "}— First billable week: {firstBillableWeekStart}–{firstBillableWeekEnd}
          </p>
          {isApproved ? (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-md p-3">
              <CheckCircle2 className="h-5 w-5" />
              <div>
                <p className="font-medium text-sm">Approved — Digital signature recorded</p>
                {approvalDate && (
                  <p className="text-xs text-green-600 mt-0.5">
                    {format(new Date(approvalDate), "PPP 'at' p")}
                  </p>
                )}
                {(checkedItems["family_approval_by"] as string) === "admin" && (
                  <p className="text-xs text-green-600 mt-0.5 italic">Recorded by admin on behalf of family</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-start space-x-3">
              <Checkbox
                id="family-approval"
                checked={false}
                onCheckedChange={() => handleApprove()}
                disabled={saving}
              />
              <label htmlFor="family-approval" className="text-sm cursor-pointer leading-snug">
                I confirm the care start date above and authorize billing to commence as planned
              </label>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const ICON_MAP: Record<string, React.ReactNode> = {
  ClipboardCheck: <ClipboardCheck className="h-5 w-5" />,
  Heart: <Heart className="h-5 w-5" />,
  Monitor: <Monitor className="h-5 w-5" />,
  FileText: <FileText className="h-5 w-5" />,
  FileCheck: <FileCheck className="h-5 w-5" />,
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

export default function FamilyOnboardingChecklistPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean | string>>({});
  const [notes, setNotes] = useState<OnboardingNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [hasChecklist, setHasChecklist] = useState(false);
  const [medications, setMedications] = useState<any[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<{
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relationship?: string;
    primary_contact_name?: string;
    primary_contact_phone?: string;
  }>({});

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      try {
        // Load checklist, medications, and emergency contacts in parallel
        const [checklistRes, carePlansRes, careNeedsRes] = await Promise.all([
          supabase
            .from("onboarding_checklists")
            .select("checked_items, notes")
            .eq("family_id", user.id)
            .maybeSingle(),
          supabase
            .from("care_plans")
            .select("id, title")
            .eq("family_id", user.id),
          supabase
            .from("care_needs_family")
            .select("emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, primary_contact_name, primary_contact_phone")
            .eq("profile_id", user.id)
            .maybeSingle(),
        ]);

        if (checklistRes.error) throw checklistRes.error;
        if (checklistRes.data) {
          setHasChecklist(true);
          setCheckedItems((checklistRes.data.checked_items as unknown as Record<string, boolean | string>) || {});
          setNotes((checklistRes.data.notes as unknown as OnboardingNote[]) || []);
        }

        // Fetch medications for all care plans
        if (carePlansRes.data && carePlansRes.data.length > 0) {
          const carePlanIds = carePlansRes.data.map((cp: any) => cp.id);
          const { data: medsData } = await supabase
            .from("medications")
            .select("id, name, dosage, frequency, instructions, schedule, care_plan_id")
            .in("care_plan_id", carePlanIds);
          if (medsData) setMedications(medsData);
        }

        // Set emergency contacts
        if (careNeedsRes.data) {
          setEmergencyContacts(careNeedsRes.data);
        }
      } catch (err) {
        console.error("Failed to load onboarding checklist:", err);
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
      const matchingSection = ONBOARDING_SECTION_DEFS.find(s => s.id === hash);
      if (matchingSection) {
        setOpenSections(prev => ({ ...prev, [hash]: true }));
      }
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, [loading, hasChecklist]);

  const totalItems = getTotalItems();
  const totalChecked = ONBOARDING_SECTION_DEFS.reduce((sum, section) => {
    return sum + section.items.filter((_, i) => !!checkedItems[`${section.id}_${i}`]).length;
  }, 0);

  const saveNotesToSupabase = useCallback(async (updatedNotes: OnboardingNote[]) => {
    if (!user?.id) return;
    try {
      await supabase
        .from("onboarding_checklists")
        .update({ notes: updatedNotes as any })
        .eq("family_id", user.id);
    } catch (err) {
      console.error("Failed to save notes:", err);
    }
  }, [user?.id]);

  const handleAcknowledgeNote = useCallback((index: number) => {
    const updatedNotes = [...notes];
    updatedNotes[index] = {
      ...updatedNotes[index],
      acknowledged_at: new Date().toISOString(),
      acknowledged_by: user?.user_metadata?.full_name || user?.email || "Family",
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
      completed_by: user?.user_metadata?.full_name || user?.email || "Family",
    };
    setNotes(updatedNotes);
    saveNotesToSupabase(updatedNotes);
  }, [notes, user, saveNotesToSupabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader breadcrumbItems={[
          { label: "Family Dashboard", path: "/dashboard/family" },
          { label: "Onboarding Progress", path: "/family/onboarding-checklist" }
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
          { label: "Family Dashboard", path: "/dashboard/family" },
          { label: "Onboarding Progress", path: "/family/onboarding-checklist" }
        ]} />
        <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
          <ClipboardCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Onboarding Not Started Yet</h2>
          <p className="text-muted-foreground mb-4">
            Your onboarding checklist will appear here once your care coordinator begins the process.
          </p>
          {user?.email && (
            <p className="text-xs text-muted-foreground mb-4">
              Signed in as <span className="font-medium">{user.email}</span>. Onboarding progress is tied to this account.
              If your household's onboarding was started under a different family member's account, please sign in with that account to view progress.
            </p>
          )}
          <Button onClick={() => navigate("/dashboard/family")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader breadcrumbItems={[
        { label: "Family Dashboard", path: "/dashboard/family" },
        { label: "Onboarding Progress", path: "/family/onboarding-checklist" }
      ]} />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/family")}>
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
                      <div className="space-y-2 pl-2">
                        {section.items.map((item, i) => {
                          const isChecked = !!checkedItems[`${section.id}_${i}`];
                          const linkUrl = section.links?.[i];
                          const isDocLink = linkUrl?.includes("documents");
                          const dateFieldLabel = section.dateFields?.[i];
                          const dateKey = `${section.id}_${i}_date`;
                          const storedDate = checkedItems[dateKey] as string | undefined;
                          // For invoice: require quote done; for receipt: require quote+invoice done
                          const isDisabledLink = isDocLink && (
                            (i === 10 && !checkedItems[`${section.id}_9`]) ||
                            (i === 11 && (!checkedItems[`${section.id}_9`] || !checkedItems[`${section.id}_10`]))
                          );

                          return (
                            <div key={i} className="flex items-start gap-3">
                              {isChecked ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                              ) : (
                                <Circle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                {linkUrl && !isDisabledLink ? (
                                  <a
                                    href={linkUrl}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      navigate(linkUrl);
                                    }}
                                    className="text-sm text-primary hover:underline flex items-center gap-1"
                                  >
                                    {item}
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                ) : (
                                  <span className={`text-sm ${isChecked ? "text-muted-foreground" : ""} ${isDisabledLink ? "text-muted-foreground/50 italic" : ""}`}>
                                    {item}{isDisabledLink ? " (complete previous step first)" : ""}
                                  </span>
                                )}
                                {dateFieldLabel && storedDate && (
                                  <Badge variant="outline" className="ml-2 text-xs gap-1">
                                    <CalendarIcon className="h-3 w-3" />
                                    {format(parseLocalDate(storedDate), "PPP")}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                </div>

                {section.id === "medication_confirmation" && medications.length > 0 && (
                  <div className="mt-3 space-y-2 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
                    <h5 className="text-sm font-semibold flex items-center gap-2 text-blue-900 mb-3">
                      <Pill className="h-4 w-4" /> Your Medications on File
                    </h5>
                    {medications.map((med) => {
                      const schedule = med.schedule as any;
                      const times = schedule?.times;
                      const timeDisplay = Array.isArray(times)
                        ? times.map((t: any) => typeof t === 'object' ? t.time : t).join(', ')
                        : '';
                      return (
                        <div key={med.id} className="rounded-md border bg-card p-3 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{med.name}</span>
                            {med.dosage && <Badge variant="secondary" className="text-xs">{med.dosage}</Badge>}
                          </div>
                          {med.frequency && (
                            <p className="text-xs text-muted-foreground">Frequency: {med.frequency}</p>
                          )}
                          {timeDisplay && (
                            <p className="text-xs text-muted-foreground">Schedule: {timeDisplay}</p>
                          )}
                          {med.instructions && (
                            <p className="text-xs text-muted-foreground">Instructions: {med.instructions}</p>
                          )}
                        </div>
                      );
                    })}
                    {medications.length === 0 && (
                      <p className="text-sm text-muted-foreground italic">No medications have been added yet.</p>
                    )}
                  </div>
                )}

                {section.id === "medication_confirmation" && medications.length === 0 && (
                  <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <p className="text-sm text-amber-800">No medications have been added to your care plan yet. Your coordinator will set these up during onboarding.</p>
                    </div>
                  </div>
                )}

                {section.id === "emergency_contacts" && (
                  <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
                    <h5 className="text-sm font-semibold flex items-center gap-2 text-blue-900 mb-3">
                      <Phone className="h-4 w-4" /> Emergency & Primary Contacts on File
                    </h5>
                    {(emergencyContacts.emergency_contact_name || emergencyContacts.primary_contact_name) ? (
                      <div className="space-y-3">
                        {emergencyContacts.emergency_contact_name && (
                          <div className="rounded-md border bg-card p-3">
                            <p className="text-sm font-medium">🚨 Emergency Contact</p>
                            <p className="text-sm">{emergencyContacts.emergency_contact_name}
                              {emergencyContacts.emergency_contact_relationship && (
                                <span className="text-muted-foreground"> ({emergencyContacts.emergency_contact_relationship})</span>
                              )}
                            </p>
                            {emergencyContacts.emergency_contact_phone && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Phone className="h-3 w-3" /> {emergencyContacts.emergency_contact_phone}
                              </p>
                            )}
                          </div>
                        )}
                        {emergencyContacts.primary_contact_name && (
                          <div className="rounded-md border bg-card p-3">
                            <p className="text-sm font-medium">📞 Primary Contact</p>
                            <p className="text-sm">{emergencyContacts.primary_contact_name}</p>
                            {emergencyContacts.primary_contact_phone && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Phone className="h-3 w-3" /> {emergencyContacts.primary_contact_phone}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <p className="text-sm text-amber-800">No emergency contacts found. Please complete your care assessment to add emergency contacts.</p>
                      </div>
                    )}
                  </div>
                )}

                {section.id === "rates_and_changes" && (
                  <RateTierReferenceCard />
                )}

                {section.id === "post_onboarding" && (
                  <>
                    <CareSummaryHeader checkedItems={checkedItems} />
                    <ServiceCommencementApproval
                      checkedItems={checkedItems}
                      familyId={user?.id}
                      onApproved={(updatedItems) => setCheckedItems(updatedItems)}
                    />
                  </>
                )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}

          {/* Notes assigned to this family */}
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
