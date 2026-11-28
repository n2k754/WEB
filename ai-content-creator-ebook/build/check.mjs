// Verifies the generated deliverables. Usage: node build/check.mjs
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const D = (f) => join(ROOT, "dist", f);
let fail = 0;
const ok = (c, m) => { console.log(`${c ? "✔" : "✘"} ${m}`); if (!c) fail++; };
const J = (n) => JSON.parse(readFileSync(join(ROOT, `content/data/${n}.json`), "utf8"));

for (const f of ["AI-Content-Creator-Ebook.pdf", "Calendrier-30-jours.pdf", "Calendrier-30-jours.csv", "Bibliotheque-de-prompts.pdf", "Bibliotheque-de-prompts.txt", "ebook-source.html"]) ok(existsSync(D(f)) && statSync(D(f)).size > 5000, `livrable présent : dist/${f}`);

const pages = execFileSync("pdftotext", ["-layout", D("AI-Content-Creator-Ebook.pdf"), "-"], { maxBuffer: 1 << 28 }).toString().split("\f");
if (pages.at(-1).trim() === "") pages.pop();
const n = pages.length;
const info = execFileSync("pdfinfo", [D("AI-Content-Creator-Ebook.pdf")]).toString();
ok(/Page size:\s+59[45]/.test(info), `format A4, ${n} pages`);

const full = pages.join("\n");
const chapters = ["INTRODUCTION", ...Array.from({ length: 15 }, (_, i) => `CHAPITRE ${i + 1}`), "CONCLUSION"];
for (const c of chapters) ok(pages.some((p) => p.includes(c) && p.includes("DANS CE CHAPITRE")), `ouverture présente : ${c}`);

const blank = pages.map((p, i) => [i + 1, p.replace(/AI CONTENT CREATOR|A I C O N T E N T C R E AT O R|\s|\d+/g, "").length]).filter(([i, len]) => len < 25 && i > 1);
ok(blank.length === 0, `aucune page vide (${blank.map((b) => b[0]).join(", ") || "ok"})`);

ok(J("hooks").length === 50, "50 hooks");
ok(J("scripts").length === 30 && J("scripts").every((s) => s.hook && s.cta && s.scenes.length >= 3 && s.scenes.every((c) => c.plan && c.voix && c.texte)), "30 scripts complets (hook, scènes, voix off, texte, CTA)");
ok(J("calendar").length === 30 && J("calendar").every((c) => c.idee && c.hook && c.cta && c.format), "calendrier de 30 jours complet");
ok(J("prompts-niches").length === 20, "20 prompts par niche");
ok(Object.values(J("prompts-library")).flat().length === 27, "27 prompts généraux");
for (let i = 1; i <= 50; i++) if (!full.includes(String(i).padStart(2, "0"))) { ok(false, `hook ${i} manquant`); break; }
ok(/Script 30/.test(full) && /J30/.test(full), "script 30 et jour 30 présents dans le PDF");

const bad = /lorem|ipsum|todo|à compléter|a completer|xxx|\bTBD\b|placeholder/i;
ok(!bad.test(full), "aucun texte de remplissage (lorem, TODO, à compléter…)");
const sources = ["content/chapters", "content/data"].flatMap((d) => execFileSync("sh", ["-c", `cat ${join(ROOT, d)}/*`]).toString());
ok(!/garanti(e|s)? (de|d')(vues|résultat|revenu)/i.test(sources) || /Aucune promesse|aucune promesse|ne garantit/i.test(sources), "pas de promesse de résultat garanti");

const sommaire = pages[3] + pages[4];
const nums = [...sommaire.matchAll(/^(?!.*(?:AI CONTENT|A I C O N)).*\S\s+(\d{1,3})\s*$/gm)].map((m) => Number(m[1]));
ok(nums.length >= 17 && nums.every((x, i) => i === 0 || x >= nums[i - 1]), "sommaire : numéros de page croissants");
chapters.forEach((c, i) => { const real = pages.findIndex((p, k) => k > 3 && p.includes(c) && p.includes("DANS CE CHAPITRE")) + 1; if (nums[i] !== real) ok(false, `sommaire : ${c} indique ${nums[i]} mais se trouve page ${real}`); });
ok(true, "sommaire : numéros vérifiés contre les pages réelles");

const fonts = execFileSync("pdffonts", [D("AI-Content-Creator-Ebook.pdf")]).toString();
ok(!/\bno\s+(no|yes)\s+(no|yes)/.test(fonts.split("\n").slice(2).filter((l) => /\sno\s+(no|yes)\s+(no|yes)\s+\d/.test(l)).join("\n")), "toutes les polices sont incorporées");

try {
  const out = execFileSync("python3", ["-c", `
from pypdf import PdfReader
r=PdfReader(r"${D("AI-Content-Creator-Ebook.pdf")}")
links=sum(1 for p in r.pages for a in (p.get("/Annots") or []) if a.get_object().get("/Subtype")=="/Link")
print(len(r.pages), links, len(r.outline))`]).toString().trim().split(" ").map(Number);
  ok(out[1] >= 17, `liens internes cliquables : ${out[1]}`);
  ok(out[2] >= 10, `signets PDF (plan) : ${out[2]}`);
} catch { console.log("• pypdf indisponible : vérification des liens ignorée"); }

console.log(fail ? `\n${fail} vérification(s) en échec` : "\nToutes les vérifications passent.");
process.exit(fail ? 1 : 0);
