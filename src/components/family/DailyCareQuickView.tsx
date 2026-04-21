import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Pill, ClipboardList, ChevronDown, ChevronUp, CheckCircle, Clock, User, ArrowRight, Lock } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

interface MedAdministration {
  id: string;
  medication_name: string;
  dosage: string;
  administered_at: string;
  administered_by_name: string;
  administered_by_role: string;
}

interface ChecklistSection {
  name: string;
  completed: number;
  total: number;
}

interface DailyLog {
  id: string;
  caregiver_name: string;
  shift_type: string | null;
  time_in: string | null;
  time_out: string | null;
  notes: string | null;
  sections: ChecklistSection[];
}

const SOP_WEEKLY_ID = "81d017e5-dd7e-48fc-a3fd-61d831c383c4";
const SOP_ONETIME_ID = "2093fdef-9195-46cd-83e5-f5c1062edf7b";

export function DailyCareQuickView() {
  const { user } = useAuth();
  const [medAdmins, setMedAdmins] = useState<MedAdministration[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [medsOpen, setMedsOpen] = useState(true);
  const [logsOpen, setLogsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSOPAccess, setHasSOPAccess] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadTodayData();
    }
  }, [user?.id]);

  const loadTodayData = async () => {
    if (!user?.id) return;
    setIsLoading(true);

    try {
      const today = format(new Date(), "yyyy-MM-dd");

      // Fetch care plan IDs for this family
      const { data: carePlans } = await supabase
        .from("care_plans")
        .select("id")
        .eq("family_id", user.id);

      const carePlanIds = carePlans?.map((cp) => cp.id) || [];

      // Check SOP entitlement: weekly add-on or one-time activation, family-approved
      if (carePlanIds.length > 0) {
        const { data: sopSelections } = await supabase
          .from("care_plan_service_selections")
          .select("id")
          .in("care_plan_id", carePlanIds)
          .in("service_item_id", [SOP_WEEKLY_ID, SOP_ONETIME_ID])
          .eq("selected", true)
          .eq("approved_by_family", true)
          .limit(1);
        setHasSOPAccess((sopSelections?.length ?? 0) > 0);
      } else {
        setHasSOPAccess(false);
      }

      // Fetch today's medication administrations
      if (carePlanIds.length > 0) {
        const { data: admins } = await supabase
          .from("medication_administrations")
          .select(`
            id,
            administered_at,
            administered_by,
            administered_by_role,
            medication_id,
            medications!inner(name, dosage, care_plan_id)
          `)
          .in("medications.care_plan_id", carePlanIds)
          .gte("administered_at", `${today}T00:00:00`)
          .lte("administered_at", `${today}T23:59:59`)
          .eq("status", "administered")
          .order("administered_at", { ascending: false });

        if (admins && admins.length > 0) {
          // Get administrator names
          const adminByIds = [...new Set(admins.map((a) => a.administered_by).filter(Boolean))];
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", adminByIds);

          const nameMap = new Map(profiles?.map((p) => [p.id, p.full_name]) || []);

          setMedAdmins(
            admins.map((a: any) => ({
              id: a.id,
              medication_name: a.medications?.name || "Unknown",
              dosage: a.medications?.dosage || "",
              administered_at: a.administered_at,
              administered_by_name: nameMap.get(a.administered_by) || "Unknown",
              administered_by_role: a.administered_by_role || "unknown",
            }))
          );
        }
      }

      // Fetch today's daily care logs
      const { data: logs } = await supabase
        .from("daily_care_logs")
        .select("id, professional_id, shift_type, time_in, time_out, notes, checklist_data")
        .eq("family_id", user.id)
        .eq("shift_date", today);

      if (logs && logs.length > 0) {
        const profIds = [...new Set(logs.map((l) => l.professional_id))];
        const { data: profProfiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", profIds);

        const profNameMap = new Map(profProfiles?.map((p) => [p.id, p.full_name]) || []);

        setDailyLogs(
          logs.map((log: any) => {
            const sections = parseChecklistSections(log.checklist_data);
            return {
              id: log.id,
              caregiver_name: profNameMap.get(log.professional_id) || "Caregiver",
              shift_type: log.shift_type,
              time_in: log.time_in,
              time_out: log.time_out,
              notes: log.notes,
              sections,
            };
          })
        );
      }
    } catch (error) {
      console.error("Error loading daily care data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const parseChecklistSections = (checklistData: any): ChecklistSection[] => {
    if (!checklistData || typeof checklistData !== "object") return [];

    const sections: ChecklistSection[] = [];
    const sectionNames: Record<string, string> = {
      startOfShift: "Start of Shift",
      careTasks: "Care Tasks",
      homeTasks: "Home Tasks",
      medicationTasks: "Medication Tasks",
      endOfShift: "End of Shift",
      mealTasks: "Meal Tasks",
    };

    for (const [key, label] of Object.entries(sectionNames)) {
      const sectionData = checklistData[key];
      if (sectionData && typeof sectionData === "object") {
        const items = Object.values(sectionData);
        const total = items.length;
        const completed = items.filter((v) => v === true).length;
        if (total > 0) {
          sections.push({ name: label, completed, total });
        }
      }
    }

    return sections;
  };

  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardContent className="py-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm">Loading today's care activity...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasContent = medAdmins.length > 0 || dailyLogs.length > 0;

  if (!hasContent) return null;

  return (
    <Card className="mt-4 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          Today's Care Activity
          <Badge variant="outline" className="ml-auto text-xs">
            {format(new Date(), "PPP")}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Medication Administrations */}
        {medAdmins.length > 0 && (
          <Collapsible open={medsOpen} onOpenChange={setMedsOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-md hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2">
                <Pill className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-sm">Medications Administered</span>
                <Badge variant="secondary" className="text-xs">{medAdmins.length}</Badge>
              </div>
              {medsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-1">
              <div className="space-y-2 pl-6">
                {medAdmins.map((admin) => (
                  <div key={admin.id} className="flex items-center justify-between text-sm border-l-2 border-blue-200 pl-3 py-1">
                    <div>
                      <span className="font-medium">{admin.medication_name}</span>
                      {admin.dosage && (
                        <span className="text-muted-foreground ml-1">({admin.dosage})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span className="text-xs">{admin.administered_by_name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {admin.administered_by_role}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">
                          {format(new Date(admin.administered_at), "h:mm a")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Daily Care Logs */}
        {dailyLogs.length > 0 && (
          <Collapsible open={logsOpen} onOpenChange={setLogsOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-md hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-green-500" />
                <span className="font-medium text-sm">Caregiver Shift Logs</span>
                <Badge variant="secondary" className="text-xs">{dailyLogs.length}</Badge>
              </div>
              {logsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-1">
              <div className="space-y-3 pl-6">
                {dailyLogs.map((log) => (
                  <div key={log.id} className="border-l-2 border-green-200 pl-3 py-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{log.caregiver_name}</span>
                      {log.shift_type && (
                        <Badge variant="outline" className="text-xs">{log.shift_type}</Badge>
                      )}
                      {log.time_in && (
                        <span className="text-xs text-muted-foreground">
                          {log.time_in}{log.time_out ? ` – ${log.time_out}` : " (in progress)"}
                        </span>
                      )}
                    </div>
                    {log.sections.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {log.sections.map((section) => {
                          const isComplete = section.completed === section.total;
                          return (
                            <div
                              key={section.name}
                              className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                                isComplete
                                  ? "bg-green-100 text-green-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {isComplete ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <Clock className="h-3 w-3" />
                              )}
                              {section.name}: {section.completed}/{section.total}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {log.notes && (
                      <p className="text-xs text-muted-foreground mt-1 italic">"{log.notes}"</p>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Link to full care plan — gated by SOP entitlement */}
        <div className="pt-1">
          {hasSOPAccess ? (
            <Link to="/family/care-management">
              <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary/80 p-0 h-auto">
                View Full Care Plan <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          ) : (
            <Link to="/family/upgrade/care-log-access">
              <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary/80 p-0 h-auto gap-1">
                <Lock className="h-3 w-3" />
                View Full Care Plan
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
