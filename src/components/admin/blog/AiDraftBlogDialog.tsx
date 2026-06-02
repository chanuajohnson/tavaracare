import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Loader2, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useSavePost, useAllPosts, BLOG_CATEGORIES } from "@/lib/blog/api";

interface Violation {
  banned_term: string;
  preferred_term: string | null;
  count: number;
  severity: string;
}

interface Draft {
  title: string;
  slug: string;
  description: string;
  category: string;
  readingTime: string;
  body: string;
  faqs: Array<{ q: string; a: string }>;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const AiDraftBlogDialog = ({ open, onOpenChange }: Props) => {
  const navigate = useNavigate();
  const save = useSavePost();
  const { data: allPosts = [] } = useAllPosts();

  const CTA_PRESETS: Array<{ id: string; label: string; href: string }> = [
    { id: "urgent", label: "Find Care Now", href: "/urgent-families" },
    { id: "family-reg", label: "Start Your Family Profile", href: "/registration/family" },
    { id: "caregiver-reg", label: "Join as a Caregiver", href: "/registration/professional" },
    { id: "readiness", label: "Take the Readiness Quiz", href: "/family/readiness-quiz" },
    { id: "care-plans", label: "Explore Care Plans", href: "/family/care-management" },
    { id: "live-in", label: "Learn About Live-In Care", href: "/services/live-in-care" },
    { id: "dementia", label: "Dementia Care Support", href: "/services/dementia-care" },
    { id: "post-surgery", label: "Post-Surgery Care", href: "/services/post-surgery-care" },
    { id: "elder", label: "Elder Care Services", href: "/services/elder-care" },
    { id: "pricing", label: "See Care Rates", href: "/family/care-management" },
    { id: "whatsapp", label: "Message Tavara on WhatsApp", href: "https://wa.me/18687865357" },
    { id: "custom", label: "Other (custom)", href: "" },
  ];

  const [topic, setTopic] = useState("");
  const [angle, setAngle] = useState("");
  const [category, setCategory] = useState<string>("Family Care Guides");
  const [audience, setAudience] = useState("family");
  const [ctaPresetId, setCtaPresetId] = useState<string>("urgent");
  const [ctaLabel, setCtaLabel] = useState("Find Care Now");
  const [ctaHref, setCtaHref] = useState("/urgent-families");
  const [referenceIds, setReferenceIds] = useState<string[]>([]);
  const [revisionNote, setRevisionNote] = useState("");

  const [generating, setGenerating] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [violations, setViolations] = useState<Violation[]>([]);

  const referenceOptions = useMemo(
    () =>
      allPosts
        .filter((p) => p.status === "published" && p.category === category)
        .slice(0, 6),
    [allPosts, category],
  );

  useEffect(() => {
    if (!open) {
      setDraft(null);
      setViolations([]);
      setRevisionNote("");
    }
  }, [open]);

  const toggleRef = (id: string) => {
    setReferenceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 3 ? prev : [...prev, id],
    );
  };

  const generate = async () => {
    if (topic.trim().length < 3) {
      toast.error("Give it a topic (at least a few words).");
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("blog-ai-draft", {
        body: {
          topic,
          angle,
          category,
          audience,
          ctaLabel,
          ctaHref,
          referencePostIds: referenceIds,
          revisionNote: draft ? revisionNote : undefined,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error + (data.detail ? `: ${data.detail}` : ""));
      setDraft(data.draft as Draft);
      setViolations((data.violations as Violation[]) ?? []);
      if (!data.violations || data.violations.length === 0) {
        toast.success("Draft ready, guardrail-clean.");
      } else {
        toast.warning(`Draft ready with ${data.violations.length} guardrail flag${data.violations.length === 1 ? "" : "s"}.`);
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to generate draft");
    } finally {
      setGenerating(false);
    }
  };

  const saveDraft = async () => {
    if (!draft) return;
    try {
      const saved = await save.mutateAsync({
        slug: draft.slug,
        title: draft.title,
        description: draft.description,
        body: draft.body,
        category: draft.category,
        reading_time: draft.readingTime,
        cta_label: ctaLabel,
        cta_href: ctaHref,
        faqs: draft.faqs,
        status: "draft",
        published_at: null,
      });
      onOpenChange(false);
      const id = (saved as any)?.id;
      if (id) navigate(`/admin/blog/${id}`);
    } catch {
      /* toast handled by mutation */
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Draft a Blog Post
          </DialogTitle>
          <DialogDescription>
            Describe the topic and angle. The AI reads existing posts for voice and runs language guardrails before you review.
          </DialogDescription>
        </DialogHeader>

        {!draft && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic *</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. What the Tavara nurse actually cooks"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="angle">Angle / key points (voice-note style)</Label>
              <Textarea
                id="angle"
                value={angle}
                onChange={(e) => setAngle(e.target.value)}
                rows={6}
                placeholder="Dump everything you want covered. Real scenarios, contentious points, what families get wrong, what you want them to understand by the end."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOG_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Audience</Label>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="caregiver">Caregiver</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cta-label">CTA label</Label>
                <Input id="cta-label" value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cta-href">CTA href</Label>
                <Input id="cta-href" value={ctaHref} onChange={(e) => setCtaHref(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Reference posts (voice anchors, up to 3 — auto-picked if none selected)</Label>
              <div className="flex flex-wrap gap-2">
                {referenceOptions.length === 0 && (
                  <p className="text-xs text-muted-foreground">No published posts in this category yet.</p>
                )}
                {referenceOptions.map((p) => {
                  const active = referenceIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleRef(p.id)}
                      className={`text-xs px-2 py-1 rounded border transition ${
                        active
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card hover:bg-muted border-border"
                      }`}
                    >
                      {p.title.slice(0, 60)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {draft && (
          <div className="space-y-4">
            {violations.length > 0 && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-amber-900 dark:text-amber-200">
                  <AlertTriangle className="h-4 w-4" />
                  {violations.length} guardrail flag{violations.length === 1 ? "" : "s"} (review before publishing)
                </div>
                <ul className="text-xs space-y-1 pl-6 list-disc text-amber-900 dark:text-amber-200">
                  {violations.map((v, i) => (
                    <li key={i}>
                      <code>{v.banned_term}</code> ×{v.count} → use{" "}
                      <em>{v.preferred_term ?? "rephrase"}</em>{" "}
                      <Badge variant="outline" className="ml-1 text-[10px]">{v.severity}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {violations.length === 0 && (
              <div className="rounded-lg border border-green-300 bg-green-50 dark:bg-green-950/30 p-3 flex items-center gap-2 text-sm text-green-900 dark:text-green-200">
                <CheckCircle2 className="h-4 w-4" />
                Guardrail-clean. No banned terms detected.
              </div>
            )}

            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Reading time</Label>
                <Input value={draft.readingTime} onChange={(e) => setDraft({ ...draft, readingTime: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description (meta)</Label>
              <Textarea
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Body (markdown)</Label>
              <Textarea
                value={draft.body}
                onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                rows={14}
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                {draft.body.split(/\s+/).filter(Boolean).length} words
              </p>
            </div>
            <div className="space-y-2">
              <Label>FAQs</Label>
              <div className="space-y-2">
                {draft.faqs.map((f, i) => (
                  <div key={i} className="border rounded p-2 space-y-1 relative">
                    <button
                      type="button"
                      className="absolute top-1 right-1 text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        setDraft({ ...draft, faqs: draft.faqs.filter((_, j) => j !== i) })
                      }
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <Input
                      value={f.q}
                      onChange={(e) => {
                        const next = [...draft.faqs];
                        next[i] = { ...next[i], q: e.target.value };
                        setDraft({ ...draft, faqs: next });
                      }}
                      placeholder="Question"
                      className="text-sm"
                    />
                    <Textarea
                      value={f.a}
                      onChange={(e) => {
                        const next = [...draft.faqs];
                        next[i] = { ...next[i], a: e.target.value };
                        setDraft({ ...draft, faqs: next });
                      }}
                      rows={2}
                      placeholder="Answer"
                      className="text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 border-t pt-3">
              <Label htmlFor="revision">Revision note (for regenerate)</Label>
              <Textarea
                id="revision"
                value={revisionNote}
                onChange={(e) => setRevisionNote(e.target.value)}
                rows={2}
                placeholder="e.g. tighter intro, more T&T specifics, add a section on weekend coverage"
              />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 flex-wrap">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          {draft && (
            <>
              <Button variant="outline" onClick={generate} disabled={generating}>
                {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Regenerate
              </Button>
              <Button onClick={saveDraft} disabled={save.isPending}>
                {save.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Save as draft & open editor
              </Button>
            </>
          )}
          {!draft && (
            <Button onClick={generate} disabled={generating}>
              {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Generate draft
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
