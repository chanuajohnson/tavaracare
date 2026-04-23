import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { QuizQuestion, ReadinessStage } from "@/data/familyReadinessQuiz";

interface QuizQuestionCardProps {
  question: QuizQuestion;
  /** 1-based for display */
  questionNumber: number;
  totalQuestions: number;
  selectedScore?: ReadinessStage;
  canGoBack: boolean;
  onSelect: (score: ReadinessStage) => void;
  onBack: () => void;
}

export const QuizQuestionCard: React.FC<QuizQuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  selectedScore,
  canGoBack,
  onSelect,
  onBack,
}) => {
  const Icon = question.icon;

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
                <p className="text-sm text-muted-foreground mt-2">
                  {question.helper}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question.options.map((option, idx) => {
              const isSelected = selectedScore === option.score;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelect(option.score)}
                  className={cn(
                    "min-h-[64px] rounded-xl border text-left p-4 transition-all duration-200",
                    "hover:border-primary/60 hover:shadow-sm hover:-translate-y-0.5",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-card"
                  )}
                  aria-pressed={isSelected}
                >
                  <span className="text-sm sm:text-[15px] leading-relaxed text-foreground">
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
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
            <p className="text-xs text-muted-foreground">
              Tap a card to continue
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
