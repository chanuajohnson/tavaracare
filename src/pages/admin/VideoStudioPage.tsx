import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Save, Film, Copy, Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Scenes = {
  scene1: string;
  scene2: string;
  scene3: { eyebrow: string; word: string };
  scene4: string[];
  scene5: { tagline: string; footer: string };
};

const DEFAULT_SCENES: Scenes = {
  scene1: "Caring for someone\nyou love…",
  scene2: "shouldn't mean\ncarrying it alone.",
  scene3: { eyebrow: "It takes a", word: "village." },
  scene4: [
    "A matched care team.",
    "A coordinator who knows",
    "your loved one.",
    "One plan. One village.",
  ],
  scene5: {
    tagline: "It takes a village to care.",
    footer: "All coordinated by your care coordinator. Tavara.",
  },
};

type ScriptRow = {
  id: string;
  title: string;
  topic: string | null;
  scenes: Scenes;
  render_status: string;
  rendered_url: string | null;
  created_at: string;
};

// Brand tokens mirror remotion/src/brand.ts
const INK = "#0B0B0B";       // near-black body text
const ACCENT = "#1E3A8A";    // navy — highlights only
const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = "'Karla', system-ui, sans-serif";

const useTavaraFonts = () => {
  useEffect(() => {
    const id = "tavara-video-preview-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Karla:wght@300;400;500&display=swap";
    document.head.appendChild(link);
  }, []);
};

const Frame: React.FC<{ children: React.ReactNode; label: string }> = ({ children, label }) => (
  <div className="flex flex-col items-center gap-2">
    <div
      className="relative w-[180px] h-[320px] rounded-xl overflow-hidden shadow-md"
      style={{ background: "radial-gradient(120% 90% at 50% 38%, #F5F0E8 0%, #ECE4D6 60%, #D9CDB8 130%)" }}
    >
      <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
        {children}
      </div>
    </div>
    <span className="text-xs text-muted-foreground">{label}</span>
  </div>
);

// Render a line with the last word in navy italic serif (matches Scene2/Scene4 final line)
const LineWithAccentLastWord: React.FC<{ text: string; size: number }> = ({ text, size }) => {
  const tokens = text.trim().split(/\s+/);
  if (tokens.length === 0) return null;
  const last = tokens.pop()!;
  const head = tokens.join(" ");
  return (
    <span style={{ fontFamily: SERIF, fontSize: size, lineHeight: 1.15, color: INK }}>
      {head ? head + " " : ""}
      <span style={{ color: ACCENT, fontStyle: "italic" }}>{last}</span>
    </span>
  );
};

const Preview: React.FC<{ scenes: Scenes }> = ({ scenes }) => {
  useTavaraFonts();

  // Scene 2 lines: keep the final word navy italic
  const scene2Lines = scenes.scene2.split("\n");

  // Scene 5: split wordmark on the dot so ".<tld>" goes navy
  const wordmark = "tavara.care";
  const dotIdx = wordmark.indexOf(".");
  const wmHead = dotIdx >= 0 ? wordmark.slice(0, dotIdx) : wordmark;
  const wmTail = dotIdx >= 0 ? wordmark.slice(dotIdx) : "";

  return (
    <div className="flex gap-3 flex-wrap justify-center">
      <Frame label="Scene 1">
        <div
          style={{
            color: INK,
            fontFamily: SERIF,
            fontSize: 22,
            lineHeight: 1.15,
            whiteSpace: "pre-line",
            fontWeight: 400,
          }}
        >
          {scenes.scene1}
        </div>
      </Frame>

      <Frame label="Scene 2">
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {scene2Lines.map((line, i) => (
            <div key={i}>
              {i === scene2Lines.length - 1 ? (
                <LineWithAccentLastWord text={line} size={22} />
              ) : (
                <span style={{ fontFamily: SERIF, fontSize: 22, lineHeight: 1.15, color: INK }}>
                  {line}
                </span>
              )}
            </div>
          ))}
        </div>
      </Frame>

      <Frame label="Scene 3">
        <div className="flex flex-col items-center gap-3">
          <div
            style={{
              color: INK,
              fontFamily: SANS,
              fontSize: 9,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            {scenes.scene3.eyebrow}
          </div>
          <div
            style={{
              color: ACCENT,
              fontFamily: SERIF,
              fontSize: 52,
              fontStyle: "italic",
              lineHeight: 1,
              fontWeight: 400,
            }}
          >
            {scenes.scene3.word}
          </div>
        </div>
      </Frame>

      <Frame label="Scene 4">
        <div className="flex flex-col gap-2 items-start text-left w-full">
          {scenes.scene4.map((line, i) => {
            const isLast = i === scenes.scene4.length - 1;
            return (
              <div
                key={i}
                style={
                  isLast
                    ? {
                        color: ACCENT,
                        fontFamily: SERIF,
                        fontStyle: "italic",
                        fontSize: 13,
                        lineHeight: 1.25,
                        marginTop: 6,
                      }
                    : {
                        color: INK,
                        fontFamily: SANS,
                        fontSize: 12,
                        lineHeight: 1.3,
                        fontWeight: 400,
                      }
                }
              >
                {line}
              </div>
            );
          })}
        </div>
      </Frame>

      <Frame label="Scene 5">
        <div className="flex flex-col items-center gap-1.5">
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 26,
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            <span style={{ color: INK }}>{wmHead}</span>
            <span style={{ color: ACCENT }}>{wmTail}</span>
          </div>
          <div
            style={{
              color: INK,
              fontFamily: SANS,
              fontSize: 7,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              fontWeight: 500,
              marginTop: 4,
            }}
          >
            Care, coordinated.
          </div>
        </div>
      </Frame>
    </div>
  );
};


const VideoStudioPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const [title, setTitle] = useState("Untitled village script");
  const [topic, setTopic] = useState("");
  const [scenes, setScenes] = useState<Scenes>(DEFAULT_SCENES);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scripts, setScripts] = useState<ScriptRow[]>([]);
  const [loadingScripts, setLoadingScripts] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    (async () => {
      const { data } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      setIsAdmin(!!data);
    })();
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    loadScripts();
  }, [isAdmin]);

  const loadScripts = async () => {
    setLoadingScripts(true);
    const { data, error } = await supabase
      .from("video_scripts")
      .select("id,title,topic,scenes,render_status,rendered_url,created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) {
      toast.error("Could not load scripts");
    } else {
      setScripts((data ?? []) as ScriptRow[]);
    }
    setLoadingScripts(false);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Add a topic so the AI knows what angle to take.");
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-video-script", {
        body: { topic: topic.trim(), templateSlug: "village-8s" },
      });
      if (error) throw error;
      const result = data?.result;
      if (!result) throw new Error("Empty response");
      const merged: Scenes = {
        scene1: result.scenes?.scene1 ?? DEFAULT_SCENES.scene1,
        scene2: result.scenes?.scene2 ?? DEFAULT_SCENES.scene2,
        scene3: {
          eyebrow: result.scenes?.scene3?.eyebrow ?? DEFAULT_SCENES.scene3.eyebrow,
          word: result.scenes?.scene3?.word ?? DEFAULT_SCENES.scene3.word,
        },
        scene4: Array.isArray(result.scenes?.scene4) && result.scenes.scene4.length > 0
          ? result.scenes.scene4.slice(0, 4)
          : DEFAULT_SCENES.scene4,
        scene5: {
          tagline: result.scenes?.scene5?.tagline ?? DEFAULT_SCENES.scene5.tagline,
          footer: result.scenes?.scene5?.footer ?? DEFAULT_SCENES.scene5.footer,
        },
      };
      setScenes(merged);
      if (result.title) setTitle(result.title);
      toast.success("Copy generated. Edit anything before saving.");
    } catch (err) {
      console.error(err);
      toast.error("AI generation failed. Try a different topic.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: tpl } = await supabase
        .from("video_templates")
        .select("id")
        .eq("slug", "village-8s")
        .maybeSingle();
      if (!tpl) throw new Error("Template not found");
      const { error } = await supabase.from("video_scripts").insert({
        template_id: tpl.id,
        title: title.trim() || "Untitled village script",
        topic: topic.trim() || null,
        scenes,
        render_status: "queued",
        created_by: user?.id ?? null,
      });
      if (error) throw error;
      toast.success("Script saved and queued for render.");
      await loadScripts();
    } catch (err) {
      console.error(err);
      toast.error("Could not save script.");
    } finally {
      setSaving(false);
    }
  };

  const handleLoadScript = (s: ScriptRow) => {
    setTitle(s.title);
    setTopic(s.topic ?? "");
    setScenes({ ...DEFAULT_SCENES, ...s.scenes });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify({ title, topic, scenes }, null, 2));
    toast.success("Script JSON copied.");
  };

  const handleDelete = async (id: string) => {
    const prev = scripts;
    setScripts((s) => s.filter((x) => x.id !== id));
    const { error } = await supabase.from("video_scripts").delete().eq("id", id);
    if (error) {
      console.error(error);
      toast.error("Could not delete script.");
      setScripts(prev);
    } else {
      toast.success("Script deleted.");
    }
  };

  const handleDownload = async (s: ScriptRow) => {
    if (!s.rendered_url) {
      toast.error("No render attached yet.");
      return;
    }
    setDownloadingId(s.id);
    const slug = (s.title || "video")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "video";
    try {
      const res = await fetch(s.rendered_url);
      if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug}.mp4`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Download started.");
    } catch (err: any) {
      console.error(err);
      // CORS or network — fall back to opening the file in a new tab
      window.open(s.rendered_url, "_blank", "noopener");
      toast.message("Opened render in a new tab (right-click → Save As).");
    } finally {
      setDownloadingId(null);
    }
  };


  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Admin access required.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        breadcrumbItems={[
          { label: "Admin", path: "/dashboard/admin" },
          { label: "Video Studio", path: "/admin/video-studio" },
        ]}
      />

      <div className="container max-w-6xl py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Video Studio</h1>
          <p className="text-muted-foreground mt-1">
            Edit each scene, generate copy with AI, and queue TikTok renders. Locked to Tavara navy palette.
          </p>
        </div>

        {/* Topic + AI */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" /> AI copy generator
            </CardTitle>
            <CardDescription>
              Give a topic and the AI writes 5 on-brand scene lines, grounded in FAQs and brand snippets, filtered through language guardrails.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic / angle</Label>
                <Input
                  id="topic"
                  placeholder="e.g. weekend coverage, respite care, what coordinators do"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleGenerate} disabled={generating} className="w-full md:w-auto">
                  {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Generate copy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview (9:16)</CardTitle>
            <CardDescription>Static preview of all 5 scenes. Final render uses Tavara fonts and motion.</CardDescription>
          </CardHeader>
          <CardContent>
            <Preview scenes={scenes} />
          </CardContent>
        </Card>

        {/* Scene editor */}
        <Card>
          <CardHeader>
            <CardTitle>Scene copy</CardTitle>
            <CardDescription>Edit any line. Use \n in scene 1 and 2 for line breaks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Script title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Scene 1 — Opening line</Label>
              <Textarea value={scenes.scene1} rows={2} onChange={(e) => setScenes({ ...scenes, scene1: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>Scene 2 — Tension line</Label>
              <Textarea value={scenes.scene2} rows={2} onChange={(e) => setScenes({ ...scenes, scene2: e.target.value })} />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Scene 3 — Eyebrow</Label>
                <Input value={scenes.scene3.eyebrow} onChange={(e) => setScenes({ ...scenes, scene3: { ...scenes.scene3, eyebrow: e.target.value } })} />
              </div>
              <div className="space-y-2">
                <Label>Scene 3 — Anchor word</Label>
                <Input value={scenes.scene3.word} onChange={(e) => setScenes({ ...scenes, scene3: { ...scenes.scene3, word: e.target.value } })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Scene 4 — Stacked bullets (one per line)</Label>
              <Textarea
                value={scenes.scene4.join("\n")}
                rows={4}
                onChange={(e) =>
                  setScenes({
                    ...scenes,
                    scene4: e.target.value.split("\n").filter((l) => l.length > 0).slice(0, 4),
                  })
                }
              />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Scene 5 — Tagline (italic)</Label>
                <Input value={scenes.scene5.tagline} onChange={(e) => setScenes({ ...scenes, scene5: { ...scenes.scene5, tagline: e.target.value } })} />
              </div>
              <div className="space-y-2">
                <Label>Scene 5 — Footer</Label>
                <Input value={scenes.scene5.footer} onChange={(e) => setScenes({ ...scenes, scene5: { ...scenes.scene5, footer: e.target.value } })} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save and queue render
          </Button>
          <Button variant="outline" onClick={handleCopyJson}>
            <Copy className="h-4 w-4 mr-2" />
            Copy script JSON
          </Button>
        </div>

        <Card className="bg-muted/40">
          <CardContent className="pt-6 text-sm text-muted-foreground space-y-1">
            <p className="flex items-center gap-2"><Film className="h-4 w-4" /> <strong>Rendering:</strong></p>
            <p>
              Saving sets the script to <Badge variant="secondary">queued</Badge>. To produce the MP4, ask the Tavara
              build assistant in chat: <em>"Render queued video scripts."</em> Output lands in the script's <code>rendered_url</code> and downloads from the library below.
            </p>
          </CardContent>
        </Card>

        {/* Library */}
        <Card>
          <CardHeader>
            <CardTitle>Script library</CardTitle>
            <CardDescription>Past scripts. Click a row to load it back into the editor.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingScripts ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : scripts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No scripts saved yet.</p>
            ) : (
              <div className="space-y-2">
                {scripts.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between border rounded-md p-3 hover:bg-accent cursor-pointer"
                    onClick={() => handleLoadScript(s)}
                  >
                    <div>
                      <p className="font-medium">{s.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.topic ? s.topic : "no topic"} · {new Date(s.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={s.render_status === "ready" ? "default" : "secondary"}>
                        {s.render_status}
                      </Badge>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8"
                        disabled={!s.rendered_url || downloadingId === s.id}
                        title={s.rendered_url ? "Download MP4" : "Render not uploaded yet"}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDownload(s);
                        }}
                      >
                        {downloadingId === s.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <Download className="h-3.5 w-3.5 mr-1" />
                            Download MP4
                          </>
                        )}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={(e) => e.stopPropagation()}
                            aria-label="Delete script"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this script?</AlertDialogTitle>
                            <AlertDialogDescription>
                              "{s.title}" will be removed from the library. This can't be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(s.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VideoStudioPage;
