# AI CONTENT CREATOR — projet d'ebook

*The Ultimate Guide to Creating Viral Social Media Content with AI* — guide pratique en français (92 pages, A4).

## Livrables (dossier `dist/`)

| Fichier | Contenu |
|---|---|
| `AI-Content-Creator-Ebook.pdf` | L'ebook complet : couverture, mentions légales, sommaire cliquable avec numéros de page, 15 chapitres, bonus et conclusion |
| `Calendrier-30-jours.pdf` / `.csv` | Calendrier de 30 jours (le CSV s'importe dans Notion, Excel, Google Sheets) |
| `Bibliotheque-de-prompts.pdf` / `.txt` | 47 prompts (20 par niche + 27 généraux), le `.txt` est fait pour le copier-coller |
| `ebook-source.html` | Version HTML/CSS éditable et imprimable de l'ebook |

## Structure du projet

```
ai-content-creator-ebook/
├─ book.config.json          Titre, sous-titre, édition, titulaire des droits
├─ content/
│  ├─ chapters/              Un fichier Markdown par chapitre (00 à 16)
│  └─ data/                  hooks.json · scripts.json · calendar.json · prompts-niches.json · prompts-library.json
├─ build/
│  ├─ build.mjs              Génère tous les livrables
│  ├─ styles.mjs             Charte graphique (CSS)
│  ├─ diagrams.mjs           Schémas SVG
│  └─ check.mjs              Vérifications automatiques
└─ dist/                     Fichiers générés
```

## Régénérer l'ebook

Prérequis : Node.js 20+, `poppler-utils` (commande `pdftotext`, utilisée pour numéroter le sommaire) et, pour les vérifications, Python 3 avec `pypdf`.

```bash
npm install
npx playwright install chromium     # une seule fois
npm run build                       # génère dist/
npm run check                       # vérifie les livrables
```

Si Chromium est installé ailleurs : `PLAYWRIGHT_CHROMIUM_PATH=/chemin/vers/chrome npm run build`.
La police **Inter** doit être installée sur la machine qui génère le PDF (sinon une police de secours est utilisée). Elle est ensuite incorporée au PDF.

## Modifier le contenu

- **Un chapitre** : éditez le fichier Markdown dans `content/chapters/`. Le premier titre `#` devient le titre du chapitre, les titres `##` alimentent l'ouverture du chapitre.
- **Encadrés** : une citation Markdown (`>`) qui commence par `**Astuce.**`, `**Attention.**`, `**Exercice.**`, `**À retenir.**`, `**Exemple.**` ou `**Note.**` prend le style correspondant.
- **Prompts** : un bloc de code ```` ```prompt ```` est mis en forme comme un prompt à copier. Les variables s'écrivent `[EN MAJUSCULES]`.
- **Schémas** : `{{diagram:cycle}}`, `{{diagram:piliers}}`, `{{diagram:workflow}}`, `{{diagram:retention}}` (définis dans `build/diagrams.mjs`).
- **Données** : `{{data:hooks}}`, `{{data:scripts}}`, `{{data:calendar}}`, `{{data:niche-prompts}}`, `{{data:library}}` insèrent le contenu des fichiers JSON de `content/data/`. Modifiez les JSON : ils alimentent aussi le calendrier et la bibliothèque de prompts séparés.
- **Nom du titulaire des droits** : renseignez `titulaire` dans `book.config.json` (il apparaît sur la page de copyright). Laissé vide, aucun nom n'est affiché.
- **Couleurs et mise en page** : `build/styles.mjs` (variables `--navy`, `--blue`, etc.).

Après toute modification : `npm run build && npm run check`. Le sommaire et ses numéros de page sont recalculés automatiquement.

## Ce que `npm run check` vérifie

Présence des 6 fichiers livrés, format A4, 17 ouvertures de chapitre, aucune page vide, 50 hooks, 30 scripts complets, calendrier de 30 jours, 20 + 27 prompts, absence de textes de remplissage, numéros du sommaire identiques aux pages réelles, polices incorporées, 17 liens internes cliquables et signets PDF.

## Impression et vente

- Format A4, marges de 20 mm, couleurs RVB, sans fond perdu ni traits de coupe : adapté à la lecture sur écran et à l'impression à domicile. Pour un imprimeur professionnel, prévoir une conversion CMJN et des fonds perdus.
- Avant de vendre : faites relire le texte par une personne francophone, **vérifiez les informations sur les outils et les règles des plateformes** (elles changent), et renseignez le titulaire des droits.
- Le guide ne promet aucun résultat. Ne l'accompagnez pas, dans votre page de vente, de promesses de viralité ou de revenus.

## Notes de relecture

Le texte a été passé au correcteur orthographique Hunspell (dictionnaire français) : seuls les termes anglais volontaires (hook, faceless, workflow, TikTok…) ne sont pas reconnus. Aucun outil de correction grammaticale n'a été utilisé : une relecture humaine reste recommandée.
