// Pure canvas renderer: drawFrame(ctx, t, spec, assets) gives the same frame for the same input.
import { REEL_H, REEL_W, SAFE_BOTTOM, SAFE_TOP, sceneAt, TIMELINE, type ReelSpec, type SceneId } from "./spec";
import { DAYS, summarizeSchedule } from "./redact";

export type Palette = { primary: string; accent: string; ink: string; bg: string; muted: string; onPrimary: string };
export type ReelAssets = { photos: Partial<Record<SceneId, HTMLImageElement>>; palette: Palette; font: string };

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const ease = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeOutBack = (x: number) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

export function wrapText(ctx: CanvasRenderingContext2D, str: string, maxW: number): string[] {
  const words = str.split(/\s+/); const lines: string[] = []; let line = "";
  for (const w of words) { const test = line ? line + " " + w : w; if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test; }
  if (line) lines.push(line); return lines;
}

function coverImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement, focusY: number, scale = 1) {
  const r = Math.max(REEL_W / img.width, REEL_H / img.height) * scale;
  const w = img.width * r, h = img.height * r;
  ctx.drawImage(img, (REEL_W - w) / 2, (REEL_H - h) * focusY, w, h);
}

function background(ctx: CanvasRenderingContext2D, scene: SceneId, localT: number, spec: ReelSpec, a: ReelAssets) {
  const img = a.photos[scene];
  ctx.fillStyle = a.palette.bg; ctx.fillRect(0, 0, REEL_W, REEL_H);
  if (img) {
    coverImage(ctx, img, spec.photos[scene]?.focusY ?? 0.5, 1 + 0.08 * localT);
    const g = ctx.createLinearGradient(0, 0, 0, REEL_H);
    g.addColorStop(0, "rgba(0,0,0,0.15)"); g.addColorStop(0.55, "rgba(0,0,0,0.35)"); g.addColorStop(1, "rgba(0,0,0,0.75)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, REEL_W, REEL_H);
  }
}

function headline(ctx: CanvasRenderingContext2D, lines: string[], y: number, size: number, color: string, font: string, p: number) {
  ctx.font = `700 ${size}px ${font}`; ctx.fillStyle = color; ctx.textAlign = "center"; ctx.textBaseline = "top";
  ctx.globalAlpha *= p;
  let yy = y + (1 - p) * 60;
  for (const l of lines) for (const w of wrapText(ctx, l, REEL_W - 160)) { ctx.fillText(w, REEL_W / 2, yy); yy += size * 1.15; }
  ctx.globalAlpha = 1;
  return yy;
}

// Rough Trinidad & Tobago outlines in reel coordinates (stylized, not to scale).
const TRINIDAD: [number, number][] = [[250,760],[420,700],[640,690],[830,700],[860,760],[820,880],[830,1060],[860,1200],[780,1260],[560,1250],[360,1290],[220,1270],[300,1200],[360,1100],[340,960],[300,860]];
const TOBAGO: [number, number][] = [[760,520],[880,470],[930,490],[860,560],[770,570]];
const PINS: Record<string, [number, number]> = {
  "North West Trinidad": [380, 780], "East Trinidad": [650, 790], "Central Trinidad": [480, 980],
  "South Trinidad": [470, 1170], "Tobago": [850, 515], "Trinidad & Tobago": [560, 950],
};

function poly(ctx: CanvasRenderingContext2D, pts: [number, number][]) { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); }

function chip(ctx: CanvasRenderingContext2D, label: string, x: number, y: number, bg: string, fg: string, font: string) {
  ctx.font = `600 44px ${font}`; const w = ctx.measureText(label).width + 64;
  roundRect(ctx, x, y, w, 88, 44); ctx.fillStyle = bg; ctx.fill();
  ctx.fillStyle = fg; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText(label, x + 32, y + 46);
  return w;
}

function drawScene(ctx: CanvasRenderingContext2D, id: SceneId, lt: number, spec: ReelSpec, a: ReelAssets) {
  const { palette: P, font } = a; const hasPhoto = !!a.photos[id]; const ink = hasPhoto ? "#ffffff" : P.ink;
  background(ctx, id, lt, spec, a);
  const T = spec.text;
  if (id === "hook") {
    headline(ctx, [T.hook1, T.hook2], 1000, 96, ink, font, easeOutCubic(ease(lt, 0.05, 0.4)));
  } else if (id === "map") {
    headline(ctx, [spec.need?.area ?? "Trinidad & Tobago"], SAFE_TOP + 40, 88, ink, font, easeOutCubic(ease(lt, 0, 0.25)));
    ctx.fillStyle = hasPhoto ? "rgba(255,255,255,0.9)" : P.muted; poly(ctx, TRINIDAD); ctx.fill(); poly(ctx, TOBAGO); ctx.fill();
    const [px, py] = PINS[spec.need?.region ?? ""] ?? PINS["Trinidad & Tobago"];
    const drop = easeOutBack(ease(lt, 0.15, 0.45)); const y = py - (1 - drop) * 400;
    const ring = ease(lt, 0.45, 1); ctx.strokeStyle = P.primary; ctx.lineWidth = 8; ctx.globalAlpha = 1 - ring;
    ctx.beginPath(); ctx.arc(px, py, 40 + ring * 180, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
    ctx.fillStyle = P.primary; ctx.beginPath(); ctx.arc(px, y - 70, 50, Math.PI, 0); ctx.lineTo(px, y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = P.onPrimary; ctx.beginPath(); ctx.arc(px, y - 70, 20, 0, Math.PI * 2); ctx.fill();
  } else if (id === "needs") {
    const cardY = 560, cardH = 900;
    ctx.globalAlpha = easeOutCubic(ease(lt, 0, 0.12));
    roundRect(ctx, 80, cardY, REEL_W - 160, cardH, 48); ctx.fillStyle = P.bg; ctx.fill(); ctx.globalAlpha = 1;
    ctx.font = `700 72px ${font}`; ctx.fillStyle = P.ink; ctx.textAlign = "left"; ctx.textBaseline = "top"; ctx.fillText(T.needsTitle, 140, cardY + 60);
    const items = [...(spec.need?.careTypes ?? []), ...(spec.need?.skills ?? []), ...(spec.need?.qualifications ?? [])].slice(0, 8);
    let x = 140, y = cardY + 190;
    items.forEach((label, i) => {
      const appear = ease(lt, 0.15 + i * 0.075, 0.15 + i * 0.075 + 0.06); if (appear <= 0) return;
      ctx.font = `600 44px ${font}`; const w = ctx.measureText(label).width + 64; if (x + w > REEL_W - 140) { x = 140; y += 110; }
      ctx.globalAlpha = appear; chip(ctx, label, x, y, i < (spec.need?.careTypes.length ?? 0) ? P.primary : P.muted, i < (spec.need?.careTypes.length ?? 0) ? P.onPrimary : P.ink, font);
      if (appear < 1) { ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.beginPath(); ctx.arc(x + w / 2, y + 44, 30 * (1 - appear) + 10, 0, Math.PI * 2); ctx.fill(); }
      ctx.globalAlpha = 1; x += w + 20;
    });
  } else if (id === "schedule") {
    const s = summarizeSchedule(spec.need?.schedule ?? "");
    headline(ctx, [T.scheduleTitle], SAFE_TOP + 80, 88, ink, font, easeOutCubic(ease(lt, 0, 0.2)));
    const cw = 120, gap = 12, total = 7 * cw + 6 * gap, x0 = (REEL_W - total) / 2, y0 = 820;
    DAYS.forEach((d, i) => {
      const x = x0 + i * (cw + gap); const fill = s.days[i] ? ease(lt, 0.15 + i * 0.07, 0.25 + i * 0.07) : 0;
      roundRect(ctx, x, y0, cw, 260, 24); ctx.fillStyle = P.bg; ctx.fill();
      if (fill > 0) { ctx.save(); roundRect(ctx, x, y0, cw, 260, 24); ctx.clip(); ctx.fillStyle = P.primary; ctx.fillRect(x, y0 + 260 * (1 - fill), cw, 260 * fill); ctx.restore(); }
      ctx.font = `700 44px ${font}`; ctx.fillStyle = fill > 0.5 ? P.onPrimary : P.ink; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(d, x + cw / 2, y0 + 130);
    });
    const p = easeOutCubic(ease(lt, 0.6, 0.85));
    headline(ctx, [s.label, s.hours, T.startLabel].filter(Boolean), 1160, 56, ink, font, p);
  } else {
    const pulse = 1 + 0.04 * Math.sin(lt * Math.PI * 6);
    const end = headline(ctx, [T.cta1], 760, 104, ink, font, easeOutCubic(ease(lt, 0, 0.25)));
    headline(ctx, [T.cta2], end + 20, 56, ink, font, easeOutCubic(ease(lt, 0.1, 0.35)));
    ctx.save(); ctx.translate(REEL_W / 2, 1300); ctx.scale(pulse, pulse);
    ctx.font = `700 48px ${font}`; const w = ctx.measureText(T.ctaBody).width + 100;
    roundRect(ctx, -w / 2, -60, w, 120, 60); ctx.fillStyle = P.primary; ctx.fill();
    ctx.fillStyle = P.onPrimary; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(T.ctaBody, 0, 2); ctx.restore();
    if (spec.need?.urgency === "urgent") {
      ctx.font = `700 44px ${font}`; const bw = ctx.measureText("Needed soon").width + 64;
      roundRect(ctx, (REEL_W - bw) / 2, 620, bw, 80, 40); ctx.fillStyle = P.accent; ctx.fill();
      ctx.fillStyle = P.ink; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("Needed soon", REEL_W / 2, 662);
    }
    ctx.font = `700 64px ${font}`; ctx.fillStyle = ink; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.fillText("Tavara", REEL_W / 2, REEL_H - SAFE_BOTTOM - 20);
  }
}

export function drawFrame(ctx: CanvasRenderingContext2D, t: number, spec: ReelSpec, assets: ReelAssets) {
  const { id, localT } = sceneAt(t);
  drawScene(ctx, id, localT, spec, assets);
  // 250 ms cross-fade into the next scene
  const idx = TIMELINE.findIndex((s) => s.id === id); const next = TIMELINE[idx + 1];
  if (next && next.start - t < 0.25) {
    ctx.globalAlpha = 1 - (next.start - t) / 0.25;
    drawScene(ctx, next.id, 0, spec, assets);
    ctx.globalAlpha = 1;
  }
}
