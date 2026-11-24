/** Creates one ZIP per package in /exports, ready to upload to Gumroad (one file per product). */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { zipSync } from "fflate";
import { TIERS } from "../src/config/pricing";

const ROOT = join(__dirname, "..");
const manifest = JSON.parse(readFileSync(join(ROOT, "private-files/manifest.json"), "utf8")) as { files: { path: string; tiers: string[] }[] };
mkdirSync(join(ROOT, "exports"), { recursive: true });
for (const t of TIERS) {
  const entries: Record<string, Uint8Array> = {};
  for (const f of manifest.files.filter((f) => f.tiers.includes(t.id))) entries[`CREATOR-STARTER-KIT-${t.name.replace(/\s/g, "-")}/${f.path}`] = new Uint8Array(readFileSync(join(ROOT, "private-files", f.path)));
  const out = join(ROOT, "exports", `creator-starter-kit-${t.id}.zip`);
  writeFileSync(out, zipSync(entries, { level: 6 }));
  console.log(`✔ ${out}  (${Object.keys(entries).length} files)`);
}
