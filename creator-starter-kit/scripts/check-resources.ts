/** Verifies that what the website promises matches what is actually in /private-files. */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { TIERS, type TierId } from "../src/config/pricing";
import { getTemplates } from "../src/content/templates";

const ROOT = join(__dirname, "..", "private-files");
let failed = 0;
const check = (ok: boolean, msg: string) => {
  console.log(`${ok ? "✔" : "✘"} ${msg}`);
  if (!ok) failed++;
};

if (!existsSync(join(ROOT, "manifest.json"))) {
  console.error("private-files/manifest.json missing. Run: npm run resources:build");
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(join(ROOT, "manifest.json"), "utf8")) as { files: { path: string; group: string; tiers: TierId[]; bytes: number }[] };
const forTier = (t: TierId) => manifest.files.filter((f) => f.tiers.includes(t));
const count = (t: TierId, re: RegExp) => forTier(t).filter((f) => re.test(f.path)).length;

check(manifest.files.every((f) => existsSync(join(ROOT, f.path))), "every manifest file exists on disk");
check(manifest.files.every((f) => f.bytes > 0), "no empty files");
check(getTemplates().length === 50, "50 templates are defined");
check(count("ultimate", /\/png\//) === 50, "Ultimate/Pro: 50 PNG previews");
check(count("pro", /\/svg\//) === 50, "Pro: 50 SVG templates");
check(count("starter", /\/svg\//) === 10, "Starter: exactly 10 SVG templates");
check(count("starter", /30-TikTok/) === 1, "Starter: TikTok ideas PDF");
check(count("starter", /Digital-Business-Guide/) === 1, "Starter: business guide PDF");
check(count("starter", /Notion|20-AI/) === 0, "Starter: no Notion / prompts (matches pricing)");
check(count("pro", /03-notion-dashboard\/.*\.csv/) === 5, "Pro: 5 Notion CSV databases");
check(count("pro", /20-AI-Prompts/) === 2, "Pro: prompts PDF + TXT");
check(count("pro", /Brand-Planning|Content-Planning/) === 0, "Pro: no Ultimate-only extras");
check(count("ultimate", /Brand-Planning/) === 1 && count("ultimate", /Content-Planning/) === 1, "Ultimate: brand workbook + bonus guide");
check(TIERS.length === 3 && TIERS.every((t) => forTier(t.id).length > 0), "every priced package has files");

const prompts = JSON.parse(readFileSync(join(__dirname, "..", "content-src/prompts.json"), "utf8"));
const ideas = JSON.parse(readFileSync(join(__dirname, "..", "content-src/tiktok-ideas.json"), "utf8"));
check(prompts.length === 20, "20 AI prompts");
check(ideas.length === 30 && ideas.every((i: any) => i.concept && i.hook && i.structure?.length >= 4 && i.cta && i.audience), "30 TikTok ideas, each with concept/hook/structure/CTA/audience");

if (failed) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log("\nAll resource checks passed.");
