import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTracking } from "@/hooks/useTracking";
import { useAuth } from "@/components/providers/AuthProvider";
import { PageViewTracker } from "@/components/tracking/PageViewTracker";
import { Button } from "@/components/ui/button";
import { QuizProgressDots } from "@/components/family/quiz/QuizProgressDots";
import { QuizQuestionCard } from "@/components/family/quiz/QuizQuestionCard";
import { QuizResultCard } from "@/components/family/quiz/QuizResultCard";
import { useFamilyStage, FAMILY_STAGE_CHANGED_EVENT } from "@/hooks/useFamilyStage";
import {
  readinessQuizQuestions,
  readinessStages,
  scoreQuiz,
  READINESS_LOCAL_STORAGE_KEY,
  READINESS_RESPONSES_LOCAL_KEY,
  readQuizProgress,
  writeQuizProgress,
  clearQuizProgress,
  countAnswered,
  type ReadinessStage,
  type ReadinessReflection,
} from "@/data/familyReadinessQuiz";

const AUTO_ADVANCE_MS = 250;

const FamilyReadinessQuizPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trackEngagement } = useTracking();
  const [searchParams] = useSearchParams();
  const viewParam = searchParams.get("view");
  const retakeParam = searchParams.get("retake");

  const { stage: savedStage, hasStage, isLoading: stageLoading, clearStage } = useFamilyStage();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(ReadinessStage | undefined)[]>(
    () => Array(readinessQuizQuestions.length).fill(undefined)
  );
  const [showResult, setShowResult] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [resumePromptOpen, setResumePromptOpen] = useState(false);
  const [pendingProgress, setPendingProgress] = useState<{
    answers: (ReadinessStage | undefined)[];
    currentIndex: number;
  } | null>(null);
  const [initialReflection, setInitialReflection] = useState<ReadinessReflection | null>(null);
  const [savedResponses, setSavedResponses] = useState<Record<string, number>>({});
  const [assessedAt, setAssessedAt] = useState<string | null>(null);

  const totalQuestions = readinessQuizQuestions.length;
  const currentQuestion = readinessQuizQuestions[currentIndex];
  const isAnonymous = !user;

  // Direct view=result mode — show their saved stage as the full result
  const viewResultMode = viewParam === "result" && hasStage;
  // Result-first mode for authenticated returners (skipped if ?retake=1)
  const isRetakeRequested = retakeParam === "1";
  const resultFirstMode = !!user && hasStage && !isRetakeRequested;

  const finalStage: ReadinessStage = useMemo(() => {
    if (viewResultMode || resultFirstMode) return savedStage;
    const numeric = answers.filter((a): a is ReadinessStage => !!a);
    return scoreQuiz(numeric);
  }, [answers, viewResultMode, resultFirstMode, savedStage]);

  const stageDef = readinessStages[finalStage];

  // Fire readiness_quiz_completed exactly once per mount when results appear.
  // PageViewTracker only re-fires on URL changes, so completion events were missed.
  const completionTrackedRef = useRef(false);
  useEffect(() => {
    if (!showResult || completionTrackedRef.current) return;
    completionTrackedRef.current = true;
    const utm: Record<string, string> = {};
    for (const k of [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "utm_referrer_source",
      "utm_referrer_campaign",
      "utm_referrer_content",
    ]) {
      const v = searchParams.get(k);
      if (v) utm[k] = v;
    }
    trackEngagement("readiness_quiz_completed" as any, {
      ...utm,
      stage: finalStage,
      viewMode: viewResultMode ? "result" : resultFirstMode ? "result_first" : "fresh",
    }).catch((e) => console.warn("[ReadinessQuiz] completion track failed", e));
  }, [showResult, finalStage, viewResultMode, resultFirstMode, searchParams, trackEngagement]);


  // On mount: handle ?retake=1 (clear in-progress, start fresh, no resume prompt)
  useEffect(() => {
    if (isRetakeRequested) {
      clearQuizProgress();
      setAnswers(Array(totalQuestions).fill(undefined));
      setCurrentIndex(0);
      setShowResult(false);
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On mount / when stage resolves: route signed-in returners to result-first
  useEffect(() => {
    if (isRetakeRequested) return;
    if (stageLoading) return;

    if (viewResultMode || resultFirstMode) {
      setShowResult(true);
      return;
    }

    // Otherwise, look for in-progress quiz to offer resume
    const progress = readQuizProgress();
    if (
      progress &&
      progress.answers.length === totalQuestions &&
      countAnswered(progress.answers) > 0 &&
      countAnswered(progress.answers) < totalQuestions
    ) {
      setPendingProgress({
        answers: progress.answers,
        currentIndex: Math.min(
          Math.max(progress.currentIndex, 0),
          totalQuestions - 1
        ),
      });
      setResumePromptOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageLoading, viewResultMode, resultFirstMode, isRetakeRequested]);

  // Load existing reflection + responses + assessedAt from profile (signed-in) when viewing result
  useEffect(() => {
    if (!user?.id || !showResult) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("client_stage_quiz_responses, client_stage_assessed_at")
        .eq("id", user.id)
        .maybeSingle();
      if (error || cancelled) return;
      const responses = data?.client_stage_quiz_responses as
        | Record<string, unknown>
        | null
        | undefined;
      const r = responses?.reflection as ReadinessReflection | undefined;
      if (r?.text) setInitialReflection(r);

      // Build a clean responses map (questionId -> score) for PreviousAnswersPanel
      if (responses && typeof responses === "object") {
        const cleaned: Record<string, number> = {};
        for (const q of readinessQuizQuestions) {
          const v = responses[q.id];
          if (typeof v === "number" && v >= 1 && v <= 4) {
            cleaned[q.id] = v;
          }
        }
        setSavedResponses(cleaned);
      }

      const ts = data?.client_stage_assessed_at as string | null | undefined;
      if (ts) setAssessedAt(ts);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, showResult]);

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

    try {
      localStorage.setItem(READINESS_LOCAL_STORAGE_KEY, String(stage));
      localStorage.setItem(
        READINESS_RESPONSES_LOCAL_KEY,
        JSON.stringify(responses)
      );
    } catch {
      // ignore storage failures
    }

    // Completed — clear any in-progress data
    clearQuizProgress();

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

    // Notify all mounted useFamilyStage() instances (dashboard banners, etc.)
    // so the banner→quick-access transition happens without a refresh.
    try {
      window.dispatchEvent(new CustomEvent(FAMILY_STAGE_CHANGED_EVENT));
    } catch {
      // ignore — non-browser env
    }
  };

  const trackedQuestionsRef = useRef<Set<string>>(new Set());

  const handleSelect = (score: ReadinessStage) => {
    const next = [...answers];
    next[currentIndex] = score;
    setAnswers(next);

    // Persist in-progress on every selection
    writeQuizProgress(next, currentIndex);

    // Fire per-question tracking once per question per mount (anon-safe)
    const qKey = `${currentQuestion.id}:${currentIndex}`;
    if (!trackedQuestionsRef.current.has(qKey)) {
      trackedQuestionsRef.current.add(qKey);
      const utm: Record<string, string> = {};
      for (const k of [
        "utm_source", "utm_medium", "utm_campaign", "utm_content",
        "utm_term", "utm_referrer_source", "utm_referrer_campaign", "utm_referrer_content",
      ]) {
        const v = searchParams.get(k);
        if (v) utm[k] = v;
      }
      trackEngagement("quiz_question_answered" as any, {
        ...utm,
        question_id: currentQuestion.id,
        question_index: currentIndex,
        total_questions: totalQuestions,
        answer_value: score,
        is_anonymous: isAnonymous,
      }).catch((e) => console.warn("[ReadinessQuiz] question track failed", e));
    }

    setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        writeQuizProgress(next, nextIndex);
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

  const handleRetake = async () => {
    clearQuizProgress();
    setAnswers(Array(totalQuestions).fill(undefined));
    setCurrentIndex(0);
    setShowResult(false);
    setInitialReflection(null);
    setSavedResponses({});
    setAssessedAt(null);
    // Clear saved stage immediately so abandoning mid-retake doesn't leave a
    // stale dashboard card behind. If the DB write fails, surface a toast but
    // still proceed to Q1 — the local state has already been wiped.
    const ok = await clearStage();
    if (!ok) {
      toast.error("Couldn't clear your previous result — please try again.");
    }
    // Navigate to ?retake=1 so result-first mode is bypassed and any existing
    // ?view=result query param is cleared.
    navigate("/family/readiness-quiz?retake=1", { replace: true });
  };

  const handleSaveStageAnonymous = () => {
    navigate(`/auth?tab=signup&role=family`);
  };

  const handleResumeContinue = () => {
    if (!pendingProgress) return;
    setAnswers(pendingProgress.answers);
    setCurrentIndex(pendingProgress.currentIndex);
    setResumePromptOpen(false);
    setPendingProgress(null);
  };

  const handleResumeStartOver = () => {
    clearQuizProgress();
    setAnswers(Array(totalQuestions).fill(undefined));
    setCurrentIndex(0);
    setResumePromptOpen(false);
    setPendingProgress(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Always-on quiz view event — fires exactly once per mount, independent
          of result-state, so funnel analytics can see who actually lands here. */}
      <PageViewTracker
        actionType="readiness_quiz_view"
        journeyStage="pre-onboarding"
        additionalData={{ initial_mode: resultFirstMode ? "result_first" : "fresh" }}
      />
      {/* Separate completion event, only fired when results render. */}
      {showResult && (
        <PageViewTracker
          actionType="readiness_quiz_completed"
          journeyStage="pre-onboarding"
          additionalData={{ stage: finalStage, viewMode: viewResultMode ? "result" : "fresh" }}
        />
      )}
      {/* Funnel attribution: the readiness quiz is the soft on-ramp for family
          registration, so we also emit family_registration_page_view here so the
          admin Acquisition Funnel Card counts quiz landers as registration-page
          intent. Fires once per mount. */}
      <PageViewTracker
        actionType="family_registration_page_view"
        journeyStage="registration"
        additionalData={{ source: "readiness_quiz" }}
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

        {/* Resume prompt */}
        {resumePromptOpen && pendingProgress && !showResult && (
          <div className="mb-6 rounded-lg border border-primary/30 bg-primary/5 p-4">
            <p className="text-sm font-medium text-foreground">
              Pick up where you left off?
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              You answered {countAnswered(pendingProgress.answers)} of {totalQuestions} last time.
            </p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={handleResumeContinue}>
                Continue
              </Button>
              <Button size="sm" variant="outline" onClick={handleResumeStartOver}>
                Start over
              </Button>
            </div>
          </div>
        )}

        {/* Sticky progress dots */}
        {!showResult && !resumePromptOpen && (
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
        {!resumePromptOpen && (
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
                  stage={finalStage}
                  responses={
                    viewResultMode || resultFirstMode
                      ? savedResponses
                      : buildResponsesObject(answers)
                  }
                  initialReflection={initialReflection}
                  assessedAt={assessedAt}
                />
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Reassurance footer */}
        {!showResult && !resumePromptOpen && (
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
