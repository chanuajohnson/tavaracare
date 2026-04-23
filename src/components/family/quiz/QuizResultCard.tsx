import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RotateCcw, ArrowRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StageDefinition } from "@/data/familyReadinessQuiz";

interface QuizResultCardProps {
  stageDef: StageDefinition;
  isAnonymous: boolean;
  isSaving: boolean;
  onRetake: () => void;
  onSaveStage: () => void;
}

export const QuizResultCard: React.FC<QuizResultCardProps> = ({
  stageDef,
  isAnonymous,
  isSaving,
  onRetake,
  onSaveStage,
}) => {
  const navigate = useNavigate();

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

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          A good next step for you
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {stageDef.nextSteps.map((step, idx) => (
            <Button
              key={idx}
              variant={step.variant ?? "default"}
              onClick={() => navigate(step.href)}
              className="justify-between h-auto py-3 px-4 text-left"
            >
              <span className="truncate">{step.label}</span>
              <ArrowRight className="h-4 w-4 shrink-0 ml-2" />
            </Button>
          ))}
        </div>
      </div>

      <Card className="bg-muted/40 border-dashed">
        <CardContent className="p-5 space-y-4">
          {isAnonymous ? (
            <>
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Save your stage so we can tailor everything to you.
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create a free family account and we'll personalize your
                    dashboard, recommendations, and check-ins around where you
                    are right now.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={onSaveStage} disabled={isSaving} className="flex-1">
                  {isSaving ? "Saving…" : "Save my stage & continue"}
                </Button>
                <Button
                  variant="outline"
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
                  onClick={onRetake}
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
    </motion.div>
  );
};
