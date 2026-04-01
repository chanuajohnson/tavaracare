import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Clock, CheckCircle2, Mic } from "lucide-react";
import { motion } from "framer-motion";

const ProfessionalScreeningLandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchScreeningSession();
    }
  }, [user]);

  const fetchScreeningSession = async () => {
    try {
      const { data, error } = await supabase
        .from("screening_sessions")
        .select("*")
        .eq("professional_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching screening session:", error);
      }
      setSession(data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Session exists and is pending or in_progress — redirect to screening page
  if (session && (session.status === "pending" || session.status === "in_progress")) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-2xl px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Mic className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Your Screening Is Ready</CardTitle>
                <CardDescription className="text-base mt-2">
                  Your screening interview has been prepared by the Tavara team. 
                  You'll answer a series of questions — you can record voice answers or type your responses.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                  <h4 className="font-medium text-sm">Before you begin:</h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <Shield className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <span>Find a quiet space where you can speak freely and honestly</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <span>There are no right or wrong answers — we want to hear your genuine perspective</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <span>You can leave multiple recordings per question, but you cannot redo a submitted recording</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <span>Take your time — this is your opportunity to show who you are as a caregiver</span>
                    </li>
                  </ul>
                </div>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => navigate(`/screening/${session.access_token}`)}
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Begin Screening Interview
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Session completed
  if (session && session.status === "completed") {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-2xl px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Screening Complete</CardTitle>
                <CardDescription className="text-base mt-2">
                  Thank you for completing your screening interview! The Tavara team is reviewing your responses 
                  and will update your profile status shortly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/dashboard/professional")}
                >
                  Return to Dashboard
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // No session exists — waiting state
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
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
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/dashboard/professional")}
              >
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfessionalScreeningLandingPage;
