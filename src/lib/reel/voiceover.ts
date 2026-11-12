import { REEL_DURATION } from "./spec";

export const VOICEOVER_MAX_BYTES = 15 * 1024 * 1024;
export const VOICEOVER_DURATION_TOLERANCE = 0.25;

export const VOICEOVER_ACCEPT = [
  "audio/webm",
  "audio/ogg",
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/x-wav",
  "audio/aac",
].join(",");

export function isVoiceoverDurationValid(seconds: number): boolean {
  return Number.isFinite(seconds) && seconds > 0 && seconds <= REEL_DURATION + VOICEOVER_DURATION_TOLERANCE;
}

export function estimateNarrationSeconds(script: string): number {
  const words = script.trim().split(/\s+/).filter(Boolean).length;
  return words / 2.35;
}

export function shouldIncludeAudioTrack(soundCuesEnabled: boolean, hasVoiceover: boolean): boolean {
  return soundCuesEnabled || hasVoiceover;
}

export function pickVoiceRecordingMime(): string {
  if (typeof MediaRecorder === "undefined") return "";
  return [
    "audio/webm;codecs=opus",
    "audio/mp4",
    "audio/ogg;codecs=opus",
    "audio/webm",
  ].find((mime) => MediaRecorder.isTypeSupported(mime)) ?? "";
}

export function voiceoverExtension(mime: string): string {
  if (mime.includes("mp4")) return "m4a";
  if (mime.includes("mpeg")) return "mp3";
  if (mime.includes("ogg")) return "ogg";
  if (mime.includes("wav")) return "wav";
  if (mime.includes("aac")) return "aac";
  return "webm";
}

export function readAudioDuration(blob: Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio();
    const clean = () => {
      URL.revokeObjectURL(url);
      audio.removeAttribute("src");
      audio.load();
    };
    const timer = window.setTimeout(() => {
      clean();
      reject(new Error("Could not read the recording length."));
    }, 10_000);
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      window.clearTimeout(timer);
      const duration = audio.duration;
      clean();
      if (Number.isFinite(duration)) resolve(duration);
      else reject(new Error("Could not read the recording length. Try recording directly in Reel Studio."));
    };
    audio.onerror = () => {
      window.clearTimeout(timer);
      clean();
      reject(new Error("This audio file could not be read. Try MP3, M4A, WAV, OGG, or WebM."));
    };
    audio.src = url;
  });
}
