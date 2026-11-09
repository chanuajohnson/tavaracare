import { drawFrame, type ReelAssets } from "./engine";
import { buildCues, scheduleAudio } from "./audio";
import { REEL_DURATION, REEL_FPS, type ReelSpec } from "./spec";
import { summarizeSchedule } from "./redact";

export function cuesFor(spec: ReelSpec) {
  const chips = (spec.need?.careTypes.length ?? 0) + (spec.need?.skills.length ?? 0) + (spec.need?.qualifications.length ?? 0);
  const days = summarizeSchedule(spec.need?.schedule ?? "").days.filter(Boolean).length;
  return buildCues(chips, days);
}

export function pickMime(): string {
  const opts = ["video/mp4;codecs=avc1,mp4a.40.2", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm"];
  return opts.find((m) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m)) ?? "video/webm";
}

export async function recordReel(
  canvas: HTMLCanvasElement, spec: ReelSpec, assets: ReelAssets, onProgress?: (p: number) => void,
): Promise<{ blob: Blob; ext: "mp4" | "webm" }> {
  const ctx = canvas.getContext("2d")!;
  const stream = canvas.captureStream(REEL_FPS);
  const ac = new AudioContext(); await ac.resume();
  const dest = ac.createMediaStreamDestination();
  if (spec.audio.enabled) dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
  const mime = pickMime();
  const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8_000_000 });
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const done = new Promise<void>((r) => (rec.onstop = () => r()));
  drawFrame(ctx, 0, spec, assets);
  rec.start(250);
  const start = performance.now(); const acStart = ac.currentTime + 0.02;
  if (spec.audio.enabled) scheduleAudio(ac, dest, acStart, cuesFor(spec), spec.audio.volume);
  await new Promise<void>((resolve) => {
    const tick = () => {
      const t = (performance.now() - start) / 1000;
      drawFrame(ctx, Math.min(t, REEL_DURATION), spec, assets); onProgress?.(Math.min(1, t / REEL_DURATION));
      if (t >= REEL_DURATION) return resolve();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  rec.stop(); await done; ac.close();
  return { blob: new Blob(chunks, { type: mime.split(";")[0] }), ext: mime.startsWith("video/mp4") ? "mp4" : "webm" };
}

export function renderStill(t: number, spec: ReelSpec, assets: ReelAssets, w = 1080, h = 1920): Promise<Blob> {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  drawFrame(c.getContext("2d")!, t, spec, assets);
  return new Promise((r) => c.toBlob((b) => r(b!), "image/png"));
}

export function download(blob: Blob, name: string) {
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
