/** Builds ONE PDF containing every document of the kit. Run: npx tsx scripts/build-complete-pdf.ts */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { launchBrowser } from "./lib/browser";
import { CSS, cover, md, guideHtml, tiktokHtml, promptsHtml, docHtml, catalogueHtml } from "./build-resources";

const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "content-src");
const body = (html: string) => html.slice(html.indexOf("<body>") + 6, html.lastIndexOf("</body>"));
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function csvTable(file: string) {
  const rows = readFileSync(join(SRC, "notion", file), "utf8").trim().split("\n").map((l) => l.split(","));
  return `<table><tr>${rows[0].map((c) => `<th>${esc(c)}</th>`).join("")}</tr>${rows.slice(1).map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</table>`;
}

(async () => {
  const ideas = JSON.parse(readFileSync(join(SRC, "tiktok-ideas.json"), "utf8"));
  const prompts = JSON.parse(readFileSync(join(SRC, "prompts.json"), "utf8"));
  const parts = [
    ["Start here", md(readFileSync(join(SRC, "docs/start-here.md"), "utf8"), true)],
  ] as [string, string][];

  const toc = `<h1 class="first">Contents</h1><ol class="toc">
  <li><strong>Section 1</strong> · Start here and how to use this edition</li>
  <li><strong>Section 2</strong> · The Digital Business Guide (8 chapters)</li>
  <li><strong>Section 3</strong> · 30 TikTok Content Ideas</li>
  <li><strong>Section 4</strong> · Social Media Template Catalogue (50 designs) and the Canva how-to</li>
  <li><strong>Section 5</strong> · Notion Content Dashboard: setup guide and database templates</li>
  <li><strong>Section 6</strong> · 20 AI Prompts</li>
  <li><strong>Section 7</strong> · Brand Planning Workbook</li>
  <li><strong>Section 8</strong> · Bonus: Content Planning Guide</li>
  <li><strong>Section 9</strong> · Licence</li></ol>
  <p class="note">This is the complete reference edition of the kit in a single PDF. The downloadable design files (SVG, PNG), Notion CSV files and the plain-text prompts are in the ZIP package.</p>`;

  const notionAppendix = `<h1>Notion database templates</h1><p>These are the five CSV databases from the package, shown as tables so you can see every property. Import the CSV files from the ZIP, then follow the setup guide above.</p>` +
    readdirSync(join(SRC, "notion")).sort().map((f) => `<h2>${esc(f.replace(".csv", "").replace(/-/g, " "))}</h2>${csvTable(f)}`).join("");

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Creator Starter Kit — Complete Edition</title><style>${CSS}</style></head><body>
  ${cover("Creator Starter Kit", "The complete edition: business guide, content ideas, templates catalogue, Notion system, AI prompts and workbooks.", "Complete edition")}
  ${toc}
  <h1>Section 1 · Start here</h1>${parts[0][1].replace('<h1 class="first">Start here</h1>', "")}
  ${body(guideHtml())}
  ${body(tiktokHtml(ideas))}
  ${body(catalogueHtml(false))}
  ${body(docHtml("canva-howto.md", "Using the templates with Canva", "How to edit, adapt and rebuild the designs.", "Templates guide"))}
  ${body(docHtml("notion-setup-guide.md", "Notion Content Dashboard", "Import files and a step-by-step setup guide.", "Notion dashboard"))}
  ${notionAppendix}
  ${body(promptsHtml(prompts))}
  ${body(docHtml("brand-planning-workbook.md", "Brand Planning Workbook", "Define, design and plan your brand in seven parts.", "Brand planning"))}
  ${body(docHtml("content-planning-guide.md", "Content Planning Guide", "A bonus guide to planning, batching and reviewing your content.", "Bonus guide"))}
  <h1>Section 9 · Licence</h1><pre style="white-space:pre-wrap;font-family:inherit;font-size:10pt">${esc(readFileSync(join(SRC, "docs/LICENSE.txt"), "utf8"))}</pre>
  </body></html>`;

  const b = await launchBrowser();
  const pg = await b.newPage();
  await pg.setContent(html, { waitUntil: "load" });
  const out = join(ROOT, "gumroad-upload", "Creator-Starter-Kit-Complete-Edition.pdf");
  mkdirSync(join(ROOT, "gumroad-upload"), { recursive: true });
  writeFileSync(out, await pg.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true, displayHeaderFooter: true, headerTemplate: "<span></span>", footerTemplate: `<div style="width:100%;font-size:7.5px;color:#8a8aa3;padding:0 18mm;display:flex;justify-content:space-between;font-family:Inter,Arial,sans-serif"><span>CREATOR STARTER KIT · Complete edition</span><span class="pageNumber"></span></div>` }));
  await b.close();
  console.log("✔", out);
})();
