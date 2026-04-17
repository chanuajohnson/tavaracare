import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt } from "lucide-react";
import { PayrollEntriesTable } from "@/components/care-plan/payroll/PayrollEntriesTable";
import { resolveCaregiverNames } from "@/services/care-plans/utils/resolveCaregiveNames";
import type { PayrollEntry } from "@/services/care-plans/types/workLogTypes";

interface ProfessionalPayrollViewProps {
  carePlanId?: string;
  carePlanTitle?: string;
}

export const ProfessionalPayrollView: React.FC<ProfessionalPayrollViewProps> = ({
  carePlanId,
  carePlanTitle,
}) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<PayrollEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !carePlanId) {
      setEntries([]);
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        // Resolve this caregiver's care_team_member ids on this care plan
        const { data: ctm, error: ctmErr } = await supabase
          .from("care_team_members")
          .select("id")
          .eq("care_plan_id", carePlanId)
          .eq("caregiver_id", user.id);

        if (ctmErr) throw ctmErr;
        const memberIds = (ctm || []).map((r) => r.id);

        if (memberIds.length === 0) {
          setEntries([]);
          return;
        }

        const { data: rows, error } = await supabase
          .from("payroll_entries")
          .select(`
            *,
            care_team_members:care_team_member_id (
              caregiver_id,
              profiles!caregiver_id ( full_name )
            )
          `)
          .eq("care_plan_id", carePlanId)
          .in("care_team_member_id", memberIds)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const records = (rows || []).map((entry: any) => ({
          caregiverId: entry.care_team_members?.caregiver_id || null,
          joinedName: entry.care_team_members?.profiles?.full_name || null,
        }));
        const nameMap = await resolveCaregiverNames(records);

        const mapped: PayrollEntry[] = (rows || []).map((entry: any) => {
          const caregiverId = entry.care_team_members?.caregiver_id;
          const resolvedName = caregiverId ? nameMap.get(caregiverId) : null;
          const validStatus: "pending" | "approved" | "paid" =
            ["pending", "approved", "paid"].includes(entry.payment_status)
              ? (entry.payment_status as "pending" | "approved" | "paid")
              : "pending";
          return {
            ...entry,
            caregiver_name: resolvedName || "You",
            payment_status: validStatus,
          };
        });

        setEntries(mapped);
      } catch (err) {
        console.error("Error loading professional payroll view:", err);
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.id, carePlanId]);

  if (!carePlanId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Care Payments
          </CardTitle>
          <CardDescription>
            Select a care plan to view your payment history.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          Care Payments
          {carePlanTitle && (
            <span className="text-sm font-normal text-muted-foreground ml-1">
              — {carePlanTitle}
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Payments received for shifts on this care plan. This is what has been
          paid (or is pending payment) to you. Download a receipt for any entry.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No care payments yet for this care plan.
          </div>
        ) : (
          <PayrollEntriesTable
            entries={entries}
            onProcessPayment={() => {}}
            readOnly
          />
        )}
      </CardContent>
    </Card>
  );
};
