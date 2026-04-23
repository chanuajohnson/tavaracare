import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, RefreshCw, Sparkles } from "lucide-react";
import { useFamilyStage } from "@/hooks/useFamilyStage";
import { readinessStages } from "@/data/familyReadinessQuiz";
import { cn } from "@/lib/utils";

/**
 * Persistent "Your readiness" card on the family dashboard. Replaces the
 * `ReadinessQuizBanner` once a stage is set. Mirrors the result-screen CTAs
 * so families always have a path back to their next best step.
 */
export const FamilyReadinessQuickAccess: React.FC = () => {
  const { stage, hasStage, isLoading } = useFamilyStage();

  if (isLoading || !hasStage) return null;

  const stageDef = readinessStages[stage];

  return (
    <Card
      className={cn(
        "mt-6 border-l-4 overflow-hidden",
        stageDef.borderClass,
        stageDef.bgClass
      )}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={cn(
                "p-1.5 rounded-md shrink-0",
                stageDef.iconBgClass
              )}
            >
              <Sparkles className={cn("h-4 w-4", stageDef.iconTextClass)} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Your readiness
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-semibold text-foreground truncate">
                  {stageDef.name}
                </h3>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] py-0 px-1.5 h-5",
                    stageDef.iconTextClass
                  )}
                >
                  {stageDef.badgeText}
                </Badge>
              </div>
            </div>
          </div>

          <Link
            to="/family/readiness-quiz"
            aria-label="Retake readiness quiz"
            className="text-muted-foreground hover:text-foreground shrink-0 p-1 rounded-md hover:bg-background/60 transition-colors"
            title="Retake"
          >
            <RefreshCw className="h-4 w-4" />
          </Link>
        </div>

        <p className="text-sm text-foreground/90 font-medium mb-1 leading-snug">
          {stageDef.title}
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 mb-3">
          {stageDef.body}
        </p>

        <div className="flex flex-wrap gap-2">
          {stageDef.nextSteps.map((step) => (
            <Button
              key={step.href + step.label}
              asChild
              size="sm"
              variant={step.variant === "outline" ? "outline" : "default"}
              className="h-8 text-xs"
            >
              <Link to={step.href}>
                {step.label}
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between gap-2 text-xs">
          <Link
            to="/family/readiness-quiz?view=result"
            className="text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
          >
            View full result
          </Link>
          <Link
            to="/family/readiness-quiz"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Retake
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default FamilyReadinessQuickAccess;
