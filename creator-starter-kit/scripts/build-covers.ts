/** Generates Gumroad cover images (1280x720) from the real template designs. Run: npx tsx scripts/build-covers.ts */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { launchBrowser } from "./lib/browser";
import { getTemplates } from "../src/content/templates";

const OUT = join(__dirname, "..", "gumroad-upload", "covers");
const T = getTemplates();
const svg = (id: string, scope: string, h?: number) => {
  const t = T.find((x) => x.id === id)!;
  return t.svg.replaceAll(`${id}-`, `${scope}-${id}-`).replace(/ width="\d+" height="\d+"/, ` width="100%" height="100%"`);
};
const card = (id: string, scope: string, w: number, style = "") => {
  const t = T.find((x) => x.id === id)!;
  return `<div style="width:${w}px;aspect-ratio:${t.width}/${t.height};border-radius:18px;overflow:hidden;border:1px solid rgba(255,255,255,.18);box-shadow:0 24px 60px rgba(0,0,0,.55);${style}">${svg(id, scope)}</div>`;
};
const base = `*{box-sizing:border-box;margin:0}body{width:1280px;height:720px;overflow:hidden;background:#09090F;color:#fff;font-family:Inter,Arial,sans-serif;position:relative}
.glow{position:absolute;border-radius:50%;filter:blur(110px)}.g1{width:620px;height:620px;background:rgba(139,92,246,.45);right:-120px;top:-160px}.g2{width:520px;height:520px;background:rgba(99,102,241,.35);left:-160px;bottom:-200px}
.brand{font-weight:800;letter-spacing:.2em;font-size:15px;color:#C4B5FD}.pill{display:inline-block;padding:8px 16px;border:1px solid rgba(196,181,253,.4);border-radius:99px;font-size:13px;letter-spacing:.16em;color:#DDD6FE;font-weight:600}
.grad{background:linear-gradient(90deg,#C4B5FD,#818CF8);-webkit-background-clip:text;color:transparent}`;

const pages: Record<string, string> = {
  "cover-1-main": `<style>${base}</style><div class="glow g1"></div><div class="glow g2"></div>
  <div style="position:absolute;left:70px;top:70px"><div class="brand">CREATOR STARTER KIT</div></div>
  <div style="position:absolute;left:70px;top:170px;width:520px"><span class="pill">THE ULTIMATE CREATOR TOOLKIT</span>
  <h1 style="font-size:60px;line-height:1.04;font-weight:800;margin-top:26px;letter-spacing:-.03em">Build your <span class="grad">digital business.</span> Start creating today.</h1>
  <p style="margin-top:24px;font-size:22px;color:#B4B4CC;line-height:1.45">Templates, TikTok ideas, Notion dashboard, business guide &amp; AI prompts, in one download.</p></div>
  <div style="position:absolute;right:70px;top:70px;display:flex;gap:18px;align-items:flex-start;transform:rotate(3deg)">
  ${card("csk-11", "a", 190, "margin-top:60px")}${card("csk-01", "a", 220, "margin-top:0")}${card("csk-31", "a", 200, "margin-top:90px")}</div>
  <div style="position:absolute;left:70px;bottom:60px;display:flex;gap:14px;font-size:15px;font-weight:600;color:#DDD6FE">
  <span>50 templates</span><span style="color:#555">•</span><span>30 TikTok ideas</span><span style="color:#555">•</span><span>Notion dashboard</span><span style="color:#555">•</span><span>8-chapter guide</span><span style="color:#555">•</span><span>20 AI prompts</span></div>`,
  "cover-2-templates": `<style>${base}</style><div class="glow g1"></div>
  <div style="position:absolute;left:60px;top:50px"><span class="pill">50 ORIGINAL TEMPLATES</span><h2 style="font-size:40px;font-weight:800;margin-top:16px;letter-spacing:-.02em">Posts, stories, promos, launches, quotes &amp; announcements</h2></div>
  <div style="position:absolute;left:60px;right:60px;top:200px;display:flex;gap:16px;align-items:flex-start">
  ${["csk-02", "csk-12", "csk-21", "csk-29", "csk-38", "csk-45", "csk-02"].slice(0, 6).map((id, i) => card(id, "b" + i, 180)).join("")}</div>`,
  "cover-3-inside": `<style>${base}.row{display:flex;align-items:center;gap:20px;padding:18px 24px;border:1px solid rgba(255,255,255,.12);border-radius:20px;background:rgba(255,255,255,.05);margin-bottom:14px}.n{font-weight:800;font-size:28px;width:44px}.t{font-size:22px;font-weight:700}.s{font-size:15px;color:#A1A1B5;margin-top:3px}.c{margin-left:auto;font-weight:800;color:#C4B5FD;font-size:18px;white-space:nowrap}</style><div class="glow g1"></div>
  <div style="position:absolute;left:70px;top:46px"><div class="brand">WHAT'S INSIDE</div></div>
  <div style="position:absolute;left:70px;right:70px;top:90px">
  ${[["01", "Social media template pack", "Posts, stories, promos, launches, quotes, announcements (SVG + PNG)", "50 designs"], ["02", "TikTok content ideas", "Concept, hook, structure, CTA and audience for each idea (PDF)", "30 ideas"], ["03", "Notion content dashboard", "Calendar, ideas, tracker, weekly plan, performance + setup guide", "5 databases"], ["04", "Digital business guide", "From first idea to first product, with exercises and checklists (PDF)", "8 chapters"], ["05", "AI prompt collection", "Business, branding, social, product, marketing, support (PDF + TXT)", "20 prompts"], ["+", "Bonus workbooks", "Brand planning workbook and content planning guide (PDF)", "2 bonuses"]].map(([n, t, s, c]) => `<div class="row"><div class="n grad">${n}</div><div><div class="t">${t}</div><div class="s">${s}</div></div><div class="c">${c}</div></div>`).join("")}</div>`,
  "cover-4-notion-guide": `<style>${base}.col{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:14px;width:178px}.col b{font-size:13px;color:#D4D4E8}.k{margin-top:10px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:10px;font-size:12.5px;line-height:1.3}.tag{display:inline-block;margin-top:6px;font-size:10px;padding:2px 6px;border-radius:5px;background:rgba(139,92,246,.35);color:#E9E3FF}</style><div class="glow g2"></div><div class="glow g1"></div>
  <div style="position:absolute;left:60px;top:46px"><span class="pill">NOTION DASHBOARD</span><h2 style="font-size:34px;font-weight:800;margin-top:14px;letter-spacing:-.02em">Plan your content,<br/>track what works</h2></div>
  <div style="position:absolute;left:60px;top:250px;display:flex;gap:12px">
  ${[["Idea", ["Hook styles that earn attention", "How do I choose a price?"]], ["Drafting", ["My weekly planning routine"]], ["Ready", ["Launch week announcement"]], ["Published", ["Customer question of the week"]]].map(([c, items]) => `<div class="col"><b>${c}</b>${(items as string[]).map((i) => `<div class="k">${i}<br/><span class="tag">Instagram</span> <span class="tag" style="background:rgba(99,102,241,.35)">Educate</span></div>`).join("")}</div>`).join("")}</div>
  <div style="position:absolute;right:70px;top:70px;transform:rotate(4deg);width:300px;background:#fff;color:#27272A;border-radius:12px;padding:28px;box-shadow:0 30px 70px rgba(0,0,0,.6)">
  <div style="font-size:10px;font-weight:800;letter-spacing:.2em;color:#7C3AED">CHAPTER 1</div><div style="font-size:22px;font-weight:800;margin-top:8px;line-height:1.15">Finding a digital product idea</div><div style="height:3px;width:40px;background:#8B5CF6;margin:12px 0"></div>
  <div style="font-size:12px;line-height:1.55">Start with problems, not products. A better question than “What should I sell?” is “Whose problem can I help solve?”</div></div>`,
};

(async () => {
  const b = await launchBrowser();
  const pg = await b.newPage({ viewport: { width: 1280, height: 720 } });
  for (const [name, html] of Object.entries(pages)) {
    await pg.setContent(`<!doctype html><html><body>${html}</body></html>`);
    await pg.screenshot({ path: join(OUT, `${name}.png`) });
    console.log("✔", name);
  }
  await b.close();
  writeFileSync(join(OUT, "README.txt"), "Gumroad cover images (1280x720). Generated by scripts/build-covers.ts\n");
})();
