/**
 * Builds every paid deliverable into /private-files from the sources in /content-src
 * and /src/content. Run with:  npm run resources:build
 * Requires Chromium (npx playwright install chromium) to render PDFs and PNG previews.
 */
import { mkdirSync, rmSync, writeFileSync, readFileSync, readdirSync, statSync, copyFileSync } from "node:fs";
import { join, relative } from "node:path";
import { marked } from "marked";
import { launchBrowser } from "./lib/browser";
import { getTemplates, TEMPLATE_CATEGORIES } from "../src/content/templates";
import type { TierId } from "../src/config/pricing";

const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "content-src");
const OUT = join(ROOT, "private-files");

const ALL: TierId[] = ["starter", "pro", "ultimate"];
const PRO_UP: TierId[] = ["pro", "ultimate"];
const ULT: TierId[] = ["ultimate"];

export interface ManifestFile {
  path: string;
  title: string;
  group: string;
  tiers: TierId[];
  /** shown as an individual download on the success page */
  listed: boolean;
  bytes: number;
}
export interface ManifestGroup {
  id: string;
  label: string;
  description: string;
  tiers: TierId[];
}

const GROUPS: ManifestGroup[] = [
  { id: "start", label: "Start here", description: "Read me first and your licence.", tiers: ALL },
  { id: "templates", label: "Social media templates", description: "SVG designs, background layers, PNG previews, catalogue and Canva guide.", tiers: ALL },
  { id: "tiktok", label: "TikTok content ideas", description: "30 original short-form video ideas.", tiers: ALL },
  { id: "guide", label: "Digital business guide", description: "8 chapters to take you from idea to first sale.", tiers: ALL },
  { id: "notion", label: "Notion content dashboard", description: "Five importable databases and a setup guide.", tiers: PRO_UP },
  { id: "prompts", label: "AI prompt collection", description: "20 ready-to-copy prompts.", tiers: PRO_UP },
  { id: "brand", label: "Brand planning workbook", description: "A workbook to define and plan your brand.", tiers: ULT },
  { id: "bonus", label: "Bonus content planning guide", description: "A practical guide to planning and batching content.", tiers: ULT },
];
const FOLDERS: Record<string, string> = {
  start: "00-start-here",
  templates: "01-social-media-templates",
  tiktok: "02-tiktok-content-ideas",
  notion: "03-notion-dashboard",
  guide: "04-digital-business-guide",
  prompts: "05-ai-prompts",
  brand: "06-brand-planning",
  bonus: "07-bonus-content-planning",
};

const files: ManifestFile[] = [];
function track(path: string, title: string, group: string, tiers: TierId[], listed = true) {
  files.push({ path, title, group, tiers, listed, bytes: statSync(join(OUT, path)).size });
}
function put(path: string, data: string | Buffer) {
  const full = join(OUT, path);
  mkdirSync(join(full, ".."), { recursive: true });
  writeFileSync(full, data);
}
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* ───────────────────────── PDF styling ───────────────────────── */

export const CSS = `
@page { size: A4; margin: 20mm 18mm 22mm; }
@page cover { margin: 0; }
* { box-sizing: border-box; }
body { font-family: Inter, 'Helvetica Neue', Arial, sans-serif; color:#1b1b2f; font-size:10.5pt; line-height:1.6; margin:0; }
h1 { font-size:26pt; line-height:1.15; margin:0 0 6mm; letter-spacing:-0.02em; border-bottom:3px solid #8B5CF6; padding-bottom:4mm; break-before: page; }
h1.first { break-before: auto; }
h2 { font-size:15pt; margin:8mm 0 3mm; color:#4C1D95; letter-spacing:-0.01em; break-after: avoid; }
h3 { font-size:12pt; margin:6mm 0 2mm; break-after: avoid; }
p { margin:0 0 3.2mm; } ul,ol { margin:0 0 4mm 5mm; padding-left:4mm; } li { margin-bottom:1.4mm; }
table { border-collapse:collapse; width:100%; margin:3mm 0 5mm; font-size:9.5pt; break-inside: avoid; }
th { background:#F3EEFF; text-align:left; } th,td { border:1px solid #DDD6FE; padding:2.2mm 3mm; vertical-align:top; }
blockquote { margin:4mm 0; padding:3mm 5mm; border-left:4px solid #8B5CF6; background:#F8F5FF; border-radius:0 6px 6px 0; }
blockquote p:last-child { margin:0; }
code { font-family:'DejaVu Sans Mono', monospace; font-size:9pt; background:#F3EEFF; padding:0.5mm 1.5mm; border-radius:3px; }
strong { color:#111; }
.cover { page: cover; height:297mm; width:210mm; padding:28mm 22mm; background:#09090F; color:#fff; position:relative; overflow:hidden; break-after: page; }
.cover .glow { position:absolute; width:150mm; height:150mm; border-radius:50%; right:-50mm; top:-30mm; background:radial-gradient(circle, rgba(139,92,246,.55), rgba(139,92,246,0) 68%); }
.cover .glow2 { position:absolute; width:130mm; height:130mm; border-radius:50%; left:-50mm; bottom:-40mm; background:radial-gradient(circle, rgba(99,102,241,.45), rgba(99,102,241,0) 68%); }
.cover .brand { position:relative; font-weight:800; letter-spacing:.18em; font-size:10pt; color:#C4B5FD; }
.cover .badge { position:relative; display:inline-block; margin-top:70mm; padding:2mm 4mm; border:1px solid rgba(255,255,255,.25); border-radius:99px; font-size:8.5pt; letter-spacing:.14em; color:#DDD6FE; }
.cover h1c { display:block; position:relative; font-size:38pt; line-height:1.08; font-weight:800; letter-spacing:-0.03em; margin:8mm 0 6mm; }
.cover .sub { position:relative; font-size:13pt; color:#B4B4CC; max-width:130mm; line-height:1.5; }
.cover .foot { position:absolute; left:22mm; bottom:20mm; font-size:8.5pt; color:#80809A; }
.toc li { margin-bottom:2mm; font-size:11pt; }
.card { border:1px solid #DDD6FE; border-radius:10px; padding:5mm 6mm; margin:0 0 5mm; break-inside: avoid; background:#FCFBFF; }
.card .meta { font-size:8pt; letter-spacing:.12em; text-transform:uppercase; color:#7C3AED; font-weight:700; margin-bottom:1.5mm; }
.card h3 { margin:0 0 2mm; font-size:13pt; }
.card .k { font-weight:700; color:#4C1D95; }
.copybox { white-space:pre-wrap; font-family:'DejaVu Sans Mono', monospace; font-size:8.8pt; line-height:1.55; background:#fff; border:1px dashed #A78BFA; border-radius:8px; padding:4mm; margin:2mm 0; }
.note { font-size:9pt; color:#5b5b75; }
.tpl { display:flex; gap:6mm; border:1px solid #DDD6FE; border-radius:10px; padding:4mm; margin-bottom:5mm; break-inside: avoid; }
.tpl .pv { width:52mm; flex:none; } .tpl .pv svg { width:100%; height:auto; border-radius:6px; display:block; }
.tpl .info { font-size:8.8pt; line-height:1.5; } .tpl h3 { margin:0 0 1mm; font-size:11.5pt; }
.sw { display:inline-block; width:3.4mm; height:3.4mm; border-radius:50%; border:1px solid #ccc; vertical-align:middle; margin-right:1mm; }
.tpl table { font-size:8pt; margin:2mm 0 0; } .tpl td, .tpl th { padding:1mm 1.6mm; }
`;

export function cover(title: string, subtitle: string, badge: string) {
  return `<section class="cover"><div class="glow"></div><div class="glow2"></div>
  <div class="brand">CREATOR STARTER KIT</div><div class="badge">${esc(badge)}</div>
  <h1c>${esc(title)}</h1c><div class="sub">${esc(subtitle)}</div>
  <div class="foot">Everything you need to build your digital creator business.<br/>© Creator Starter Kit · For licensed use only — see LICENSE.txt</div></section>`;
}
export const page = (body: string, title: string) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(title)}</title><style>${CSS}</style></head><body>${body}</body></html>`;
export const md = (s: string, firstH1 = false) => {
  let h = marked.parse(s, { async: false }) as string;
  if (firstH1) h = h.replace("<h1>", '<h1 class="first">');
  return h;
};

/* ───────────────────────── documents ───────────────────────── */

export function guideHtml() {
  const chapters = readdirSync(join(SRC, "guide")).filter((f) => f.endsWith(".md")).sort();
  const parsed = chapters.map((f, i) => {
    const raw = readFileSync(join(SRC, "guide", f), "utf8");
    const title = raw.match(/^# (.+)$/m)![1];
    return { n: i + 1, title, html: md(raw.replace(/^# .+$/m, `# Chapter ${i + 1} · ${title}`)) };
  });
  const toc = `<h1 class="first">Contents</h1><ol class="toc">${parsed.map((c) => `<li>${esc(c.title)}</li>`).join("")}</ol>
  <h2>Before you begin</h2><p>This guide gives practical, beginner-friendly guidance. It contains general information only. It is <strong>not</strong> legal, tax, financial or accounting advice, and it makes no promise of income, followers or sales. Verify the rules that apply in your country.</p>
  <p class="note">How to use it: read one chapter at a time, complete the exercise at the end, then move on. Most people finish a chapter in 20 to 30 minutes.</p>`;
  return page(cover("The Digital Business Guide", "Eight practical chapters to take you from first idea to your first digital product.", "Digital business guide") + toc + parsed.map((c) => c.html).join(""), "Digital Business Guide");
}

export function tiktokHtml(ideas: any[]) {
  const cards = ideas
    .map(
      (i) => `<div class="card"><div class="meta">Idea ${String(i.id).padStart(2, "0")} · ${esc(i.category)}</div><h3>${esc(i.title)}</h3>
  <p><span class="k">Video concept.</span> ${esc(i.concept)}</p>
  <p><span class="k">Opening hook.</span> “${esc(i.hook)}”</p>
  <p class="k" style="margin-bottom:1mm">Video structure</p><ol>${i.structure.map((s: string) => `<li>${esc(s)}</li>`).join("")}</ol>
  <p><span class="k">Suggested CTA.</span> ${esc(i.cta)}</p>
  <p style="margin:0"><span class="k">Target audience.</span> ${esc(i.audience)}</p></div>`,
    )
    .join("");
  const intro = `<h1 class="first">How to use these ideas</h1><p>Each of the 30 ideas includes a concept, an opening hook, a simple structure, a suggested call to action and the audience it suits. Rewrite every hook in your own voice and add your own examples: the ideas are starting points, not scripts.</p>
  <ul><li>Pick three ideas that match your audience and film them in one batch.</li><li>Keep each video focused on one point.</li><li>Test two different hooks for the same idea and compare watch time.</li><li>Use only music, images and claims you have the right to use. Avoid income promises.</li></ul>
  <p class="note">Ideas are grouped by theme: ${[...new Set(ideas.map((i) => i.category))].join(", ")}.</p>`;
  return page(cover("30 TikTok Content Ideas", "Original short-form video ideas with hooks, structures and calls to action.", "TikTok content ideas") + intro + `<h1>The 30 ideas</h1>` + cards, "30 TikTok Content Ideas");
}

export function promptsHtml(prompts: any[]) {
  const cats = [...new Set(prompts.map((p) => p.category))];
  const body = cats
    .map(
      (c) =>
        `<h1>${esc(c)}</h1>` +
        prompts
          .filter((p) => p.category === c)
          .map(
            (p) => `<div class="card"><div class="meta">Prompt ${String(p.id).padStart(2, "0")} · ${esc(p.category)}</div><h3>${esc(p.title)}</h3>
    <p class="note">${esc(p.useWhen)}</p><div class="copybox">${esc(p.prompt)}</div><p class="note"><strong>Tip:</strong> ${esc(p.tip)}</p></div>`,
          )
          .join(""),
    )
    .join("");
  const intro = `<h1 class="first">How to use the prompts</h1><p>Copy a prompt into the AI assistant you prefer, then replace every <code>[BRACKETED]</code> placeholder with your real details. The more specific your details are, the more useful the answer.</p>
  <ul><li><strong>Check the output.</strong> AI tools can make mistakes. Verify facts, prices, legal and tax statements before you publish anything.</li><li><strong>Make it yours.</strong> Edit the result so that it sounds like you.</li><li><strong>Protect privacy.</strong> Don't paste customers' personal data or confidential information into an AI tool.</li><li>Prompts work with most general-purpose AI assistants; wording may need small adjustments.</li></ul>`;
  return page(cover("20 AI Prompts", "Ready-to-copy prompts for ideas, branding, social media, products, marketing and support.", "AI prompt collection") + intro + body, "20 AI Prompts");
}

export function docHtml(file: string, title: string, subtitle: string, badge: string) {
  return page(cover(title, subtitle, badge) + md(readFileSync(join(SRC, "docs", file), "utf8"), true), title);
}

export function catalogueHtml(starterOnly: boolean) {
  const tpls = getTemplates().filter((t) => (starterOnly ? t.starter : true));
  const sections = TEMPLATE_CATEGORIES.map((cat) => {
    const list = tpls.filter((t) => t.category === cat.id);
    if (!list.length) return "";
    return `<h1>${esc(cat.label)} <span style="font-size:12pt;color:#7C3AED">· ${esc(cat.size)}</span></h1>` + list.map((t) => {
      const fonts = t.texts.some((x) => x.font === "serif") ? "Inter + Playfair Display" : "Inter";
      const rows = t.texts.filter((x) => x.lines.join("").trim()).map((x) => `<tr><td>${esc(x.role)}</td><td>${x.size}px / ${x.weight}${x.italic ? " italic" : ""}</td><td>${x.fill}</td><td>${esc(x.lines.join(" ").slice(0, 44))}</td></tr>`).join("");
      return `<div class="tpl"><div class="pv">${t.svg.replace(/ width="\d+" height="\d+"/, "")}</div><div class="info">
      <h3>#${String(t.number).padStart(2, "0")} · ${esc(t.name)}</h3>
      <div>${t.width} × ${t.height} px · File: <code>${t.id}</code> · Palette: ${esc(t.paletteName)}</div>
      <div style="margin:1mm 0"><span class="sw" style="background:${t.colors.text}"></span>${t.colors.text} <span class="sw" style="background:${t.colors.accent}"></span>${t.colors.accent} <span class="sw" style="background:${t.colors.accent2}"></span>${t.colors.accent2} · Background: ${esc(t.colors.background)}</div>
      <div>Fonts: ${fonts}</div>
      <table><tr><th>Text element</th><th>Size / weight</th><th>Colour</th><th>Sample text</th></tr>${rows}</table></div></div>`;
    }).join("");
  }).join("");
  const intro = `<h1 class="first">About this catalogue</h1><p>This catalogue lists every design in your package (${tpls.length} templates) with its exact canvas size, palette, fonts and text elements, so you can rebuild or adapt any layout in your preferred tool. See <em>How to use the templates with Canva</em> for step-by-step instructions.</p>
  <p><strong>Important:</strong> the designs are original vector (SVG) and PNG files. They are not Canva share links and are not automatically editable inside Canva. Use the SVG in a vector editor, or upload the background layer to Canva and add text using the specs below.</p>
  <p class="note">Fonts used: Inter and Playfair Display (free Google Fonts, also available in Canva).</p>`;
  return page(cover(starterOnly ? "Template Catalogue (Starter)" : "Template Catalogue", `${tpls.length} original social media layouts across ${TEMPLATE_CATEGORIES.filter((c) => tpls.some((t) => t.category === c.id)).length} categories.`, "Social media templates") + intro + sections, "Template Catalogue");
}

/* ───────────────────────── main ───────────────────────── */

async function main() {
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });
  const browser = await launchBrowser();
  const pdfPage = await browser.newPage();
  const toPdf = async (html: string, path: string) => {
    await pdfPage.setContent(html, { waitUntil: "load" });
    const buf = await pdfPage.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate: `<div style="width:100%;font-size:7.5px;color:#8a8aa3;padding:0 18mm;display:flex;justify-content:space-between;font-family:Inter,Arial,sans-serif"><span>CREATOR STARTER KIT</span><span class="pageNumber"></span></div>`,
    });
    put(path, buf);
  };

  const ideas = JSON.parse(readFileSync(join(SRC, "tiktok-ideas.json"), "utf8"));
  const prompts = JSON.parse(readFileSync(join(SRC, "prompts.json"), "utf8"));
  if (ideas.length !== 30) throw new Error(`Expected 30 TikTok ideas, got ${ideas.length}`);
  if (prompts.length !== 20) throw new Error(`Expected 20 prompts, got ${prompts.length}`);

  // 00 start
  put(`${FOLDERS.start}/START-HERE.txt`, readFileSync(join(SRC, "docs/start-here.md"), "utf8").replace(/^#+ /gm, ""));
  copyFileSync(join(SRC, "docs/LICENSE.txt"), join(OUT, FOLDERS.start, "LICENSE.txt"));
  track(`${FOLDERS.start}/START-HERE.txt`, "Start here", "start", ALL);
  track(`${FOLDERS.start}/LICENSE.txt`, "Licence", "start", ALL);

  // 01 templates
  const tpls = getTemplates();
  const png = await browser.newPage({ viewport: { width: 1080, height: 1080 } });
  for (const t of tpls) {
    const tiers = t.starter ? ALL : PRO_UP;
    const base = `${FOLDERS.templates}`;
    put(`${base}/svg/${t.id}.svg`, t.svg);
    put(`${base}/backgrounds/${t.id}-background.svg`, t.backgroundSvg);
    await png.setViewportSize({ width: t.width, height: t.height });
    await png.setContent(`<body style="margin:0">${t.svg}</body>`);
    const shot = await png.screenshot({ type: "png", clip: { x: 0, y: 0, width: t.width, height: t.height } });
    put(`${base}/png/${t.id}.png`, shot);
    track(`${base}/svg/${t.id}.svg`, `${t.name} (SVG)`, "templates", tiers, false);
    track(`${base}/backgrounds/${t.id}-background.svg`, `${t.name} (background)`, "templates", tiers, false);
    track(`${base}/png/${t.id}.png`, `${t.name} (PNG)`, "templates", tiers, false);
  }
  await png.close();
  await toPdf(catalogueHtml(true), `${FOLDERS.templates}/Template-Catalogue-Starter.pdf`);
  track(`${FOLDERS.templates}/Template-Catalogue-Starter.pdf`, "Template catalogue (10 templates)", "templates", ["starter"]);
  await toPdf(catalogueHtml(false), `${FOLDERS.templates}/Template-Catalogue.pdf`);
  track(`${FOLDERS.templates}/Template-Catalogue.pdf`, "Template catalogue (50 templates)", "templates", PRO_UP);
  await toPdf(docHtml("canva-howto.md", "Using the templates with Canva", "How to edit, adapt and rebuild the designs.", "Templates guide"), `${FOLDERS.templates}/How-to-use-the-templates-with-Canva.pdf`);
  track(`${FOLDERS.templates}/How-to-use-the-templates-with-Canva.pdf`, "How to use the templates with Canva", "templates", ALL);

  // 02 tiktok
  await toPdf(tiktokHtml(ideas), `${FOLDERS.tiktok}/30-TikTok-Content-Ideas.pdf`);
  track(`${FOLDERS.tiktok}/30-TikTok-Content-Ideas.pdf`, "30 TikTok content ideas (PDF)", "tiktok", ALL);

  // 03 notion
  for (const f of readdirSync(join(SRC, "notion"))) {
    mkdirSync(join(OUT, FOLDERS.notion), { recursive: true }); copyFileSync(join(SRC, "notion", f), join(OUT, FOLDERS.notion, f));
  }
  await toPdf(docHtml("notion-setup-guide.md", "Notion Content Dashboard", "Import files and a step-by-step setup guide.", "Notion dashboard"), `${FOLDERS.notion}/Notion-Setup-Guide.pdf`);
  track(`${FOLDERS.notion}/Notion-Setup-Guide.pdf`, "Notion setup guide (PDF)", "notion", PRO_UP);
  for (const f of readdirSync(join(SRC, "notion"))) track(`${FOLDERS.notion}/${f}`, `${f.replace(/\.csv$/, "").replace(/-/g, " ")} (CSV)`, "notion", PRO_UP);

  // 04 guide
  await toPdf(guideHtml(), `${FOLDERS.guide}/Digital-Business-Guide.pdf`);
  track(`${FOLDERS.guide}/Digital-Business-Guide.pdf`, "Digital business guide (PDF)", "guide", ALL);

  // 05 prompts
  await toPdf(promptsHtml(prompts), `${FOLDERS.prompts}/20-AI-Prompts.pdf`);
  put(`${FOLDERS.prompts}/20-AI-Prompts.txt`, prompts.map((p: any) => `#${p.id} [${p.category}] ${p.title}\n${p.useWhen}\n\n${p.prompt}\n\nTip: ${p.tip}\n\n${"-".repeat(60)}\n`).join("\n"));
  track(`${FOLDERS.prompts}/20-AI-Prompts.pdf`, "20 AI prompts (PDF)", "prompts", PRO_UP);
  track(`${FOLDERS.prompts}/20-AI-Prompts.txt`, "20 AI prompts (copy-paste text)", "prompts", PRO_UP);

  // 06 + 07
  await toPdf(docHtml("brand-planning-workbook.md", "Brand Planning Workbook", "Define, design and plan your brand in seven parts.", "Brand planning"), `${FOLDERS.brand}/Brand-Planning-Workbook.pdf`);
  track(`${FOLDERS.brand}/Brand-Planning-Workbook.pdf`, "Brand planning workbook (PDF)", "brand", ULT);
  await toPdf(docHtml("content-planning-guide.md", "Content Planning Guide", "A bonus guide to planning, batching and reviewing your content.", "Bonus guide"), `${FOLDERS.bonus}/Content-Planning-Guide.pdf`);
  track(`${FOLDERS.bonus}/Content-Planning-Guide.pdf`, "Content planning guide (PDF)", "bonus", ULT);

  await browser.close();
  put("manifest.json", JSON.stringify({ generated: new Date().toISOString(), groups: GROUPS, folders: FOLDERS, files }, null, 2));
  const total = files.reduce((a, f) => a + f.bytes, 0);
  console.log(`✔ ${files.length} files, ${(total / 1e6).toFixed(1)} MB written to ${relative(ROOT, OUT)}`);
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
