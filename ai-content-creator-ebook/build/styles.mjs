export const CSS = `
@page { size: A4; margin: 24mm 20mm 24mm;
  @bottom-left  { content: "AI CONTENT CREATOR"; font: 600 7.5pt Inter, Arial, sans-serif; letter-spacing: .14em; color: #7B859B; }
  @bottom-right { content: counter(page); font: 700 9pt Inter, Arial, sans-serif; color: #0B1530; }
}
@page full { margin: 0; @bottom-left { content: none } @bottom-right { content: none } }
:root { --navy:#0B1530; --blue:#1F5BFF; --soft:#EAF0FF; --line:#D5DCEB; --grey:#5B6478; --ink:#111827; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin:0; font-family: Inter, 'Helvetica Neue', Arial, sans-serif; font-size: 10.4pt; line-height: 1.62; color: var(--ink); }
p { margin: 0 0 3.4mm; orphans: 3; widows: 3; }
a { color: inherit; text-decoration: none; }
strong { color: #000; }

/* full-bleed pages */
.full { page: full; width: 210mm; height: 297mm; position: relative; overflow: hidden; break-after: page; }
.cover { background: var(--navy); color: #fff; }
.cover .grid { position:absolute; inset:0; background-image: linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px); background-size: 14mm 14mm; }
.cover .arc { position:absolute; right:-70mm; top:-50mm; width:190mm; height:190mm; border-radius:50%; border:1.2mm solid var(--blue); opacity:.9; }
.cover .arc2 { position:absolute; right:-40mm; top:-20mm; width:130mm; height:130mm; border-radius:50%; background: radial-gradient(circle at 35% 35%, #3D74FF, var(--blue) 55%, #1244CC); box-shadow: 0 0 40mm rgba(31,91,255,.55); }
.cover .inner { position:absolute; left:22mm; right:22mm; bottom:34mm; }
.cover .kicker { font-size: 9pt; letter-spacing:.32em; font-weight:700; color:#8FB0FF; margin-bottom: 8mm; }
.cover h1 { font-size: 54pt; line-height: .98; font-weight: 900; letter-spacing:-.03em; margin:0; border:0; padding:0; color:#fff; }
.cover h1 span { color:#5C8DFF; }
.cover .sub { font-size: 15pt; font-weight:500; color:#D7E2FF; margin-top: 9mm; line-height:1.35; max-width: 150mm; }
.cover .rule { width: 26mm; height: 1.6mm; background: var(--blue); margin: 10mm 0 8mm; }
.cover .tag { font-size: 10.5pt; color:#A9BBE6; max-width: 135mm; line-height:1.55; }
.cover .ed { position:absolute; left:22mm; top:22mm; font-size:8.5pt; letter-spacing:.24em; font-weight:700; color:#8FB0FF; }

/* running pages */
.page { page: auto; }
.title-page { break-after: page; min-height: 240mm; display:flex; flex-direction:column; justify-content:center; text-align:left; }
.title-page .k { font-size: 9pt; letter-spacing:.3em; font-weight:700; color: var(--blue); }
.title-page h1 { font-size: 40pt; line-height: 1; font-weight:900; letter-spacing:-.03em; margin: 6mm 0 4mm; color: var(--navy); border:0; padding:0; }
.title-page .s { font-size: 14pt; color: var(--grey); max-width:140mm; line-height:1.4; }
.title-page .bar { width: 22mm; height: 1.4mm; background: var(--blue); margin: 10mm 0; }
.legal-page { break-after: page; font-size: 9pt; color: #374151; line-height:1.6; }
.legal-page h2 { font-size: 12pt; color: var(--navy); margin: 0 0 3mm; letter-spacing:0; }
.legal-page h2 + * { margin-top:0 }
.legal-page .sp { height: 8mm }

/* TOC */
.toc h1 { font-size: 30pt; color: var(--navy); border:0; padding:0; margin: 0 0 3mm; font-weight:900; letter-spacing:-.02em; }
.toc .bar { width: 22mm; height: 1.4mm; background: var(--blue); margin-bottom: 9mm; }
.toc ol { list-style:none; margin:0; padding:0; }
.toc li { border-bottom: .2mm solid var(--line); }
.toc li a.row { display:flex; align-items:baseline; gap: 4mm; padding: 2.1mm 0; }
.toc li .n { width: 9mm; font-weight:800; color: var(--blue); font-size: 10pt; }
.toc li .t { flex:1; font-weight:600; color: var(--navy); font-size: 10.6pt; }
.toc li .p { font-weight:700; color: var(--navy); font-variant-numeric: tabular-nums; }
.toc .sub { font-size: 8.8pt; color: var(--grey); margin-left: 13mm; padding: 0; }
.toc li.sec { border:0; padding-top:5mm; }
.toc li.sec .t { font-size: 8.5pt; letter-spacing:.2em; color: var(--grey); text-transform:uppercase; }

/* chapter opener */
.opener { background: var(--navy); color:#fff; }
.opener .grid { position:absolute; inset:0; background-image: linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px); background-size: 14mm 14mm; }
.opener .num { position:absolute; left:20mm; top:40mm; font-size: 150pt; font-weight: 900; line-height: 1; color: transparent; -webkit-text-stroke: .45mm #3D74FF; letter-spacing:-.04em; }
.opener .circle { position:absolute; right:-40mm; bottom:-40mm; width: 120mm; height: 120mm; border-radius:50%; background: var(--blue); opacity:.9; }
.opener .circle2 { position:absolute; right: 10mm; bottom: 10mm; width: 50mm; height: 50mm; border-radius:50%; border:.8mm solid rgba(255,255,255,.5); }
.opener .body { position:absolute; left:20mm; right:30mm; top: 118mm; }
.opener .lab { font-size: 9pt; letter-spacing:.3em; font-weight:700; color:#8FB0FF; margin-bottom: 5mm; }
.opener h1 { font-size: 30pt; line-height:1.08; font-weight:900; letter-spacing:-.02em; margin:0; border:0; padding:0; color:#fff; }
.opener .rule { width: 22mm; height: 1.4mm; background: var(--blue); margin: 9mm 0 7mm; }
.opener ul { list-style:none; margin:0; padding:0; font-size: 10.5pt; color:#CCD9FF; line-height:1.9; }
.opener ul li::before { content:"—  "; color:#5C8DFF; }
.opener .in { font-size: 8.5pt; letter-spacing:.22em; font-weight:700; color:#8FB0FF; margin-bottom: 2.5mm; }

/* running content */
.chapter-body { break-before: auto; }
.chapter-body h2 { font-size: 16pt; line-height:1.2; font-weight:800; color: var(--navy); margin: 9mm 0 3.4mm; letter-spacing:-.01em; break-after: avoid; padding-left: 4mm; border-left: 1.2mm solid var(--blue); }
.chapter-body h3 { font-size: 12pt; font-weight:800; color: var(--blue); margin: 6mm 0 2.4mm; break-after: avoid; }
.chapter-body ul, .chapter-body ol { margin: 0 0 4mm; padding-left: 6mm; }
.chapter-body li { margin-bottom: 1.5mm; }
.chapter-body li::marker { color: var(--blue); font-weight:700; }
.chapter-body table { width:100%; border-collapse: collapse; margin: 3mm 0 6mm; font-size: 9.2pt; line-height:1.45; }
.chapter-body th { background: var(--navy); color:#fff; text-align:left; font-weight:700; padding: 2.4mm 3mm; font-size: 8.8pt; }
.chapter-body td { padding: 2.3mm 3mm; border-bottom: .25mm solid var(--line); vertical-align: top; }
.chapter-body tr:nth-child(even) td { background: #F7F9FD; }
.chapter-body tr { break-inside: avoid; }
.chapter-body td:empty { height: 8.5mm; }
.chapter-body hr { border:0; border-top:.3mm solid var(--line); margin: 6mm 0; }

blockquote { margin: 4mm 0 5mm; padding: 3.4mm 5mm; border-radius: 2mm; background: var(--soft); border-left: 1.4mm solid var(--blue); break-inside: avoid; }
blockquote p:last-child { margin-bottom:0 }
blockquote.attention { background:#FFF4E5; border-left-color:#F59E0B; }
blockquote.exercice { background: var(--navy); color:#fff; border-left-color: #5C8DFF; }
blockquote.exercice strong { color: #8FB0FF; }
blockquote.retenir { background:#F2F5FB; border-left-color: var(--navy); }

.prompt { margin: 4mm 0 6mm; border: .35mm solid var(--blue); border-radius: 2mm; overflow:hidden; break-inside: avoid; }
.prompt .lab { background: var(--blue); color:#fff; font-size: 7.6pt; letter-spacing:.2em; font-weight:800; padding: 1.6mm 4mm; }
.prompt pre { margin:0; padding: 3.6mm 4.4mm; white-space: pre-wrap; word-wrap: break-word; font: 400 8.9pt/1.55 'DejaVu Sans Mono', 'Courier New', monospace; background:#F5F8FF; color:#111827; }
.prompt.long { break-inside: auto; }

figure.diagram { margin: 5mm 0 6mm; text-align:center; break-inside: avoid; }
figure.diagram svg { width:100%; height:auto; }
figure.diagram figcaption { font-size: 8.4pt; color: var(--grey); margin-top: 1.6mm; font-style: italic; }

/* data blocks */
.niche-h { font-size: 11pt; font-weight:800; color: var(--navy); margin: 6mm 0 1.6mm; break-after: avoid; }
.hooks td:first-child { width: 9mm; font-weight:800; color: var(--blue); }
.hooks td:nth-child(2) { width: 27mm; font-size: 8.4pt; text-transform: uppercase; letter-spacing:.06em; color: var(--grey); font-weight:700; }
.hooks td:nth-child(3) { font-weight:500; }
.script { border: .35mm solid var(--line); border-radius: 2.4mm; margin: 0 0 6mm; break-inside: avoid; overflow:hidden; }
.script .hd { background: var(--navy); color:#fff; padding: 3mm 4.4mm; display:flex; justify-content:space-between; gap:4mm; align-items:baseline; }
.script .hd b { font-size: 10.4pt; } .script .hd span { font-size: 8pt; letter-spacing:.1em; color:#9DB7FF; font-weight:700; text-transform:uppercase; white-space:nowrap; }
.script .meta { padding: 2mm 4.4mm; font-size: 8.4pt; color: var(--grey); background: var(--soft); }
.script .hook { padding: 2.6mm 4.4mm 0; font-weight:700; color: var(--navy); }
.script .hook i { font-style: normal; color: var(--blue); font-size: 8pt; letter-spacing:.14em; margin-right: 2mm; }
.script table { margin: 2mm 0 0 !important; font-size: 8.8pt !important; }
.script .cta { padding: 2.2mm 4.4mm 3mm; font-weight:700; color: var(--navy); border-top: .25mm solid var(--line); }
.script .cta i { font-style: normal; color: var(--blue); font-size: 8pt; letter-spacing:.14em; margin-right: 2mm; }
.week { font-size: 11pt; font-weight:800; color: var(--blue); margin: 6mm 0 1.6mm; break-after: avoid; }
.cal td:first-child { width: 34mm; } .cal .d { font-weight:900; color: var(--blue); font-size: 12pt; line-height:1; }
.cal .p { font-size: 7.8pt; text-transform: uppercase; letter-spacing:.07em; color: var(--grey); font-weight:700; margin-top: 1mm; line-height:1.3 }
.cal .h { font-style: italic; color: var(--navy); }
.pcard { border: .35mm solid var(--line); border-radius: 2mm; margin: 0 0 5mm; break-inside: avoid; overflow:hidden; }
.pcard .hd { padding: 2.4mm 4mm; background: var(--soft); display:flex; justify-content: space-between; gap: 4mm; }
.pcard .hd b { color: var(--navy); } .pcard .hd span { font-size: 8pt; letter-spacing:.1em; text-transform:uppercase; color: var(--blue); font-weight:800; }
.pcard pre { margin:0; padding: 3.2mm 4mm; white-space: pre-wrap; font: 400 8.8pt/1.55 'DejaVu Sans Mono', monospace; background:#fff; }
.pcard .tip { padding: 0 4mm 2.6mm; font-size: 8.6pt; color: var(--grey); }
.catlab { font-size: 13pt; font-weight:800; color: var(--navy); margin: 7mm 0 3mm; padding-bottom: 1.5mm; border-bottom: .5mm solid var(--blue); break-after: avoid; }

/* standalone documents */
.doc-head { padding: 0 0 6mm; border-bottom: 1.2mm solid var(--blue); margin-bottom: 6mm; }
.doc-head .k { font-size: 8.5pt; letter-spacing:.3em; font-weight:700; color: var(--blue); }
.doc-head h1 { font-size: 26pt; margin: 3mm 0 2mm; color: var(--navy); font-weight:900; letter-spacing:-.02em; border:0; padding:0; }
.doc-head p { color: var(--grey); margin:0; }
`;
