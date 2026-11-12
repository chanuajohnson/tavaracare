// Pure canvas renderer: drawFrame(ctx, t, spec, assets) gives the same frame for the same input.
import { REEL_H, REEL_W, SAFE_BOTTOM, SAFE_TOP, sceneAt, TIMELINE, type ReelSpec, type SceneId } from "./spec";
import { DAYS, summarizeSchedule } from "./redact";
import { projectGeo, reelLocationPoint, TRINIDAD_OUTLINE, TOBAGO_OUTLINE, type LonLat } from "./geo";

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
    g.addColorStop(0, "rgba(0,0,0,0.55)"); g.addColorStop(0.55, "rgba(0,0,0,0.45)"); g.addColorStop(1, "rgba(0,0,0,0.75)");
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

function islandPath(ctx: CanvasRenderingContext2D, points: LonLat[]) {
  ctx.beginPath();
  points.forEach((point, i) => {
    const [x, y] = projectGeo(point);
    if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
  });
  ctx.closePath();
}

export type CareChip = { label: string; index: number; x: number; y: number; width: number };
export type CareCardLayout = { cardY: number; cardH: number; chipsY: number; chipH: number; fontSize: number; rows: CareChip[][] };

/** Fit every real care item inside the card, shrinking type before adding another row. */
export function layoutCareCard(items: string[], measure: (label: string, size: number) => number): CareCardLayout {
  const maxW = REEL_W - 280, gap = 20;
  let chosen: Omit<CareCardLayout, "cardY" | "cardH" | "chipsY"> & { contentH: number } | undefined;
  for (let fontSize = 44; fontSize >= 32; fontSize -= 2) {
    const chipH = Math.round(fontSize * 1.45 + 24);
    const rows: CareChip[][] = [];
    let row: CareChip[] = [], x = 0;
    items.forEach((label, index) => {
      const width = Math.min(maxW, measure(label, fontSize) + 64);
      if (row.length && x + width > maxW) { rows.push(row); row = []; x = 0; }
      row.push({ label, index, x, y: 0, width });
      x += width + gap;
    });
    if (row.length) rows.push(row);
    const contentH = rows.length ? rows.length * chipH + (rows.length - 1) * gap : 0;
    chosen = { chipH, fontSize, rows, contentH };
    if (rows.length <= 5) break;
  }
  const layout = chosen!;
  const cardH = Math.max(420, 250 + layout.contentH);
  const cardY = Math.round((REEL_H - cardH) / 2 + 20);
  const chipsY = cardY + 190;
  layout.rows.forEach((row, r) => row.forEach((chip) => {
    chip.x += 140;
    chip.y = chipsY + r * (layout.chipH + gap);
  }));
  return { cardY, cardH, chipsY, chipH: layout.chipH, fontSize: layout.fontSize, rows: layout.rows };
}

function chip(ctx: CanvasRenderingContext2D, item: CareChip, layout: CareCardLayout, bg: string, fg: string, font: string) {
  roundRect(ctx, item.x, item.y, item.width, layout.chipH, layout.chipH / 2); ctx.fillStyle = bg; ctx.fill();
  let size = layout.fontSize;
  ctx.font = `600 ${size}px ${font}`;
  while (ctx.measureText(item.label).width > item.width - 56 && size > 26) {
    size -= 2; ctx.font = `600 ${size}px ${font}`;
  }
  ctx.fillStyle = fg; ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillText(item.label, item.x + 28, item.y + layout.chipH / 2 + 2);
}

function drawScene(ctx: CanvasRenderingContext2D, id: SceneId, lt: number, spec: ReelSpec, a: ReelAssets) {
  const { palette: P, font } = a; const hasPhoto = !!a.photos[id]; const ink = hasPhoto ? "#ffffff" : P.ink;
  background(ctx, id, lt, spec, a);
  const T = spec.text;
  if (id === "hook") {
    headline(ctx, [T.hook1, T.hook2], 1000, 96, ink, font, easeOutCubic(ease(lt, 0.05, 0.4)));
  } else if (id === "map") {
    headline(ctx, [spec.need?.area ?? "Trinidad & Tobago"], SAFE_TOP + 40, 88, ink, font, easeOutCubic(ease(lt, 0, 0.25)));
    ctx.save();
    ctx.fillStyle = P.bg; ctx.strokeStyle = P.primary; ctx.lineWidth = 5; ctx.globalAlpha = 0.96;
    ctx.shadowColor = P.primary; ctx.shadowBlur = 28;
    for (const island of [TRINIDAD_OUTLINE, TOBAGO_OUTLINE]) {
      islandPath(ctx, island); ctx.fill(); ctx.globalAlpha = 0.28; ctx.stroke(); ctx.globalAlpha = 0.96;
    }
    ctx.restore();
    const point = reelLocationPoint(spec.need?.area, spec.need?.region);
    if (point) {
      const [px, py] = point;
      const drop = easeOutBack(ease(lt, 0.15, 0.45)); const y = py - (1 - drop) * 400;
      const ring = ease(lt, 0.45, 1); ctx.strokeStyle = P.primary; ctx.lineWidth = 8; ctx.globalAlpha = 1 - ring;
      ctx.beginPath(); ctx.arc(px, py, 40 + ring * 180, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
      ctx.fillStyle = P.primary; ctx.beginPath(); ctx.arc(px, y - 70, 50, Math.PI, 0); ctx.lineTo(px, y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = P.onPrimary; ctx.beginPath(); ctx.arc(px, y - 70, 20, 0, Math.PI * 2); ctx.fill();
      headline(ctx, ["General area only, never a street address"], 1510, 38, ink, font, ease(lt, 0.4, 0.7));
    } else {
      const p = easeOutCubic(ease(lt, 0.15, 0.4));
      ctx.globalAlpha = p; roundRect(ctx, 150, 1480, REEL_W - 300, 150, 32); ctx.fillStyle = P.bg; ctx.fill();
      headline(ctx, ["Choose a family request", "to place the pin"], 1510, 42, P.ink, font, p); ctx.globalAlpha = 1;
    }
  } else if (id === "needs") {
    const items = [...(spec.need?.careTypes ?? []), ...(spec.need?.skills ?? [])].slice(0, 8);
    const layout = layoutCareCard(items, (label, size) => { ctx.font = `600 ${size}px ${font}`; return ctx.measureText(label).width; });
    const { cardY, cardH } = layout;
    ctx.globalAlpha = easeOutCubic(ease(lt, 0, 0.12));
    roundRect(ctx, 80, cardY, REEL_W - 160, cardH, 48); ctx.fillStyle = P.bg; ctx.fill(); ctx.globalAlpha = 1;
    ctx.font = `700 72px ${font}`; ctx.fillStyle = P.ink; ctx.textAlign = "left"; ctx.textBaseline = "top"; ctx.fillText(T.needsTitle, 140, cardY + 60);
    if (!items.length) {
      headline(ctx, ["Choose a family request above.", "Their care needs will appear here."], cardY + 210, 44, P.ink, font, ease(lt, 0.1, 0.35));
    }
    for (const row of layout.rows) for (const item of row) {
      const i = item.index;
      const appear = ease(lt, 0.15 + i * 0.075, 0.15 + i * 0.075 + 0.06); if (appear <= 0) continue;
      const isCareType = i < (spec.need?.careTypes.length ?? 0);
      ctx.globalAlpha = appear;
      chip(ctx, item, layout, isCareType ? P.primary : P.muted, isCareType ? P.onPrimary : P.ink, font);
      ctx.globalAlpha = 1;
    }
  } else if (id === "requirements") {
    const items = [...(spec.need?.qualifications ?? []), ...(spec.need?.requirements ?? [])].slice(0, 10);
    const layout = layoutCareCard(items, (label, size) => { ctx.font = `600 ${size}px ${font}`; return ctx.measureText(label).width; });
    const { cardY, cardH } = layout;
    ctx.globalAlpha = easeOutCubic(ease(lt, 0, 0.12));
    roundRect(ctx, 80, cardY, REEL_W - 160, cardH, 48); ctx.fillStyle = P.bg; ctx.fill(); ctx.globalAlpha = 1;
    ctx.font = `700 72px ${font}`; ctx.fillStyle = P.ink; ctx.textAlign = "left"; ctx.textBaseline = "top";
    ctx.fillText(T.requirementsTitle, 140, cardY + 60, REEL_W - 280);
    if (!items.length) {
      headline(ctx, spec.need ? ["No extra requirements listed."] : ["Choose a family request above.", "Their caregiver requirements will appear here."], cardY + 210, 44, P.ink, font, ease(lt, 0.1, 0.35));
    }
    for (const row of layout.rows) for (const item of row) {
      const appear = ease(lt, 0.12 + item.index * 0.06, 0.18 + item.index * 0.06); if (appear <= 0) continue;
      ctx.globalAlpha = appear;
      chip(ctx, item, layout, item.index < (spec.need?.qualifications.length ?? 0) ? P.muted : P.primary, item.index < (spec.need?.qualifications.length ?? 0) ? P.ink : P.onPrimary, font);
      ctx.globalAlpha = 1;
    }
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
    // Ending: question, then three invitations, each with its own link button.
    const pulse = 1 + 0.03 * Math.sin(lt * Math.PI * 6);
    let y = SAFE_TOP + 20;
    if (spec.need?.urgency === "urgent") {
      ctx.font = `700 40px ${font}`; const bw = ctx.measureText("Needed soon").width + 56;
      roundRect(ctx, (REEL_W - bw) / 2, y, bw, 72, 36); ctx.fillStyle = P.accent; ctx.fill();
      ctx.fillStyle = P.ink; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("Needed soon", REEL_W / 2, y + 38);
      y += 100;
    }
    y = headline(ctx, [T.cta1], y, 88, ink, font, easeOutCubic(ease(lt, 0, 0.15)));
    y = headline(ctx, [T.ctaSub], y + 6, 46, ink, font, easeOutCubic(ease(lt, 0.05, 0.2)));
    // Three clear cards so viewers can see at a glance where they fit: audience card, other audience, WhatsApp.
    const tagFor = (link: string) => /\/(?:join-as-caregiver|caregiver)(?:$|[?#])/.test(link) ? "FOR CAREGIVERS" : "FOR FAMILIES";
    const cards: [string, string, string][] = [
      [tagFor(T.ctaBody), T.cta2, T.ctaBody],
      [tagFor(T.cta4Body), T.cta4, T.cta4Body],
      ["WHATSAPP CHANNEL", T.whatsappTitle, T.whatsappBody],
    ];
    const cardH = 270, gap = 28, cx = 90, cw = REEL_W - 180;
    let cy = Math.max(y + 30, 560);
    cards.forEach(([tagText, label, link], i) => {
      const p = easeOutCubic(ease(lt, 0.15 + i * 0.18, 0.3 + i * 0.18));
      if (p > 0 && (label.trim() || link.trim())) {
        ctx.save(); ctx.globalAlpha = p; ctx.translate((1 - p) * 80, 0);
        roundRect(ctx, cx, cy, cw, cardH, 36); ctx.fillStyle = P.bg; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = P.muted; ctx.stroke();
        roundRect(ctx, cx, cy, 18, cardH, 9); ctx.fillStyle = P.primary; ctx.fill();
        ctx.textAlign = "left"; ctx.textBaseline = "top";
        ctx.font = `800 32px ${font}`; ctx.fillStyle = P.primary; ctx.fillText(tagText, cx + 56, cy + 30);
        ctx.font = `700 42px ${font}`; ctx.fillStyle = P.ink;
        wrapText(ctx, label, cw - 100).slice(0, 2).forEach((l, k) => ctx.fillText(l, cx + 56, cy + 78 + k * 48));
        let size = 34; ctx.font = `700 ${size}px ${font}`;
        while (ctx.measureText(link).width > cw - 160 && size > 22) { size -= 2; ctx.font = `700 ${size}px ${font}`; }
        const lw = ctx.measureText(link).width + 56, lh = size + 30, ly = cy + cardH - lh - 24;
        const sc = i === 0 ? 1 + 0.02 * Math.sin(lt * Math.PI * 6) : 1;
        ctx.translate(cx + 56 + lw / 2, ly + lh / 2); ctx.scale(sc, sc);
        roundRect(ctx, -lw / 2, -lh / 2, lw, lh, lh / 2); ctx.fillStyle = P.primary; ctx.fill();
        ctx.fillStyle = P.onPrimary; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(link, 0, 2);
        ctx.restore();
      }
      cy += cardH + gap;
    });
    ctx.font = `700 56px ${font}`; ctx.fillStyle = ink; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.fillText("Tavara", REEL_W / 2, REEL_H - SAFE_BOTTOM + 40);
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
