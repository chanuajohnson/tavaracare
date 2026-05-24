import { useEffect, useRef, useState } from "react";
import { Play, Pause, Square, Loader2, Headphones } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useBlogAudio } from "@/hooks/useBlogAudio";
import { formatTime } from "@/lib/blog/formatTime";
import { cn } from "@/lib/utils";

interface Props {
  postId: string;
  className?: string;
}

const SPEEDS = [1, 1.25, 1.5, 1.75];

export const BlogAudioPlayer = ({ postId, className }: Props) => {
  const { audio, isPreparing, error, prepare } = useBlogAudio(postId);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);

  // Reset on post change
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [postId]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (audio?.duration_seconds && !duration) {
      setDuration(audio.duration_seconds);
    }
  }, [audio, duration]);

  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const utteranceQueueRef = useRef<SpeechSynthesisUtterance[]>([]);
  const [usingBrowserTTS, setUsingBrowserTTS] = useState(false);

  const stopBrowserTTS = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    speechRef.current = null;
    utteranceQueueRef.current = [];
  };

  // Wait for voices to populate (Chrome loads them asynchronously).
  const getVoicesAsync = (): Promise<SpeechSynthesisVoice[]> =>
    new Promise((resolve) => {
      const synth = window.speechSynthesis;
      const existing = synth.getVoices();
      if (existing.length > 0) return resolve(existing);
      const handler = () => {
        synth.removeEventListener("voiceschanged", handler);
        resolve(synth.getVoices());
      };
      synth.addEventListener("voiceschanged", handler);
      // Safety timeout
      setTimeout(() => resolve(synth.getVoices()), 1500);
    });

  const pickBestVoice = (voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
    const preferred = [
      "Samantha",
      "Google UK English Female",
      "Microsoft Aria Online (Natural) - English (United States)",
      "Microsoft Jenny Online (Natural) - English (United States)",
      "Karen",
      "Moira",
      "Google US English",
    ];
    for (const name of preferred) {
      const v = voices.find((vv) => vv.name === name);
      if (v) return v;
    }
    // Any en-* "natural" / female-sounding voice
    const natural = voices.find((v) => /en[-_]/i.test(v.lang) && /natural|female|samantha|aria|jenny/i.test(v.name));
    if (natural) return natural;
    // Any English voice
    return voices.find((v) => /^en/i.test(v.lang)) ?? voices[0] ?? null;
  };

  // Split text into ~200-char chunks at sentence boundaries to avoid Chrome's
  // ~15-second cutoff that produces a clipped/harsh effect.
  const chunkText = (text: string, maxLen = 220): string[] => {
    const sentences = text.replace(/\s+/g, " ").match(/[^.!?]+[.!?]+|\S+$/g) ?? [text];
    const chunks: string[] = [];
    let current = "";
    for (const s of sentences) {
      const piece = s.trim();
      if (!piece) continue;
      if ((current + " " + piece).trim().length > maxLen && current) {
        chunks.push(current.trim());
        current = piece;
      } else {
        current = (current + " " + piece).trim();
      }
    }
    if (current) chunks.push(current.trim());
    return chunks;
  };

  const startBrowserTTS = async (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      toast.error("Your browser does not support read-aloud.");
      return;
    }
    stopBrowserTTS();
    const voices = await getVoicesAsync();
    const voice = pickBestVoice(voices);
    const chunks = chunkText(text);
    const synth = window.speechSynthesis;

    setUsingBrowserTTS(true);
    setIsPlaying(true);
    if (audio?.duration_seconds) setDuration(audio.duration_seconds);

    chunks.forEach((chunk, idx) => {
      const utter = new SpeechSynthesisUtterance(chunk);
      if (voice) utter.voice = voice;
      utter.lang = voice?.lang ?? "en-US";
      utter.rate = Math.max(0.7, Math.min(1.2, speed * 0.95));
      utter.pitch = 1.0;
      utter.volume = 1.0;
      utter.onerror = () => {
        if (idx === chunks.length - 1) setIsPlaying(false);
      };
      utter.onend = () => {
        if (idx === chunks.length - 1) {
          setIsPlaying(false);
          setCurrentTime(0);
        }
      };
      utteranceQueueRef.current.push(utter);
      synth.speak(utter);
    });
    speechRef.current = utteranceQueueRef.current[0] ?? null;
  };

  const ensureReady = async () => {
    if (audio?.audio_url) return { url: audio.audio_url as string };
    const fresh = await prepare();
    if (fresh?.provider_unavailable && fresh.fallback_text) {
      return { fallbackText: fresh.fallback_text };
    }
    return { url: fresh?.audio_url };
  };

  const handlePlayPause = async () => {
    const el = audioRef.current;
    if (isPlaying) {
      if (usingBrowserTTS) {
        window.speechSynthesis.pause();
      } else if (el) {
        el.pause();
      }
      setIsPlaying(false);
      return;
    }
    if (usingBrowserTTS && speechRef.current && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      return;
    }
    try {
      const ready = await ensureReady();
      if (ready?.fallbackText) {
        startBrowserTTS(ready.fallbackText);
        return;
      }
      const url = ready?.url;
      if (!url) {
        toast.error("Audio not ready yet — please try again in a moment.");
        return;
      }
      requestAnimationFrame(() => {
        const a = audioRef.current;
        if (!a) return;
        a.playbackRate = speed;
        a.play().then(() => setIsPlaying(true)).catch((e) => {
          console.error("[BlogAudioPlayer] play() failed:", e);
          toast.error("Could not start playback in this browser.");
        });
      });
    } catch (e: any) {
      console.error("[BlogAudioPlayer] prepare failed:", e);
    }
  };

  const handleStop = () => {
    if (usingBrowserTTS) {
      stopBrowserTTS();
      setIsPlaying(false);
      setCurrentTime(0);
      setUsingBrowserTTS(false);
      return;
    }
    const el = audioRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (vals: number[]) => {
    const el = audioRef.current;
    if (!el || !duration || usingBrowserTTS) return;
    const t = vals[0];
    el.currentTime = t;
    setCurrentTime(t);
  };

  const cycleSpeed = () => {
    const idx = SPEEDS.indexOf(speed);
    const next = SPEEDS[(idx + 1) % SPEEDS.length];
    setSpeed(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
    if (usingBrowserTTS) {
      // Restart queued utterances at new rate from the remaining text
      const remaining = utteranceQueueRef.current.map((u) => u.text).join(" ");
      if (remaining) {
        stopBrowserTTS();
        startBrowserTTS(remaining);
      }
    }
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4 md:p-5 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Headphones className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">Listen to this article</div>
          <div className="text-xs text-muted-foreground">
            {duration > 0 ? `${formatTime(duration)} narrated audio` : "AI narration"}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={cycleSpeed}
          className="text-xs font-mono"
          title="Playback speed"
        >
          {speed}x
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Button
          size="icon"
          onClick={handlePlayPause}
          disabled={isPreparing}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPreparing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={handleStop}
          disabled={!duration}
          aria-label="Stop"
        >
          <Square className="h-4 w-4" />
        </Button>

        <div className="flex-1 flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground tabular-nums w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            max={duration || 1}
            step={1}
            onValueChange={handleSeek}
            disabled={!duration}
            className="flex-1"
          />
          <span className="text-xs font-mono text-muted-foreground tabular-nums w-10">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {isPreparing && (
        <p className="text-xs text-muted-foreground mt-3">
          Preparing audio… first-time generation takes 10-30 seconds.
        </p>
      )}
      {error && (
        <p className="text-xs text-destructive mt-3">{error}</p>
      )}

      <audio
        ref={audioRef}
        src={audio?.audio_url}
        preload="metadata"
        onLoadedMetadata={(e) => {
          const d = (e.target as HTMLAudioElement).duration;
          if (isFinite(d) && d > 0) setDuration(d);
        }}
        onTimeUpdate={(e) => setCurrentTime((e.target as HTMLAudioElement).currentTime)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />
    </div>
  );
};
