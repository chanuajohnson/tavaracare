import React from "react";
import { cn } from "@/lib/utils";

interface QuizProgressDotsProps {
  total: number;
  currentIndex: number; // 0-based
}

export const QuizProgressDots: React.FC<QuizProgressDotsProps> = ({
  total,
  currentIndex,
}) => {
  return (
    <div
      className="flex items-center justify-center gap-2"
      role="progressbar"
      aria-valuenow={currentIndex + 1}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`Question ${currentIndex + 1} of ${total}`}
    >
      {Array.from({ length: total }).map((_, i) => {
        const isCurrent = i === currentIndex;
        const isComplete = i < currentIndex;
        return (
          <span
            key={i}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              isCurrent
                ? "w-6 bg-primary"
                : isComplete
                ? "w-2 bg-primary/60"
                : "w-2 bg-muted"
            )}
          />
        );
      })}
    </div>
  );
};
