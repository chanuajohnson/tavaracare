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
  readinessStages,
  READINESS_LOCAL_STORAGE_KEY,
  type ReadinessReflection,
} from "@/data/familyReadinessQuiz";
import {
  visibleQuestions,
  deriveReadinessProfile,
  journeyStageToLegacyStage,
  readAssessmentProgress,
  writeAssessmentProgress,
  clearAssessmentProgress,
  countAssessmentAnswered,
  READINESS_ASSESSMENT_PROFILE_KEY,
  type AssessmentAnswers,
  type FamilyReadinessProfile,
} from "@/data/familyReadinessAssessment";
import { saveReadinessProfile, cacheProfileLocally } from "@/lib/family/readinessHistory";

const AUTO_ADVANCE_MS = 250;

const FamilyReadinessQuizPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trackEngagement } = useTracking();
  const [searchParams] = useSearchParams();
  const viewParam = searchParams.get("view");
  const retakeParam = searchParams.get("retake");
  const fromRegistration = searchParams.get("from") === "registration";

  const { stage: savedStage, hasStage, isLoading: stageLoading, clearStage } = useFamilyStage();

  const [answers, setAnswers] = useState<AssessmentAnswers>({});
  const [freeText, setFreeText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [resumePromptOpen, setResumePromptOpen] = useState(false);
  const [pendingProgress, setPendingProgress] = useState<{
    answers: AssessmentAnswers;
    currentIndex: number;
    freeText?: string;
  } | null>(null);
  const [initialReflection, setInitialReflection] = useState<ReadinessReflection | null>(null);
  const [assessedAt, setAssessedAt] = useState<string | null>(null);

  // The visible set is answer-dependent (conditional Q2b).
  const questions = useMemo(() => visibleQuestions(answers), [answers]);
  const totalQuestions = questions.length;
  const currentQuestion = questions[Math.min(currentIndex, totalQuestions - 1)];
  const isAnonymous = !user;

  const viewResultMode = viewParam === "result" && hasStage;
  const isRetakeRequested = retakeParam === "1";
  const resultFirstMode = !!user && hasStage && !isRetakeRequested;

  // Result presentation reuses the existing stage cards. The stage is derived
  // from the journey question alone — never from service appetite.
  const derivedProfile = useMemo<FamilyReadinessProfile | null>(() => {
    if (viewResultMode || resultFirstMode) return null;
    return deriveReadinessProfile(answers, { freeText });
  }, [answers, freeText, viewResultMode, resultFirstMode]);

  const finalStage =
    viewResultMode || resultFirstMode
      ? savedStage
      : journeyStageToLegacyStage(derivedProfile?.current_journey_stage);

  const stageDef = readinessStages[finalStage];

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
      journey_stage: derivedProfile?.current_journey_stage,
      viewMode: viewResultMode ? "result" : resultFirstMode ? "result_first" : "fresh",
    }).catch((e) => console.warn("[ReadinessQuiz] completion track failed", e));
  }, [
    showResult,
    finalStage,
    derivedProfile,
    viewResultMode,
    resultFirstMode,
    searchParams,
    trackEngagement,
  ]);

  // ?retake=1 — clear in-progress, start fresh, no resume prompt
  useEffect(() => {
    if (isRetakeRequested) {
      clearAssessmentProgress();
      setAnswers({});
      setFreeText("");
      setCurrentIndex(0);
      setShowResult(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isRetakeRequested) return;
    if (stageLoading) return;

    if (viewResultMode || resultFirstMode) {
      setShowResult(true);
      return;
    }

    const progress = readAssessmentProgress();
    const answered = progress ? countAssessmentAnswered(progress.answers) : 0;
    if (progress && answered > 0) {
      setPendingProgress({
        answers: progress.answers,
        currentIndex: Math.max(progress.currentIndex, 0),
        freeText: progress.freeText,
      });
      setResumePromptOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageLoading, viewResultMode, resultFirstMode, isRetakeRequested]);

  // Existing reflection + timestamp for the result view
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
      const responses = data?.client_stage_quiz_responses as Record<string, unknown> | null;
      const r = responses?.reflection as ReadinessReflection | undefined;
      if (r?.text) setInitialReflection(r);
      const ts = data?.client_stage_assessed_at as string | null | undefined;
      if (ts) setAssessedAt(ts);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, showResult]);

  const persist = async (finalAnswers: AssessmentAnswers, finalFreeText: string) => {
    const profile = deriveReadinessProfile(finalAnswers, {
      source: "initial_quiz",
      freeText: finalFreeText,
    });

    cacheProfileLocally(profile);
    try {
      localStorage.setItem(
        READINESS_LOCAL_STORAGE_KEY,
        String(journeyStageToLegacyStage(profile.current_journey_stage))
      );
    } catch {
      // ignore
    }
    clearAssessmentProgress();

    if (user?.id) {
      setIsSaving(true);
      try {
        const { ok } = await saveReadinessProfile(user.id, profile, "initial_quiz");
        if (!ok) {
          toast.error("We couldn't save your answers just now — please try again.");
        } else {
          toast.success("Thank you. We'll pace things the way you asked.");
        }
      } finally {
        setIsSaving(false);
      }
    }

    try {
      window.dispatchEvent(new CustomEvent(FAMILY_STAGE_CHANGED_EVENT));
    } catch {
      // ignore
    }
  };

  const trackedQuestionsRef = useRef<Set<string>>(new Set());

  const trackAnswer = (questionId: string, value: unknown) => {
    if (trackedQuestionsRef.current.has(questionId)) return;
    trackedQuestionsRef.current.add(questionId);
    trackEngagement("quiz_question_answered" as any, {
      question_id: questionId,
      question_index: currentIndex,
      total_questions: totalQuestions,
      answer_value: Array.isArray(value) ? value.join(",") : String(value),
      is_anonymous: isAnonymous,
    }).catch((e) => console.warn("[ReadinessQuiz] question track failed", e));
  };

  const advance = (nextAnswers: AssessmentAnswers, nextFreeText: string) => {
    const nextVisible = visibleQuestions(nextAnswers);
    if (currentIndex < nextVisible.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      writeAssessmentProgress(nextAnswers, nextIndex, nextFreeText);
    } else {
      setShowResult(true);
      persist(nextAnswers, nextFreeText);
    }
  };

  const handleSelect = (value: string | string[]) => {
    if (!currentQuestion) return;
    const next = { ...answers, [currentQuestion.id]: value };
    setAnswers(next);
    writeAssessmentProgress(next, currentIndex, freeText);
    trackAnswer(currentQuestion.id, value);

    const needsContinue =
      currentQuestion.kind === "multi" ||
      !!currentQuestion.followUp ||
      !!currentQuestion.freeText;
    if (needsContinue) return;

    setTimeout(() => advance(next, freeText), AUTO_ADVANCE_MS);
  };

  const handleFollowUpSelect = (value: string) => {
    if (!currentQuestion?.followUp) return;
    const next = { ...answers, [currentQuestion.followUp.id]: value };
    setAnswers(next);
    writeAssessmentProgress(next, currentIndex, freeText);
  };

  const handleFreeTextChange = (value: string) => {
    setFreeText(value);
    writeAssessmentProgress(answers, currentIndex, value);
  };

  const handleContinue = () => advance(answers, freeText);

  const handleSkip = () => {
    if (!currentQuestion) return;
    const next = { ...answers };
    delete next[currentQuestion.id];
    setAnswers(next);
    advance(next, freeText);
  };

  const handleBack = () => {
    if (currentIndex === 0) {
      navigate(-1);
      return;
    }
    setCurrentIndex((i) => i - 1);
  };

  const handleRetake = async () => {
    clearAssessmentProgress();
    try {
      localStorage.removeItem(READINESS_ASSESSMENT_PROFILE_KEY);
    } catch {
      // ignore
    }
    setAnswers({});
    setFreeText("");
    setCurrentIndex(0);
    setShowResult(false);
    setInitialReflection(null);
    setAssessedAt(null);
    const ok = await clearStage();
    if (!ok) {
      toast.error("Couldn't clear your previous result — please try again.");
    }
    navigate("/family/readiness-quiz?retake=1", { replace: true });
  };

  const handleSaveStageAnonymous = () => {
    navigate(`/auth?tab=signup&role=family`);
  };

  const handleResumeContinue = () => {
    if (!pendingProgress) return;
    setAnswers(pendingProgress.answers);
    setFreeText(pendingProgress.freeText ?? "");
    const visible = visibleQuestions(pendingProgress.answers);
    setCurrentIndex(Math.min(pendingProgress.currentIndex, visible.length - 1));
    setResumePromptOpen(false);
    setPendingProgress(null);
  };

  const handleResumeStartOver = () => {
    clearAssessmentProgress();
    setAnswers({});
    setFreeText("");
    setCurrentIndex(0);
    setResumePromptOpen(false);
    setPendingProgress(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageViewTracker
        actionType="readiness_quiz_view"
        journeyStage="pre-onboarding"
        additionalData={{ initial_mode: resultFirstMode ? "result_first" : "fresh" }}
      />
      {showResult && (
        <PageViewTracker
          actionType="readiness_quiz_completed"
          journeyStage="pre-onboarding"
          additionalData={{ stage: finalStage, viewMode: viewResultMode ? "result" : "fresh" }}
        />
      )}
      <PageViewTracker
        actionType="family_registration_page_view"
        journeyStage="registration"
        additionalData={{ source: "readiness_quiz" }}
      />

      <div className="container max-w-2xl px-4 py-8 sm:py-12">
        <div className="text-center mb-8 space-y-2">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold">
            Tavara Care Readiness Check
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {showResult
              ? "Here's where you are right now"
              : "Help us understand where you are"}
          </h1>
          {!showResult && (
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              A few short questions, so we can pace this right for you. No wrong
              answers, and you can change any of these later.
            </p>
          )}
          {!showResult && fromRegistration && (
            <p className="text-xs text-muted-foreground">
              Thanks for registering. This is the last step, and you can skip any
              question.
            </p>
          )}
        </div>

        {resumePromptOpen && pendingProgress && !showResult && (
          <div className="mb-6 rounded-lg border border-primary/30 bg-primary/5 p-4">
            <p className="text-sm font-medium text-foreground">
              Pick up where you left off?
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              You answered {countAssessmentAnswered(pendingProgress.answers)} question
              {countAssessmentAnswered(pendingProgress.answers) === 1 ? "" : "s"} last time.
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

        {!showResult && !resumePromptOpen && (
          <div className="sticky top-2 z-10 flex justify-center mb-6">
            <div className="bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 border border-border/60 shadow-sm">
              <QuizProgressDots total={totalQuestions} currentIndex={currentIndex} />
            </div>
          </div>
        )}

        {!resumePromptOpen && (
          <div className="relative min-h-[420px]">
            <AnimatePresence mode="wait">
              {!showResult && currentQuestion ? (
                <QuizQuestionCard
                  key={currentQuestion.id}
                  question={currentQuestion}
                  questionNumber={currentIndex + 1}
                  totalQuestions={totalQuestions}
                  value={answers[currentQuestion.id]}
                  followUpValue={
                    currentQuestion.followUp
                      ? (answers[currentQuestion.followUp.id] as string | undefined)
                      : undefined
                  }
                  freeText={freeText}
                  canGoBack={currentIndex > 0}
                  onSelect={handleSelect}
                  onFollowUpSelect={handleFollowUpSelect}
                  onFreeTextChange={handleFreeTextChange}
                  onContinue={handleContinue}
                  onSkip={handleSkip}
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
                  responses={(derivedProfile?.raw_answers ?? {}) as Record<string, unknown>}
                  initialReflection={initialReflection}
                  assessedAt={assessedAt}
                />
              )}
            </AnimatePresence>
          </div>
        )}

        {!showResult && !resumePromptOpen && (
          <p className="text-center text-xs text-muted-foreground mt-8">
            We use this only to pace your experience. You can update it anytime.
          </p>
        )}
      </div>
    </div>
  );
};

export default FamilyReadinessQuizPage;
