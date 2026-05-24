import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RotateCcw, ArrowRight, Lock, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StageDefinition, ReadinessStage, ReadinessReflection } from "@/data/familyReadinessQuiz";
import { QuizReflectionField } from "./QuizReflectionField";
import { AnonymousLeadCapture } from "./AnonymousLeadCapture";
import { RetakeConfirmDialog } from "./RetakeConfirmDialog";
import { PreviousAnswersPanel } from "./PreviousAnswersPanel";
import { useTracking } from "@/hooks/useTracking";

interface QuizResultCardProps {
  stageDef: StageDefinition;
  isAnonymous: boolean;
  isSaving: boolean;
  onRetake: () => void;
  onSaveStage: () => void;
  /** Final stage number (1-4) */
  stage: ReadinessStage;
  /** Quiz responses by question id */
  responses: Record<string, number>;
  /** Existing reflection from profile (signed-in users) */
  initialReflection?: ReadinessReflection | null;
  /** ISO timestamp of last completion (signed-in users only) */
  assessedAt?: string | null;
}

export const QuizResultCard: React.FC<QuizResultCardProps> = ({
  stageDef,
  isAnonymous,
  isSaving,
  onRetake,
  onSaveStage,
  stage,
  responses,
  initialReflection = null,
  assessedAt = null,
}) => {
  const navigate = useNavigate();
  const [reflectionText, setReflectionText] = useState<string>(
    initialReflection?.text || ""
  );
  const [retakeConfirmOpen, setRetakeConfirmOpen] = useState(false);

  // Freshness messaging — only for signed-in users with a DB timestamp
  const freshness = (() => {
    if (isAnonymous || !assessedAt) return null;
    const ms = Date.now() - new Date(assessedAt).getTime();
    if (Number.isNaN(ms) || ms < 0) return null;
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    let label: string;
    if (days <= 0) label = "Last checked: today";
    else if (days === 1) label = "Last checked: 1 day ago";
    else if (days < 14) label = `Last checked: ${days} days ago`;
    else if (days < 60)
      label = `Last checked: ${days} days ago — does this still feel right?`;
    else
      label =
        "It's been a while since you took this — life may have shifted. Want to refresh?";
    return { days, label };
  })();

  const handleRetakeRequest = () => {
    if (isAnonymous) {
      onRetake();
      return;
    }
    setRetakeConfirmOpen(true);
  };

  const handleRetakeConfirm = () => {
    setRetakeConfirmOpen(false);
    onRetake();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="w-full space-y-6"
    >
      <Card className={cn("border-l-4 shadow-sm", stageDef.borderClass, stageDef.bgClass)}>
        <CardContent className="p-6 sm:p-8 space-y-5">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "h-12 w-12 rounded-full flex items-center justify-center shrink-0",
                stageDef.iconBgClass
              )}
            >
              <Sparkles className={cn("h-6 w-6", stageDef.iconTextClass)} aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
              <Badge
                variant="outline"
                className={cn(
                  "mb-2 bg-white/70 border-current",
                  stageDef.iconTextClass
                )}
              >
                {stageDef.badgeText}
              </Badge>
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground leading-snug">
                {stageDef.title}
              </h2>
              <p className="text-sm sm:text-base text-foreground/80 leading-relaxed mt-3">
                {stageDef.body}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Freshness + retake controls (signed-in users only) */}
      {!isAnonymous && freshness && (
        <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3 space-y-3">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{freshness.label}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRetakeRequest}
              className="gap-2"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Things changed — retake
            </Button>
          </div>
        </div>
      )}

      {/* See my answers — signed-in users with stored responses */}
      {!isAnonymous && Object.keys(responses).length > 0 && (
        <PreviousAnswersPanel responses={responses} />
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          A good next step for you
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {stageDef.nextSteps.map((step, idx) => (
            <Button
              key={idx}
              variant={step.variant ?? "default"}
              onClick={() => {
                if (isAnonymous) {
                  navigate(
                    `/auth?tab=signup&role=family&from=quiz&stage=${stage}`
                  );
                } else {
                  navigate(step.href);
                }
              }}
              className="justify-between h-auto py-3 px-4 text-left"
            >
              <span className="truncate">{step.label}</span>
              <ArrowRight className="h-4 w-4 shrink-0 ml-2" />
            </Button>
          ))}
        </div>
        {isAnonymous && (
          <p className="text-xs text-muted-foreground">
            Create your free account to unlock these next steps.
          </p>
        )}
      </div>


      {/* Open-text reflection field — for ALL users, signed in or anonymous */}
      <QuizReflectionField
        stageDef={stageDef}
        initialReflection={initialReflection}
        onReflectionChange={setReflectionText}
      />

      {/* Anonymous lead capture — only for logged-out users */}
      {isAnonymous && (
        <AnonymousLeadCapture
          stage={stage}
          stageDef={stageDef}
          responses={responses}
          reflection={reflectionText}
        />
      )}

      <Card className="bg-muted/40 border-dashed">
        <CardContent className="p-5 space-y-4">
          {isAnonymous ? (
            <>
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Or just take me to the dashboard.
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your result is saved on this device. You can come back anytime.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="flex-1"
                >
                  Just take me home
                </Button>
                <Button
                  variant="ghost"
                  onClick={onRetake}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Retake
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {isSaving
                      ? "Saving to your profile…"
                      : "Saved. Your dashboard is now tailored to you."}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You can retake this anytime — things change, and your
                    dashboard will follow.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => navigate("/dashboard/family")}
                  className="flex-1"
                  disabled={isSaving}
                >
                  Go to my dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRetakeRequest}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Retake
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <RetakeConfirmDialog
        open={retakeConfirmOpen}
        onOpenChange={setRetakeConfirmOpen}
        onConfirm={handleRetakeConfirm}
        mode="retake-now"
      />
    </motion.div>
  );
};
