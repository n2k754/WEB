/**
 * Tiny SVG scene builder used to generate the 50 original social media templates.
 * The same output feeds the website preview and the downloadable files.
 */
export type Anchor = "start" | "middle" | "end";

export interface TextEl {
  role: string;
  lines: string[];
  x: number;
  y: number;
  size: number;
  weight: number;
  fill: string;
  anchor: Anchor;
  font: "sans" | "serif";
  italic: boolean;
  spacing: number;
  lh: number;
  opacity: number;
}

export interface TextOpts {
  x: number;
  y: number;
  size: number;
  weight?: number;
  fill: string;
  anchor?: Anchor;
  font?: "sans" | "serif";
  italic?: boolean;
  upper?: boolean;
  /** letter spacing in px */
  spacing?: number;
  /** line height multiplier */
  lh?: number;
  maxWidth?: number;
  maxLines?: number;
  opacity?: number;
}

export const FONT_STACK = {
  sans: "Inter, 'Helvetica Neue', Arial, sans-serif",
  serif: "'Playfair Display', Georgia, 'DejaVu Serif', serif",
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function charWidth(o: { weight: number; upper: boolean; font: "sans" | "serif"; italic: boolean; spacing: number; size: number }) {
  let f = o.font === "serif" ? 0.5 : 0.55;
  if (o.weight >= 700) f += 0.04;
  if (o.upper) f += 0.13;
  return f * o.size + o.spacing;
}

function wrap(text: string, maxChars: number): string[] {
  const out: string[] = [];
  for (const para of text.split("\n")) {
    let line = "";
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (next.length > maxChars && line) {
        out.push(line);
        line = word;
      } else line = next;
    }
    if (line) out.push(line);
  }
  return out;
}

export class Scene {
  defs: string[] = [];
  shapes: string[] = [];
  /** shapes drawn above text (rare) */
  texts: TextEl[] = [];
  private order: Array<{ t: "s"; v: string } | { t: "t"; v: TextEl }> = [];

  constructor(
    public id: string,
    public w: number,
    public h: number,
  ) {}

  private pushShape(s: string) {
    this.shapes.push(s);
    this.order.push({ t: "s", v: s });
  }

  gradient(name: string, c1: string, c2: string, angle = 135) {
    const rad = (angle * Math.PI) / 180;
    const x2 = 0.5 + Math.cos(rad) / 2;
    const y2 = 0.5 + Math.sin(rad) / 2;
    const gid = `${this.id}-${name}`;
    this.defs.push(
      `<linearGradient id="${gid}" x1="${(1 - x2).toFixed(3)}" y1="${(1 - y2).toFixed(3)}" x2="${x2.toFixed(3)}" y2="${y2.toFixed(3)}"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>`,
    );
    return `url(#${gid})`;
  }

  rect(x: number, y: number, w: number, h: number, o: { fill?: string; rx?: number; stroke?: string; sw?: number; opacity?: number } = {}) {
    this.pushShape(
      `<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}"${o.rx ? ` rx="${r(o.rx)}"` : ""} fill="${o.fill ?? "none"}"${o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw ?? 2}"` : ""}${o.opacity != null ? ` opacity="${o.opacity}"` : ""}/>`,
    );
  }

  circle(cx: number, cy: number, rad: number, o: { fill?: string; stroke?: string; sw?: number; opacity?: number } = {}) {
    this.pushShape(
      `<circle cx="${r(cx)}" cy="${r(cy)}" r="${r(rad)}" fill="${o.fill ?? "none"}"${o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw ?? 2}"` : ""}${o.opacity != null ? ` opacity="${o.opacity}"` : ""}/>`,
    );
  }

  line(x1: number, y1: number, x2: number, y2: number, o: { stroke: string; sw?: number; opacity?: number; dash?: string }) {
    this.pushShape(
      `<line x1="${r(x1)}" y1="${r(y1)}" x2="${r(x2)}" y2="${r(y2)}" stroke="${o.stroke}" stroke-width="${o.sw ?? 2}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ""}${o.opacity != null ? ` opacity="${o.opacity}"` : ""} stroke-linecap="round"/>`,
    );
  }

  /** Adds wrapped text. Returns the baseline y of the line AFTER the block. */
  text(role: string, str: string, o: TextOpts): number {
    const weight = o.weight ?? 400;
    const font = o.font ?? "sans";
    const upper = !!o.upper;
    const spacing = o.spacing ?? 0;
    const lh = o.lh ?? 1.15;
    const src = upper ? str.toUpperCase() : str;
    let size = o.size;
    let lines = [src];
    if (o.maxWidth) {
      for (let i = 0; i < 24; i++) {
        const cw = charWidth({ weight, upper, font, italic: !!o.italic, spacing, size });
        lines = wrap(src, Math.max(4, Math.floor(o.maxWidth / cw)));
        const longest = Math.max(...lines.map((l) => l.length));
        const tooWide = longest * cw > o.maxWidth * 1.02;
        const tooMany = o.maxLines ? lines.length > o.maxLines : false;
        if (!tooWide && !tooMany) break;
        size = Math.round(size * 0.94);
      }
    }
    const el: TextEl = {
      role,
      lines,
      x: o.x,
      y: o.y,
      size,
      weight,
      fill: o.fill,
      anchor: o.anchor ?? "start",
      font,
      italic: !!o.italic,
      spacing,
      lh,
      opacity: o.opacity ?? 1,
    };
    this.texts.push(el);
    this.order.push({ t: "t", v: el });
    return o.y + lines.length * size * lh;
  }

  /** Bottom edge (approx.) of the last text block added. */
  bottom(): number {
    const t = this.texts[this.texts.length - 1];
    if (!t) return 0;
    return t.y + (t.lines.length - 1) * t.size * t.lh + t.size * 0.25;
  }

  /** Baseline of the last line of the last text block. */
  lastBaseline(): number {
    const t = this.texts[this.texts.length - 1];
    return t ? t.y + (t.lines.length - 1) * t.size * t.lh : 0;
  }

  private textSvg(t: TextEl) {
    const fam = FONT_STACK[t.font];
    const spans = t.lines
      .map((l, i) => `<tspan x="${r(t.x)}" ${i === 0 ? `y="${r(t.y)}"` : `dy="${r(t.size * t.lh)}"`}>${esc(l)}</tspan>`)
      .join("");
    return `<text font-family="${fam.replace(/"/g, "'")}" font-size="${t.size}" font-weight="${t.weight}"${t.italic ? ` font-style="italic"` : ""} fill="${t.fill}" text-anchor="${t.anchor}"${t.spacing ? ` letter-spacing="${t.spacing}"` : ""}${t.opacity !== 1 ? ` opacity="${t.opacity}"` : ""}>${spans}</text>`;
  }

  svg(withText = true, extraAttrs = ""): string {
    const body = this.order
      .map((e) => (e.t === "s" ? e.v : withText ? this.textSvg(e.v) : ""))
      .join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.w} ${this.h}" width="${this.w}" height="${this.h}"${extraAttrs}>${this.defs.length ? `<defs>${this.defs.join("")}</defs>` : ""}${body}</svg>`;
  }
}

function r(n: number) {
  return Math.round(n * 10) / 10;
}
