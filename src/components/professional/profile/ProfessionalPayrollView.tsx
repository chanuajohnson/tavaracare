import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, AlertCircle, ArrowUp } from "lucide-react";
import { PayrollEntriesTable } from "@/components/care-plan/payroll/PayrollEntriesTable";
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
  const [error, setError] = useState<string | null>(null);
  const [otherPlansWithPayments, setOtherPlansWithPayments] = useState<number>(0);

  useEffect(() => {
    if (!user?.id || !carePlanId) {
      setEntries([]);
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Resolve ALL of this caregiver's care_team_member ids across all plans
        const { data: allCtm, error: allCtmErr } = await supabase
          .from("care_team_members")
          .select("id, care_plan_id")
          .eq("caregiver_id", user.id);

        if (allCtmErr) throw allCtmErr;

        const memberIdsForThisPlan = (allCtm || [])
          .filter((r) => r.care_plan_id === carePlanId)
          .map((r) => r.id);

        const memberIdsForOtherPlans = (allCtm || [])
          .filter((r) => r.care_plan_id && r.care_plan_id !== carePlanId)
          .map((r) => r.id);

        // Count payments on OTHER plans (for the switcher hint)
        if (memberIdsForOtherPlans.length > 0) {
          const { data: otherPayments } = await supabase
            .from("payroll_entries")
            .select("care_plan_id")
            .in("care_team_member_id", memberIdsForOtherPlans);
          const distinctOtherPlans = new Set(
            (otherPayments || []).map((p: any) => p.care_plan_id).filter(Boolean)
          );
          setOtherPlansWithPayments(distinctOtherPlans.size);
        } else {
          setOtherPlansWithPayments(0);
        }

        if (memberIdsForThisPlan.length === 0) {
          setEntries([]);
          return;
        }

        // Simplified query — no fragile nested join
        const { data: rows, error: rowsErr } = await supabase
          .from("payroll_entries")
          .select("*")
          .eq("care_plan_id", carePlanId)
          .in("care_team_member_id", memberIdsForThisPlan)
          .order("created_at", { ascending: false });

        if (rowsErr) throw rowsErr;

        const mapped: PayrollEntry[] = (rows || []).map((entry: any) => {
          const validStatus: "pending" | "approved" | "paid" =
            ["pending", "approved", "paid"].includes(entry.payment_status)
              ? (entry.payment_status as "pending" | "approved" | "paid")
              : "pending";
          return {
            ...entry,
            caregiver_name: "You",
            payment_status: validStatus,
          };
        });

        console.log("[ProfessionalPayrollView] Loaded", mapped.length, "entries for plan", carePlanId);
        setEntries(mapped);
      } catch (err: any) {
        console.error("Error loading professional payroll view:", err);
        setError(err?.message || "Couldn't load payments");
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
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mb-2" />
            <p className="text-sm text-destructive font-medium">Couldn't load payments</p>
            <p className="text-xs text-muted-foreground mt-1">
              Please refresh the page. If the problem persists, contact support.
            </p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <p className="text-sm text-muted-foreground">
              No care payments yet for this care plan.
            </p>
            {otherPlansWithPayments > 0 && (
              <div className="inline-flex items-start gap-2 px-4 py-3 rounded-md bg-primary/5 border border-primary/20 text-left max-w-md mx-auto">
                <ArrowUp className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-foreground">
                  You have payments on{" "}
                  <span className="font-semibold text-primary">
                    {otherPlansWithPayments} other care plan
                    {otherPlansWithPayments === 1 ? "" : "s"}
                  </span>
                  . Switch using the <strong>Care Plan selector</strong> above to view them.
                </p>
              </div>
            )}
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
