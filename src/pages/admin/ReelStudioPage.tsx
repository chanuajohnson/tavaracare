import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Play, Pause, Download, Copy, Image as ImageIcon, Film, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  defaultCaregiverText, defaultText, REEL_DURATION, REEL_H, REEL_W, STILL_TIMES, TEXT_LIMITS, TIMELINE,
  type ReelSafeNeed, type ReelSpec, type ReelText, type SceneId,
  WHATSAPP_CHANNEL_URL,
} from "@/lib/reel/spec";
import { containsUnsafe, redact } from "@/lib/reel/redact";
import { buildCaption, buildCaregiverCaption, findBannedWords } from "@/lib/reel/caption";
import { drawFrame, type Palette, type ReelAssets } from "@/lib/reel/engine";
import { download, recordReel, renderStill } from "@/lib/reel/export";

type Candidate = { request_ref: string; area: string; care_type: string };
type LibraryPhoto = { id: string; scene_id: string; url: string; focus_y: number };

const SCENE_LABELS: Record<SceneId, string> = { hook: "1. Hook", map: "2. Map", needs: "3. Care needs", requirements: "4. Caregiver requirements", schedule: "5. Schedule", cta: "6. Ending" };
const TEXT_FIELD_LABELS: Partial<Record<keyof ReelText, string>> = {
  requirementsTitle: "Requirements scene title",
  whatsappTitle: "WhatsApp channel invitation",
  whatsappBody: "WhatsApp line on screen (no links)",
};
const RATE_BANDS = ["$40/hr", "$45/hr", "$50+/hr"];

// Blog imagery: same-origin paths for our own covers so the canvas stays exportable.
function toLoadableUrl(u: string): string {
  return u.replace(/^https?:\/\/(www\.)?tavara\.care/, "");
}
async function blobImage(url: string): Promise<{ img: HTMLImageElement; src: string } | null> {
  try {
    const res = await fetch(toLoadableUrl(url));
    if (!res.ok) return null;
    const src = URL.createObjectURL(await res.blob());
    return { img: await loadImage(src), src };
  } catch { return null; }
}
function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function readPalette(): { palette: Palette; font: string } {
  const cs = getComputedStyle(document.documentElement);
  const v = (n: string, f: string) => { const x = cs.getPropertyValue(n).trim(); return x ? `hsl(${x})` : f; };
  return {
    palette: {
      primary: v("--primary", "#1d4ed8"), onPrimary: v("--primary-foreground", "#ffffff"),
      accent: v("--accent", "#fde68a"), ink: v("--foreground", "#0f172a"),
      bg: v("--background", "#ffffff"), muted: v("--muted", "#e2e8f0"),
    },
    font: getComputedStyle(document.body).fontFamily || "sans-serif",
  };
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
}

async function signedObjectUrl(path: string): Promise<string | null> {
  const { data } = await supabase.storage.from("reel-photos").createSignedUrl(path, 3600);
  if (!data?.signedUrl) return null;
  const blob = await (await fetch(data.signedUrl)).blob(); // blob URL keeps the canvas exportable
  return URL.createObjectURL(blob);
}

const ReelStudioPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [selectedRef, setSelectedRef] = useState<string>("");
  const [preset, setPreset] = useState<ReelSpec["preset"]>("new_match_needed");
  const [need, setNeed] = useState<ReelSafeNeed | undefined>();
  const [text, setText] = useState<ReelText>(defaultText());
  const [photos, setPhotos] = useState<ReelSpec["photos"]>({});
  const [images, setImages] = useState<ReelAssets["photos"]>({});
  const [library, setLibrary] = useState<(LibraryPhoto & { preview?: string })[]>([]);
  const [audioOn, setAudioOn] = useState(true);
  const [blogPool, setBlogPool] = useState<{ url: string; img: HTMLImageElement; src: string }[]>([]);
  const [useBlogPhotos, setUseBlogPhotos] = useState(true);
  const [blogAssign, setBlogAssign] = useState<Partial<Record<SceneId, number>>>({});
  const [showRate, setShowRate] = useState(false);
  const [rateBand, setRateBand] = useState(RATE_BANDS[0]);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [exporting, setExporting] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const exportCanvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();
  const theme = useMemo(readPalette, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => setIsAdmin(!!data));
  }, [user, authLoading, navigate]);

  const loadLibrary = useCallback(async () => {
    const { data } = await (supabase as any).from("reel_photo_library").select("*").order("created_at", { ascending: false });
    const rows: LibraryPhoto[] = data ?? [];
    const withPreview = await Promise.all(rows.map(async (r) => ({ ...r, preview: (await signedObjectUrl(r.url)) ?? undefined })));
    setLibrary(withPreview);
  }, []);

  const isCaregiver = preset === "caregiver_available";
  const [caregivers, setCaregivers] = useState<Candidate[] | null>(null);
  useEffect(() => {
    if (!isAdmin) return;
    (supabase as any).rpc("list_reel_caregiver_candidates").then(({ data, error }: any) => {
      if (error) toast.error("Could not load caregivers: " + error.message);
      setCaregivers(data ?? []);
    });
  }, [isAdmin]);
  useEffect(() => { setSelectedRef(""); }, [isCaregiver]);

  useEffect(() => {
    if (!isAdmin) return;
    (supabase as any).rpc("list_reel_candidates").then(({ data, error }: any) => {
      if (error) toast.error("Could not load families: " + error.message);
      setCandidates(data ?? []);
    });
    loadLibrary();
    (async () => {
      const [{ data: posts }, { data: media }] = await Promise.all([
        (supabase as any).from("blog_posts").select("cover_image_url").eq("status", "published").not("cover_image_url", "is", null),
        (supabase as any).from("blog_media_assets").select("public_url").not("public_url", "is", null),
      ]);
      const urls = Array.from(new Set([...(posts ?? []).map((p: any) => p.cover_image_url), ...(media ?? []).map((m: any) => m.public_url)].filter(Boolean))) as string[];
      const loaded = (await Promise.all(urls.map(async (url) => { const r = await blobImage(url); return r ? { url, ...r } : null; }))).filter(Boolean) as { url: string; img: HTMLImageElement; src: string }[];
      setBlogPool(loaded);
    })();
  }, [isAdmin, loadLibrary]);

  // Give every scene a different blog photo; reshuffle on demand so reels never look the same.
  const shuffleBlogPhotos = useCallback(() => {
    if (!blogPool.length) return;
    const order = shuffled(blogPool.map((_, i) => i));
    const next: Partial<Record<SceneId, number>> = {};
    TIMELINE.forEach(({ id }, i) => { next[id] = order[i % order.length]; });
    setBlogAssign(next);
  }, [blogPool]);
  useEffect(() => { shuffleBlogPhotos(); }, [shuffleBlogPhotos, selectedRef]);

  useEffect(() => {
    if (!selectedRef || preset === "general_recruit") {
      setNeed(undefined);
      setText((previous) => ({ ...defaultText(), whatsappTitle: previous.whatsappTitle, whatsappBody: previous.whatsappBody }));
      return;
    }
    const caregiverMode = preset === "caregiver_available";
    (supabase as any).rpc(caregiverMode ? "get_reel_safe_caregiver" : "get_reel_safe_need", { ref: selectedRef }).then(({ data, error }: any) => {
      if (error || !data) { toast.error(caregiverMode ? "That caregiver's summary is not available." : "That family's summary is not available."); return; }
      const safe = redact(data);
      if (preset === "urgent_need") safe.urgency = "urgent";
      setNeed(safe);
      setText((previous) => ({ ...(caregiverMode ? defaultCaregiverText(safe) : defaultText(safe)), whatsappTitle: previous.whatsappTitle, whatsappBody: previous.whatsappBody }));
    });
  }, [selectedRef, preset]);

  const spec: ReelSpec = useMemo(() => ({
    preset, need: preset === "general_recruit" ? undefined : need, text, photos,
    rateBand: showRate ? rateBand : undefined, audio: { enabled: audioOn, volume: 0.6 },
  }), [preset, need, text, photos, showRate, rateBand, audioOn]);
  const assets: ReelAssets = useMemo(() => {
    const merged: ReelAssets["photos"] = {};
    for (const { id } of TIMELINE) {
      const idx = blogAssign[id];
      merged[id] = images[id] ?? (useBlogPhotos && idx !== undefined ? blogPool[idx]?.img : undefined);
    }
    return { photos: merged, palette: theme.palette, font: theme.font };
  }, [images, theme, blogAssign, blogPool, useBlogPhotos]);

  const caption = useMemo(() => isCaregiver ? buildCaregiverCaption(spec.need, WHATSAPP_CHANNEL_URL) : buildCaption(spec.need, spec.rateBand, WHATSAPP_CHANNEL_URL), [spec, isCaregiver]);
  const issues = useMemo(() => {
    const all = [...Object.values(text), caption].join(" \n ");
    const out: string[] = [];
    const unsafe = containsUnsafe(Object.values(text).join(" ")); if (unsafe) out.push(`Text contains a ${unsafe}.`);
    const banned = findBannedWords(all); if (banned.length) out.push(`Avoid these words: ${banned.join(", ")}.`);
    if (/https?:\/\/|whatsapp\.com\//i.test(text.whatsappBody)) out.push("Keep links off the video. The channel link is already in the caption.");
    return out;
  }, [text, caption]);

  // Draw preview whenever time or spec changes
  useEffect(() => { const c = canvasRef.current; if (c) drawFrame(c.getContext("2d")!, t, spec, assets); }, [t, spec, assets]);

  useEffect(() => {
    if (!playing) return;
    const start = performance.now() - t * 1000;
    const loop = () => {
      const nt = (performance.now() - start) / 1000;
      if (nt >= REEL_DURATION) { setT(REEL_DURATION); setPlaying(false); return; }
      setT(nt); rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  const setScenePhoto = async (scene: SceneId, path: string, focusY: number, preview?: string) => {
    const src = preview ?? (await signedObjectUrl(path));
    if (!src) return toast.error("Could not load that photo.");
    const img = await loadImage(src);
    setImages((p) => ({ ...p, [scene]: img }));
    setPhotos((p) => ({ ...p, [scene]: { url: path, focusY } }));
  };

  const uploadPhoto = async (scene: SceneId, file: File) => {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return toast.error("Please use a JPG, PNG or WebP photo. iPhone HEIC photos need converting first.");
    const path = `${scene}/${crypto.randomUUID()}.${file.type.split("/")[1]}`;
    const { error } = await supabase.storage.from("reel-photos").upload(path, file, { contentType: file.type });
    if (error) return toast.error("Upload failed: " + error.message);
    await (supabase as any).from("reel_photo_library").insert({ scene_id: scene, url: path, focus_y: 0.5 });
    await setScenePhoto(scene, path, 0.5, URL.createObjectURL(file));
    loadLibrary();
    toast.success("Photo saved to your shelf.");
  };

  const removeLibraryPhoto = async (p: LibraryPhoto) => {
    await supabase.storage.from("reel-photos").remove([p.url]);
    await (supabase as any).from("reel_photo_library").delete().eq("id", p.id);
    loadLibrary();
  };

  const ref = spec.need?.requestRef ?? "general";
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  const logExport = async () => {
    await (supabase as any).from("reel_exports").insert({ request_ref: ref, preset, spec: { ...spec, photos: Object.keys(photos) }, created_by: user!.id });
  };

  const exportVideo = async () => {
    if (issues.length) return toast.error("Fix the wording issues before exporting.");
    setPlaying(false); setExporting(0);
    try {
      const { blob, ext } = await recordReel(exportCanvasRef.current!, spec, assets, setExporting);
      download(blob, `tavara-${ref}-${stamp}.${ext}`);
      await logExport();
      toast.success(ext === "mp4" ? "Video downloaded." : "Video downloaded as WebM. Convert it to MP4 before posting to Instagram.");
    } catch (e: any) {
      toast.error("Export failed: " + (e?.message ?? "unknown error"));
    } finally { setExporting(null); }
  };

  const exportStills = async () => {
    if (issues.length) return toast.error("Fix the wording issues before exporting.");
    for (const [i, st] of STILL_TIMES.entries()) download(await renderStill(st, spec, assets), `tavara-${ref}-${stamp}-${i + 1}.png`);
    await logExport();
    toast.success("Three still images downloaded.");
  };

  if (authLoading || isAdmin === null) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!isAdmin) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Admin access required.</p></div>;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader breadcrumbItems={[{ label: "Admin Dashboard", path: "/dashboard/admin" }, { label: "Reel Studio", path: "/admin/reels" }]} />
      <div className="container max-w-6xl py-6 px-4">
        <h1 className="text-2xl md:text-3xl font-bold mb-1 flex items-center gap-2"><Film className="h-7 w-7" /> Reel Studio</h1>
        <p className="text-muted-foreground mb-6">Make an {REEL_DURATION}-second vertical video telling nurses and caregivers that a family needs care. Only families who agreed to social posts appear, and no names, addresses or diagnoses are ever shown.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-6 order-2 lg:order-1">
            <Card>
              <CardHeader><CardTitle>1. Choose the reel</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Reel type</Label>
                  <Select value={preset} onValueChange={(v) => setPreset(v as ReelSpec["preset"])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new_match_needed">A family needs care</SelectItem>
                      <SelectItem value="urgent_need">Urgent: care needed soon</SelectItem>
                      <SelectItem value="caregiver_available">A caregiver is available</SelectItem>
                      <SelectItem value="general_recruit">General: join the care team</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {isCaregiver && (
                  <div className="space-y-2">
                    <Label>Available caregiver</Label>
                    {caregivers === null ? <p className="text-sm text-muted-foreground">Loading…</p> : caregivers.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No caregivers are listed yet. A caregiver appears here once they are available for matching and you switch on "Caregiver agreed to an anonymous social post" on their profile in User Management (Profile tab).</p>
                    ) : (
                      <Select value={selectedRef} onValueChange={setSelectedRef}>
                        <SelectTrigger><SelectValue placeholder="Pick a caregiver" /></SelectTrigger>
                        <SelectContent>
                          {caregivers.map((c) => <SelectItem key={c.request_ref} value={c.request_ref}>{c.request_ref} · {c.area} · {c.care_type}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}
                {preset !== "general_recruit" && !isCaregiver && (
                  <div className="space-y-2">
                    <Label>Family request</Label>
                    <p className="text-xs text-muted-foreground">Only families whose "agreed to an anonymous social post" switch is on appear here ({candidates?.length ?? 0} so far).</p>
                    {candidates === null ? <p className="text-sm text-muted-foreground">Loading…</p> : candidates.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No families have agreed to social posts yet. Switch it on from a family's profile in User Management (Profile tab) once they agree.</p>
                    ) : (
                      <Select value={selectedRef} onValueChange={setSelectedRef}>
                        <SelectTrigger><SelectValue placeholder="Pick a family request" /></SelectTrigger>
                        <SelectContent>
                          {candidates.map((c) => <SelectItem key={c.request_ref} value={c.request_ref}>{c.request_ref} · {c.area} · {c.care_type}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>2. Edit the words</CardTitle><CardDescription>Everything on screen can be changed.</CardDescription></CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(Object.keys(TEXT_LIMITS) as (keyof ReelText)[]).map((k) => (
                  <div key={k} className={`space-y-1 ${k === "whatsappBody" ? "sm:col-span-2" : ""}`}>
                    <Label className="text-xs capitalize">{TEXT_FIELD_LABELS[k] ?? k.replace(/([A-Z0-9])/g, " $1")}</Label>
                    <Input value={text[k]} maxLength={TEXT_LIMITS[k]} placeholder={k === "whatsappBody" ? 'Search "Tavara.Care" in WhatsApp Channels' : undefined} onChange={(e) => setText((p) => ({ ...p, [k]: e.target.value }))} />
                    <p className="text-[11px] text-muted-foreground text-right">{text[k].length}/{TEXT_LIMITS[k]}</p>
                  </div>
                ))}
                <div className="flex items-center gap-3 sm:col-span-2">
                  <Switch checked={showRate} onCheckedChange={setShowRate} id="rate" />
                  <Label htmlFor="rate">Show care rate in caption</Label>
                  {showRate && (
                    <Select value={rateBand} onValueChange={setRateBand}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>{RATE_BANDS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                    </Select>
                  )}
                </div>
                <div className="flex items-center gap-3 sm:col-span-2">
                  <Switch checked={audioOn} onCheckedChange={setAudioOn} id="audio" />
                  <Label htmlFor="audio">Tap and chime sounds</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>3. Scene photos</CardTitle><CardDescription>Your blog photos rotate through the scenes automatically, a different one each time. Upload or pick your own to override a scene. Never use photos of the loved one.</CardDescription></CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-wrap items-center gap-3 rounded-md border p-3">
                  <Switch id="blogphotos" checked={useBlogPhotos} onCheckedChange={setUseBlogPhotos} />
                  <Label htmlFor="blogphotos" className="flex-1">Use blog photos ({blogPool.length} found)</Label>
                  <Button size="sm" variant="outline" onClick={shuffleBlogPhotos} disabled={!useBlogPhotos || !blogPool.length}>Shuffle photos</Button>
                </div>
                {TIMELINE.map(({ id }) => (
                  <div key={id} className="space-y-2 border-b pb-4 last:border-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium">{SCENE_LABELS[id]}</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <label className="cursor-pointer"><Upload className="h-4 w-4 mr-1" />Upload
                            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && uploadPhoto(id, e.target.files[0])} />
                          </label>
                        </Button>
                        {photos[id] && <Button size="sm" variant="ghost" onClick={() => { setPhotos((p) => { const n = { ...p }; delete n[id]; return n; }); setImages((p) => { const n = { ...p }; delete n[id]; return n; }); }}>Clear</Button>}
                      </div>
                    </div>
                    {photos[id] && (
                      <div className="space-y-1">
                        <Label className="text-xs">Vertical focus</Label>
                        <Slider value={[photos[id]!.focusY * 100]} min={0} max={100} step={1} onValueChange={([v]) => setPhotos((p) => ({ ...p, [id]: { ...p[id]!, focusY: v / 100 } }))} />
                      </div>
                    )}
                    {useBlogPhotos && blogPool.length > 0 && !photos[id] && (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {blogPool.map((b, i) => (
                          <button key={b.url} type="button" aria-label="Use this blog photo" onClick={() => setBlogAssign((p) => ({ ...p, [id]: i }))} className={`h-16 w-10 shrink-0 rounded overflow-hidden border-2 ${blogAssign[id] === i ? "border-primary" : "border-transparent"}`}>
                            <img src={b.src} alt="Blog photo" className="h-full w-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                    {library.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {library.map((p) => (
                          <div key={p.id} className="relative shrink-0">
                            <button type="button" onClick={() => setScenePhoto(id, p.url, p.focus_y, p.preview)} className={`h-16 w-10 rounded overflow-hidden border-2 ${photos[id]?.url === p.url ? "border-primary" : "border-transparent"}`}>
                              {p.preview ? <img src={p.preview} alt="Saved scene photo" className="h-full w-full object-cover" /> : <ImageIcon className="h-4 w-4 m-auto" />}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {library.length > 0 && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-muted-foreground">Manage saved photos</summary>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {library.map((p) => (
                        <div key={p.id} className="relative h-20 w-12 rounded overflow-hidden">
                          {p.preview && <img src={p.preview} alt="Saved scene photo" className="h-full w-full object-cover" />}
                          <button type="button" aria-label="Delete photo" onClick={() => removeLibraryPhoto(p)} className="absolute top-0 right-0 bg-background/90 rounded-bl p-0.5"><Trash2 className="h-3 w-3" /></button>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Caption</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Textarea value={caption} readOnly rows={7} />
                <Button variant="outline" onClick={() => { navigator.clipboard.writeText(caption); toast.success("Caption copied."); }}><Copy className="h-4 w-4 mr-2" />Copy caption</Button>
              </CardContent>
            </Card>
          </div>

          <div className="order-1 lg:order-2 lg:sticky lg:top-4 self-start space-y-3">
            <canvas ref={canvasRef} width={REEL_W} height={REEL_H} className="w-full max-w-[360px] mx-auto block rounded-xl border bg-muted aspect-[9/16]" />
            <div className="flex items-center gap-2 max-w-[360px] mx-auto">
              <Button size="icon" variant="outline" onClick={() => { if (t >= REEL_DURATION) setT(0); setPlaying((p) => !p); }} aria-label={playing ? "Pause" : "Play"}>
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Slider value={[t]} min={0} max={REEL_DURATION} step={0.05} onValueChange={([v]) => { setPlaying(false); setT(v); }} className="flex-1" />
              <span className="text-xs tabular-nums w-10 text-right">{t.toFixed(1)}s</span>
            </div>
            {issues.length > 0 && <div className="max-w-[360px] mx-auto text-sm text-destructive space-y-1">{issues.map((i) => <p key={i}>{i}</p>)}</div>}
            <div className="grid grid-cols-1 gap-2 max-w-[360px] mx-auto">
              <Button onClick={exportVideo} disabled={exporting !== null || (preset !== "general_recruit" && !need)}><Download className="h-4 w-4 mr-2" />Export video</Button>
              <Button variant="outline" onClick={exportStills} disabled={preset !== "general_recruit" && !need}><ImageIcon className="h-4 w-4 mr-2" />Download 3 still images</Button>
            </div>
          </div>
        </div>
      </div>

      <canvas ref={exportCanvasRef} width={REEL_W} height={REEL_H} className="hidden" />
      <Dialog open={exporting !== null}>
        <DialogContent className="[&>button]:hidden">
          <DialogHeader>
            <DialogTitle>Recording your reel</DialogTitle>
            <DialogDescription>Keep this tab open and in front until it finishes. This takes about {REEL_DURATION} seconds.</DialogDescription>
          </DialogHeader>
          <div className="h-2 rounded bg-muted overflow-hidden"><div className="h-full bg-primary transition-all" style={{ width: `${Math.round((exporting ?? 0) * 100)}%` }} /></div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReelStudioPage;
