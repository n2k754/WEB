// Inline SVG diagrams in the book palette. Text is real SVG text (selectable, crisp in PDF).
const NAVY = "#0B1530", BLUE = "#1F5BFF", LIGHT = "#EAF0FF", GREY = "#5B6478";
const wrap = (w, h, inner, caption) => `<figure class="diagram"><svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" font-family="Inter, Helvetica, Arial, sans-serif">${inner}</svg>${caption ? `<figcaption>${caption}</figcaption>` : ""}</figure>`;
const box = (x, y, w, h, t1, t2 = "", fill = LIGHT, tc = NAVY) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${fill}"/><text x="${x + w / 2}" y="${y + (t2 ? h / 2 - 3 : h / 2 + 5)}" text-anchor="middle" font-size="13" font-weight="700" fill="${tc}">${t1}</text>${t2 ? `<text x="${x + w / 2}" y="${y + h / 2 + 14}" text-anchor="middle" font-size="10.5" fill="${tc === "#fff" ? "#CFE0FF" : GREY}">${t2}</text>` : ""}`;
const arrow = (x1, y1, x2, y2) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${BLUE}" stroke-width="2" fill="none" marker-end="url(#a)"/>`;
const defs = `<defs><marker id="a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="${BLUE}"/></marker></defs>`;

export const diagrams = {
  cycle: () => wrap(640, 205, `${defs}
    ${box(10, 55, 120, 62, "Votre vidéo", "publiée")}
    ${arrow(132, 86, 168, 86)}
    ${box(170, 55, 130, 62, "Petit groupe", "de spectateurs")}
    ${arrow(302, 86, 338, 86)}
    ${box(340, 55, 130, 62, "Signaux", "visionnage · interactions")}
    ${arrow(472, 86, 508, 86)}
    ${box(510, 55, 120, 62, "Diffusion", "plus large… ou non", NAVY, "#fff")}
    <path d="M570 120 C570 160 70 160 70 122" stroke="${BLUE}" stroke-width="2" fill="none" stroke-dasharray="5 4" marker-end="url(#a)"/>
    <text x="320" y="190" text-anchor="middle" font-size="11" fill="${GREY}">Vos données : ce que vous apprenez pour la vidéo suivante</text>`,
    "Principe général simplifié. Le fonctionnement réel varie selon les plateformes et évolue."),
  piliers: () => wrap(640, 250, `${defs}
    <circle cx="320" cy="125" r="58" fill="${NAVY}"/><text x="320" y="121" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">Votre niche</text><text x="320" y="139" text-anchor="middle" font-size="10.5" fill="#CFE0FF">sujet · public · angle</text>
    ${box(30, 20, 190, 62, "Éducation", "tutoriels · erreurs · méthodes")}
    ${box(420, 20, 190, 62, "Coulisses", "journée · outils · processus")}
    ${box(30, 168, 190, 62, "Preuve", "démonstrations · avant/après")}
    ${box(420, 168, 190, 62, "Offre", "ce que vous proposez, honnêtement")}
    ${arrow(222, 66, 270, 100)}${arrow(418, 66, 372, 100)}${arrow(222, 186, 270, 150)}${arrow(418, 186, 372, 150)}`,
    "Quatre piliers de contenu autour d'une niche."),
  workflow: () => {
    const steps = ["Rassembler", "Contexte", "Trier", "Enrichir", "Angle", "Vérifier"];
    const sub = ["questions · vécu", "prompt précis", "3 questions", "exemple réel", "méthode · erreur…", "faits · sources"];
    const w = 98, g = 10;
    return wrap(660, 110, steps.map((s, i) => box(10 + i * (w + g), 25, w, 62, `${i + 1}. ${s}`, sub[i], i === 5 ? NAVY : LIGHT, i === 5 ? "#fff" : NAVY)).join(""), "Le workflow de recherche d'idées en six étapes.");
  },
  retention: () => wrap(640, 240, `
    <rect x="50" y="20" width="560" height="170" fill="#fff" stroke="#D5DCEB"/>
    <rect x="50" y="20" width="70" height="170" fill="${LIGHT}"/>
    <text x="85" y="38" text-anchor="middle" font-size="10" font-weight="700" fill="${BLUE}">HOOK</text>
    <path d="M50 30 C60 60 80 100 130 112 C200 126 300 128 380 140 C460 152 540 160 610 168" stroke="${BLUE}" stroke-width="3" fill="none"/>
    <path d="M50 30 C60 40 80 50 130 54 C230 60 340 66 420 70 C500 74 560 78 610 84" stroke="${NAVY}" stroke-width="3" fill="none" stroke-dasharray="6 4"/>
    <text x="620" y="88" font-size="10" fill="${NAVY}">Cible</text><text x="620" y="172" font-size="10" fill="${BLUE}">Risque</text>
    <text x="50" y="208" font-size="10" fill="${GREY}">0 s</text><text x="330" y="208" text-anchor="middle" font-size="10" fill="${GREY}">Temps de lecture</text><text x="610" y="208" text-anchor="end" font-size="10" fill="${GREY}">Fin</text>
    <text x="42" y="30" text-anchor="end" font-size="10" fill="${GREY}">100 %</text>
    <text x="320" y="232" text-anchor="middle" font-size="10" fill="${GREY}">Courbe illustrative : elle ne repose sur aucune donnée réelle. Votre outil statistique affiche la vôtre.</text>`,
    "Pourquoi les premières secondes comptent : la perte d'audience est généralement la plus forte au début."),
};
