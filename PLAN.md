# PLAN.md — Meshcore Drenthe Themawebsite

## Projectoverzicht

Een Nederlandstalige themawebsite voor het **Meshcore Drenthe** project van Hackerspace Drenthe. De site dient als centraal informatiepunt voor iedereen die betrokken is bij het opzetten van een decentraal mesh-communicatienetwerk in de provincie Drenthe.

**Doelgroepen:**
- Beginners (noobs) — wat is het, waarom doen we dit, hoe kan ik meedoen?
- Gevorderden — technische protocollen, configuratie, deployment

**Aanpak:** Geleidelijke opbouw van eenvoudig naar technisch, zodat iedereen op zijn eigen niveau kan instappen.

**Bron:** [Mei: Meshcore Maand bij Hackerspace Drenthe](https://www.hackerspace-drenthe.nl/2026/04/02/mei-meshcore-maand-bij-hackerspace-drenthe/) — blogpost door Rein, 2 april 2026. Dit is het referentie-artikel voor toon, inhoud en terminologie.

---

## Bronmateriaal & Toon

De blogpost van Hackerspace Drenthe is leidend voor de schrijfstijl:
- **Toegankelijke toon** — humor, beeldspraak ("estafette van walkietalkies"), geen onnodig jargon
- **Scenario-gedreven** — begin met het probleem ("stel je voor: het netwerk valt weg"), dan de oplossing
- **Kernboodschappen uit de blogpost:**
  - Meshcore = open-source mesh-netwerk op LoRa-technologie
  - Nodes springen berichten door van punt naar punt
  - Geen abonnement, lange afstand, zuinig (batterij/zon)
  - Doel: noodnetwerk voor Drenthe — tekstberichten, GPS, noodsignalen
  - Zelfvoorzienend: 3D-geprinte behuizingen + zonnepanelen
  - Mei 2026: kick-off 6 mei, daarna elke woensdag bouwen
  - Rollen: hardware-scouts, designers, documentatie-helden, presentatie-tijgers

---

## Sitemap & Paginastructuur

De website bestaat uit meerdere HTML-pagina's met een gedeelde navigatie en consistente layout.

**Strategie voor gedeelde HTML-blokken:** Navigatie en footer worden via een gedeeld JS-component (`js/components/page-shell.js`) geïnjecteerd in elke pagina. Zo hoeft een wijziging in de nav maar op één plek te gebeuren. Bij uitgeschakeld JavaScript toont een `<noscript>`-fallback met basislinks.

**Werkt lokaal zonder server:** De site gebruikt classic `<script defer>` in plaats van ES Modules, zodat je `index.html` direct in de browser kunt openen via `file://` — geen server nodig. Voor development is een lokale server wel handig (bijv. live-reload):
```bash
# Optioneel: start een lokale server vanuit de projectmap
./serve.sh
# Of handmatig:
python3 -m http.server 8000
```

```
index.html              → Startpagina (hero, introductie, overzicht)
wat-is-meshcore.html    → Uitleg voor beginners
hoe-werkt-het.html      → Technische uitleg (LoRa, Meshtastic, mesh-protocol)
netwerk-drenthe.html    → SVG-kaart van Drenthe met node-locaties
meedoen.html            → Hoe kun je meedoen, rollen, materiaallijst
planning.html           → Mei-planning, evenementen, tijdlijn
handleidingen.html      → Stap-voor-stap guides (flashen, bouwen, configureren)
woordenlijst.html       → Begrippen en termen uitgelegd (node, mesh, LoRa, firmware, etc.)
faq.html                → Veelgestelde vragen
404.html                → Foutpagina ("Node niet gevonden")
```

---

## Pagina-inhoud per pagina

### 1. `index.html` — Startpagina
- **Hero-sectie** met animated SVG mesh-netwerk visualisatie
- Korte elevator pitch: "Wat als het netwerk uitvalt?"
- Drie highlights: Wat is het? / Waarom Drenthe? / Doe mee!
- Verwijzingen naar de belangrijkste subpagina's
- Hackerspace Drenthe logo + verwijzing naar hackerspace-drenthe.nl

### 2. `wat-is-meshcore.html` — Wat is Meshcore?
*Doelgroep: beginners — geen technisch jargon*
- Analogie: "Denk aan een estafette van walkietalkies"
- SVG-animatie: berichten die van node naar node springen
- Voordelen in simpele taal:
  - Geen abonnement nodig
  - Werkt zonder internet
  - Lange afstand (kilometers)
  - Draait op zonneenergie
- Waarom een noodnetwerk? Scenario uitleg
- Vergelijking: normaal netwerk vs. mesh-netwerk (SVG infographic)

### 3. `hoe-werkt-het.html` — Hoe werkt het? (Technisch)
*Geleidelijke opbouw: eerst eenvoudig, dan dieper*

**Sectie A — De basis (iedereen)**
- Wat is een node?
- Hoe praten nodes met elkaar? (mesh-topologie)
- SVG-diagram: mesh vs. star vs. ring topologie

**Sectie B — LoRa Protocol**
- Wat is LoRa (Long Range)?
- Frequenties (EU868)
- Bereik en duty cycle
- SVG: radiogolven visualisatie

**Sectie C — Meshtastic Protocol**
- Wat is Meshtastic?
- Relatie LoRa ↔ Meshtastic ↔ Meshcore
- Kanalen, encryptie, berichten
- Node-rollen: Client, Router, Repeater
- Protocol-stack diagram (SVG)

**Sectie D — Meshcore specifiek**
- Wat voegt Meshcore toe bovenop Meshtastic?
- Firmware-overzicht
- Configuratiemogelijkheden

### 4. `netwerk-drenthe.html` — Netwerk Kaart
- **Interactieve SVG-kaart van Drenthe**
  - Gemeentegrenzen zichtbaar
  - Geplande node-locaties als markers
  - Hover/click: info over specifieke node (locatie, status, type)
  - Animatie: verbindingslijnen tussen nodes
- Legenda (node-types, status: gepland/actief/offline)
- Dekking-overzicht: welke gebieden al bereikt worden
- Statistieken: aantal nodes, geschat bereik
- **Kaartdata bron:** CBS/PDOK open geodata (gemeentegrenzen Drenthe), geëxporteerd als SVG path-data. Wordt lokaal meegeleverd als `assets/svg/drenthe-map.svg`. Coördinaten voor node-locaties staan in `js/config/nodes.js`.

### 5. `meedoen.html` — Meedoen
- **Rollen** (gebaseerd op het Hackerspace artikel):
  - Hardware-scouts (boards, antennes, zonnepanelen)
  - Designers (3D-print behuizingen)
  - Documentatie-helden (tutorials en handleidingen)
  - Presentatie-tijgers (kick-off voorbereiding)
  - Bouwers (solderen, assembleren)
  - Testers (netwerk testen en rapporteren)
- **Wat heb je nodig?** — materiaallijst met geschatte kosten
  - LoRa-board (bijv. Heltec, TTGO, RAK)
  - Antenne
  - Behuizing (3D-print STL bestanden)
  - Zonnepaneel + laadcircuit
  - USB-kabel, batterij
- **Contact**: Telegram-groep, woensdagavond bij de hackerspace
- **Locatie**: Coevorden — Graaf van Heiden Reinesteinlaan, De Nieuwe Veste

### 6. `planning.html` — Planning & Roadmap
*Mei 2026 = de jumpstart. Niet het eindresultaat, maar de vonk die het project op gang brengt.*

- **Visie** (bovenaan de pagina)
  - Mei is de maand om het project te jumpstarten en te boosten
  - Doel: enthousiasmeren, eerste prototypes bouwen, community vormen
  - Een dekkend netwerk is de stip op de horizon — niet de mei-deadline

- **Tijdlijn Mei 2026** (SVG visualisatie)
  - Woensdag 6 mei: **Kick-off** — techniek, visie en demo
  - Rest van mei: hak-avonden elke woensdagavond

- **Activiteiten tijdens de hak-avonden:**
  - Firmware flashen en configureren — eerste nodes tot leven brengen
  - 3D-printen behuizingen — prototypes testen en verbeteren
  - Solar setup solderen — eerste zelfvoorzienende nodes bouwen
  - Locatiescouting — strategische plekken in kaart brengen

- **Mei-doelen (realistisch):**
  - Eerste werkende prototype-nodes
  - Eerste succesvolle berichten via het mesh
  - Kernteam gevormd met duidelijke rollen
  - Materiaallijst en budgetplan vastgesteld
  - Website live als centraal informatiepunt

- **Horizon daarna:**
  - Zomer 2026: eerste nodes permanent geplaatst
  - Najaar 2026: testnetwerk kerngebied Coevorden
  - 2027: uitbreiding richting Emmen en rest van Drenthe

- **Voorbereiding** (nu — april):
  - Materiaal bestellen
  - Ontwerpen finaliseren
  - Website bouwen (dit project)
  - Kwartiermakers verzamelen

### 7. `handleidingen.html` — Handleidingen
*Stap-voor-stap, met afbeeldingen*
- Firmware flashen op een LoRa-board
- Je eerste Meshtastic-node configureren
- Behuizing 3D-printen (met STL-links)
- Zonnepaneel-laadcircuit aansluiten
- Node monteren en plaatsen
- Verbinding testen met de Meshtastic-app

### 8. `faq.html` — Veelgestelde Vragen
- Is het legaal? (Ja, ISM-band, geen vergunning nodig)
- Hoe ver reikt een node? (Afhankelijk van antenne, 1-15+ km)
- Wat kost het? (Geschatte kosten per node)
- Kan ik gewoon teksten sturen? (Ja, en GPS-locaties)
- Hoe veilig/privé is het? (Encryptie uitleg)
- Werkt het ook zonder zon? (Batterijduur uitleg)
- Moet ik kunnen programmeren? (Nee, flashen is eenvoudig)

### 9. `woordenlijst.html` — Woordenlijst / Glossary
*Alle termen op één plek — gelinkt vanuit andere pagina's*
- **Node** — een knooppunt in het mesh-netwerk
- **Mesh** — netwerktopologie waarbij elk punt met meerdere andere verbonden is
- **LoRa** — Long Range radio-technologie voor langeafstandscommunicatie
- **Meshtastic** — open-source software die LoRa gebruikvriendelijk maakt
- **Meshcore** — Meshtastic-gebaseerd mesh-netwerk project
- **Firmware** — software die op de hardware-chip draait
- **Flashen** — firmware op een apparaat zetten
- **ISM-band** — vrij te gebruiken radiofrequentie (868 MHz in Europa)
- **Duty cycle** — maximale zendtijd per tijdseenheid (wettelijke beperking)
- **Hop** — één sprong van node naar node
- **Repeater/Router** — node die berichten doorstuurt
- **GPS** — plaatsbepaling via satelliet
- **3D-printen** — objecten laag voor laag opbouwen uit kunststof
- Alfabetisch gesorteerd, met ankerlinks zodat andere pagina's direct naar een term kunnen linken

### 10. `404.html` — Foutpagina
- Titel: "Node niet gevonden" (speelse mesh-knipoog)
- Korte tekst: "Dit bericht heeft zijn bestemming niet bereikt"
- SVG-illustratie: verdwaald bericht in het mesh
- Link terug naar startpagina en sitemap
- Lichtgewicht — geen zware JS of animaties

---

### Gedeelde pagina-elementen (alle pagina's)
- **Open Graph meta-tags**: `og:title`, `og:description`, `og:image` voor goede previews op Telegram, Signal, social media
- **Meta description**: unieke beschrijving per pagina voor zoekmachines
- **Canonical URL**: relatief pad naar de pagina
- **Favicon**: mesh-node icoon als SVG favicon

---

## Visueel Ontwerp

### Stijl & Identiteit
- **Eigen projectstijl** — niet de Hackerspace huisstijl kopiëren, maar een herkenbare Meshcore Drenthe identiteit
- **Hackerspace Drenthe logo** wordt getoond in de footer en op de startpagina als partner/organisator
- **Doelgroep: 14 jaar en ouder** — toegankelijke taal, geen onnodige complexiteit, maar ook niet kinderachtig
- **Drents karakter** — de site ademt Drenthe: verwijzingen naar de regio, het landschap, de gemeenschap. Nuchter, hands-on, samen doen. Geen corporate-taal maar ook geen studententaal.
- Stijl: modern, clean, licht technisch maar toegankelijk voor iedereen
- Dark/light modus ondersteuning (CSS custom properties)
- **Print-stylesheet**: `@media print` voor handleidingen-pagina (wordt waarschijnlijk uitgeprint voor bij de werkbank)

### Kleurenpalet

**Light mode:**
| Token | Kleur | Gebruik |
|---|---|---|
| `--color-primary` | `#2d6a4f` (bosgroen) | Primaire accentkleur — Drenthe/natuur |
| `--color-primary-light` | `#52b788` | Hover-states, highlights |
| `--color-secondary` | `#1b4332` | Donkere variant, headers |
| `--color-accent` | `#f4a261` | Call-to-action, signaalkleur (radio) |
| `--color-bg` | `#fafaf5` | Achtergrond |
| `--color-text` | `#2b2b2b` | Standaard tekst |
| `--color-node` | `#e76f51` | Node markers op de kaart |
| `--color-signal` | `#00b4d8` | Signaal/verbindingslijnen |

**Dark mode** (aangepast voor WCAG AA contrast):
| Token | Kleur | Contrast op `#1a1a2e` |
|---|---|---|
| `--color-bg-dark` | `#1a1a2e` | Achtergrond |
| `--color-text-dark` | `#e0e0e0` | 11.3:1 — tekst |
| `--color-primary-dark` | `#74c69d` | 7.2:1 — primaire kleur (lichter dan light mode) |
| `--color-primary-light-dark` | `#95d5b2` | 8.8:1 — highlights |
| `--color-accent-dark` | `#f4a261` | 6.4:1 — CTA (ongewijzigd) |
| `--color-node-dark` | `#f4845f` | 5.2:1 — node markers (lichter) |
| `--color-signal-dark` | `#48cae4` | 7.5:1 — signaallijnen (lichter) |

> Alle kleurcombinaties gevalideerd op minimaal 4.5:1 contrast (WCAG AA).

### Typografie
- **Lokaal ingebedde fonts** (geen Google Fonts — OFL-licentie, self-hosted `.woff2`)
- **Heading font: Space Grotesk** — moderne tech-uitstraling, krachtig maar vriendelijk. Open-source (OFL).
- **Body font: Inter** — uitstekende leesbaarheid op scherm, breed taalondersteuning. Open-source (OFL).
- **Mono font: JetBrains Mono** — voor code-snippets, firmware-commando's en technische blokken. Open-source (OFL).
- Font-bestanden worden opgeslagen als `.woff2` in `assets/fonts/`
- CSS `font-display: swap` voor snelle eerste weergave

### SVG Illustraties & Animaties
Alle visuele elementen worden als inline SVG gemaakt:

1. **Mesh-netwerk hero-animatie** — nodes die oplichten en berichten doorsturen
2. **Node-naar-node animatie** — bericht springt via het mesh
3. **Topologie-diagrammen** — mesh vs. star vs. ring
4. **LoRa radiogolven** — geanimeerde cirkels die vanuit een node uitstralen
5. **Protocol-stack** — gelaagd diagram (Hardware → LoRa → Meshtastic → Meshcore)
6. **Kaart van Drenthe** — interactief met gemeentegrenzen en node-markers
7. **Tijdlijn** — visuele planning mei 2026
8. **Infographic** — vergelijking normaal netwerk vs. mesh

### Foto's & Bitmap-afbeeldingen (door AI-agent te genereren)
De volgende afbeeldingen zijn niet als SVG te maken en worden aangeleverd door een gespecialiseerde AI-beeldgenerator. Formaat: WebP of PNG, geoptimaliseerd voor web.

| # | Afbeelding | Pagina | Beschrijving / Prompt-richting |
|---|---|---|---|
| B1 | **Hero-achtergrondfoto** | `index.html` | Drents landschap (heide/bos) met subtiele tech-overlay, sfeerbeeld dat natuur en technologie combineert |
| B2 | **LoRa-node close-up** | `wat-is-meshcore.html` | Realistisch beeld van een kleine LoRa-node met antenne en zonnepaneel in een weerbestendige behuizing, buiten gemonteerd |
| B3 | **Node op een paal in de natuur** | `wat-is-meshcore.html` | Een mesh-node gemonteerd op een paal in Drents landschap, bos of heideveld |
| B4 | **Solderen / bouwen** | `meedoen.html` | Handen die een LoRa-board solderen op een werkbank in een makerspace/hackerspace setting |
| B5 | **3D-printer met behuizing** | `meedoen.html` | Een 3D-printer die een node-behuizing afdrukt, hackerspace sfeer |
| B6 | **Groep mensen bij hackerspace** | `meedoen.html` | Diverse groep mensen rond een werktafel bezig met elektronica, gezellige hackerspace sfeer |
| B7 | **Firmware flashen** | `handleidingen.html` | Laptop met USB-kabel naar een LoRa-board, scherm toont een terminal/flash-tool |
| B8 | **Node deployment buiten** | `handleidingen.html` | Iemand die een afgewerkte node met zonnepaneel op een hoge plek bevestigt |
| B9 | **Drentse zendmast/toren** | `netwerk-drenthe.html` | Hoge plek in Drenthe (kerktoren, uitzichttoren, watertoren) als ideale node-locatie |
| B10 | **Meshtastic app op telefoon** | `hoe-werkt-het.html` | Smartphone met de Meshtastic-app open, kaartweergave met nodes zichtbaar |

> **Workflow**: Zodra we bij een fase komen die een bitmap nodig heeft, wordt de exacte prompt + gewenste afmetingen/stijl opgesteld en door de AI-beeldgenerator verwerkt. De afbeeldingen worden opgeslagen in `assets/images/`.

> **Formaat & fallback**: Gebruik `<picture>` element met WebP als primair formaat en PNG als fallback voor oudere browsers:
> ```html
> <picture>
>   <source srcset="assets/images/hero.webp" type="image/webp">
>   <img src="assets/images/hero.png" alt="..." loading="lazy">
> </picture>
> ```

---

## Bestandsstructuur

Alle bestanden staan direct in de workspace-root (`/home/rein/dev/drentetech/`).

```
drentetech/
├── index.html
├── wat-is-meshcore.html
├── hoe-werkt-het.html
├── netwerk-drenthe.html
├── meedoen.html
├── planning.html
├── handleidingen.html
├── faq.html
├── woordenlijst.html
├── 404.html
│
├── css/
│   ├── variables.css           # Design tokens (kleuren, spacing, fonts)
│   ├── reset.css               # CSS reset
│   ├── base.css                # Basis-stijlen, typografie
│   ├── layout.css              # Grid, containers, responsive layout
│   ├── print.css               # Print-stylesheet (@media print)
│   ├── components/
│   │   ├── nav.css             # Navigatiebalk
│   │   ├── hero.css            # Hero-sectie
│   │   ├── card.css            # Informatiekaarten
│   │   ├── timeline.css        # Tijdlijn component
│   │   ├── map.css             # Kaart styling
│   │   ├── faq.css             # FAQ accordion
│   │   ├── footer.css          # Footer
│   │   ├── glossary.css        # Woordenlijst (alfabetische nav, ankerlinks)
│   │   └── code-block.css      # Code/technische blokken
│   └── pages/
│       ├── home.css            # Pagina-specifiek: startpagina
│       └── handleidingen.css   # Pagina-specifiek: guides
│
├── js/
│   ├── main.js                 # Entry point, shared init
│   ├── components/
│   │   ├── page-shell.js       # Gedeelde nav + footer (inject in elke pagina)
│   │   ├── navigation.js       # Mobiele nav, actieve pagina
│   │   ├── theme-toggle.js     # Dark/light mode
│   │   ├── mesh-animation.js   # Hero mesh-animatie
│   │   ├── node-animation.js   # Node-naar-node berichtanimatie
│   │   ├── map-interactive.js  # Interactieve Drenthe-kaart
│   │   ├── timeline.js         # Tijdlijn interactie
│   │   ├── faq-accordion.js    # FAQ open/dicht
│   │   └── scroll-reveal.js    # Elementen tonen bij scrollen
│   ├── utils/
│   │   ├── dom.js              # DOM helper-functies
│   │   ├── svg.js              # SVG creatie/manipulatie helpers
│   │   └── a11y.js             # Accessibility helpers
│   └── config/
│       ├── nodes.js            # Node-locaties data (coördinaten, status)
│       └── settings.js         # Globale configuratie
│
├── assets/
│   ├── images/
│   │   └── logo-hackerspace.svg    # Hackerspace Drenthe logo
│   ├── fonts/
│   │   ├── SpaceGrotesk-Variable.woff2
│   │   ├── Inter-Variable.woff2
│   │   └── JetBrainsMono-Variable.woff2
│   └── svg/
│       ├── drenthe-map.svg         # Kaart van Drenthe (basis)
│       ├── mesh-topology.svg       # Mesh topologie diagram
│       ├── star-topology.svg       # Star topologie diagram
│       ├── protocol-stack.svg      # Protocol stack diagram
│       ├── lora-waves.svg          # LoRa radiogolven
│       └── icon-sprite.svg         # Iconen sprite (node, antenna, sun, etc.)
│
├── tests/
│   ├── unit/
│   │   ├── dom.test.js
│   │   ├── svg.test.js
│   │   ├── page-shell.test.js
│   │   ├── navigation.test.js
│   │   ├── theme-toggle.test.js
│   │   ├── map-interactive.test.js
│   │   └── faq-accordion.test.js
│   └── test-runner.html
│
├── PLAN.md
└── RULES.md
```

---

## Responsive Breakpoints

| Breakpoint | Breedte | Toelichting |
|---|---|---|
| Mobiel | 320px – 767px | Enkele kolom, hamburger-menu |
| Tablet | 768px – 1023px | Twee kolommen waar nodig |
| Desktop | 1024px – 1440px | Volledige layout |
| Breed | 1441px+ | Max-width container, gecentreerd |

---

## WCAG Compliance Aandachtspunten

- Alle SVG-animaties respecteren `prefers-reduced-motion`
- Kaartinteractie is volledig toetsenbord-toegankelijk
- Kleurcontrast minimaal 4.5:1 (AA) — gevalideerd per kleurtoken
- Skip-link naar hoofdcontent op elke pagina
- `lang="nl"` op alle pagina's
- Alle interactieve SVG-elementen hebben ARIA-labels

---

## Bouwvolgorde (PDCA per fase)

### Fase 1 — Fundament
1. Projectmapstructuur aanmaken
2. CSS variabelen, reset en basis-stijlen
3. Gedeelde layout: navigatie + footer component
4. Responsive grid-systeem
5. Dark/light mode toggle
6. Unit tests voor basis-componenten

### Fase 2 — Startpagina
7. Hero-sectie met mesh-animatie (SVG)
8. Content-blokken startpagina
9. Responsieve styling
10. WCAG-check startpagina

### Fase 3 — Informatiepagina's
11. `woordenlijst.html` — woordenlijst (moet eerst, want andere pagina's linken ernaar)
12. `wat-is-meshcore.html` — beginner content + SVG animatie
13. `hoe-werkt-het.html` — technische content + diagrammen
14. `faq.html` — FAQ met accordion

### Fase 4 — Interactieve Kaart
15. SVG-kaart van Drenthe opbouwen
16. Node-locaties data-model
17. Interactieve hover/click functionaliteit
18. Animatie verbindingslijnen
19. Unit tests kaart-module

### Fase 5 — Planning & Meedoen
20. `planning.html` — tijdlijn SVG
21. `meedoen.html` — rollen, materiaal, contact
22. `handleidingen.html` — stap-voor-stap guides

### Fase 6 — Polish & Oplevering
23. `404.html` — foutpagina
24. Cross-browser testen (Chrome, Firefox, Safari, Edge)
25. Volledige WCAG AA audit
26. Performance-optimalisatie
27. Alle unit tests groen
28. HTML-validatie (W3C)

---

## Technische Notities

- **Werkt lokaal**: Classic `<script defer>` — geen server nodig, werkt via `file://`. Optioneel: `./serve.sh` voor development.
- **Classic scripts**: JavaScript gebruikt `<script defer>` in laadvolgorde. Functies zijn globaal beschikbaar via de laadvolgorde.
- **CSS Custom Properties**: Alle design tokens via `:root` variabelen, apart kleurschema voor dark mode
- **SVG inline**: Animaties worden via CSS (`@keyframes`) en minimaal JS aangestuurd
- **Lokale test-runner**: Een HTML-bestand dat alle unit tests in de browser draait (ook via `file://`)
- **Test-scope**: Unit tests dekken JS-logica (data, state, DOM-manipulatie). Visuele SVG/CSS-animaties worden niet getest — die worden handmatig geverifieerd via de browser.
- **Gedeelde HTML-shell**: Navigatie en footer worden door `page-shell.js` geïnjecteerd. `<noscript>` fallback met basisnavigatie.

---

*Dit plan volgt de regels uit [RULES.md](RULES.md). Elke fase doorloopt de PDCA-cyclus: Plan → Do → Check → Act.*
