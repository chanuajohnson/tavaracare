import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export interface AnnotationRow {
  id: string;
  occurred_on: string;
  label: string;
}

export function useAnnotations() {
  return useQuery<AnnotationRow[]>({
    queryKey: ["blog-analytics-annotations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_analytics_annotations")
        .select("id, occurred_on, label")
        .order("occurred_on", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as AnnotationRow[];
    },
  });
}

export function AnnotationsCard() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: rows = [] } = useAnnotations();
  const [label, setLabel] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [saving, setSaving] = useState(false);

  const add = async () => {
    if (!label.trim() || !date) return;
    setSaving(true);
    const { error } = await supabase
      .from("blog_analytics_annotations")
      .insert({
        occurred_on: date,
        label: label.trim(),
        created_by: user?.id ?? null,
      });
    setSaving(false);
    if (error) {
      toast.error("Could not save annotation");
      return;
    }
    setLabel("");
    qc.invalidateQueries({ queryKey: ["blog-analytics-annotations"] });
    toast.success("Annotation saved");
  };

  const remove = async (id: string) => {
    const { error } = await supabase
      .from("blog_analytics_annotations")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error("Could not delete");
      return;
    }
    qc.invalidateQueries({ queryKey: ["blog-analytics-annotations"] });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Annotations</CardTitle>
        <CardDescription>
          Log launches and outreach pushes so future-you can correlate spikes
          with causes. Markers appear on the daily landings chart.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="sm:w-44"
          />
          <Input
            placeholder='e.g. "Scully outreach – Diamond Vale wave 1"'
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") add();
            }}
            maxLength={120}
          />
          <Button onClick={add} disabled={!label.trim() || saving}>
            Add
          </Button>
        </div>

        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No annotations yet.</p>
        ) : (
          <ul className="divide-y">
            {rows.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between py-2 text-sm"
              >
                <span>
                  <span className="font-mono text-xs text-muted-foreground mr-3">
                    {r.occurred_on}
                  </span>
                  {r.label}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => remove(r.id)}
                  className="h-7 w-7 p-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
