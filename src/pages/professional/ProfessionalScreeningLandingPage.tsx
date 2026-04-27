import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Clock, CheckCircle2, Mic, PlayCircle, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

interface ScreeningSession {
  id: string;
  status: string;
  access_token: string;
  template_id: string;
  template_name?: string;
  question_count?: number;
}

const ProfessionalScreeningLandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<ScreeningSession[]>([]);
  const [tipsShown, setTipsShown] = useState(true);
  const nextSessionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchScreeningSessions();
    }
  }, [user]);

  const fetchScreeningSessions = async () => {
    try {
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("screening_sessions")
        .select("id, status, access_token, template_id")
        .eq("professional_id", user?.id)
        .order("created_at", { ascending: true });

      if (sessionsError) {
        console.error("Error fetching screening sessions:", sessionsError);
        setLoading(false);
        return;
      }

      if (!sessionsData || sessionsData.length === 0) {
        setSessions([]);
        setLoading(false);
        return;
      }

      const templateIds = [...new Set(sessionsData.map(s => s.template_id))];
      const { data: templates } = await supabase
        .from("screening_question_templates")
        .select("id, title, questions")
        .in("id", templateIds);

      const templateMap = new Map(
        templates?.map(t => [t.id, { 
          name: t.title || "Screening Questionnaire",
          questionCount: Array.isArray(t.questions) ? t.questions.length : 0
        }]) || []
      );

      const enrichedSessions: ScreeningSession[] = sessionsData.map(s => ({
        ...s,
        template_name: templateMap.get(s.template_id)?.name || "Screening Questionnaire",
        question_count: templateMap.get(s.template_id)?.questionCount || 0
      }));

      setSessions(enrichedSessions);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll to the next incomplete session after loading
  useEffect(() => {
    if (!loading && nextSessionRef.current) {
      setTimeout(() => {
        nextSessionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 600);
    }
  }, [loading, sessions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.status === "completed" || s.status === "reviewed").length;
  const remainingSessions = totalSessions - completedSessions;
  const allComplete = totalSessions > 0 && completedSessions === totalSessions;
  const progressPercent = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

  // Find the first incomplete session
  const nextSession = sessions.find(s => s.status !== "completed" && s.status !== "reviewed");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
      case "reviewed":
        return <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700"><CheckCircle2 className="h-3 w-3" /> Completed</span>;
      case "in_progress":
        return <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700"><PlayCircle className="h-3 w-3" /> In Progress</span>;
      default:
        return <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700"><Clock className="h-3 w-3" /> Pending</span>;
    }
  };

  const formatTemplateName = (name: string) => {
    return name
      .replace(/_/g, " ")
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  // No sessions exist — waiting state
  if (totalSessions === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-2xl px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                  <Clock className="h-8 w-8 text-amber-600" />
                </div>
                <CardTitle className="text-2xl">Screening Not Yet Assigned</CardTitle>
                <CardDescription className="text-base mt-2">
                  Your screening interview has not been assigned yet. The Tavara team will prepare your 
                  screening questions and notify you when it's time. In the meantime, make sure you've 
                  completed all previous steps in your onboarding journey.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => navigate("/dashboard/professional")}>
                  Return to Dashboard
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // All sessions completed — celebration state
  if (allComplete) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-2xl px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">🎉 All Screenings Complete!</CardTitle>
                <CardDescription className="text-base mt-2">
                  You've completed all {totalSessions} screening questionnaire{totalSessions > 1 ? "s" : ""}. 
                  The Tavara team is reviewing your responses and will notify you when your profile is cleared.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-green-600">{completedSessions} of {totalSessions} completed</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
                <Button variant="outline" className="w-full" onClick={() => navigate("/dashboard/professional")}>
                  Return to Dashboard
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Multi-session progress view
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl px-4 py-12 pb-28">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
          
          {/* Progress Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Mic className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Your Screening Progress</CardTitle>
                  <CardDescription>
                    Complete all questionnaires to move forward in your onboarding
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-medium">{completedSessions} of {totalSessions} questionnaires</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Next Session Banner */}
          {nextSession && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card className="border-primary bg-primary/5 shadow-md">
                <CardContent className="py-5 px-5">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                        {remainingSessions}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm">
                          {remainingSessions} session{remainingSessions > 1 ? "s" : ""} remaining
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Up next: <span className="font-medium text-foreground">{formatTemplateName(nextSession.template_name || "")}</span>
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="lg"
                      className="w-full"
                      onClick={() => navigate(`/screening/${nextSession.access_token}`)}
                    >
                      {nextSession.status === "in_progress" ? "Continue Where You Left Off" : "Start Next Session"}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Tips - collapsible */}
          {tipsShown && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">💡 Before you begin:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1.5">
                      <li className="flex items-start gap-2">
                        <Shield className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                        <span>Find a quiet space where you can speak freely</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Shield className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                        <span>No right or wrong answers — be genuine</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Shield className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                        <span>You can record voice or type your responses</span>
                      </li>
                    </ul>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => setTipsShown(false)}>
                    Dismiss
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Session Cards */}
          <div className="space-y-3">
            {sessions.map((session, index) => {
              const isCompleted = session.status === "completed" || session.status === "reviewed";
              const isInProgress = session.status === "in_progress";
              const isPending = session.status === "pending";
              const canStart = isPending || isInProgress;
              const isNextSession = nextSession?.id === session.id;

              return (
                <motion.div
                  key={session.id}
                  ref={isNextSession ? nextSessionRef : undefined}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className={`transition-all ${isCompleted ? "border-green-200 bg-green-50/50" : isNextSession ? "border-primary ring-2 ring-primary/20 shadow-sm" : canStart ? "border-primary/30 hover:border-primary/50" : ""}`}>
                    <CardContent className="flex items-center justify-between py-4 px-5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${isCompleted ? "bg-green-100 text-green-700" : isNextSession ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                          {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{formatTemplateName(session.template_name || "")}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {session.question_count ? (
                              <span className="text-xs text-muted-foreground">{session.question_count} questions</span>
                            ) : null}
                            {getStatusBadge(session.status)}
                          </div>
                        </div>
                      </div>
                      {canStart && (
                        <Button 
                          size="sm" 
                          variant={isNextSession ? "default" : "outline"}
                          onClick={() => navigate(`/screening/${session.access_token}`)}
                          className="shrink-0 ml-3"
                        >
                          {isInProgress ? "Continue" : "Begin"}
                          <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Back to Dashboard */}
          <Button variant="outline" className="w-full" onClick={() => navigate("/dashboard/professional")}>
            Return to Dashboard
          </Button>
        </motion.div>
      </div>

      {/* Sticky bottom CTA for mobile */}
      {nextSession && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t border-border md:hidden z-50">
          <Button 
            size="lg"
            className="w-full"
            onClick={() => navigate(`/screening/${nextSession.access_token}`)}
          >
            {nextSession.status === "in_progress" ? "Continue Session" : "Start Next Session"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfessionalScreeningLandingPage;
