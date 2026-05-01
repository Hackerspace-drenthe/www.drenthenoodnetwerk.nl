# Meshcore Drenthe — www.drenthenoodnetwerk.nl

Een Nederlandstalige website voor het **Meshcore Drenthe** project van [Hackerspace Drenthe](https://www.hackerspace-drenthe.nl/). Centraal informatiepunt over het opzetten van een decentraal mesh-communicatienetwerk in de provincie Drenthe.

## Wat is Meshcore Drenthe?

Een open-source noodnetwerk op LoRa-technologie. Nodes sturen berichten door van punt naar punt — zonder internet, zonder abonnement, zonder zendmasten. Het netwerk draait op zonne-energie en is ontworpen voor noodcommunicatie in Drenthe.

- **Kick-off:** woensdag 6 mei 2026, 19:00–21:00
- **Locatie:** De Nieuwe Veste, Coevorden
- **Elke woensdag:** hak-avond bij Hackerspace Drenthe

## Website

Statische site — puur HTML, CSS en JavaScript. Geen frameworks, geen build-stap.

### Pagina's

| Pagina | Beschrijving |
|---|---|
| `index.html` | Homepage met introductie en overzicht |
| `wat-is-meshcore.html` | Uitleg voor beginners + kennisquiz |
| `hoe-werkt-het.html` | Technische uitleg (LoRa, Meshcore firmware) + mesh-simulator + bereik-calculator |
| `netwerk-drenthe.html` | Live netwerkkaart (embed van map.meshcore.io) |
| `meedoen.html` | Rollen, materialen, contact |
| `planning.html` | Roadmap en tijdlijn |
| `handleidingen.html` | Stap-voor-stap handleidingen |
| `apparaten.html` | Apparatenvergelijking met specs en kooplinks |
| `faq.html` | Veelgestelde vragen |
| `woordenlijst.html` | Begrippenlijst |

### MeshCore Academy (`MeshAcademy/`)

Gratis interactieve cursusreeks over MeshCore mesh-netwerken voor noodcommunicatie — 19 modules met quizzen, interactieve tools en certificering.

| Module | Onderwerp |
|---|---|
| `c01` – `c02` | Introductie mesh-netwerken & noodcommunicatie |
| `c03` – `c04` | LoRa-radio basis & regelgeving |
| `c05` – `c07` | Hardware, firmware & eerste configuratie |
| `c08` – `c10` | Antennes, plaatsing & link-budget planning |
| `c11` | Stroomverbruik & batterij |
| `c12` – `c14` | Channels, rooms, packet-types & routering |
| `c15` – `c16` | Protocollen vergelijken & beveiliging |
| `c17` – `c18` | Onderhoud, troubleshooting & netwerk-ontwerp |
| `c19` | Eindexamen |

Instappagina: `MeshAcademy/index.html` — Cursus-hub: `MeshAcademy/course-hub.html`

### Lokaal draaien

```bash
./serve.sh
# of
python3 -m http.server 8000 --bind 127.0.0.1
```

Open [http://localhost:8000](http://localhost:8000)

## Technische keuzes

- **Offline-first** — alle assets lokaal (fonts, CSS, JS), uitzondering: netwerkkaart iframe en apparaat-afbeeldingen
- **Toegankelijkheid** — WCAG AA, skip-links, ARIA-labels, toetsenbordnavigatie
- **Thema** — licht/donker via `data-theme`, respecteert `prefers-color-scheme`
- **Fonts** — Space Grotesk (koppen), Inter (tekst), JetBrains Mono (code) — lokale WOFF2
- **Geen tracking** — geen analytics, geen cookies

## Meedoen

Wil je bijdragen aan de website of het project? Kom langs op woensdagavond bij [Hackerspace Drenthe](https://www.hackerspace-drenthe.nl/), neem contact op via de [Telegram-groep](https://t.me/+GTTYOvZTRVNhNThk) of mail naar [bestuur@hackerspace-drenthe.nl](mailto:bestuur@hackerspace-drenthe.nl).

## Licentie

Dit project is van [Hackerspace Drenthe](https://www.hackerspace-drenthe.nl/).
