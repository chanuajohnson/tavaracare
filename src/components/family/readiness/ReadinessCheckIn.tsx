/**
 * Contextual readiness check-in.
 *
 * Only ever asks about the ONE dimension that matters at this moment, and only
 * at a meaningful moment (care starting, a caregiver change, a home
 * recommendation). Never a re-run of the whole assessment.
 */

import React, { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { updateReadinessDimension } from "@/lib/family/readinessHistory";
import { FAMILY_READINESS_CHANGED_EVENT } from "@/hooks/family/useFamilyReadiness";
import {
  CAPACITY_LABELS,
  COMFORT_LABELS,
  LEVEL_LABELS,
  type ReadinessDimension,
  type ReadinessUpdateSource,
} from "@/data/familyReadinessAssessment";

type SupportedDimension =
  | "outside_care_comfort"
  | "information_capacity"
  | "home_change_readiness";

const PROMPTS: Record<SupportedDimension, { prompt: string; helper: string }> = {
  outside_care_comfort: {
    prompt: "How are you feeling about having care in the home now?",
    helper: "Feelings change once care starts, and that's normal.",
  },
  information_capacity: {
    prompt: "How much would you like us to share at once right now?",
    helper: "We'll match our updates to whatever you choose.",
  },
  home_change_readiness: {
    prompt: "How do you feel about changes in the home at this point?",
    helper: "We'll only suggest what you're open to.",
  },
};

const OPTIONS: Record<SupportedDimension, { id: string; label: string }[]> = {
  outside_care_comfort: (
    ["comfortable", "mostly_comfortable", "mixed", "not_yet"] as const
  ).map((id) => ({ id, label: COMFORT_LABELS[id] })),
  information_capacity: (["low", "moderate", "high"] as const).map((id) => ({
    id,
    label: CAPACITY_LABELS[id],
  })),
  home_change_readiness: (["low", "moderate", "high"] as const).map((id) => ({
    id,
    label: LEVEL_LABELS[id],
  })),
};

interface Props {
  dimension: SupportedDimension;
  source: ReadinessUpdateSource;
  onDone?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const ReadinessCheckIn: React.FC<Props> = ({
  dimension,
  source,
  onDone,
  onDismiss,
  className,
}) => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const copy = PROMPTS[dimension];

  const handle = async (value: string) => {
    if (!user?.id) return;
    setSaving(true);
    const { ok } = await updateReadinessDimension(
      user.id,
      dimension as ReadinessDimension,
      value,
      source
    );
    setSaving(false);
    if (!ok) {
      toast.error("We couldn't save that — please try again.");
      return;
    }
    try {
      window.dispatchEvent(new CustomEvent(FAMILY_READINESS_CHANGED_EVENT));
    } catch {
      // ignore
    }
    toast.success("Thank you. We've updated how we'll pace things.");
    onDone?.();
  };

  return (
    <Card className={className}>
      <CardContent className="p-5 space-y-4 relative">
        {onDismiss && (
          <button
            type="button"
            aria-label="Not now"
            onClick={onDismiss}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <div className="pr-6">
          <h3 className="text-base font-semibold text-foreground">{copy.prompt}</h3>
          <p className="text-sm text-muted-foreground mt-1">{copy.helper}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {OPTIONS[dimension].map((o) => (
            <Button
              key={o.id}
              type="button"
              size="sm"
              variant="outline"
              disabled={saving}
              onClick={() => handle(o.id)}
              className="h-auto py-2 whitespace-normal text-left"
            >
              {o.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
