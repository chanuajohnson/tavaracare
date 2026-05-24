import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { MessageCircle, Mail, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  READINESS_LEAD_LOCAL_KEY,
  type StageDefinition,
  type ReadinessStage,
} from "@/data/familyReadinessQuiz";

const TAVARA_WHATSAPP = "18687865357";

const nameSchema = z
  .string()
  .trim()
  .min(2, "Please enter your name")
  .max(100, "Name is too long");

const emailSchema = z
  .string()
  .trim()
  .email("Please enter a valid email")
  .max(255, "Email is too long");

const phoneSchema = z
  .string()
  .trim()
  .min(7, "Please enter a valid phone number")
  .max(20, "Phone number is too long")
  .regex(/^[0-9+\-\s()]+$/, "Phone number can only contain digits and + - ( )");

interface AnonymousLeadCaptureProps {
  stage: ReadinessStage;
  stageDef: StageDefinition;
  /** All quiz answers as { questionId: score } */
  responses: Record<string, number>;
  /** The user's open-text reflection, if any */
  reflection?: string;
}

type Mode = "whatsapp" | "email" | null;

export const AnonymousLeadCapture: React.FC<AnonymousLeadCaptureProps> = ({
  stage,
  stageDef,
  responses,
  reflection,
}) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [captured, setCaptured] = useState<"email" | "whatsapp" | null>(null);

  const closeModal = () => {
    setMode(null);
    setName("");
    setEmail("");
    setPhone("");
  };


  const buildSummary = () => {
    const lines = [
      `Hi Tavara — I just took the Care Readiness Check.`,
      ``,
      `My result: ${stageDef.badgeText}`,
      `"${stageDef.title}"`,
    ];
    if (reflection) {
      lines.push(``, `What's really going on for me:`, `"${reflection}"`);
    }
    lines.push(
      ``,
      `Lead ref: quiz_stage${stage}_${Date.now()}`
    );
    return lines.join("\n");
  };

  const persistLeadLocal = (lead: Record<string, unknown>) => {
    try {
      localStorage.setItem(READINESS_LEAD_LOCAL_KEY, JSON.stringify(lead));
    } catch {
      // ignore
    }
  };

  const handleWhatsAppSubmit = async () => {
    const nameResult = nameSchema.safeParse(name);
    if (!nameResult.success) {
      toast.error(nameResult.error.issues[0].message);
      return;
    }
    const phoneResult = phoneSchema.safeParse(phone);
    if (!phoneResult.success) {
      toast.error(phoneResult.error.issues[0].message);
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("quiz_leads").insert({
        name: nameResult.data,
        contact_method: "whatsapp",
        whatsapp_number: phoneResult.data,
        client_stage: stage,
        quiz_responses: responses,
        reflection: reflection || null,
        source_path: window.location.pathname,
      });

      if (error) {
        console.error("[LeadCapture] whatsapp save failed:", error);
        toast.error("We couldn't save your details — please try again.");
        setSubmitting(false);
        return;
      }

      persistLeadLocal({
        contact_method: "whatsapp",
        name: nameResult.data,
        whatsapp_number: phoneResult.data,
        stage,
        captured_at: new Date().toISOString(),
      });

      toast.success("Saved. Opening WhatsApp…");

      const summary = encodeURIComponent(buildSummary());
      window.open(`https://wa.me/${TAVARA_WHATSAPP}?text=${summary}`, "_blank");

      closeModal();
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailSubmit = async () => {
    const nameResult = nameSchema.safeParse(name);
    if (!nameResult.success) {
      toast.error(nameResult.error.issues[0].message);
      return;
    }
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast.error(emailResult.error.issues[0].message);
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("quiz_leads").insert({
        name: nameResult.data,
        contact_method: "email",
        email: emailResult.data.toLowerCase(),
        client_stage: stage,
        quiz_responses: responses,
        reflection: reflection || null,
        source_path: window.location.pathname,
      });

      if (error) {
        console.error("[LeadCapture] email save failed:", error);
        toast.error("We couldn't save your details — please try again.");
        setSubmitting(false);
        return;
      }

      persistLeadLocal({
        contact_method: "email",
        name: nameResult.data,
        email: emailResult.data.toLowerCase(),
        stage,
        captured_at: new Date().toISOString(),
      });

      toast.success(
        "Saved. We'll be in touch — and your result is preserved on this device."
      );
      closeModal();
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAccount = () => {
    navigate(`/auth?tab=signup&role=family&from=quiz&stage=${stage}`);
  };

  const handleSignIn = () => {
    navigate(`/auth?from=quiz&stage=${stage}`);
  };

  return (
    <>
      <Card className="border-primary/20">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                Want to keep this?
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Your results are saved on this device — but if you'd like them tied
                to you (and gentle check-ins as things change), pick one:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button
              variant="outline"
              onClick={() => setMode("whatsapp")}
              className="h-auto py-3 px-3 flex-col items-start gap-1 text-left whitespace-normal"
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">WhatsApp my result</span>
              </div>
              <span className="text-xs text-muted-foreground font-normal">
                Send it to Tavara
              </span>
            </Button>

            <Button
              variant="outline"
              onClick={() => setMode("email")}
              className="h-auto py-3 px-3 flex-col items-start gap-1 text-left whitespace-normal"
            >
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Email me my result</span>
              </div>
              <span className="text-xs text-muted-foreground font-normal">
                Just my name + email
              </span>
            </Button>

            <Button
              onClick={handleCreateAccount}
              className="h-auto py-3 px-3 flex-col items-start gap-1 text-left whitespace-normal"
            >
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span className="text-sm font-medium">Create account</span>
              </div>
              <span className="text-xs opacity-90 font-normal">
                Full dashboard
              </span>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Already have an account?{" "}
            <button
              onClick={handleSignIn}
              className="underline underline-offset-2 hover:text-foreground"
            >
              Sign in
            </button>
          </p>
        </CardContent>
      </Card>

      {/* WhatsApp modal */}
      <Dialog open={mode === "whatsapp"} onOpenChange={(o) => !o && closeModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Send my result on WhatsApp
            </DialogTitle>
            <DialogDescription>
              We'll save your details and open WhatsApp pre-filled with your
              result so you can send it to Tavara in one tap.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="wa-name">Your name</Label>
              <Input
                id="wa-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="First name is fine"
                maxLength={100}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wa-phone">WhatsApp number</Label>
              <Input
                id="wa-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="868-xxx-xxxx"
                inputMode="tel"
                maxLength={20}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={closeModal} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleWhatsAppSubmit} disabled={submitting}>
              {submitting ? "Saving…" : "Save & open WhatsApp"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email modal */}
      <Dialog open={mode === "email"} onOpenChange={(o) => !o && closeModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Email me my result
            </DialogTitle>
            <DialogDescription>
              Just your name + email. We'll keep your result on file and send
              gentle check-ins — no spam, ever.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="em-name">Your name</Label>
              <Input
                id="em-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="First name is fine"
                maxLength={100}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="em-email">Email</Label>
              <Input
                id="em-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                maxLength={255}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={closeModal} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleEmailSubmit} disabled={submitting}>
              {submitting ? "Saving…" : "Save my result"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
