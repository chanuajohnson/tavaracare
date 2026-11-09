// Synthesized sound cues, scheduled against the timeline so they stay in sync.
export type CueType = "click" | "chime" | "pop" | "tick";
export type Cue = { t: number; type: CueType };

export function buildCues(chipCount: number, dayCount: number): Cue[] {
  const cues: Cue[] = [{ t: 0.2, type: "chime" }, { t: 3.1, type: "pop" }];
  for (let i = 0; i < Math.min(chipCount, 8); i++) cues.push({ t: 6.1 + i * 0.3, type: "click" });
  for (let i = 0; i < dayCount; i++) cues.push({ t: 10.0 + i * 0.18, type: "tick" });
  cues.push({ t: 12.3, type: "chime" });
  return cues;
}

export function scheduleAudio(ac: AudioContext, dest: AudioNode, start: number, cues: Cue[], volume = 0.6) {
  for (const c of cues) {
    const t0 = start + c.t;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.connect(g).connect(dest);
    if (c.type === "click") {
      o.type = "square"; o.frequency.value = 2000;
      g.gain.setValueAtTime(0.15 * volume, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.015);
      o.start(t0); o.stop(t0 + 0.02);
    } else if (c.type === "tick") {
      o.type = "triangle"; o.frequency.value = 1400;
      g.gain.setValueAtTime(0.12 * volume, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.04);
      o.start(t0); o.stop(t0 + 0.05);
    } else if (c.type === "pop") {
      o.type = "sine"; o.frequency.setValueAtTime(600, t0); o.frequency.exponentialRampToValueAtTime(200, t0 + 0.15);
      g.gain.setValueAtTime(0.4 * volume, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);
      o.start(t0); o.stop(t0 + 0.2);
    } else {
      o.type = "sine"; o.frequency.value = 880;
      const o2 = ac.createOscillator(); o2.type = "sine"; o2.frequency.value = 1320; o2.connect(g);
      g.gain.setValueAtTime(0.25 * volume, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.4);
      o.start(t0); o.stop(t0 + 0.45); o2.start(t0); o2.stop(t0 + 0.45);
    }
  }
}
