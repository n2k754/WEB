// Silent text-only TikTok promo (1080x1920, 30 fps, 24 s) built from real pages of the ebook PDF.
// Usage: node promo/build-promo.mjs <frames-dir> [frameList]   then ffmpeg (see promo/README.md)
import { mkdirSync, rmSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { chromium } from "playwright";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PDF = join(ROOT, "dist/AI-Content-Creator-Ebook.pdf");
const FPS = 30, DUR = 24;
const dir = process.argv[2];
const only = process.argv[3] ? process.argv[3].split(",").map(Number) : null;

// --- real ebook pages as visuals ---
const texts = execFileSync("pdftotext", ["-layout", PDF, "-"], { maxBuffer: 1 << 28 }).toString().split("\f");
const find = (...needles) => { const i = texts.findIndex((t, k) => k > 4 && !t.includes("DANS CE CHAPITRE") && needles.every((n) => t.includes(n))); if (i < 0) throw new Error("page introuvable: " + needles); return i + 1; };
const pages = { cover: 1, hooks: find("Entrepreneuriat et freelance", "QUESTION"), scripts: find("Script 02"), calendar: find("Semaine 1", "J1"), prompts: find("Programme de contenus pour débutants"), plan: find("Jour 1", "Clarifier") };
const tmp = join(dir, "_pages"); mkdirSync(tmp, { recursive: true });
const img = {};
for (const [k, p] of Object.entries(pages)) {
  execFileSync("pdftoppm", ["-r", "120", "-png", "-singlefile", "-f", String(p), "-l", String(p), PDF, join(tmp, k)]);
  img[k] = "data:image/png;base64," + readFileSync(join(tmp, k + ".png")).toString("base64");
}
console.log("pages:", pages);

const feats = [
  ["50", "HOOKS", "par niche, à adapter à ton sujet", "hooks"],
  ["30", "SCRIPTS VIDÉO", "hook · scènes · voix off · CTA", "scripts"],
  ["30", "JOURS", "de calendrier de contenu", "calendar"],
  ["47", "PROMPTS", "prêts à copier-coller", "prompts"],
  ["7", "JOURS", "pour publier tes premières vidéos", "plan"],
];
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}body{width:1080px;height:1920px;overflow:hidden;background:#0B1530;color:#fff;font-family:Inter,Arial,sans-serif;position:relative}
.abs{position:absolute}.scene{position:absolute;inset:0;opacity:0}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);background-size:90px 90px}
.orb{position:absolute;border-radius:50%}
.big{font-weight:900;letter-spacing:-.03em;line-height:1}
.blue{color:#5C8DFF}.out{color:transparent;-webkit-text-stroke:3px #3D74FF}
.card{border-radius:26px;overflow:hidden;box-shadow:0 40px 90px rgba(0,0,0,.6),0 0 0 3px rgba(143,176,255,.55);background:#fff}
.card img{display:block;width:100%}
.kick{font-size:30px;letter-spacing:.3em;font-weight:800;color:#8FB0FF}
.pill{display:inline-block;padding:18px 34px;border-radius:99px;font-weight:800;font-size:40px}
</style></head><body>
<div class="abs" style="inset:0"><div class="grid"></div><div class="orb" id="o1" style="width:900px;height:900px;right:-380px;top:-300px;background:radial-gradient(circle at 35% 35%,#3D74FF,#1F5BFF 55%,#1244CC);box-shadow:0 0 200px rgba(31,91,255,.5)"></div><div class="orb" id="o2" style="width:600px;height:600px;left:-300px;bottom:-250px;border:10px solid #1F5BFF;opacity:.7"></div></div>

<div class="scene" id="A"><div class="abs" style="left:70px;right:150px;top:520px">
  <div class="big" id="a1" style="font-size:118px">TU VEUX<br>CRÉER DU<br>CONTENU<br><span class="blue">AVEC L'IA ?</span></div>
  <div class="big" id="a2" style="font-size:84px;margin-top:80px;color:#D7E2FF;line-height:1.08;font-weight:800">Sans y passer<br>toutes tes soirées ?</div></div></div>

<div class="scene" id="B">
  <div class="abs" id="bcard" style="left:230px;top:300px;width:560px"><div class="card"><img src="${img.cover}"></div></div>
  <div class="abs" style="left:70px;right:150px;top:1210px;text-align:center">
    <div class="kick" id="b1">LE GUIDE COMPLET</div>
    <div class="big" id="b2" style="font-size:112px;margin-top:26px">AI CONTENT<br><span class="blue">CREATOR</span></div>
    <div id="b3" style="font-size:42px;color:#BFD0FF;margin-top:36px;font-weight:600">Créer du contenu court avec l'IA<br>TikTok · Reels · Shorts</div></div></div>

<div class="scene" id="C">${feats.map(([n, a, b, k], i) => `
  <div class="feat abs" id="f${i}" style="inset:0">
    <div class="abs" style="left:70px;right:150px;top:210px">
      <div class="big out" style="font-size:300px;line-height:.9">${n}</div>
      <div class="big" style="font-size:78px;margin-top:6px">${a}</div>
      <div style="font-size:42px;color:#BFD0FF;margin-top:14px;font-weight:500">${b}</div></div>
    <div class="abs card" style="left:130px;top:870px;width:760px;height:760px"><img src="${img[k]}" style="width:760px"></div>
  </div>`).join("")}</div>

<div class="scene" id="D"><div class="abs" style="left:70px;right:150px;top:430px">
  <div class="kick">POUR QUI ?</div>
  <div class="big" id="d0" style="font-size:96px;margin-top:30px">Pensé pour<br><span class="blue">les débutants</span></div>
  ${["Créateurs de contenu", "Freelances", "Petites entreprises", "Entrepreneurs"].map((t, i) => `<div class="abs" id="d${i + 1}" style="left:0;top:${330 + i * 150}px;width:850px"><div style="display:flex;align-items:center;gap:30px;padding:30px 38px;border-radius:30px;background:rgba(255,255,255,.07);border:2px solid rgba(255,255,255,.14)"><span style="width:64px;height:64px;border-radius:50%;background:#1F5BFF;display:grid;place-items:center;font-size:40px;font-weight:900">✓</span><span style="font-size:54px;font-weight:800">${t}</span></div></div>`).join("")}</div></div>

<div class="scene" id="E"><div class="abs" style="left:70px;right:150px;top:560px">
  <div class="big" id="e1" style="font-size:112px">AUCUNE<br>PROMESSE<br><span class="blue">MAGIQUE.</span></div>
  <div id="e2" style="font-size:56px;color:#D7E2FF;margin-top:70px;line-height:1.3;font-weight:600">Juste une méthode claire pour planifier, écrire et publier.</div>
  <div id="e3" style="font-size:36px;color:#8FB0FF;margin-top:50px;font-weight:600">Les résultats dépendent de ton travail,<br>de ta niche et de ta régularité.</div></div></div>

<div class="scene" id="F">
  <div class="abs card" id="fcard" style="left:340px;top:250px;width:400px"><img src="${img.cover}"></div>
  <div class="abs" style="left:0;right:100px;top:960px;text-align:center">
    <div class="big" id="c1" style="font-size:104px">AI CONTENT<br><span class="blue">CREATOR</span></div>
    <div id="c2" style="font-size:46px;color:#D7E2FF;margin-top:34px;font-weight:600">Guide PDF · 92 pages</div>
    <div id="c3" class="pill" style="margin-top:70px;background:linear-gradient(90deg,#1F5BFF,#3D74FF);font-size:68px;padding:40px 80px;box-shadow:0 0 110px rgba(31,91,255,.8)">LIEN EN BIO ↑</div></div></div>
<div class="abs" id="flash" style="inset:0;background:#fff;opacity:0"></div>
<script>
const $=id=>document.getElementById(id), cl=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)), seg=(t,s,d)=>cl((t-s)/d);
const oc=x=>1-Math.pow(1-x,3), ob=x=>{const c=1.70158;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)}, io=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
function pop(el,t,s,d=.4,y=60){const p=seg(t,s,d);el.style.opacity=oc(cl(p*2));el.style.transform='translateY('+(1-ob(p))*y+'px)';}
const T={A:[0,3.6],B:[3.6,6.8],C:[6.8,15.6],D:[15.6,19.2],E:[19.2,22.0],F:[22.0,24.1]};
function render(t){
  $('o1').style.transform='translate('+Math.sin(t*.5)*40+'px,'+Math.cos(t*.4)*30+'px)';
  $('o2').style.transform='translate('+Math.cos(t*.45)*30+'px,'+Math.sin(t*.35)*40+'px)';
  for(const k in T){const [s,e]=T[k];const on=t>=s&&t<e;const el=$(k);el.style.opacity=on?cl(Math.min((t-s)/.2,(e-t)/.2,1)):0;}
  pop($('a1'),t,0.1,.5,80); pop($('a2'),t,1.9,.5,60);
  const p=seg(t,3.6,.7); $('bcard').style.transform='translateY('+(1-oc(p))*260+'px) rotate('+(-6+6*oc(p))+'deg) scale('+(0.9+0.1*oc(p))+')';
  pop($('b1'),t,4.2,.4,40); pop($('b2'),t,4.5,.5,70); pop($('b3'),t,5.4,.5,40);
  const per=1.76;
  for(let i=0;i<5;i++){const f=$('f'+i),s=6.8+i*per,e=s+per,on=t>=s&&t<e;f.style.display=on?'block':'none';
    if(on){const pin=oc(seg(t,s,.35)),pout=io(seg(t,e-.22,.22));f.style.opacity=1-pout;f.style.transform='translateX('+((1-pin)*900-pout*900)+'px)';}}
  pop($('d0'),t,15.8,.5,60); for(let i=1;i<=4;i++) pop($('d'+i),t,16.7+(i-1)*.55,.4,50);
  pop($('e1'),t,19.4,.5,80); pop($('e2'),t,20.3,.5,50); pop($('e3'),t,21.0,.5,30);
  const q=seg(t,22.0,.6);$('fcard').style.transform='scale('+(0.8+0.2*ob(q))+')';$('fcard').style.opacity=cl(q*3);
  pop($('c1'),t,22.4,.5,60); pop($('c2'),t,23.0,.4,40); pop($('c3'),t,23.3,.45,60);
  let fl=0;for(const c of [3.6,15.6,22.0]) if(t>=c&&t<c+.2) fl=Math.max(fl,(1-(t-c)/.2)*.25);$('flash').style.opacity=fl;
}
window.render=render;render(0);
</script></body></html>`;

rmSync(join(dir), { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
const opts = { args: ["--no-sandbox"] };
const b = process.env.PLAYWRIGHT_CHROMIUM_PATH ? await chromium.launch({ ...opts, executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }) : await chromium.launch(opts).catch(() => chromium.launch({ ...opts, executablePath: "/opt/pw-browsers/chromium" }));
const pg = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await pg.setContent(html, { waitUntil: "load" });
for (let f = 0; f < FPS * DUR; f++) {
  if (only && !only.includes(f)) continue;
  await pg.evaluate((t) => window.render(t), f / FPS);
  await pg.screenshot({ path: `${dir}/${String(f).padStart(4, "0")}.jpg`, type: "jpeg", quality: 90 });
}
await b.close();
console.log("frames done");
