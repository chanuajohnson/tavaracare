import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { PageViewTracker } from "@/components/tracking/PageViewTracker";
import { QuizProgressDots } from "@/components/family/quiz/QuizProgressDots";
import { QuizQuestionCard } from "@/components/family/quiz/QuizQuestionCard";
import { QuizResultCard } from "@/components/family/quiz/QuizResultCard";
import {
  readinessQuizQuestions,
  readinessStages,
  scoreQuiz,
  READINESS_LOCAL_STORAGE_KEY,
  READINESS_RESPONSES_LOCAL_KEY,
  type ReadinessStage,
} from "@/data/familyReadinessQuiz";

const AUTO_ADVANCE_MS = 250;

const FamilyReadinessQuizPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(ReadinessStage | undefined)[]>(
    () => Array(readinessQuizQuestions.length).fill(undefined)
  );
  const [showResult, setShowResult] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const totalQuestions = readinessQuizQuestions.length;
  const currentQuestion = readinessQuizQuestions[currentIndex];
  const isAnonymous = !user;

  const finalStage: ReadinessStage = useMemo(() => {
    const numeric = answers.filter((a): a is ReadinessStage => !!a);
    return scoreQuiz(numeric);
  }, [answers]);

  const stageDef = readinessStages[finalStage];

  const buildResponsesObject = (currentAnswers: (ReadinessStage | undefined)[]) => {
    return readinessQuizQuestions.reduce<Record<string, number>>((acc, q, i) => {
      const a = currentAnswers[i];
      if (a) acc[q.id] = a;
      return acc;
    }, {});
  };

  const persistStage = async (
    stage: ReadinessStage,
    finalAnswers: (ReadinessStage | undefined)[]
  ) => {
    const responses = buildResponsesObject(finalAnswers);

    // Always write to localStorage so anonymous → signup migration is possible
    try {
      localStorage.setItem(READINESS_LOCAL_STORAGE_KEY, String(stage));
      localStorage.setItem(
        READINESS_RESPONSES_LOCAL_KEY,
        JSON.stringify(responses)
      );
    } catch {
      // ignore storage failures (private mode etc.)
    }

    // Persist to profile if signed in
    if (user?.id) {
      setIsSaving(true);
      try {
        const { error } = await supabase
          .from("profiles")
          .update({
            client_stage: stage,
            client_stage_assessed_at: new Date().toISOString(),
            client_stage_quiz_responses: responses,
          })
          .eq("id", user.id);

        if (error) {
          console.error("[ReadinessQuiz] failed to save stage:", error);
          toast.error("We couldn't save your stage just now — please try again.");
        } else {
          toast.success("Saved. Your dashboard is now tailored to you.");
        }
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleSelect = (score: ReadinessStage) => {
    const next = [...answers];
    next[currentIndex] = score;
    setAnswers(next);

    setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        const stage = scoreQuiz(
          next.filter((a): a is ReadinessStage => !!a)
        );
        setShowResult(true);
        persistStage(stage, next);
      }
    }, AUTO_ADVANCE_MS);
  };

  const handleBack = () => {
    if (currentIndex === 0) {
      navigate(-1);
      return;
    }
    setCurrentIndex((i) => i - 1);
  };

  const handleRetake = () => {
    setAnswers(Array(totalQuestions).fill(undefined));
    setCurrentIndex(0);
    setShowResult(false);
  };

  const handleSaveStageAnonymous = () => {
    // Stage is already in localStorage from persistStage; route to signup.
    navigate(`/auth?tab=signup&role=family`);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageViewTracker
        actionType={
          showResult ? "readiness_quiz_completed" : "readiness_quiz_view"
        }
        journeyStage="pre-onboarding"
        additionalData={
          showResult ? { stage: finalStage } : undefined
        }
      />

      <div className="container max-w-2xl px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold">
            Tavara Care Readiness Check
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {showResult
              ? "Here's where you are right now"
              : "Let's get a feel for where you are"}
          </h1>
          {!showResult && (
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Six quick questions — about 60 seconds. There's no right or wrong.
            </p>
          )}
        </div>

        {/* Sticky progress dots */}
        {!showResult && (
          <div className="sticky top-2 z-10 flex justify-center mb-6">
            <div className="bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 border border-border/60 shadow-sm">
              <QuizProgressDots
                total={totalQuestions}
                currentIndex={currentIndex}
              />
            </div>
          </div>
        )}

        {/* Body */}
        <div className="relative min-h-[420px]">
          <AnimatePresence mode="wait">
            {!showResult ? (
              <QuizQuestionCard
                key={currentQuestion.id}
                question={currentQuestion}
                questionNumber={currentIndex + 1}
                totalQuestions={totalQuestions}
                selectedScore={answers[currentIndex]}
                canGoBack={currentIndex > 0}
                onSelect={handleSelect}
                onBack={handleBack}
              />
            ) : (
              <QuizResultCard
                key="result"
                stageDef={stageDef}
                isAnonymous={isAnonymous}
                isSaving={isSaving}
                onRetake={handleRetake}
                onSaveStage={handleSaveStageAnonymous}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Reassurance footer */}
        {!showResult && (
          <p className="text-center text-xs text-muted-foreground mt-8">
            We use this only to tailor your experience. You can retake it
            anytime.
          </p>
        )}
      </div>
    </div>
  );
};

export default FamilyReadinessQuizPage;
