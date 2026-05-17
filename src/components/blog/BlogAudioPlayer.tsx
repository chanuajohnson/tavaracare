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
  }, [postId]);

  useEffect(() => {
    if (audio?.duration_seconds && !duration) {
      setDuration(audio.duration_seconds);
    }
  }, [audio, duration]);

  const ensureReady = async () => {
    if (audio?.audio_url) return audio.audio_url;
    const fresh = await prepare();
    return fresh?.audio_url;
  };

  const handlePlayPause = async () => {
    const el = audioRef.current;
    if (isPlaying && el) {
      el.pause();
      setIsPlaying(false);
      return;
    }
    const url = await ensureReady();
    if (!url) return;
    // Need to wait a tick for src to be applied
    requestAnimationFrame(() => {
      const a = audioRef.current;
      if (!a) return;
      a.playbackRate = speed;
      a.play().then(() => setIsPlaying(true)).catch((e) => console.error(e));
    });
  };

  const handleStop = () => {
    const el = audioRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (vals: number[]) => {
    const el = audioRef.current;
    if (!el || !duration) return;
    const t = vals[0];
    el.currentTime = t;
    setCurrentTime(t);
  };

  const cycleSpeed = () => {
    const idx = SPEEDS.indexOf(speed);
    const next = SPEEDS[(idx + 1) % SPEEDS.length];
    setSpeed(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
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
