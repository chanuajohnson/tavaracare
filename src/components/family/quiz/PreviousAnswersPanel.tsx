import React, { useState } from "react";
import { ChevronDown, ChevronUp, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { readinessQuizQuestions } from "@/data/familyReadinessQuiz";

interface PreviousAnswersPanelProps {
  /** Map of questionId -> selected score (1-4) */
  responses: Record<string, number>;
}

export const PreviousAnswersPanel: React.FC<PreviousAnswersPanelProps> = ({
  responses,
}) => {
  const [open, setOpen] = useState(false);

  const hasAny = readinessQuizQuestions.some((q) => responses[q.id]);
  if (!hasAny) return null;

  return (
    <div className="rounded-lg border border-border/60 bg-background/50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors rounded-lg"
        aria-expanded={open}
      >
        <span>See my answers</span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 space-y-4 border-t border-border/60">
          {readinessQuizQuestions.map((q, idx) => {
            const score = responses[q.id];
            const selected = q.options.find((o) => o.score === score);
            return (
              <div key={q.id} className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">
                  {idx + 1}. {q.prompt}
                </p>
                {selected ? (
                  <div className="flex items-start gap-2 text-sm text-foreground">
                    <Check
                      className={cn(
                        "h-4 w-4 mt-0.5 shrink-0 text-primary"
                      )}
                      aria-hidden
                    />
                    <span>{selected.label}</span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No answer recorded
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
