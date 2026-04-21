import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Lock,
  CheckCircle2,
  ClipboardList,
  Clock,
  History,
  MessageSquare,
  AlertTriangle,
  ArrowLeft,
  Send,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

const SOP_WEEKLY_ID = "81d017e5-dd7e-48fc-a3fd-61d831c383c4";
const SOP_ONETIME_ID = "2093fdef-9195-46cd-83e5-f5c1062edf7b";
const TAVARA_ADMIN_NUMBER = "18687865357";

type PlanChoice = "weekly" | "one_time";

const PLAN_DETAILS: Record<PlanChoice, { id: string; label: string; price: string; cadence: string; serviceItemId: string }> = {
  weekly: {
    id: "weekly",
    label: "Daily Care SOP + Monitoring",
    price: "$149",
    cadence: "per week",
    serviceItemId: SOP_WEEKLY_ID,
  },
  one_time: {
    id: "one_time",
    label: "Daily Care SOP — One-Time Activation",
    price: "$199",
    cadence: "one-time, 30-day access",
    serviceItemId: SOP_ONETIME_ID,
  },
};

export default function CareLogUpgradePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [familyName, setFamilyName] = useState<string>("");
  const [carePlanId, setCarePlanId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanChoice | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [quoteSent, setQuoteSent] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const [{ data: profile }, { data: plans }] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
        supabase.from("care_plans").select("id").eq("family_id", user.id).limit(1),
      ]);
      if (profile?.full_name) setFamilyName(profile.full_name);
      if (plans && plans.length > 0) setCarePlanId(plans[0].id);
    })();
  }, [user?.id]);

  const buildWhatsAppMessage = (plan: PlanChoice) => {
    const detail = PLAN_DETAILS[plan];
    const greeting = familyName ? `Hi Tavara — ${familyName} here.` : "Hi Tavara,";
    return (
      `${greeting}\n\n` +
      `Please activate the *${detail.label}* (${detail.price} ${detail.cadence}) on our care plan so we can see the full caregiver SOP logs.\n\n` +
      `*Payment details:*\n` +
      `First Citizens Bank, Point Lisas\n` +
      `A/C 2991223\n` +
      `Chanua Johnson — Savings\n\n` +
      `I'll reply with the bank reference once paid.\n\n` +
      `— Sent from Tavara Care`
    );
  };

  const handleChoose = (plan: PlanChoice) => {
    setSelectedPlan(plan);
    setPreviewOpen(true);
  };

  const handleConfirmAndSend = async () => {
    if (!selectedPlan || !user?.id) return;
    if (!carePlanId) {
      toast.error("No care plan found. Please complete onboarding first.");
      return;
    }
    setSubmitting(true);
    try {
      const detail = PLAN_DETAILS[selectedPlan];
      const notesPayload =
        selectedPlan === "one_time"
          ? `Family-requested one-time activation. 30-day access window starts on admin approval. Requested at ${new Date().toISOString()}.`
          : `Family-requested weekly add-on activation. Requested at ${new Date().toISOString()}.`;

      const { error } = await supabase.from("care_plan_service_selections").insert({
        care_plan_id: carePlanId,
        service_item_id: detail.serviceItemId,
        selected: true,
        approved_by_family: true,
        quantity: 1,
        notes: notesPayload,
      });

      if (error) throw error;

      const text = buildWhatsAppMessage(selectedPlan);
      const url = `https://api.whatsapp.com/send/?phone=${TAVARA_ADMIN_NUMBER}&text=${encodeURIComponent(text)}&type=phone_number&app_absent=0`;
      window.open(url, "_blank");

      setQuoteSent(true);
      setPreviewOpen(false);
      toast.success("Quote sent. Tavara admin will confirm activation within 24 hours.");
    } catch (err: any) {
      console.error("Error submitting upgrade request:", err);
      toast.error(err?.message || "Could not submit your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        breadcrumbItems={[
          { label: "Family Dashboard", path: "/dashboard/family" },
          { label: "Unlock Full Care Log", path: "/family/upgrade/care-log-access" },
        ]}
      />

      <div className="container max-w-4xl py-8 space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        {/* Hero */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-background to-background">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-3">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Unlock the Full Caregiver Care Log</CardTitle>
                <CardDescription className="text-base mt-1">
                  See exactly what your caregiver did, when, and how — every shift, in detail.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {quoteSent && (
          <Card className="border-green-300 bg-green-50">
            <CardContent className="py-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-900">Quote sent via WhatsApp.</p>
                <p className="text-sm text-green-800 mt-1">
                  Once payment is confirmed by Tavara admin, the full care log will unlock on your dashboard within 24 hours.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* What you're missing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              What you're missing right now
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border bg-muted/30 p-4">
                <Badge variant="outline" className="mb-2">Today's view (free)</Badge>
                <ul className="text-sm space-y-1.5 text-muted-foreground">
                  <li>• Section completion summary chips</li>
                  <li>• Caregiver name & shift times</li>
                  <li>• Short note preview</li>
                </ul>
              </div>
              <div className="rounded-lg border-2 border-primary/40 bg-primary/5 p-4">
                <Badge className="mb-2 bg-primary">With full access</Badge>
                <ul className="text-sm space-y-1.5">
                  <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /> Full 66-item GAPP checklist per shift</li>
                  <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /> Time-stamped section completion</li>
                  <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /> Complete caregiver notes & incident reports</li>
                  <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /> Searchable historical log archive</li>
                  <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /> Two-way acknowledgment thread with caregiver</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: ClipboardList, label: "Full SOP detail", desc: "Every task ticked, in order" },
            { icon: Clock, label: "Time-stamped", desc: "Know when each task was done" },
            { icon: History, label: "Historical archive", desc: "Search past shifts anytime" },
            { icon: MessageSquare, label: "Two-way notes", desc: "Acknowledge & reply" },
          ].map((b) => (
            <Card key={b.label} className="border-muted">
              <CardContent className="pt-4 pb-3">
                <b.icon className="h-5 w-5 text-primary mb-2" />
                <p className="font-medium text-sm">{b.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{b.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pricing options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-primary/30 hover:border-primary transition-colors">
            <CardHeader>
              <Badge variant="secondary" className="w-fit mb-2">Recurring</Badge>
              <CardTitle className="text-xl">Add to weekly plan</CardTitle>
              <CardDescription>Daily Care SOP + Monitoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-3xl font-bold">$149</span>
                <span className="text-muted-foreground ml-1">/ week</span>
              </div>
              <ul className="text-sm space-y-1.5 text-muted-foreground">
                <li>• Continuous full access</li>
                <li>• Bills with weekly care plan</li>
                <li>• Cancel anytime</li>
              </ul>
              <Button
                className="w-full"
                onClick={() => handleChoose("weekly")}
                disabled={submitting}
              >
                Add to weekly plan
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-400/40 hover:border-amber-500 transition-colors">
            <CardHeader>
              <Badge className="w-fit mb-2 bg-amber-500 hover:bg-amber-600">One-time</Badge>
              <CardTitle className="text-xl">One-time activation</CardTitle>
              <CardDescription>30-day full access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-3xl font-bold">$199</span>
                <span className="text-muted-foreground ml-1">/ 30 days</span>
              </div>
              <ul className="text-sm space-y-1.5 text-muted-foreground">
                <li>• No recurring charge</li>
                <li>• Try it before committing</li>
                <li>• Renew or upgrade later</li>
              </ul>
              <Button
                variant="outline"
                className="w-full border-amber-500 text-amber-700 hover:bg-amber-50"
                onClick={() => handleChoose("one_time")}
                disabled={submitting}
              >
                Activate one-time
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Trust line */}
        <Card className="bg-muted/40">
          <CardContent className="py-4 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              Tavara coordinates billing through bank transfer. After you tap an option, we'll open WhatsApp with a pre-filled
              message containing payment details for our admin team. Access unlocks within 24 hours of payment confirmation.
            </p>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center">
          Tavara is a Care Coordination &amp; Management Platform. Care services are delivered by independently contracted
          caregivers. <Link to="/family/care-management" className="underline">Return to dashboard</Link>
        </p>
      </div>

      {/* WhatsApp preview dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Send activation request via WhatsApp
            </DialogTitle>
            <DialogDescription>
              Review the message below. We'll record your selection in your care plan and open WhatsApp so you can send it to Tavara admin.
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && (
            <div className="space-y-3">
              <div className="rounded-lg bg-muted/50 p-3 text-sm whitespace-pre-line border font-mono">
                {buildWhatsAppMessage(selectedPlan)}
              </div>
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>
                  Access unlocks once Tavara admin marks the service as approved &amp; payment is received.
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPreviewOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleConfirmAndSend} disabled={submitting} className="gap-2">
              <Send className="h-4 w-4" />
              {submitting ? "Sending…" : "Send via WhatsApp"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
