// Builds the ebook (PDF + editable HTML) and the separate calendar / prompt-library deliverables.
// Usage: node build/build.mjs
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { marked } from "marked";
import { chromium } from "playwright";
import { CSS } from "./styles.mjs";
import { diagrams } from "./diagrams.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const cfg = JSON.parse(readFileSync(join(ROOT, "book.config.json"), "utf8"));
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const data = (n) => JSON.parse(read(`content/data/${n}.json`));
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const DIST = join(ROOT, "dist");
mkdirSync(DIST, { recursive: true });

/* ───────── data renderers ───────── */
const hooksHtml = () => {
  const hooks = data("hooks");
  const niches = [...new Set(hooks.map((h) => h.niche))];
  return niches.map((n) => `<div class="niche-h">${esc(n)}</div><table class="hooks"><tbody>${hooks.filter((h) => h.niche === n).map((h) => `<tr><td>${String(h.id).padStart(2, "0")}</td><td>${esc(h.technique)}</td><td>${esc(h.hook)}</td></tr>`).join("")}</tbody></table>`).join("");
};
const scriptsHtml = () => data("scripts").map((s) => `<div class="script"><div class="hd"><b>Script ${String(s.id).padStart(2, "0")} · ${esc(s.titre)}</b><span>${esc(s.duree)}</span></div>
  <div class="meta">Niche : ${esc(s.niche)}  ·  Format : ${esc(s.format)}</div>
  <div class="hook"><i>HOOK</i>« ${esc(s.hook)} »</div>
  <table><thead><tr><th style="width:30%">Plan (ce qu'on voit)</th><th>Voix off</th><th style="width:24%">Texte à l'écran</th></tr></thead><tbody>${s.scenes.map((c) => `<tr><td>${esc(c.plan)}</td><td>${esc(c.voix)}</td><td>${esc(c.texte)}</td></tr>`).join("")}</tbody></table>
  <div class="cta"><i>CTA</i>${esc(s.cta)}</div></div>`).join("");
const calRows = (items) => `<table class="cal"><thead><tr><th>Jour</th><th>Idée</th><th>Hook</th><th>Appel à l'action</th></tr></thead><tbody>${items.map((c) => `<tr><td><div class="d">J${c.jour}</div><div class="p">${esc(c.pilier)}<br>${esc(c.format)}</div></td><td>${esc(c.idee)}</td><td class="h">« ${esc(c.hook)} »</td><td>${esc(c.cta)}</td></tr>`).join("")}</tbody></table>`;
const calendarHtml = () => {
  const c = data("calendar");
  return [0, 1, 2, 3, 4].map((w) => { const items = c.slice(w * 7, w * 7 + 7); return items.length ? `<div class="week">${w < 4 ? `Semaine ${w + 1}` : "Jours 29 et 30"}</div>${calRows(items)}` : ""; }).join("");
};
const pcard = (id, titre, tag, prompt, tip) => `<div class="pcard"><div class="hd"><b>${id ? `${String(id).padStart(2, "0")} · ` : ""}${esc(titre)}</b><span>${esc(tag)}</span></div><pre>${esc(prompt)}</pre>${tip ? `<div class="tip">${esc(tip)}</div>` : ""}</div>`;
const nichePromptsHtml = () => data("prompts-niches").map((p) => pcard(p.id, p.titre, p.niche, p.prompt)).join("");
const libraryHtml = () => { const L = data("prompts-library"); return Object.entries(L).map(([cat, items]) => `<div class="catlab">${esc(cat)}</div>${items.map((p) => pcard(0, p.titre, "", p.prompt)).join("")}`).join(""); };
const DATA = { hooks: hooksHtml, scripts: scriptsHtml, calendar: calendarHtml, "niche-prompts": nichePromptsHtml, library: libraryHtml };

/* ───────── markdown → html ───────── */
marked.setOptions({ gfm: true, breaks: false });
function render(md) {
  let h = marked.parse(md, { async: false });
  h = h.replace(/<pre><code class="language-prompt">([\s\S]*?)<\/code><\/pre>/g, (_, c) => `<div class="prompt${c.length > 1800 ? " long" : ""}"><div class="lab">PROMPT À COPIER</div><pre>${c.trim()}</pre></div>`);
  h = h.replace(/<blockquote>\s*<p><strong>(Attention|Astuce|Exercice|À retenir|Exemple|Note)/g, (m, k) => `<blockquote class="${{ Attention: "attention", Exercice: "exercice", "À retenir": "retenir" }[k] ?? ""}"><p><strong>${k}`);
  h = h.replace(/<p>\{\{diagram:(\w+)\}\}<\/p>/g, (_, n) => diagrams[n]());
  h = h.replace(/<p>\{\{data:([\w-]+)\}\}<\/p>/g, (_, n) => DATA[n]());
  return h;
}

/* ───────── chapters ───────── */
const files = readdirSync(join(ROOT, "content/chapters")).filter((f) => f.endsWith(".md")).sort();
const chapters = files.map((f) => {
  const md = read(`content/chapters/${f}`);
  const num = Number(f.slice(0, 2));
  const title = md.match(/^# (.+)$/m)[1];
  const h2 = [...md.matchAll(/^## (.+)$/gm)].map((m) => m[1].replace(/^\d+\.\s*/, "")).filter((t) => !/^Exercice|^Le calendrier$|^Les 20 prompts$/.test(t));
  const kind = num === 0 ? "intro" : num === 16 ? "conclusion" : "chapter";
  return { file: f, num, title, h2, kind, label: kind === "intro" ? "INTRODUCTION" : kind === "conclusion" ? "CONCLUSION" : `CHAPITRE ${num}`, body: render(md.replace(/^# .+$/m, "")), id: `ch-${num}` };
});
if (chapters.length !== 17) throw new Error(`Expected 17 chapter files, got ${chapters.length}`);

const owner = cfg.titulaire ? `${esc(cfg.titulaire)}. ` : "";
const cover = `<section class="full cover"><div class="grid"></div><div class="arc"></div><div class="arc2"></div><div class="ed">${esc(cfg.edition.toUpperCase())}</div>
<div class="inner"><div class="kicker">GUIDE PRATIQUE · TIKTOK · REELS · SHORTS</div><h1>AI CONTENT<br><span>CREATOR</span></h1><div class="sub">${esc(cfg.sousTitre)}</div><div class="rule"></div><div class="tag">${esc(cfg.accroche)}</div></div></section>`;
const titlePage = `<section class="title-page page"><div class="k">GUIDE PRATIQUE · ${esc(cfg.edition.toUpperCase())}</div><h1>AI CONTENT<br>CREATOR</h1><div class="s">${esc(cfg.sousTitre)}</div><div class="bar"></div><p style="color:#5B6478;max-width:130mm">Planifier, écrire, produire et analyser ses contenus TikTok, Instagram Reels et YouTube Shorts avec l'intelligence artificielle, sans promesse irréaliste.</p></section>`;
const legal = `<section class="legal-page page"><h2>Droits d'auteur</h2>
<p>© ${cfg.annee} ${owner}Tous droits réservés. Ce guide est destiné à un usage personnel. Il est interdit de le revendre, de le diffuser, de le partager publiquement ou d'en reproduire des extraits importants sans autorisation écrite de l'auteur. Les modèles, prompts et tableaux peuvent être utilisés librement pour vos propres contenus.</p>
<div class="sp"></div><h2>Avertissement éducatif</h2>
<p>Ce guide est un support pédagogique. Il présente des méthodes générales et des exemples. <strong>Il ne garantit aucun résultat</strong> : ni nombre de vues, ni croissance d'audience, ni revenus. Les résultats dépendent de nombreux facteurs que personne ne contrôle entièrement.</p>
<p>Les contenus ne constituent ni un conseil juridique, ni un conseil financier, fiscal ou médical. Pour toute question de ce type, adressez-vous à un professionnel qualifié.</p>
<div class="sp"></div><h2>Outils, marques et règles de plateforme</h2>
<p>Les noms d'outils, de marques et de plateformes cités (par exemple ChatGPT, Claude, Canva, CapCut, TikTok, Instagram, YouTube, Notion) appartiennent à leurs propriétaires respectifs. Ce guide n'est affilié à aucune de ces sociétés et n'est ni parrainé ni approuvé par elles. Les fonctionnalités, offres, prix, licences et règles de ces services évoluent : vérifiez toujours leurs conditions actuelles avant de les utiliser, notamment pour un usage commercial.</p>
<div class="sp"></div><h2>Contenus générés par IA et droits</h2>
<p>Vous restez responsable de ce que vous publiez : exactitude des informations, respect du droit d'auteur, des licences, des droits des personnes et des règles des plateformes, y compris l'indication des contenus réalistes générés ou modifiés par IA lorsque cela est requis.</p>
<div class="sp"></div><h2>Transparence</h2>
<p>Ce guide a été conçu avec l'assistance d'outils d'intelligence artificielle, puis structuré et relu. Les exemples de scripts, de hooks et de calendriers sont originaux et illustratifs : ils ne reproduisent le contenu d'aucun autre créateur et ne s'appuient sur aucune étude de cas ni statistique réelle.</p>
<div class="sp"></div><p style="color:#7B859B">Version ${esc(cfg.version)} · ${esc(cfg.edition)}</p></section>`;

const opener = (c) => `<section class="full opener" id="${c.id}"><div class="grid"></div><div class="circle"></div><div class="circle2"></div>${c.kind === "chapter" ? `<div class="num">${String(c.num).padStart(2, "0")}</div>` : ""}
<div class="body"><div class="lab">${c.label}</div><h1>${esc(c.title)}</h1><div class="rule"></div><div class="in">DANS CE CHAPITRE</div><ul>${c.h2.slice(0, 6).map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div></section>`;
const chapterHtml = (c) => `${opener(c)}<section class="chapter-body page">${c.body}</section>`;

const tocHtml = (pages) => `<section class="toc page"><h1>Sommaire</h1><div class="bar"></div><ol>${chapters.map((c) => `<li><a class="row" href="#${c.id}"><span class="n">${c.kind === "chapter" ? String(c.num).padStart(2, "0") : ""}</span><span class="t">${esc(c.title)}</span><span class="p">${pages?.[c.id] ?? "00"}</span></a></li>`).join("")}</ol></section>`;

// French typography: non-breaking spaces before : ; ! ? » and after «  (outside <style> and <pre> so prompts stay copy-friendly)
const NB = "\u00A0";
const frTypo = (html) => html.split(/(<style[\s\S]*?<\/style>|<pre[\s\S]*?<\/pre>)/).map((seg, i) => i % 2 ? seg : seg.replace(/>([^<]+)</g, (m, t) => ">" + t.replace(/ ([:;!?»])/g, NB + "$1").replace(/« /g, "«" + NB) + "<")).join("");
const doc = (body, title) => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${esc(title)}</title><style>${CSS}</style></head><body>${frTypo(body)}</body></html>`;
const bookHtml = (pages) => doc(cover + titlePage + legal + tocHtml(pages) + chapters.map(chapterHtml).join(""), `${cfg.titre} — ${cfg.sousTitre}`);

/* ───────── PDF ───────── */
const browser = await (async () => {
  const opts = { args: ["--no-sandbox"] };
  if (process.env.PLAYWRIGHT_CHROMIUM_PATH) return chromium.launch({ ...opts, executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH });
  try { return await chromium.launch(opts); } catch (e) {
    if (existsSync("/opt/pw-browsers/chromium")) return chromium.launch({ ...opts, executablePath: "/opt/pw-browsers/chromium" });
    throw new Error("Chromium introuvable. Lancez : npx playwright install chromium\n" + e);
  }
})();
const page = await browser.newPage();
async function toPdf(html, out, meta = {}) {
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const buf = await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true, outline: true, tagged: true });
  writeFileSync(out, buf);
  return buf;
}
const pdfPages = (file) => execFileSync("pdftotext", ["-layout", file, "-"], { maxBuffer: 1 << 28 }).toString().split("\f");

// pass 1: layout with placeholder page numbers, then locate each chapter opener
const tmp = join(DIST, ".pass1.pdf");
await toPdf(bookHtml(null), tmp);
let texts = pdfPages(tmp);
const pageOf = {};
let cursor = 4; // after cover, title, legal (TOC pages follow)
for (const c of chapters) {
  const idx = texts.findIndex((t, i) => i >= cursor && t.includes(c.label) && t.includes("DANS CE CHAPITRE"));
  if (idx < 0) throw new Error(`Opener introuvable pour ${c.label}`);
  pageOf[c.id] = idx + 1;
  cursor = idx + 1;
}
// pass 2: final book
const bookPdf = join(DIST, "AI-Content-Creator-Ebook.pdf");
await toPdf(bookHtml(pageOf), bookPdf);
texts = pdfPages(bookPdf);
const chk = chapters.every((c) => texts[pageOf[c.id] - 1]?.includes(c.label));
if (!chk) throw new Error("La pagination du sommaire ne correspond pas au PDF final");
writeFileSync(join(DIST, "ebook-source.html"), bookHtml(pageOf));

/* ───────── separate deliverables ───────── */
const docHead = (k, t, p) => `<div class="doc-head"><div class="k">${k}</div><h1>${t}</h1><p>${p}</p></div>`;
const calHtml = docHead("AI CONTENT CREATOR · OUTIL", "Calendrier de contenu sur 30 jours", "Niche d'exemple : organisation et productivité pour étudiants et jeunes actifs. Adaptez chaque ligne à votre niche (voir le prompt d'adaptation plus bas). Aucune promesse de résultat : ce calendrier structure votre régularité.") +
  `<div class="chapter-body">${calendarHtml()}<h2>Adapter ce calendrier à votre niche</h2><div class="prompt"><div class="lab">PROMPT À COPIER</div><pre>${esc("Voici un calendrier de contenu de 30 jours conçu pour la niche « organisation et productivité » : [COLLEZ LE CALENDRIER].\nAdapte-le à ma niche : [VOTRE NICHE], pour [VOTRE PUBLIC]. Garde la même structure (piliers, formats, rythme),\nmais remplace chaque idée, chaque hook et chaque CTA par des propositions adaptées à ma niche.\nN'invente ni statistique ni témoignage. Présente le résultat sous forme de tableau.")}</pre></div></div>`;
await toPdf(doc(calHtml, "Calendrier de contenu sur 30 jours"), join(DIST, "Calendrier-30-jours.pdf"));
const cal = data("calendar");
const csvq = (s) => `"${String(s).replace(/"/g, '""')}"`;
writeFileSync(join(DIST, "Calendrier-30-jours.csv"), "﻿" + ["Jour,Pilier,Format,Idée,Hook,CTA,Statut,Date de publication", ...cal.map((c) => [c.jour, c.pilier, c.format, c.idee, c.hook, c.cta, "À faire", ""].map(csvq).join(","))].join("\n"));

const libDoc = docHead("AI CONTENT CREATOR · OUTIL", "Bibliothèque de prompts", "47 prompts à copier-coller : 20 prompts par niche et 27 prompts généraux classés par étape. Remplacez chaque [VARIABLE] par vos informations, relisez et vérifiez toujours le résultat.") +
  `<div class="chapter-body"><h2>La formule d'un bon prompt</h2><table><thead><tr><th>Élément</th><th>Rôle</th></tr></thead><tbody><tr><td><strong>Rôle</strong></td><td>Qui doit parler ? (scénariste, coach, rédacteur…)</td></tr><tr><td><strong>Contexte</strong></td><td>Public, sujet, plateforme, ton</td></tr><tr><td><strong>Tâche</strong></td><td>Ce que vous voulez obtenir</td></tr><tr><td><strong>Obligations</strong></td><td>Durée, interdits, « n'invente aucune statistique »</td></tr><tr><td><strong>Format</strong></td><td>Tableau, liste, script, etc.</td></tr></tbody></table>
  <blockquote class="attention"><p><strong>Attention.</strong> Vérifiez toujours les faits, chiffres et affirmations générés par l'IA, ne saisissez pas de données confidentielles et respectez les conditions d'utilisation de l'outil et des plateformes.</p></blockquote>
  <h2>Partie 1 · 20 prompts par niche</h2>${nichePromptsHtml()}<h2>Partie 2 · 27 prompts généraux par étape</h2>${libraryHtml()}</div>`;
await toPdf(doc(libDoc, "Bibliothèque de prompts"), join(DIST, "Bibliotheque-de-prompts.pdf"));
const niches = data("prompts-niches"), lib = data("prompts-library");
writeFileSync(join(DIST, "Bibliotheque-de-prompts.txt"),
  `AI CONTENT CREATOR — BIBLIOTHÈQUE DE PROMPTS\nRemplacez chaque [VARIABLE] par vos informations. Vérifiez toujours les faits générés.\n\n=== PARTIE 1 : 20 PROMPTS PAR NICHE ===\n\n` +
  niches.map((p) => `#${p.id} [${p.niche}] ${p.titre}\n\n${p.prompt}\n\n${"-".repeat(70)}\n`).join("\n") +
  `\n=== PARTIE 2 : 27 PROMPTS GÉNÉRAUX ===\n\n` + Object.entries(lib).map(([cat, items]) => `--- ${cat.toUpperCase()} ---\n\n` + items.map((p) => `${p.titre}\n\n${p.prompt}\n\n${"-".repeat(70)}\n`).join("\n")).join("\n"));

await browser.close();
try { (await import("node:fs")).unlinkSync(tmp); } catch {}
console.log("✔ dist/AI-Content-Creator-Ebook.pdf, ebook-source.html, Calendrier-30-jours.(pdf|csv), Bibliotheque-de-prompts.(pdf|txt)");
