import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { AssessmentQuestion } from "@/data/familyReadinessAssessment";

interface QuizQuestionCardProps {
  question: AssessmentQuestion;
  /** 1-based for display */
  questionNumber: number;
  totalQuestions: number;
  /** Current answer: string for single-select, string[] for multi-select */
  value?: string | string[];
  /** Current answer for the on-card follow-up (e.g. best time to reach you) */
  followUpValue?: string;
  freeText?: string;
  canGoBack: boolean;
  onSelect: (value: string | string[]) => void;
  onFollowUpSelect: (value: string) => void;
  onFreeTextChange: (value: string) => void;
  onContinue: () => void;
  onSkip: () => void;
  onBack: () => void;
}

export const QuizQuestionCard: React.FC<QuizQuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  value,
  followUpValue,
  freeText = "",
  canGoBack,
  onSelect,
  onFollowUpSelect,
  onFreeTextChange,
  onContinue,
  onSkip,
  onBack,
}) => {
  const Icon = question.icon;
  const isMulti = question.kind === "multi";
  const selected = isMulti
    ? Array.isArray(value)
      ? value
      : []
    : typeof value === "string"
      ? [value]
      : [];

  const [localText, setLocalText] = useState(freeText);
  useEffect(() => setLocalText(freeText), [question.id, freeText]);

  const toggle = (optionId: string) => {
    if (!isMulti) {
      onSelect(optionId);
      return;
    }
    const next = selected.includes(optionId)
      ? selected.filter((s) => s !== optionId)
      : [...selected, optionId];
    onSelect(next);
  };

  // Multi-select, an on-card follow-up, or a free-text field all need an
  // explicit Continue. Plain single-selects advance on their own.
  const needsContinue = isMulti || !!question.followUp || !!question.freeText;
  const canContinue = selected.length > 0;

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full"
    >
      <Card className="border-0 shadow-none sm:border sm:shadow-sm bg-transparent sm:bg-card">
        <CardContent className="p-0 sm:p-6 space-y-6">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="h-5 w-5 text-primary" aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                Question {questionNumber} of {totalQuestions}
              </p>
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground leading-snug mt-1">
                {question.prompt}
              </h2>
              {question.helper && (
                <p className="text-sm text-muted-foreground mt-2">{question.helper}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question.options.map((option) => {
              const isSelected = selected.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggle(option.id)}
                  className={cn(
                    "min-h-[64px] rounded-xl border text-left p-4 transition-all duration-200",
                    "hover:border-primary/60 hover:shadow-sm hover:-translate-y-0.5",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "flex items-start gap-2",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-card"
                  )}
                  aria-pressed={isSelected}
                >
                  {isMulti && (
                    <span
                      className={cn(
                        "mt-0.5 h-4 w-4 rounded border shrink-0 flex items-center justify-center",
                        isSelected ? "bg-primary border-primary" : "border-muted-foreground/40"
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                    </span>
                  )}
                  <span className="text-sm sm:text-[15px] leading-relaxed text-foreground">
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>

          {question.followUp && selected.length > 0 && (
            <div className="space-y-2 rounded-xl border border-border/60 bg-muted/30 p-4">
              <p className="text-sm font-medium text-foreground">
                {question.followUp.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {question.followUp.options.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onFollowUpSelect(opt.id)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm transition-colors",
                      followUpValue === opt.id
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/60"
                    )}
                    aria-pressed={followUpValue === opt.id}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {question.freeText && (
            <div className="space-y-2">
              <label
                htmlFor={`${question.id}-text`}
                className="text-sm font-medium text-foreground"
              >
                {question.freeText.label}
              </label>
              <Textarea
                id={`${question.id}-text`}
                value={localText}
                placeholder={question.freeText.placeholder}
                rows={3}
                onChange={(e) => {
                  setLocalText(e.target.value);
                  onFreeTextChange(e.target.value);
                }}
              />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onBack}
              disabled={!canGoBack}
              className="gap-1 text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onSkip}
                className="text-muted-foreground"
              >
                Skip this
              </Button>
              {needsContinue ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={onContinue}
                  disabled={!canContinue}
                  className="gap-1"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">Tap a card to continue</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
