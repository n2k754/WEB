import { Scene, type TextEl } from "./template-engine";

export type TemplateCategoryId = "ig-posts" | "ig-stories" | "promo" | "launch" | "quotes" | "announcements";

export interface TemplateCategory {
  id: TemplateCategoryId;
  label: string;
  size: string;
  w: number;
  h: number;
  count: number;
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  { id: "ig-posts", label: "Instagram posts", size: "1080 × 1350 px (4:5)", w: 1080, h: 1350, count: 10 },
  { id: "ig-stories", label: "Instagram stories", size: "1080 × 1920 px (9:16)", w: 1080, h: 1920, count: 10 },
  { id: "promo", label: "Promotional posts", size: "1080 × 1080 px (1:1)", w: 1080, h: 1080, count: 8 },
  { id: "launch", label: "Product launches", size: "1080 × 1350 px (4:5)", w: 1080, h: 1350, count: 8 },
  { id: "quotes", label: "Quotes", size: "1080 × 1080 px (1:1)", w: 1080, h: 1080, count: 8 },
  { id: "announcements", label: "Business announcements", size: "1080 × 1080 px (1:1)", w: 1080, h: 1080, count: 6 },
];

/* ───────────────────────────── palettes ───────────────────────────── */

interface Palette {
  name: string;
  bg: string | [string, string];
  bgSolid: string;
  fg: string;
  muted: string;
  accent: string;
  accent2: string;
  onAccent: string;
  surface: string;
}

const PALETTES: Record<string, Palette> = {
  midnight: { name: "Midnight", bg: "#09090F", bgSolid: "#09090F", fg: "#FFFFFF", muted: "#A1A1B5", accent: "#8B5CF6", accent2: "#6366F1", onAccent: "#FFFFFF", surface: "#171724" },
  violet: { name: "Violet Gradient", bg: ["#6D28D9", "#4338CA"], bgSolid: "#4F2FC9", fg: "#FFFFFF", muted: "#DDD6FE", accent: "#FDE68A", accent2: "#FBBF24", onAccent: "#2A1065", surface: "#5B3CE0" },
  cream: { name: "Warm Cream", bg: "#F6F1E9", bgSolid: "#F6F1E9", fg: "#17151F", muted: "#6B6577", accent: "#8B5CF6", accent2: "#6366F1", onAccent: "#FFFFFF", surface: "#FFFFFF" },
  lilac: { name: "Soft Lilac", bg: "#EDE9FE", bgSolid: "#EDE9FE", fg: "#1E1B4B", muted: "#5B5780", accent: "#6366F1", accent2: "#8B5CF6", onAccent: "#FFFFFF", surface: "#FFFFFF" },
  sunset: { name: "Sunset", bg: ["#FF7A59", "#FFB347"], bgSolid: "#FF9650", fg: "#1A1020", muted: "#4A2A2A", accent: "#1A1020", accent2: "#3B1D4A", onAccent: "#FFFFFF", surface: "#FFE3CC" },
  forest: { name: "Forest", bg: "#10231C", bgSolid: "#10231C", fg: "#F2FBF6", muted: "#9DBBAA", accent: "#7EE0A8", accent2: "#3FBF86", onAccent: "#0B1A14", surface: "#18332A" },
  ocean: { name: "Deep Ocean", bg: "#0B1B3A", bgSolid: "#0B1B3A", fg: "#FFFFFF", muted: "#9DB4D9", accent: "#5CC8FF", accent2: "#3B82F6", onAccent: "#06142B", surface: "#12284D" },
  blush: { name: "Blush", bg: "#FCE7EC", bgSolid: "#FCE7EC", fg: "#3B0A1E", muted: "#7A4659", accent: "#E11D74", accent2: "#F472B6", onAccent: "#FFFFFF", surface: "#FFFFFF" },
  mono: { name: "Monochrome", bg: "#F4F4F5", bgSolid: "#F4F4F5", fg: "#111113", muted: "#6B6B73", accent: "#111113", accent2: "#3F3F46", onAccent: "#FFFFFF", surface: "#FFFFFF" },
};

/* ───────────────────────────── layouts ───────────────────────────── */

interface Copy {
  label?: string;
  headline: string;
  body?: string;
  items?: string[];
  author?: string;
  role?: string;
  big?: string;
  cta?: string;
  date?: string;
  handle?: string;
  stats?: [string, string][];
}

type LayoutFn = (s: Scene, p: Palette, c: Copy) => void;

function paintBg(s: Scene, p: Palette) {
  if (Array.isArray(p.bg)) s.rect(0, 0, s.w, s.h, { fill: s.gradient("bg", p.bg[0], p.bg[1], 135) });
  else s.rect(0, 0, s.w, s.h, { fill: p.bg });
}

const pillW = (label: string, size: number, spacing: number) => Math.round(label.length * (size * 0.68 + spacing) + 56);

function pill(s: Scene, p: Palette, label: string, x: number, y: number, mode: "tint" | "solid" = "tint") {
  const size = 22;
  const w = pillW(label, size, 3);
  if (mode === "solid") s.rect(x, y, w, 52, { fill: p.accent, rx: 26 });
  else s.rect(x, y, w, 52, { fill: p.accent, rx: 26, opacity: 0.18 });
  s.text("Label", label, { x: x + w / 2, y: y + 34, size, weight: 700, fill: mode === "solid" ? p.onAccent : p.accent === p.fg ? p.fg : p.accent, anchor: "middle", upper: true, spacing: 3 });
}

function footer(s: Scene, p: Palette, c: Copy, k: number) {
  const y = s.h - 84 * k;
  s.text("Handle", c.handle ?? "@yourhandle", { x: 80, y, size: 30, weight: 600, fill: p.muted });
  if (c.cta) s.text("Footer call to action", c.cta, { x: s.w - 80, y, size: 30, weight: 700, fill: p.accent, anchor: "end" });
}

const statement: LayoutFn = (s, p, c) => {
  const k = s.w / 1080;
  const tall = s.h > s.w * 1.5;
  paintBg(s, p);
  s.circle(s.w * 0.94, s.h * 0.07, s.w * 0.42, { fill: p.accent, opacity: 0.16 });
  s.circle(s.w * 0.02, s.h * 0.98, s.w * 0.24, { fill: p.accent2, opacity: 0.14 });
  if (c.label) pill(s, p, c.label, 80, tall ? 170 : 96);
  const hs = (tall ? 128 : 104) * k;
  s.text("Headline", c.headline, { x: 80, y: s.h * (tall ? 0.3 : 0.27) + hs * 0.8, size: hs, weight: 800, fill: p.fg, maxWidth: s.w - 160, maxLines: 4, lh: 1.06 });
  const barY = s.bottom() + 36;
  s.rect(80, barY, 120, 10, { fill: p.accent, rx: 5 });
  if (c.body) s.text("Body", c.body, { x: 80, y: barY + 90, size: 40 * k, weight: 400, fill: p.muted, maxWidth: s.w - 220, maxLines: 4, lh: 1.4 });
  footer(s, p, c, k);
};

const split: LayoutFn = (s, p, c) => {
  const k = s.w / 1080;
  paintBg(s, p);
  const ph = s.h * 0.47;
  s.rect(0, 0, s.w, ph, { fill: s.gradient("panel", p.accent, p.accent2, 135) });
  s.circle(s.w * 0.88, ph * 0.2, 230 * k, { fill: "#FFFFFF", opacity: 0.1 });
  s.circle(s.w * 0.7, ph * 0.9, 130 * k, { fill: "#FFFFFF", opacity: 0.08 });
  if (c.label) s.text("Label", c.label, { x: 80, y: 120, size: 24, weight: 700, fill: p.onAccent, upper: true, spacing: 4, opacity: 0.85 });
  s.text("Headline", c.headline, { x: 80, y: 230 * k + 40, size: 94 * k, weight: 800, fill: p.onAccent, maxWidth: s.w - 200, maxLines: 4, lh: 1.06 });
  s.circle(s.w - 170, ph, 86, { fill: p.bgSolid, stroke: p.accent2, sw: 6 });
  s.text("Number", c.big ?? "01", { x: s.w - 170, y: ph + 22, size: 62, weight: 800, fill: p.fg, anchor: "middle" });
  if (c.body) s.text("Body", c.body, { x: 80, y: ph + 150, size: 42 * k, weight: 400, fill: p.fg, maxWidth: s.w - 220, maxLines: 5, lh: 1.42 });
  if (c.cta) {
    const w = Math.round(c.cta.length * 22 + 96);
    s.rect(80, s.h - 200, w, 84, { fill: p.accent, rx: 42 });
    s.text("Button", c.cta, { x: 80 + w / 2, y: s.h - 200 + 54, size: 32, weight: 700, fill: p.onAccent, anchor: "middle" });
  }
  s.text("Handle", c.handle ?? "@yourhandle", { x: s.w - 80, y: s.h - 142, size: 28, weight: 600, fill: p.muted, anchor: "end" });
};

const quote: LayoutFn = (s, p, c) => {
  const k = s.w / 1080;
  paintBg(s, p);
  s.circle(s.w * 0.95, s.h * 0.95, s.w * 0.3, { fill: p.accent, opacity: 0.12 });
  s.text("Quote mark", "“", { x: 70, y: 400 * k, size: 420 * k, weight: 700, fill: p.accent, font: "serif", opacity: 0.95 });
  s.text("Quote", c.headline, { x: 80, y: s.h * 0.4, size: 70 * k, weight: 500, fill: p.fg, font: "serif", italic: true, maxWidth: s.w - 170, maxLines: 6, lh: 1.28 });
  const by = s.bottom() + 40;
  s.rect(80, by, 90, 6, { fill: p.accent, rx: 3 });
  s.text("Author", c.author ?? "Your name", { x: 80, y: by + 70, size: 32, weight: 700, fill: p.fg, upper: true, spacing: 3 });
  if (c.role) s.text("Author role", c.role, { x: 80, y: by + 114, size: 28, weight: 400, fill: p.muted });
  s.text("Handle", c.handle ?? "@yourhandle", { x: s.w - 80, y: s.h - 76 * k, size: 28, weight: 600, fill: p.muted, anchor: "end" });
};

const list: LayoutFn = (s, p, c) => {
  const k = s.w / 1080;
  const tall = s.h > s.w * 1.5;
  paintBg(s, p);
  s.circle(s.w * 0.96, 40, s.w * 0.28, { fill: p.accent, opacity: 0.14 });
  if (c.label) pill(s, p, c.label, 80, tall ? 170 : 90);
  s.text("Headline", c.headline, { x: 80, y: (tall ? 330 : 250) * (s.h > 1200 && !tall ? 1.1 : 1), size: 88 * k, weight: 800, fill: p.fg, maxWidth: s.w - 160, maxLines: 3, lh: 1.06 });
  const items = c.items ?? [];
  const top = s.bottom() + 40;
  const avail = s.h - top - 170;
  const rowH = Math.min(168, avail / Math.max(items.length, 1));
  items.forEach((it, i) => {
    const y = top + i * rowH;
    s.rect(80, y, s.w - 160, rowH - 24, { fill: p.surface, rx: 30, stroke: p.accent, sw: 1.5 });
    s.circle(150, y + (rowH - 24) / 2, 34, { fill: p.accent });
    s.text("Number", String(i + 1), { x: 150, y: y + (rowH - 24) / 2 + 14, size: 38, weight: 800, fill: p.onAccent, anchor: "middle" });
    s.text("List item", it, { x: 212, y: y + (rowH - 24) / 2 + 13, size: 38, weight: 600, fill: p.fg, maxWidth: s.w - 340, maxLines: 2, lh: 1.15 });
  });
  footer(s, p, c, k);
};

const offer: LayoutFn = (s, p, c) => {
  const k = s.w / 1080;
  paintBg(s, p);
  const cx = s.w / 2;
  const cy = s.h * 0.37;
  const rad = s.w * 0.2;
  if (c.label) s.text("Label", c.label, { x: cx, y: s.h * 0.11, size: 30, weight: 700, fill: p.accent, anchor: "middle", upper: true, spacing: 8 });
  s.circle(cx, cy, rad + 70, { stroke: p.accent, sw: 2, opacity: 0.2 });
  s.circle(cx, cy, rad + 34, { stroke: p.accent, sw: 3, opacity: 0.4 });
  s.circle(cx, cy, rad, { fill: s.gradient("badge", p.accent, p.accent2, 135) });
  s.text("Offer", c.big ?? "30%", { x: cx, y: cy + 30 * k, size: 160 * k, weight: 900, fill: p.onAccent, anchor: "middle" });
  s.text("Offer label", "OFF", { x: cx, y: cy + 98 * k, size: 52 * k, weight: 800, fill: p.onAccent, anchor: "middle", spacing: 14 });
  s.text("Headline", c.headline, { x: cx, y: cy + rad + 120 * k, size: 62 * k, weight: 800, fill: p.fg, anchor: "middle", maxWidth: s.w - 200, maxLines: 2, lh: 1.1 });
  if (c.body) s.text("Body", c.body, { x: cx, y: s.bottom() + 50, size: 32 * k, weight: 400, fill: p.muted, anchor: "middle", maxWidth: s.w - 260, maxLines: 2, lh: 1.4 });
  const cta = c.cta ?? "Shop now";
  const w = Math.round(cta.length * 22 + 110);
  s.rect(cx - w / 2, s.h - 190 * k, w, 88, { fill: p.fg, rx: 44 });
  s.text("Button", cta, { x: cx, y: s.h - 190 * k + 57, size: 32, weight: 800, fill: p.bgSolid, anchor: "middle" });
};

const launch: LayoutFn = (s, p, c) => {
  const k = s.w / 1080;
  paintBg(s, p);
  s.circle(s.w * 0.9, s.h * 0.06, s.w * 0.36, { fill: p.accent, opacity: 0.14 });
  pill(s, p, c.label ?? "New", 80, 96, "solid");
  s.text("Headline", c.headline, { x: 80, y: 290, size: 108 * k, weight: 800, fill: p.fg, maxWidth: s.w - 160, maxLines: 3, lh: 1.04 });
  if (c.body) s.text("Subtitle", c.body, { x: 80, y: s.bottom() + 28 + 36, size: 38 * k, weight: 400, fill: p.muted, maxWidth: s.w - 220, maxLines: 3, lh: 1.4 });
  const my = Math.max(s.bottom() + 50, s.h * 0.5);
  const mh = s.h - my - 190;
  s.rect(80, my, s.w - 160, mh, { fill: s.gradient("mock", p.accent, p.accent2, 135), rx: 40 });
  s.rect(120, my + 40, s.w - 240, mh - 80, { fill: "#FFFFFF", opacity: 0.14, rx: 28 });
  [0, 1, 2].forEach((i) => s.circle(160 + i * 28, my + 76, 8, { fill: "#FFFFFF", opacity: 0.7 }));
  s.rect(150, my + 120, (s.w - 300) * 0.55, 26, { fill: "#FFFFFF", opacity: 0.55, rx: 13 });
  s.rect(150, my + 170, (s.w - 300) * 0.8, 18, { fill: "#FFFFFF", opacity: 0.3, rx: 9 });
  s.rect(150, my + 208, (s.w - 300) * 0.65, 18, { fill: "#FFFFFF", opacity: 0.3, rx: 9 });
  s.text("Mockup hint", "Drop your product mockup here", { x: s.w / 2, y: my + mh - 78, size: 24, weight: 600, fill: p.onAccent, anchor: "middle", opacity: 0.8 });
  const dy = s.h - 120;
  const date = c.date ?? "Available now";
  const dw = Math.round(date.length * 17 + 70);
  s.rect(80, dy - 50, dw, 70, { fill: p.fg, rx: 35 });
  s.text("Date", date, { x: 80 + dw / 2, y: dy - 5, size: 28, weight: 700, fill: p.bgSolid, anchor: "middle" });
  s.text("Handle", c.handle ?? "@yourhandle", { x: s.w - 80, y: dy - 5, size: 28, weight: 600, fill: p.muted, anchor: "end" });
};

const countdown: LayoutFn = (s, p, c) => {
  const k = s.w / 1080;
  paintBg(s, p);
  s.circle(s.w * 0.1, s.h * 0.08, s.w * 0.3, { fill: p.accent, opacity: 0.14 });
  if (c.label) s.text("Label", c.label, { x: s.w / 2, y: 150, size: 26, weight: 700, fill: p.accent, anchor: "middle", upper: true, spacing: 7 });
  s.text("Headline", c.headline, { x: s.w / 2, y: 290, size: 96 * k, weight: 800, fill: p.fg, anchor: "middle", maxWidth: s.w - 160, maxLines: 3, lh: 1.06 });
  const stats = c.stats ?? [["03", "Days"], ["14", "Hours"], ["22", "Min"]];
  const gap = 28;
  const bw = (s.w - 160 - gap * (stats.length - 1)) / stats.length;
  const by = Math.max(s.bottom() + 60, s.h * 0.46);
  stats.forEach(([n, u], i) => {
    const x = 80 + i * (bw + gap);
    s.rect(x, by, bw, 270, { fill: p.surface, rx: 36, stroke: p.accent, sw: 2 });
    s.text("Countdown number", n, { x: x + bw / 2, y: by + 150, size: 136, weight: 800, fill: p.fg, anchor: "middle" });
    s.text("Countdown unit", u, { x: x + bw / 2, y: by + 218, size: 26, weight: 600, fill: p.muted, anchor: "middle", upper: true, spacing: 4 });
  });
  if (c.body) s.text("Body", c.body, { x: s.w / 2, y: by + 270 + 90, size: 36 * k, weight: 400, fill: p.muted, anchor: "middle", maxWidth: s.w - 220, maxLines: 3, lh: 1.4 });
  const cta = c.cta ?? "Set a reminder";
  const w = Math.round(cta.length * 22 + 110);
  s.rect(s.w / 2 - w / 2, s.h - 190, w, 88, { fill: p.accent, rx: 44 });
  s.text("Button", cta, { x: s.w / 2, y: s.h - 190 + 57, size: 32, weight: 800, fill: p.onAccent, anchor: "middle" });
};

const tip: LayoutFn = (s, p, c) => {
  const k = s.w / 1080;
  const tall = s.h > s.w * 1.5;
  paintBg(s, p);
  s.text("Big number", c.big ?? "01", { x: 50, y: s.h * 0.42, size: 520 * k, weight: 900, fill: p.accent, opacity: 0.2 });
  s.text("Label", c.label ?? "Tip", { x: 80, y: tall ? 200 : 140, size: 30, weight: 700, fill: p.accent, upper: true, spacing: 8 });
  s.text("Headline", c.headline, { x: 80, y: s.h * (tall ? 0.46 : 0.5), size: 92 * k, weight: 800, fill: p.fg, maxWidth: s.w - 160, maxLines: 4, lh: 1.06 });
  if (c.body) s.text("Body", c.body, { x: 80, y: s.bottom() + 30 + 40, size: 40 * k, weight: 400, fill: p.muted, maxWidth: s.w - 220, maxLines: 4, lh: 1.42 });
  const dy = s.h - 120;
  [0, 1, 2, 3, 4].forEach((i) => {
    if (i === 0) s.rect(80, dy, 64, 14, { fill: p.accent, rx: 7 });
    else s.rect(80 + 64 + 18 + (i - 1) * 32, dy, 14, 14, { fill: p.muted, rx: 7, opacity: 0.5 });
  });
  s.text("Handle", c.handle ?? "@yourhandle", { x: s.w - 80, y: dy + 14, size: 28, weight: 600, fill: p.muted, anchor: "end" });
};

const editorial: LayoutFn = (s, p, c) => {
  const k = s.w / 1080;
  paintBg(s, p);
  s.rect(50, 50, s.w - 100, s.h - 100, { stroke: p.fg, sw: 3, opacity: 0.35 });
  s.rect(72, 72, s.w - 144, s.h - 144, { stroke: p.accent, sw: 1.5, opacity: 0.8 });
  s.text("Label", c.label ?? "Journal", { x: s.w / 2, y: 190, size: 24, weight: 600, fill: p.accent, anchor: "middle", upper: true, spacing: 9 });
  s.line(s.w / 2 - 50, 226, s.w / 2 + 50, 226, { stroke: p.accent, sw: 3 });
  s.text("Headline", c.headline, { x: s.w / 2, y: s.h * 0.3 + 40, size: 100 * k, weight: 700, fill: p.fg, font: "serif", anchor: "middle", maxWidth: s.w - 260, maxLines: 4, lh: 1.12 });
  if (c.body) s.text("Subline", c.body, { x: s.w / 2, y: s.bottom() + 36 + 30, size: 42 * k, weight: 400, fill: p.muted, font: "serif", italic: true, anchor: "middle", maxWidth: s.w - 280, maxLines: 3, lh: 1.35 });
  const oy = s.h - 220;
  s.line(s.w / 2 - 90, oy, s.w / 2 - 22, oy, { stroke: p.accent, sw: 2 });
  s.circle(s.w / 2, oy, 7, { fill: p.accent });
  s.line(s.w / 2 + 22, oy, s.w / 2 + 90, oy, { stroke: p.accent, sw: 2 });
  s.text("Handle", c.handle ?? "@yourhandle", { x: s.w / 2, y: oy + 64, size: 28, weight: 600, fill: p.muted, anchor: "middle", spacing: 2 });
};

const story: LayoutFn = (s, p, c) => {
  const k = s.w / 1080;
  paintBg(s, p);
  s.circle(s.w * 0.9, s.h * 0.1, s.w * 0.5, { fill: p.accent, opacity: 0.16 });
  s.circle(s.w * 0.05, s.h * 0.62, s.w * 0.26, { fill: p.accent2, opacity: 0.14 });
  if (c.label) pill(s, p, c.label, 80, 170, "solid");
  s.text("Headline", c.headline, { x: 80, y: s.h * 0.28, size: 156 * k, weight: 900, fill: p.fg, maxWidth: s.w - 160, maxLines: 5, lh: 1.0 });
  const by = Math.max(s.bottom() + 70, s.h * 0.6);
  s.rect(80, by, s.w - 160, 270, { fill: p.surface, rx: 44, stroke: p.accent, sw: 2 });
  s.text("Sticker prompt", c.body ?? "Ask me anything", { x: 130, y: by + 100, size: 46, weight: 700, fill: p.fg, maxWidth: s.w - 260, maxLines: 2, lh: 1.15 });
  s.rect(130, by + 160, s.w - 260, 64, { fill: p.accent, rx: 32, opacity: 0.2 });
  s.text("Sticker hint", c.cta ?? "Type your answer…", { x: 160, y: by + 202, size: 28, weight: 500, fill: p.muted });
  const sw = 380;
  s.rect(s.w / 2 - sw / 2, s.h - 250, sw, 84, { stroke: p.fg, sw: 3, rx: 42, opacity: 0.8 });
  s.text("Swipe", "Swipe up  ↑", { x: s.w / 2, y: s.h - 250 + 54, size: 30, weight: 700, fill: p.fg, anchor: "middle" });
  s.text("Handle", c.handle ?? "@yourhandle", { x: s.w / 2, y: s.h - 100, size: 28, weight: 600, fill: p.muted, anchor: "middle" });
};

const announce: LayoutFn = (s, p, c) => {
  const k = s.w / 1080;
  paintBg(s, p);
  s.rect(0, 0, 36, s.h, { fill: s.gradient("stripe", p.accent, p.accent2, 90) });
  s.circle(s.w * 0.98, s.h * 0.02, s.w * 0.3, { fill: p.accent, opacity: 0.12 });
  s.text("Label", c.label ?? "Announcement", { x: 100, y: 140, size: 26, weight: 700, fill: p.accent, upper: true, spacing: 7 });
  s.text("Headline", c.headline, { x: 100, y: 270, size: 98 * k, weight: 800, fill: p.fg, maxWidth: s.w - 200, maxLines: 3, lh: 1.05 });
  const dy = s.bottom() + 36;
  s.line(100, dy, s.w - 100, dy, { stroke: p.muted, sw: 2, opacity: 0.4 });
  if (c.body) s.text("Body", c.body, { x: 100, y: dy + 80, size: 38 * k, weight: 400, fill: p.muted, maxWidth: s.w - 220, maxLines: 4, lh: 1.45 });
  const stats = c.stats ?? [];
  const colW = (s.w - 200) / Math.max(stats.length, 1);
  const sy = s.h - 280;
  stats.forEach(([l, v], i) => {
    s.text("Detail label", l, { x: 100 + i * colW, y: sy, size: 22, weight: 600, fill: p.muted, upper: true, spacing: 4 });
    s.text("Detail value", v, { x: 100 + i * colW, y: sy + 52, size: 40, weight: 700, fill: p.fg, maxWidth: colW - 24, maxLines: 2, lh: 1.1 });
  });
  s.text("Call to action", c.cta ? `→ ${c.cta}` : "", { x: 100, y: s.h - 90, size: 32, weight: 700, fill: p.accent });
  s.text("Handle", c.handle ?? "@yourhandle", { x: s.w - 100, y: s.h - 90, size: 28, weight: 600, fill: p.muted, anchor: "end" });
};

const LAYOUTS = { statement, split, quote, list, offer, launch, countdown, tip, editorial, story, announce } as const;
export type LayoutId = keyof typeof LAYOUTS;

/* ───────────────────────────── the 50 templates ───────────────────────────── */

interface Def {
  category: TemplateCategoryId;
  name: string;
  layout: LayoutId;
  palette: keyof typeof PALETTES;
  copy: Copy;
  starter?: boolean;
}

const DEFS: Def[] = [
  /* Instagram posts (10) */
  { category: "ig-posts", name: "Bold Statement — Midnight", layout: "statement", palette: "midnight", starter: true, copy: { label: "Content tip", headline: "Post for one person, not for everyone.", body: "Clear beats clever. Write to the one reader who needs this today.", cta: "Save this" } },
  { category: "ig-posts", name: "Bold Statement — Cream", layout: "statement", palette: "cream", copy: { label: "Mindset", headline: "Consistency is a system, not a mood.", body: "Plan the week once. Then let the plan do the heavy lifting.", cta: "Share" } },
  { category: "ig-posts", name: "Bold Statement — Violet", layout: "statement", palette: "violet", copy: { label: "Reminder", headline: "Start before you feel ready.", body: "Your first version only has to exist. You can improve what exists.", cta: "Swipe →" } },
  { category: "ig-posts", name: "Numbered Checklist — Lilac", layout: "list", palette: "lilac", starter: true, copy: { label: "Checklist", headline: "Before you hit publish", items: ["Is the hook in the first line?", "Is there one clear call to action?", "Did you add a keyword in the caption?", "Would you stop scrolling for this?"], cta: "Save for later" } },
  { category: "ig-posts", name: "Numbered Checklist — Midnight", layout: "list", palette: "midnight", copy: { label: "3 steps", headline: "Plan a week of content", items: ["Pick 3 content pillars", "Write 5 hooks per pillar", "Batch-create in one session"], cta: "Save" } },
  { category: "ig-posts", name: "Big Number Tip — Cream", layout: "tip", palette: "cream", copy: { label: "Tip", big: "01", headline: "Lead with the result.", body: "Open with what the viewer gets, then show how." } },
  { category: "ig-posts", name: "Big Number Tip — Forest", layout: "tip", palette: "forest", copy: { label: "Tip", big: "02", headline: "One post, three formats.", body: "Turn a carousel into a short video and a story." } },
  { category: "ig-posts", name: "Split Panel — Blush", layout: "split", palette: "blush", copy: { label: "Did you know", big: "03", headline: "Hooks win the first 2 seconds.", body: "Test three different openings for the same idea and keep the one people finish.", cta: "Read the caption", handle: "@yourhandle" } },
  { category: "ig-posts", name: "Split Panel — Deep Ocean", layout: "split", palette: "ocean", copy: { label: "Framework", big: "04", headline: "Idea → Draft → Publish → Review.", body: "A simple loop you can repeat every week without burning out.", cta: "Try it this week", handle: "@yourhandle" } },
  { category: "ig-posts", name: "Editorial Frame — Cream", layout: "editorial", palette: "cream", copy: { label: "The creator journal", headline: "Small steps, shared often.", body: "Notes on building something of your own." } },

  /* Instagram stories (10) */
  { category: "ig-stories", name: "Story Question — Midnight", layout: "story", palette: "midnight", starter: true, copy: { label: "Q&A", headline: "Ask me anything about starting out.", body: "What would you like to know?", cta: "Type your question…" } },
  { category: "ig-stories", name: "Story Question — Violet", layout: "story", palette: "violet", copy: { label: "This or that", headline: "Reels or carousels?", body: "Vote and tell me why", cta: "Tap to answer…" } },
  { category: "ig-stories", name: "Story Question — Sunset", layout: "story", palette: "sunset", copy: { label: "Poll", headline: "What should I post next?", body: "Pick one topic", cta: "Your vote…" } },
  { category: "ig-stories", name: "Story Statement — Cream", layout: "statement", palette: "cream", copy: { label: "Today", headline: "Done is better than perfect.", body: "Publish the draft. Learn from real feedback.", cta: "Swipe ↑" } },
  { category: "ig-stories", name: "Story Statement — Deep Ocean", layout: "statement", palette: "ocean", starter: true, copy: { label: "New", headline: "Big news is coming this week.", body: "Stay close — details drop soon.", cta: "Stay tuned" } },
  { category: "ig-stories", name: "Story Quote — Lilac", layout: "quote", palette: "lilac", copy: { headline: "A small audience that trusts you beats a large one that ignores you.", author: "Your name", role: "Founder, Your Brand" } },
  { category: "ig-stories", name: "Story Tip — Forest", layout: "tip", palette: "forest", copy: { label: "Quick tip", big: "05", headline: "Reuse your best idea.", body: "Great content deserves more than one outing." } },
  { category: "ig-stories", name: "Story Countdown — Midnight", layout: "countdown", palette: "midnight", copy: { label: "Coming soon", headline: "Something new drops in", stats: [["03", "Days"], ["14", "Hours"], ["22", "Min"]], body: "Tap the reminder so you don't miss it.", cta: "Set reminder" } },
  { category: "ig-stories", name: "Story Checklist — Blush", layout: "list", palette: "blush", copy: { label: "Today's plan", headline: "My 3 priorities", items: ["Film two short videos", "Reply to every comment", "Plan tomorrow's post"], cta: "Follow along" } },
  { category: "ig-stories", name: "Story Split — Sunset", layout: "split", palette: "sunset", copy: { label: "Behind the scenes", big: "BTS", headline: "How I plan a week of posts", body: "Open the story to see my exact process, step by step.", cta: "Watch now" } },

  /* Promotional posts (8) */
  { category: "promo", name: "Sale Badge — Midnight", layout: "offer", palette: "midnight", starter: true, copy: { label: "Weekend sale", big: "30%", headline: "Launch week offer", body: "Available until Sunday at midnight.", cta: "Shop now" } },
  { category: "promo", name: "Sale Badge — Sunset", layout: "offer", palette: "sunset", copy: { label: "Limited time", big: "25%", headline: "Summer special", body: "Use the code at checkout.", cta: "Get the deal" } },
  { category: "promo", name: "Sale Badge — Violet", layout: "offer", palette: "violet", starter: true, copy: { label: "Member offer", big: "20%", headline: "Thank you for being here", body: "A small gift for our early community.", cta: "Claim offer" } },
  { category: "promo", name: "Sale Badge — Blush", layout: "offer", palette: "blush", copy: { label: "Flash sale", big: "40%", headline: "24 hours only", body: "When it's gone, it's gone.", cta: "Shop the sale" } },
  { category: "promo", name: "Promo Statement — Forest", layout: "statement", palette: "forest", copy: { label: "Bundle", headline: "Three tools. One price.", body: "Everything you need in a single bundle.", cta: "See bundle" } },
  { category: "promo", name: "Promo Statement — Monochrome", layout: "statement", palette: "mono", copy: { label: "Offer", headline: "Free shipping on every order.", body: "This week only. No code needed.", cta: "Order now" } },
  { category: "promo", name: "Promo Split — Lilac", layout: "split", palette: "lilac", copy: { label: "Why choose us", big: "01", headline: "Made for beginners.", body: "Simple, practical and ready to use from day one.", cta: "Learn more", handle: "@yourhandle" } },
  { category: "promo", name: "Promo Reasons — Cream", layout: "list", palette: "cream", copy: { label: "3 reasons", headline: "Why you'll love it", items: ["Easy to use from day one", "Designed to save you time", "Made to look professional"], cta: "Shop now" } },

  /* Product launches (8) */
  { category: "launch", name: "Launch Hero — Midnight", layout: "launch", palette: "midnight", starter: true, copy: { label: "New", headline: "Meet your new product.", body: "A short line that explains the main benefit in plain words.", date: "Available 12 March", handle: "@yourbrand" } },
  { category: "launch", name: "Launch Hero — Violet", layout: "launch", palette: "violet", copy: { label: "Just launched", headline: "It's finally here.", body: "Everything you asked for, in one simple package.", date: "Out now", handle: "@yourbrand" } },
  { category: "launch", name: "Launch Hero — Cream", layout: "launch", palette: "cream", copy: { label: "Introducing", headline: "The new way to get started.", body: "Simple tools that help you move from idea to launch.", date: "Live today", handle: "@yourbrand" } },
  { category: "launch", name: "Launch Hero — Deep Ocean", layout: "launch", palette: "ocean", copy: { label: "New release", headline: "Version 2 is live.", body: "Faster, cleaner and easier to use than ever.", date: "Update available", handle: "@yourbrand" } },
  { category: "launch", name: "Launch Countdown — Violet", layout: "countdown", palette: "violet", copy: { label: "Launch week", headline: "We launch in", stats: [["02", "Days"], ["08", "Hours"], ["45", "Min"]], body: "Join the list to get launch day access.", cta: "Join the list" } },
  { category: "launch", name: "Launch Countdown — Forest", layout: "countdown", palette: "forest", copy: { label: "Almost there", headline: "Doors open in", stats: [["05", "Days"], ["00", "Hours"], ["00", "Min"]], body: "Be the first to know when it goes live.", cta: "Notify me" } },
  { category: "launch", name: "Launch Teaser — Midnight", layout: "statement", palette: "midnight", copy: { label: "Teaser", headline: "Something new is on its way.", body: "We've been building quietly. Here comes the reveal.", cta: "Follow for news" } },
  { category: "launch", name: "Launch Features — Lilac", layout: "split", palette: "lilac", copy: { label: "What's new", big: "NEW", headline: "Built around your workflow.", body: "Three improvements you'll notice straight away.", cta: "See what's new", handle: "@yourbrand" } },

  /* Quotes (8) */
  { category: "quotes", name: "Quote Card — Midnight", layout: "quote", palette: "midnight", starter: true, copy: { headline: "Progress loves a plan, and a plan loves a first step.", author: "Your name", role: "Creator" } },
  { category: "quotes", name: "Quote Card — Cream", layout: "quote", palette: "cream", copy: { headline: "Make it simple enough that you'll actually do it.", author: "Your name", role: "Founder" } },
  { category: "quotes", name: "Quote Card — Lilac", layout: "quote", palette: "lilac", starter: true, copy: { headline: "Your audience doesn't need perfect. They need useful.", author: "Your name", role: "Coach" } },
  { category: "quotes", name: "Quote Card — Forest", layout: "quote", palette: "forest", copy: { headline: "Build slowly. Publish steadily. Improve constantly.", author: "Your name", role: "Entrepreneur" } },
  { category: "quotes", name: "Quote Card — Blush", layout: "quote", palette: "blush", copy: { headline: "Every expert you admire once published their first awkward post.", author: "Your name", role: "Designer" } },
  { category: "quotes", name: "Quote Editorial — Cream", layout: "editorial", palette: "cream", copy: { label: "Words to build on", headline: "Make something people can use today.", body: "— Your name" } },
  { category: "quotes", name: "Quote Editorial — Midnight", layout: "editorial", palette: "midnight", copy: { label: "Daily thought", headline: "Clarity is a kindness to your reader.", body: "— Your name" } },
  { category: "quotes", name: "Quote Statement — Sunset", layout: "statement", palette: "sunset", copy: { label: "Remember", headline: "Small wins, stacked daily.", body: "That's the whole strategy.", cta: "Share" } },

  /* Business announcements (6) */
  { category: "announcements", name: "Announcement — Midnight", layout: "announce", palette: "midnight", starter: true, copy: { label: "Announcement", headline: "We're opening a new chapter.", body: "A short paragraph that explains what is changing and why it matters to your customers.", stats: [["Date", "12 March"], ["Time", "10:00"], ["Where", "Online"]], cta: "Learn more" } },
  { category: "announcements", name: "Announcement — Cream", layout: "announce", palette: "cream", copy: { label: "Update", headline: "New opening hours.", body: "Starting next month, we're adjusting our support hours to serve you better.", stats: [["From", "1 April"], ["Mon–Fri", "9:00–17:00"], ["Reach us", "By email"]], cta: "See details" } },
  { category: "announcements", name: "Announcement — Deep Ocean", layout: "announce", palette: "ocean", copy: { label: "Event", headline: "Join our free live workshop.", body: "A practical session for beginners. Bring your questions and your ideas.", stats: [["Date", "20 May"], ["Time", "18:00"], ["Where", "Live online"]], cta: "Reserve your seat" } },
  { category: "announcements", name: "Announcement Frame — Blush", layout: "editorial", palette: "blush", copy: { label: "Big news", headline: "We have an announcement.", body: "Read the full story in the caption." } },
  { category: "announcements", name: "Announcement Statement — Forest", layout: "statement", palette: "forest", copy: { label: "Milestone", headline: "Thank you for the first chapter.", body: "We're grateful for every share, comment and message.", cta: "Say hi" } },
  { category: "announcements", name: "Announcement Split — Violet", layout: "split", palette: "violet", copy: { label: "New service", big: "NEW", headline: "Now offering a starter package.", body: "Everything a beginner needs, in a single simple offer.", cta: "Book a call", handle: "@yourbrand" } },
];

/* ───────────────────────────── public API ───────────────────────────── */

export interface RenderedTemplate {
  id: string;
  number: number;
  name: string;
  category: TemplateCategoryId;
  categoryLabel: string;
  width: number;
  height: number;
  starter: boolean;
  paletteName: string;
  colors: { background: string; text: string; accent: string; accent2: string };
  layout: LayoutId;
  /** Full design with live text */
  svg: string;
  /** Background/graphics layer only (no text) for Canva upload */
  backgroundSvg: string;
  texts: TextEl[];
}

let cache: RenderedTemplate[] | null = null;

export function getTemplates(): RenderedTemplate[] {
  if (cache) return cache;
  cache = DEFS.map((d, idx) => {
    const cat = TEMPLATE_CATEGORIES.find((c) => c.id === d.category)!;
    const number = idx + 1;
    const id = `csk-${String(number).padStart(2, "0")}`;
    const pal = PALETTES[d.palette];
    const scene = new Scene(id, cat.w, cat.h);
    LAYOUTS[d.layout](scene, pal, d.copy);
    return {
      id,
      number,
      name: d.name,
      category: d.category,
      categoryLabel: cat.label,
      width: cat.w,
      height: cat.h,
      starter: !!d.starter,
      paletteName: pal.name,
      colors: {
        background: Array.isArray(pal.bg) ? pal.bg.join(" → ") : pal.bg,
        text: pal.fg,
        accent: pal.accent,
        accent2: pal.accent2,
      },
      layout: d.layout,
      svg: scene.svg(true),
      backgroundSvg: scene.svg(false),
      texts: scene.texts,
    };
  });
  return cache;
}

export function getTemplate(id: string) {
  return getTemplates().find((t) => t.id === id);
}
