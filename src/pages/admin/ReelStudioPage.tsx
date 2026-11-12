import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Play, Pause, Download, Copy, Image as ImageIcon, Film, Upload, Trash2, Star, Save, FolderOpen, Mic, Square } from "lucide-react";
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
  defaultCaregiverText, defaultText, normalizeReelTextLinks, REEL_DURATION, REEL_H, REEL_W, STILL_TIMES, TEXT_LIMITS, TIMELINE,
  type ReelSafeNeed, type ReelSpec, type ReelText, type SceneId,
  WHATSAPP_CHANNEL_URL,
} from "@/lib/reel/spec";
import { containsUnsafe, redact } from "@/lib/reel/redact";
import { buildCaption, buildCaregiverCaption, findBannedWords } from "@/lib/reel/caption";
import { drawFrame, type Palette, type ReelAssets } from "@/lib/reel/engine";
import { download, recordReel, renderStill } from "@/lib/reel/export";
import { buildFounderCaption, defaultFounderScript, DEFAULT_FOUNDER_STORY } from "@/lib/reel/founderStory";
import { estimateNarrationSeconds, isVoiceoverDurationValid, pickVoiceRecordingMime, readAudioDuration, VOICEOVER_ACCEPT, VOICEOVER_MAX_BYTES, voiceoverExtension } from "@/lib/reel/voiceover";

type Candidate = { request_ref: string; area: string; care_type: string };
type SavedReel = { id: string; request_ref: string; preset: string; spec: any; is_primary: boolean; created_at: string };
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
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const [voicePath, setVoicePath] = useState<string | null>(null);
  const [voiceDuration, setVoiceDuration] = useState<number | null>(null);
  const [recording, setRecording] = useState(false);
  const [script, setScript] = useState(defaultFounderScript());
  const [founderCaption, setFounderCaption] = useState(true);
  const [story, setStory] = useState(DEFAULT_FOUNDER_STORY);
  type VoicePreset = { id: string; name: string; script: string; caption_story: string; voice_path: string | null; voice_duration: number | null; created_at: string };
  const [presets, setPresets] = useState<VoicePreset[]>([]);
  const [presetName, setPresetName] = useState("");
  const loadPresets = useCallback(async () => {
    const { data } = await (supabase as any).from("reel_voice_presets").select("*").order("created_at", { ascending: false });
    setPresets(data ?? []);
  }, []);
  const recRef = useRef<MediaRecorder | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement>(null);

  const setVoice = useCallback((blob: Blob | null, path: string | null, duration: number | null) => {
    setVoiceUrl((old) => { if (old) URL.revokeObjectURL(old); return blob ? URL.createObjectURL(blob) : null; });
    setVoiceBlob(blob); setVoicePath(path); setVoiceDuration(duration);
  }, []);

  const acceptVoice = async (blob: Blob) => {
    if (blob.size > VOICEOVER_MAX_BYTES) return toast.error("That recording is over 15 MB. Please use a shorter clip.");
    let duration: number;
    try { duration = await readAudioDuration(blob); } catch (e: any) { return toast.error(e.message); }
    if (!isVoiceoverDurationValid(duration)) return toast.error(`Your voiceover is ${duration.toFixed(1)} seconds. Keep it to ${REEL_DURATION} seconds so it is not cut off.`);
    const type = blob.type || "audio/webm";
    const path = `${crypto.randomUUID()}.${voiceoverExtension(type)}`;
    const { error } = await supabase.storage.from("reel-voiceovers").upload(path, blob, { contentType: type });
    if (error) return toast.error("Could not save your voiceover: " + error.message);
    setVoice(blob, path, duration);
    toast.success(`Voiceover saved (${duration.toFixed(1)} seconds). Press play to hear it with the reel.`);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      const mime = pickVoiceRecordingMime();
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      rec.onstop = () => { stream.getTracks().forEach((tr) => tr.stop()); setRecording(false); acceptVoice(new Blob(chunks, { type: rec.mimeType || mime || "audio/webm" })); };
      recRef.current = rec; rec.start(); setRecording(true);
      window.setTimeout(() => { if (rec.state === "recording") rec.stop(); }, REEL_DURATION * 1000);
    } catch { toast.error("Microphone access was blocked. Allow the microphone in your browser, or upload a recording instead."); }
  };
  const savePreset = async () => {
    const name = presetName.trim() || `Founder voiceover ${new Date().toLocaleDateString()}`;
    const { error } = await (supabase as any).from("reel_voice_presets").insert({ name, script, caption_story: story, voice_path: voicePath, voice_duration: voiceDuration, created_by: user!.id });
    if (error) return toast.error("Could not save: " + error.message);
    setPresetName(""); loadPresets();
    toast.success(voicePath ? `"${name}" saved with your voiceover and caption story.` : `"${name}" saved (script and caption story only, no recording yet).`);
  };
  const applyPreset = async (p: VoicePreset) => {
    setScript(p.script); if (p.caption_story) setStory(p.caption_story); setFounderCaption(true);
    if (p.voice_path) {
      const { data } = await supabase.storage.from("reel-voiceovers").download(p.voice_path);
      if (data) setVoice(data, p.voice_path, p.voice_duration);
      else toast.error("The recording for this preset could not be found.");
    } else setVoice(null, null, null);
    toast.success(`Using "${p.name}" on this reel.`);
  };
  const deletePreset = async (p: VoicePreset) => {
    if (!window.confirm(`Delete "${p.name}"? Reels you already exported are not affected.`)) return;
    await (supabase as any).from("reel_voice_presets").delete().eq("id", p.id);
    loadPresets(); toast.success("Preset deleted.");
  };
  const stopRecording = () => { if (recRef.current?.state === "recording") recRef.current.stop(); };

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
  const [saved, setSaved] = useState<SavedReel[]>([]);
  const pendingRef = useRef<{ text: ReelText; ref: string } | null>(null);
  const loadSaved = useCallback(async () => {
    const { data } = await (supabase as any).from("reel_exports").select("id, request_ref, preset, spec, is_primary, created_at").order("is_primary", { ascending: false }).order("created_at", { ascending: false }).limit(100);
    setSaved(data ?? []);
  }, []);
  useEffect(() => { if (isAdmin) { loadSaved(); loadPresets(); } }, [isAdmin, loadSaved, loadPresets]);
  const [caregivers, setCaregivers] = useState<Candidate[] | null>(null);
  useEffect(() => {
    if (!isAdmin) return;
    (supabase as any).rpc("list_reel_caregiver_candidates").then(({ data, error }: any) => {
      if (error) toast.error("Could not load caregivers: " + error.message);
      setCaregivers(data ?? []);
    });
  }, [isAdmin]);
  useEffect(() => { if (!pendingRef.current) setSelectedRef(""); }, [isCaregiver]);

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
      setScript(defaultFounderScript(safe));
      const pending = pendingRef.current?.ref === selectedRef ? pendingRef.current : null;
      pendingRef.current = null;
      setText((previous) => pending ? { ...defaultText(safe), ...pending.text } : ({ ...(caregiverMode ? defaultCaregiverText(safe) : defaultText(safe)), whatsappTitle: previous.whatsappTitle, whatsappBody: previous.whatsappBody }));
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

  const standardCaption = useMemo(() => isCaregiver ? buildCaregiverCaption(spec.need, WHATSAPP_CHANNEL_URL) : buildCaption(spec.need, spec.rateBand, WHATSAPP_CHANNEL_URL), [spec, isCaregiver]);
  const caption = useMemo(() => founderCaption ? buildFounderCaption(spec.need, spec.rateBand, WHATSAPP_CHANNEL_URL, isCaregiver, story) : standardCaption, [founderCaption, standardCaption, spec, isCaregiver, story]);
  const issues = useMemo(() => {
    const all = [...Object.values(text), caption].join(" \n ");
    const out: string[] = [];
    const unsafe = containsUnsafe(Object.values(text).join(" ")); if (unsafe) out.push(`Text contains a ${unsafe}.`);
    const banned = findBannedWords(all); if (banned.length) out.push(`Avoid these words: ${banned.join(", ")}.`);
    if (/https?:\/\/|whatsapp\.com\//i.test(text.whatsappBody)) out.push("Keep links off the video. The channel link is already in the caption.");
    return out;
  }, [text, caption]);
  const scriptSeconds = estimateNarrationSeconds(script);

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
    const a = previewAudioRef.current;
    if (a && voiceUrl) { a.currentTime = Math.min(t, a.duration || t); a.play().catch(() => {}); }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); previewAudioRef.current?.pause(); };
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
    await (supabase as any).from("reel_exports").insert({ request_ref: ref, preset, spec: { ...spec, photos: Object.keys(photos), voiceover: voicePath ? { path: voicePath, duration: voiceDuration, script } : undefined, founderCaption, founderStory: story }, created_by: user!.id });
    loadSaved();
  };
  const saveReel = async () => {
    if (issues.length) return toast.error("Fix the wording issues before saving.");
    await logExport(); toast.success("Reel saved. Find it under Saved reels.");
  };
  const openSaved = (r: SavedReel) => {
    const sp = r.spec ?? {};
    const baseText = r.preset === "caregiver_available" ? defaultCaregiverText() : defaultText();
    const restoredText = normalizeReelTextLinks({ ...baseText, ...(sp.text ?? {}) });
    setPlaying(false); setT(0);
    if (sp.rateBand) { setShowRate(true); setRateBand(sp.rateBand); } else setShowRate(false);
    if (sp.audio) setAudioOn(!!sp.audio.enabled);
    setFounderCaption(sp.founderCaption ?? false);
    setStory(sp.founderStory || DEFAULT_FOUNDER_STORY);
    setVoice(null, null, null);
    if (sp.voiceover?.script) setScript(sp.voiceover.script);
    if (sp.voiceover?.path) {
      supabase.storage.from("reel-voiceovers").download(sp.voiceover.path).then(({ data }) => {
        if (data) setVoice(data, sp.voiceover.path, sp.voiceover.duration ?? null);
        else toast.error("This reel's voiceover could not be found. Record it again if needed.");
      });
    }
    if (r.request_ref === "general") { pendingRef.current = null; setPreset(r.preset as ReelSpec["preset"]); setSelectedRef(""); setTimeout(() => setText(restoredText), 0); }
    else { pendingRef.current = { text: restoredText, ref: r.request_ref }; setPreset(r.preset as ReelSpec["preset"]); setSelectedRef(r.request_ref); }
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.success("Saved reel opened. Photos reshuffle, so pick them again if needed.");
  };
  const deleteSaved = async (r: SavedReel) => {
    if (!window.confirm("Delete this saved reel? The video you downloaded is not affected.")) return;
    const { error } = await (supabase as any).from("reel_exports").delete().eq("id", r.id);
    if (error) return toast.error("Could not delete: " + error.message);
    loadSaved(); toast.success("Saved reel deleted.");
  };
  const makePrimary = async (r: SavedReel) => {
    await (supabase as any).from("reel_exports").update({ is_primary: false }).eq("request_ref", r.request_ref);
    const { error } = await (supabase as any).from("reel_exports").update({ is_primary: !r.is_primary }).eq("id", r.id);
    if (error) return toast.error("Could not update: " + error.message);
    loadSaved(); toast.success(r.is_primary ? "No longer the main reel." : `Main reel set for ${r.request_ref}.`);
  };
  const PRESET_LABEL: Record<string, string> = { new_match_needed: "Family needs care", urgent_need: "Urgent family", caregiver_available: "Caregiver available", general_recruit: "General" };

  const exportVideo = async () => {
    if (issues.length) return toast.error("Fix the wording issues before exporting.");
    setPlaying(false); setExporting(0);
    try {
      const { blob, ext } = await recordReel(exportCanvasRef.current!, spec, assets, setExporting, voiceBlob);
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
              <CardHeader><CardTitle>Your voiceover</CardTitle><CardDescription>Record your own voice or upload a clip, up to {REEL_DURATION} seconds. It plays with the preview and is mixed into the exported video. The sound cues get quieter under your voice.</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                <Label htmlFor="script">Script to read</Label>
                <Textarea id="script" value={script} onChange={(e) => setScript(e.target.value)} rows={4} />
                <p className={`text-xs ${scriptSeconds > REEL_DURATION ? "text-destructive" : "text-muted-foreground"}`}>About {Math.round(scriptSeconds)} seconds at a relaxed pace{scriptSeconds > REEL_DURATION ? `. Trim it to fit ${REEL_DURATION} seconds.` : "."}</p>
                <div className="flex flex-wrap gap-2">
                  {recording
                    ? <Button variant="destructive" onClick={stopRecording}><Square className="h-4 w-4 mr-2" />Stop recording</Button>
                    : <Button onClick={startRecording}><Mic className="h-4 w-4 mr-2" />Record my voice</Button>}
                  <Button variant="outline" asChild>
                    <label className="cursor-pointer"><Upload className="h-4 w-4 mr-2" />Upload audio
                      <input type="file" accept={VOICEOVER_ACCEPT} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) acceptVoice(f); }} />
                    </label>
                  </Button>
                  {voiceUrl && <Button variant="ghost" onClick={() => setVoice(null, null, null)}><Trash2 className="h-4 w-4 mr-2" />Remove voiceover</Button>}
                </div>
                {recording && <p className="text-sm text-destructive">Recording… it stops automatically at {REEL_DURATION} seconds.</p>}
                {voiceUrl && <div className="space-y-1"><audio controls src={voiceUrl} className="w-full" /><p className="text-xs text-muted-foreground">Voiceover ready ({voiceDuration?.toFixed(1)} seconds). It is saved privately with this reel when you save or export.</p></div>}
                <div className="flex items-center gap-3 pt-2 border-t">
                  <Switch id="founder" checked={founderCaption} onCheckedChange={setFounderCaption} />
                  <Label htmlFor="founder">Use my founder story in the caption (Build and Bloom)</Label>
                </div>
                {founderCaption && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <Label htmlFor="story">Founder story (top of caption)</Label>
                      <Button size="sm" variant="ghost" onClick={() => setStory(DEFAULT_FOUNDER_STORY)}>Reset to default</Button>
                    </div>
                    <Textarea id="story" value={story} onChange={(e) => setStory(e.target.value)} rows={10} />
                    <p className="text-xs text-muted-foreground">The family's care needs, links and the "not a financial investment" note are added below this automatically.</p>
                  </div>
                )}
                <div className="space-y-2 pt-2 border-t">
                  <Label>Save for reuse</Label>
                  <p className="text-xs text-muted-foreground">Saves your script, founder story and recording together, so you can use them on any reel.</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input value={presetName} onChange={(e) => setPresetName(e.target.value)} placeholder="Name, e.g. Founder story v1" maxLength={60} />
                    <Button variant="secondary" onClick={savePreset}><Save className="h-4 w-4 mr-2" />Save voiceover and caption</Button>
                  </div>
                  {presets.length > 0 && <div className="space-y-2">
                    {presets.map((p) => (
                      <div key={p.id} className="flex flex-wrap items-center gap-2 rounded-md border p-2">
                        <div className="flex-1 min-w-[160px]">
                          <p className="text-sm font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.voice_path ? `Recording ${Number(p.voice_duration ?? 0).toFixed(1)}s` : "No recording"} · {new Date(p.created_at).toLocaleDateString()}</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => applyPreset(p)}><FolderOpen className="h-4 w-4 mr-1" />Use</Button>
                        <Button size="sm" variant="ghost" aria-label="Delete preset" onClick={() => deletePreset(p)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    ))}
                  </div>}
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
              <CardHeader><CardTitle>Saved reels</CardTitle><CardDescription>Every export and save lands here. Open one to edit and re-export, star it as the main reel for that family or caregiver, or delete it.</CardDescription></CardHeader>
              <CardContent className="space-y-2">
                {saved.length === 0 ? <p className="text-sm text-muted-foreground">No saved reels yet. Use "Save reel" or export a video.</p> : saved.map((r) => (
                  <div key={r.id} className={`flex flex-wrap items-center gap-2 rounded-md border p-3 ${r.is_primary ? "border-primary bg-primary/5" : ""}`}>
                    <div className="flex-1 min-w-[180px]">
                      <p className="font-medium text-sm">{r.is_primary && <Star className="inline h-4 w-4 mr-1 fill-primary text-primary" />}{r.request_ref} · {PRESET_LABEL[r.preset] ?? r.preset}</p>
                      <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}{r.spec?.text?.hook1 ? ` · "${r.spec.text.hook1}"` : ""}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => openSaved(r)}><FolderOpen className="h-4 w-4 mr-1" />Open</Button>
                    {r.request_ref !== "general" && <Button size="sm" variant={r.is_primary ? "default" : "outline"} onClick={() => makePrimary(r)}><Star className="h-4 w-4 mr-1" />{r.is_primary ? "Main reel" : "Make main"}</Button>}
                    <Button size="sm" variant="ghost" aria-label="Delete saved reel" onClick={() => deleteSaved(r)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Caption</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Textarea value={caption} readOnly rows={founderCaption ? 14 : 7} />
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
              <Button variant="secondary" onClick={saveReel} disabled={preset !== "general_recruit" && !need}><Save className="h-4 w-4 mr-2" />Save reel (no download)</Button>
              <Button variant="outline" onClick={exportStills} disabled={preset !== "general_recruit" && !need}><ImageIcon className="h-4 w-4 mr-2" />Download 3 still images</Button>
            </div>
          </div>
        </div>
      </div>

      {voiceUrl && <audio ref={previewAudioRef} src={voiceUrl} className="hidden" />}
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
