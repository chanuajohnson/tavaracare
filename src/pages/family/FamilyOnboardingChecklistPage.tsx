
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
  ExternalLink, CalendarIcon
} from "lucide-react";
import { ONBOARDING_SECTION_DEFS, getTotalItems } from "@/components/admin/onboarding/onboardingSections";
import OnboardingNotesCard, { OnboardingNote } from "@/components/admin/onboarding/OnboardingNotesCard";

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

export default function FamilyOnboardingChecklistPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean | string>>({});
  const [notes, setNotes] = useState<OnboardingNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [hasChecklist, setHasChecklist] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("onboarding_checklists")
          .select("checked_items, notes")
          .eq("family_id", user.id)
          .maybeSingle();
        if (error) throw error;
        if (data) {
          setHasChecklist(true);
          setCheckedItems((data.checked_items as unknown as Record<string, boolean | string>) || {});
          setNotes((data.notes as unknown as OnboardingNote[]) || []);
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

  const totalItems = getTotalItems();
  const totalChecked = Object.values(checkedItems).filter(Boolean).length;

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
                                    {format(new Date(storedDate), "PPP")}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                </div>

                {section.id === "rates_and_changes" && (
                  <RateTierReferenceCard />
                )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}

          {/* Notes assigned to this family */}
          <OnboardingNotesCard
            notes={notes}
            onAddNote={() => {}}
            readOnly
          />
        </div>
      </div>
    </div>
  );
}
