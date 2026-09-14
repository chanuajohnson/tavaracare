/**
 * Understanding checkpoint — shown before a significant commitment.
 *
 * The family is never asked to prove comprehension. They are simply offered
 * four honest ways forward, and three of them are requests for support, not
 * failures.
 */

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  recordCheckpoint,
  fetchCheckpoints,
  type CheckpointKey,
  type CheckpointResponse,
} from "@/lib/family/readinessHistory";

const OPTIONS: { id: CheckpointResponse; label: string }[] = [
  { id: "ready", label: "This is clear, I'm ready" },
  { id: "needs_time", label: "I understand, but I need a little more time" },
  { id: "explain_simply", label: "Please explain this more simply" },
  { id: "speak_to_someone", label: "I'd rather speak to someone first" },
];

interface Props {
  checkpointKey: CheckpointKey;
  title: string;
  /** Plain-language summary of what is being agreed to. */
  summary: string;
  onReady?: () => void;
  className?: string;
}

export const UnderstandingCheckpoint: React.FC<Props> = ({
  checkpointKey,
  title,
  summary,
  onReady,
  className,
}) => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setLoaded(true);
      return;
    }
    let cancelled = false;
    (async () => {
      const rows = await fetchCheckpoints(user.id);
      if (cancelled) return;
      const match = rows.find((r) => r.checkpoint_key === checkpointKey);
      setExisting(match?.response ?? null);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, checkpointKey]);

  const handle = async (response: CheckpointResponse) => {
    if (!user?.id) return;
    setSaving(true);
    const { ok } = await recordCheckpoint(user.id, checkpointKey, response);
    setSaving(false);
    if (!ok) {
      toast.error("We couldn't record that — please try again.");
      return;
    }
    setExisting(response);
    if (response === "ready") {
      onReady?.();
    } else {
      toast.success("Thank you. Someone will follow up with you on this.");
    }
  };

  if (!loaded) return null;

  if (existing === "ready") {
    return (
      <Card className={className}>
        <CardContent className="p-4 flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
          You confirmed this was clear.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-5 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{summary}</p>
        </div>

        {existing && existing !== "ready" && (
          <p className="text-xs text-muted-foreground">
            We have your note that you wanted more support here. You can change your
            answer below at any time.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {OPTIONS.map((o) => (
            <Button
              key={o.id}
              type="button"
              variant={o.id === "ready" ? "default" : "outline"}
              disabled={saving}
              onClick={() => handle(o.id)}
              className="justify-start h-auto py-3 text-left whitespace-normal"
            >
              {o.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
