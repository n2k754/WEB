/**
 * Renders the 20 s vertical promo (1080x1920, 30 fps) frame by frame from real kit visuals,
 * cuts synced to the 120 BPM beat (1 beat = 0.5 s). Usage: npx tsx promo/build-promo.ts <frames-dir>
 */
import { mkdirSync, rmSync } from "node:fs";
import { launchBrowser } from "../scripts/lib/browser";
import { getTemplates } from "../src/content/templates";

const FPS = 30, DUR = 20;
const T = getTemplates();
const tpl = (id: string, scope: string) => T.find((x) => x.id === id)!.svg.replaceAll(`${id}-`, `${scope}-${id}-`).replace(/ width="\d+" height="\d+"/, ' width="100%" height="100%"');
const card = (id: string, scope: string, w: number, extra = "") => {
  const t = T.find((x) => x.id === id)!;
  return `<div class="tcard" style="width:${w}px;aspect-ratio:${t.width}/${t.height};${extra}">${tpl(id, scope)}</div>`;
};
const col = (ids: string[], scope: string) => ids.concat(ids).map((id, i) => card(id, `${scope}${i}`, 400, "margin-bottom:28px")).join("");

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}body{width:1080px;height:1920px;overflow:hidden;background:#09090F;color:#fff;font-family:Inter,Arial,sans-serif;position:relative}
.abs{position:absolute}.glow{position:absolute;border-radius:50%;filter:blur(140px)}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:90px 90px}
.grad{background:linear-gradient(90deg,#C4B5FD,#818CF8 60%,#A78BFA);-webkit-background-clip:text;color:transparent}
.big{font-weight:900;letter-spacing:-.03em;line-height:1.0}
.tcard{border-radius:28px;overflow:hidden;border:2px solid rgba(255,255,255,.2);box-shadow:0 30px 80px rgba(0,0,0,.6);flex:none}
.scene{position:absolute;inset:0;opacity:0}
.center{position:absolute;left:60px;right:140px;text-align:left}
.pill{background:rgba(9,9,15,.88);display:inline-block;padding:14px 28px;border:2px solid rgba(196,181,253,.5);border-radius:99px;font-size:30px;font-weight:700;letter-spacing:.14em;color:#DDD6FE}
.panel{background:rgba(255,255,255,.06);border:2px solid rgba(255,255,255,.14);border-radius:36px;backdrop-filter:blur(8px)}
</style></head><body>
<div class="abs" style="inset:0" id="bg"><div class="grid"></div><div class="glow" id="g1" style="width:900px;height:900px;background:rgba(139,92,246,.5);left:-300px;top:-200px"></div><div class="glow" id="g2" style="width:800px;height:800px;background:rgba(99,102,241,.4);right:-300px;bottom:-100px"></div></div>

<!-- A: hook -->
<div class="scene" id="A">
  <div class="center" style="top:560px">
    <div class="big" id="a1" style="font-size:150px">STOP<br>SCROLLING.</div>
    <div class="big" id="a2" style="font-size:78px;margin-top:70px;color:#D4D4E8;font-weight:800">Want to launch your</div>
    <div class="big grad" id="a3" style="font-size:132px;margin-top:10px">DIGITAL<br>BUSINESS?</div>
  </div>
</div>
<!-- B: logo -->
<div class="scene" id="B">
  <div class="abs" style="left:0;right:100px;top:480px;text-align:center">
    <div id="b0" style="width:210px;height:210px;margin:0 auto;border-radius:56px;background:linear-gradient(135deg,#8B5CF6,#6366F1);box-shadow:0 0 140px rgba(139,92,246,.8);display:grid;place-items:center"><svg viewBox="0 0 24 24" width="110" height="110" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.6 5.6L21 10l-4.6 4.2L17.6 21 12 17.8 6.4 21l1.2-6.8L3 10l6.4-1.4z"/></svg></div>
    <div class="big" id="b1" style="font-size:104px;margin-top:70px;letter-spacing:.02em">CREATOR<br>STARTER<br><span class="grad">KIT</span></div>
    <div id="b2" style="font-size:44px;color:#B4B4CC;margin-top:50px;line-height:1.35;font-weight:500">Everything you need.<br>One download.</div>
  </div>
</div>
<!-- C: features -->
<div class="scene" id="C">
${[
  ["50", "ORIGINAL TEMPLATES", "Posts, stories, promos, launches, quotes", `<div style="position:relative;height:760px;width:820px">${card("csk-11", "f1", 310, "position:absolute;left:0;top:70px;transform:rotate(-7deg)")}${card("csk-01", "f1", 340, "position:absolute;left:230px;top:0;transform:rotate(2deg);z-index:2")}${card("csk-31", "f1", 320, "position:absolute;left:480px;top:90px;transform:rotate(8deg)")}</div>`],
  ["30", "TIKTOK VIDEO IDEAS", "Hook · structure · CTA · audience", `<div class="panel" style="width:820px;padding:50px"><div style="font-size:28px;letter-spacing:.16em;color:#C4B5FD;font-weight:800">IDEA #01 · OPENING HOOK</div><div style="font-size:60px;font-weight:800;line-height:1.15;margin-top:26px">“I almost wasted a month on a product nobody wanted.”</div><div style="margin-top:40px;font-size:34px;color:#B4B4CC;line-height:1.5">① Hook ② 3 questions ③ Wrap-up ④ CTA</div></div>`],
  ["5", "NOTION DATABASES", "Calendar · ideas · tracker · plan · stats", `<div style="display:flex;gap:18px;width:820px">${[["Idea", "Hook styles that earn attention"], ["Drafting", "My weekly planning routine"], ["Ready", "Launch week announcement"]].map(([c, x]) => `<div class="panel" style="flex:1;padding:22px;border-radius:28px"><div style="font-size:26px;font-weight:800;color:#D4D4E8">${c}</div><div style="margin-top:20px;padding:20px;border-radius:18px;background:rgba(255,255,255,.08);font-size:27px;font-weight:600;line-height:1.25">${x}<div style="margin-top:12px;font-size:20px;color:#C4B5FD">Instagram · Educate</div></div></div>`).join("")}</div>`],
  ["8", "CHAPTER BUSINESS GUIDE", "From first idea to first product", `<div style="width:640px;background:#fff;color:#27272A;border-radius:22px;padding:56px;box-shadow:0 40px 100px rgba(0,0,0,.7);transform:rotate(-3deg)"><div style="font-size:22px;font-weight:900;letter-spacing:.2em;color:#7C3AED">CHAPTER 1</div><div style="font-size:54px;font-weight:900;line-height:1.08;margin-top:16px">Finding a digital product idea</div><div style="height:6px;width:80px;background:#8B5CF6;margin:28px 0"></div><div style="font-size:30px;line-height:1.5">Start with problems, not products. Ask: whose problem can I help solve?</div></div>`],
  ["20", "READY-TO-USE AI PROMPTS", "Business · branding · social · support", `<div class="panel" style="width:820px;padding:44px;background:rgba(0,0,0,.45)"><div style="font-size:26px;font-weight:800;letter-spacing:.14em;color:#C4B5FD">PROMPT · BUSINESS IDEAS</div><div id="typed" style="font-family:'DejaVu Sans Mono',monospace;font-size:33px;line-height:1.5;color:#E4E4F0;margin-top:26px;min-height:420px"></div></div>`],
].map(([n, label, sub, vis], i) => `<div class="feat" id="f${i}" style="position:absolute;inset:0"><div class="abs" style="left:60px;top:230px;right:140px"><div class="big grad" style="font-size:330px;line-height:.9">${n}</div><div class="big" style="font-size:70px;margin-top:6px">${label}</div><div style="font-size:38px;color:#B4B4CC;margin-top:16px;font-weight:500">${sub}</div></div><div class="abs" style="left:60px;top:860px">${vis}</div></div>`).join("")}
</div>
<!-- D: scrolling templates -->
<div class="scene" id="D">
  <div class="abs" id="cA" style="left:60px;top:0;width:400px">${col(["csk-01", "csk-12", "csk-21", "csk-29", "csk-38", "csk-45"], "ca")}</div>
  <div class="abs" id="cB" style="left:490px;top:0;width:400px">${col(["csk-31", "csk-02", "csk-33", "csk-11", "csk-41", "csk-04"], "cb")}</div>
  <div class="abs" style="inset:0;background:linear-gradient(180deg,#09090F 0,#09090F 24%,rgba(9,9,15,.0) 36%,rgba(9,9,15,.0) 62%,rgba(9,9,15,.95) 72%,#09090F 100%)"></div>
  <div class="abs" style="left:60px;right:140px;top:210px"><div class="big" style="font-size:112px">INSTANT<br><span class="grad">DOWNLOAD</span></div></div>
  <div class="abs" style="left:60px;right:140px;top:1290px"><span class="pill" id="dpill">PDF · SVG · PNG · NOTION · TXT</span></div>
</div>
<!-- E: CTA -->
<div class="scene" id="E">
  <div class="abs" style="left:0;right:100px;top:330px;text-align:center">
    <div id="e1" style="font-size:42px;letter-spacing:.22em;color:#C4B5FD;font-weight:800">THE COMPLETE KIT</div>
    <div class="big grad" id="e2" style="font-size:240px;margin-top:40px">€14.99</div>
    <div id="e3" style="font-size:50px;color:#D4D4E8;margin-top:34px;font-weight:600;line-height:1.3">50 templates · 30 ideas<br>Notion · guide · 20 prompts</div>
    <div id="e4" style="display:inline-block;margin-top:90px;padding:44px 80px;border-radius:99px;background:linear-gradient(90deg,#8B5CF6,#6366F1);font-size:70px;font-weight:900;letter-spacing:.02em;box-shadow:0 0 120px rgba(139,92,246,.8)">LINK IN BIO ↑</div>
    <div id="e5" style="font-size:36px;color:#8A8AA6;margin-top:60px;letter-spacing:.2em;font-weight:700">CREATOR STARTER KIT</div>
  </div>
</div>
<div class="abs" id="flash" style="inset:0;background:#fff;opacity:0"></div>
<script>
const $=id=>document.getElementById(id);
const cl=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const seg=(t,s,d)=>cl((t-s)/d);
const oc=x=>1-Math.pow(1-x,3), ob=x=>{const c=1.70158;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)}, io=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
const BEAT=0.5;
const prompt="Act as a practical business coach for beginners. I have these skills: [YOUR SKILLS]. Suggest 10 small digital product ideas, with the audience, the problem solved and the main risk for each…";
function pop(el,t,s,d=.35,fromY=60){const p=seg(t,s,d);el.style.opacity=oc(cl(p*2));el.style.transform='translateY('+(1-ob(p))*fromY+'px) scale('+(0.8+0.2*ob(p))+')';}
function render(t){
  const ph=(t%BEAT)/BEAT, pulse=Math.exp(-ph*5);
  $('g1').style.transform='translate('+Math.sin(t*.5)*80+'px,'+Math.cos(t*.4)*60+'px) scale('+(1+.08*pulse)+')';
  $('g2').style.transform='translate('+Math.cos(t*.45)*70+'px,'+Math.sin(t*.35)*80+'px) scale('+(1+.06*pulse)+')';
  const sh=(el,a)=>{el.style.transform='translate('+(Math.sin(t*90)*a)+'px,'+(Math.cos(t*77)*a)+'px)'};
  // A 0-4
  const A=$('A'); A.style.opacity=t<4.0?1:0;
  if(t<4.2){
    pop($('a1'),t,0.0,.4,90); pop($('a2'),t,1.0,.35,50); pop($('a3'),t,2.0,.45,90);
    const build=cl((t-2)/2); if(t>3) sh($('A'),build*6); else A.style.transform='';
  }
  // B 4-6
  const B=$('B'); const bo=t>=4&&t<6.0; B.style.opacity=bo?1:0;
  if(bo){const p=seg(t,4,.5); $('b0').style.transform='scale('+ob(p)+') rotate('+(1-p)*-40+'deg)'; pop($('b1'),t,4.25,.4,80); pop($('b2'),t,5.0,.4,50); B.style.transform='translateY('+(-1*io(seg(t,5.8,.2))*300)+'px)'; B.style.opacity=bo?1-seg(t,5.8,.2):0;}
  // C 6-14, five features 1.6s each (beat aligned 6,7.5? use 1.6 -> use exact: 6,7.6,9.2,10.8,12.4 -> ends 14.0)
  const C=$('C'); C.style.opacity=(t>=6&&t<14.05)?1:0;
  for(let i=0;i<5;i++){
    const f=$('f'+i), s=6+i*1.6, e=s+1.6, on=t>=s&&t<e; f.style.display=on?'block':'none';
    if(on){const pin=oc(seg(t,s,.28)), pout=io(seg(t,e-.2,.2)); f.style.opacity=1-pout; f.style.transform='translateX('+((1-pin)*900-pout*900)+'px)';
      if(i===4){const n=Math.floor(cl((t-s-.25)/1.0)*prompt.length); $('typed').textContent=prompt.slice(0,n)+(Math.floor(t*4)%2?'▌':'');}}
  }
  // D 14-17 scroll
  const D=$('D'); const don=t>=14&&t<17.05; D.style.opacity=don?(seg(t,14,.15)):0;
  if(don){const y=(t-14)*520; $('cA').style.transform='translateY('+(-y-200)+'px)'; $('cB').style.transform='translateY('+(y-2900)+'px)'; $('dpill').style.transform='scale('+(1+.05*pulse)+')';}
  // E 17-20
  const E=$('E'); const eon=t>=17; E.style.opacity=eon?1:0;
  if(eon){pop($('e1'),t,17.0,.3,40); const p=seg(t,17.2,.5); $('e2').style.transform='scale('+(0.4+0.6*ob(p))+')'; $('e2').style.opacity=cl(p*3); pop($('e3'),t,17.9,.4,40); pop($('e4'),t,18.5,.4,60);
    $('e4').style.transform+=' scale('+(1+.045*pulse)+')'; pop($('e5'),t,19.1,.4,20);}
  // flash on the drop & cut points
  let fl=0; for(const c of [4,6,14,17]) if(t>=c&&t<c+.25) fl=Math.max(fl,(1-(t-c)/.25)*(c===4?.9:.35));
  $('flash').style.opacity=fl;
}
window.render=render; render(0);
</script></body></html>`;

(async () => {
  const dir = process.argv[2];
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const b = await launchBrowser();
  const pg = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await pg.setContent(html, { waitUntil: "load" });
  const frames = FPS * DUR;
  const only = process.argv[3] ? process.argv[3].split(",").map(Number) : null;
  for (let f = 0; f < frames; f++) {
    if (only && !only.includes(f)) continue;
    await pg.evaluate((t) => (window as any).render(t), f / FPS);
    await pg.screenshot({ path: `${dir}/${String(f).padStart(4, "0")}.jpg`, type: "jpeg", quality: 90 });
    if (f % 100 === 0) console.log("frame", f);
  }
  await b.close();
})();
