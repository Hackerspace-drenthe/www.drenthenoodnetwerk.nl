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
| `hoe-werkt-het.html` | Technische uitleg (LoRa, Meshtastic, Meshcore) + mesh-simulator + bereik-calculator |
| `netwerk-drenthe.html` | Live netwerkkaart (embed van map.meshcore.io) |
| `meedoen.html` | Rollen, materialen, contact |
| `planning.html` | Roadmap en tijdlijn |
| `handleidingen.html` | Stap-voor-stap handleidingen |
| `apparaten.html` | Apparatenvergelijking met specs en kooplinks |
| `faq.html` | Veelgestelde vragen |
| `woordenlijst.html` | Begrippenlijst |

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

Wil je bijdragen aan de website of het project? Kom langs op woensdagavond bij [Hackerspace Drenthe](https://www.hackerspace-drenthe.nl/) of neem contact op via de [Telegram-groep](https://t.me/+GTTYOvZTRVNhNThk).

## Licentie

Dit project is van [Hackerspace Drenthe](https://www.hackerspace-drenthe.nl/).
