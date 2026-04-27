import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageCircle, Pencil, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  READINESS_REFLECTION_LOCAL_KEY,
  type StageDefinition,
  type ReadinessReflection,
} from "@/data/familyReadinessQuiz";

const MAX_LEN = 500;

interface QuizReflectionFieldProps {
  stageDef: StageDefinition;
  /** Initial reflection from profile (for signed-in users) */
  initialReflection?: ReadinessReflection | null;
  /** Notifies parent when reflection text changes — used by anon lead capture */
  onReflectionChange?: (text: string) => void;
}

export const QuizReflectionField: React.FC<QuizReflectionFieldProps> = ({
  stageDef,
  initialReflection = null,
  onReflectionChange,
}) => {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState<ReadinessReflection | null>(
    initialReflection
  );
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // On mount, hydrate from localStorage if no profile reflection
  useEffect(() => {
    if (initialReflection) {
      setSubmitted(initialReflection);
      return;
    }
    try {
      const raw = localStorage.getItem(READINESS_REFLECTION_LOCAL_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ReadinessReflection;
        if (parsed?.text) {
          setSubmitted(parsed);
          onReflectionChange?.(parsed.text);
        }
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialReflection]);

  const handleShare = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setSaving(true);
    const reflection: ReadinessReflection = {
      text: trimmed,
      submitted_at: new Date().toISOString(),
    };

    // Always write to localStorage so anon→signup migration works
    try {
      localStorage.setItem(
        READINESS_REFLECTION_LOCAL_KEY,
        JSON.stringify(reflection)
      );
    } catch {
      // ignore
    }

    // Signed-in: persist into profile.client_stage_quiz_responses.reflection
    if (user?.id) {
      try {
        const { data: profile, error: fetchErr } = await supabase
          .from("profiles")
          .select("client_stage_quiz_responses")
          .eq("id", user.id)
          .maybeSingle();

        if (fetchErr) throw fetchErr;

        const existingResponses =
          (profile?.client_stage_quiz_responses as Record<string, unknown>) || {};
        const newResponses = {
          ...existingResponses,
          reflection: { text: reflection.text, submitted_at: reflection.submitted_at },
        };

        const { error: updateErr } = await supabase
          .from("profiles")
          .update({
            client_stage_quiz_responses: newResponses as unknown as never,
          })
          .eq("id", user.id);

        if (updateErr) throw updateErr;
      } catch (err) {
        console.error("[QuizReflection] save failed:", err);
        toast.error("We saved it on this device, but couldn't sync to your profile.");
      }
    }

    setSubmitted(reflection);
    setText("");
    setEditing(false);
    setSaving(false);
    onReflectionChange?.(trimmed);
  };

  const handleEdit = () => {
    setText(submitted?.text || "");
    setEditing(true);
  };

  const remaining = MAX_LEN - text.length;
  const isOver = remaining < 0;

  // Already submitted view (echoed back)
  if (submitted && !editing) {
    return (
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Check className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                You shared
              </p>
              <p className="text-sm text-foreground/90 italic leading-relaxed">
                "{submitted.text}"
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleEdit}
              className="shrink-0 h-8 px-2 text-muted-foreground hover:text-foreground"
              aria-label="Edit reflection"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Active input view
  return (
    <Card className="bg-muted/30 border-dashed">
      <CardContent className="p-4 sm:p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <MessageCircle className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              Did we get it right?
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tell us in your own words what's actually weighing on you. Specifics
              help us help you better.
            </p>
          </div>
        </div>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_LEN + 50))}
          placeholder={stageDef.reflectionPlaceholder}
          rows={3}
          className="resize-none bg-background/80 text-sm"
          maxLength={MAX_LEN + 50}
        />

        <div className="flex items-center justify-between gap-3">
          <span
            className={`text-xs ${
              isOver ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {Math.max(0, remaining)} chars left
          </span>
          <div className="flex items-center gap-2">
            <AnimatePresence>
              {saving && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-muted-foreground"
                >
                  Thank you — we hear you.
                </motion.span>
              )}
            </AnimatePresence>
            {editing && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditing(false);
                  setText("");
                }}
              >
                Cancel
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleShare}
              disabled={!text.trim() || isOver || saving}
            >
              Share
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
