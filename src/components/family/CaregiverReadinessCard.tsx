
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, UserCheck, Loader2 } from "lucide-react";
import { PROFESSIONAL_ONBOARDING_SECTION_DEFS, getProfessionalTotalItems } from "@/components/admin/onboarding/professionalOnboardingSections";

interface CaregiverReadiness {
  caregiverName: string;
  totalItems: number;
  checkedItems: number;
  isApproved: boolean;
  approvalDate?: string;
  notesAcknowledged: number;
  totalNotes: number;
}

export function CaregiverReadinessCard() {
  const { user } = useAuth();
  const [readiness, setReadiness] = useState<CaregiverReadiness | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      try {
        // Find checklists where this family is assigned
        const { data: checklists, error } = await supabase
          .from("professional_onboarding_checklists")
          .select("professional_id, checked_items, notes")
          .eq("family_id", user.id);

        if (error) throw error;
        if (!checklists || checklists.length === 0) {
          setReadiness(null);
          return;
        }

        const checklist = checklists[0];
        const items = (checklist.checked_items as unknown as Record<string, boolean | string>) || {};
        const notes = (checklist.notes as unknown as any[]) || [];

        // Get professional name
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", checklist.professional_id)
          .maybeSingle();

        const totalItems = getProfessionalTotalItems();
        let checkedCount = 0;
        PROFESSIONAL_ONBOARDING_SECTION_DEFS.forEach((section) => {
          section.items.forEach((_, i) => {
            if (items[`${section.id}_${i}`] === true) checkedCount++;
          });
        });

        const notesAcknowledged = notes.filter((n: any) => n.acknowledged_at).length;

        setReadiness({
          caregiverName: profile?.full_name || "Your Caregiver",
          totalItems,
          checkedItems: checkedCount,
          isApproved: items["professional_approval_confirmed"] === true,
          approvalDate: items["professional_approval_date"] as string | undefined,
          notesAcknowledged,
          totalNotes: notes.length,
        });
      } catch (err) {
        console.error("Failed to load caregiver readiness:", err);
        setReadiness(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  if (loading) return null;
  if (!readiness) return null;

  const percentage = readiness.totalItems > 0
    ? Math.round((readiness.checkedItems / readiness.totalItems) * 100)
    : 0;

  const isReady = readiness.isApproved || percentage >= 90;

  return (
    <Card className={`border-l-4 ${isReady ? "border-l-green-500 bg-green-50/50" : "border-l-amber-400 bg-amber-50/50"}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full shrink-0 ${isReady ? "bg-green-100" : "bg-amber-100"}`}>
            {isReady ? (
              <UserCheck className="h-5 w-5 text-green-700" />
            ) : (
              <Clock className="h-5 w-5 text-amber-700" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`font-semibold text-sm ${isReady ? "text-green-900" : "text-amber-900"}`}>
              {isReady
                ? `${readiness.caregiverName} is ready to begin care`
                : `${readiness.caregiverName} is completing onboarding`}
            </h4>
            <p className={`text-xs mt-1 ${isReady ? "text-green-700" : "text-amber-700"}`}>
              {isReady
                ? "Your assigned caregiver has completed their onboarding preparation and is ready to start."
                : `Onboarding is ${percentage}% complete (${readiness.checkedItems}/${readiness.totalItems} items covered).`}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant={isReady ? "default" : "secondary"} className="text-xs">
                {percentage}% Complete
              </Badge>
              {readiness.isApproved && (
                <Badge variant="default" className="text-xs gap-1 bg-green-600">
                  <CheckCircle2 className="h-3 w-3" />
                  Readiness Approved
                </Badge>
              )}
              {readiness.totalNotes > 0 && (
                <Badge variant="outline" className="text-xs">
                  {readiness.notesAcknowledged}/{readiness.totalNotes} notes reviewed
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
