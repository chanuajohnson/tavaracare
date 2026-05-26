import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react";

export interface WordTiming {
  word: string;
  start: number;
  end: number;
}

interface BlogReadingCtx {
  enabled: boolean;
  timings: WordTiming[];
  bodyOffset: number;
  currentIndex: number;
  counterRef: MutableRefObject<number>;
  setCurrentTime: (t: number) => void;
  resetCounter: () => void;
  isPlaying: boolean;
  setIsPlaying: (b: boolean) => void;
}

const Ctx = createContext<BlogReadingCtx | null>(null);

export const useBlogReading = () => useContext(Ctx);

interface ProviderProps {
  children: ReactNode;
  timings: WordTiming[];
  bodyOffset: number;
  enabled: boolean;
}

export const BlogReadingProvider = ({
  children,
  timings,
  bodyOffset,
  enabled,
}: ProviderProps) => {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const counterRef = useRef(bodyOffset);

  const setCurrentTime = useCallback(
    (t: number) => {
      if (!timings.length) return;
      // Binary search: largest index whose start <= t
      let lo = 0;
      let hi = timings.length - 1;
      let idx = -1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (timings[mid].start <= t) {
          idx = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }
      setCurrentIndex((prev) => (prev === idx ? prev : idx));
    },
    [timings],
  );

  const resetCounter = useCallback(() => {
    counterRef.current = bodyOffset;
  }, [bodyOffset]);

  // Auto-scroll the active word into view during playback so the highlight
  // stays visible while screen-recording.
  const lastScrollRef = useRef(0);
  useEffect(() => {
    if (!enabled || !isPlaying || currentIndex < 0) return;
    const now = Date.now();
    if (now - lastScrollRef.current < 400) return;
    lastScrollRef.current = now;
    const el = document.querySelector(`[data-word-idx="${currentIndex}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentIndex, enabled, isPlaying]);



  const value = useMemo(
    () => ({
      enabled,
      timings,
      bodyOffset,
      currentIndex,
      counterRef,
      setCurrentTime,
      resetCounter,
      isPlaying,
      setIsPlaying,
    }),
    [enabled, timings, bodyOffset, currentIndex, setCurrentTime, resetCounter, isPlaying],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};
