# Meshcore Repeater Planning Tool

Een interactieve OpenLayers-gebaseerde planningstool voor het optimaliseren van Meshcore repeater-plaatsing in Drenthe.

## Functionaliteit

### Kaartlagen
- **Bestaande Repeaters** — Actieve en inactieve repeaters uit het live netwerk (kleur per classificatie)
- **Companions** — Client-apparaten (blauw)
- **Bewezen Links** — Geverifieerde verbindingen tussen nodes (oranje/blauw)
- **Betrouwbare Bereik** — Geschat bereik (instelbaar: 40-100% van gemiddelde/max link-afstanden)
- **Geplande Locaties** — Nieuwe repeater-planning (rood/oranje)
- **RF Obstructies** — Semi-transparante overlay met gebouwen, bossen en andere RF-blokkerende structuren
- **Hoge Structuren** — Watertorens, zendmasten, kerktorens, flatgebouwen en andere hoge structuren met exacte hoogte (driehoek markers, oranje = geschikt voor repeater)
- **Bewoonde Kernen** — Steden, plaatsen en dorpen in Drenthe met inwonertal (ruitvormige markers: goud = stad, lichtgoud = plaats, geel = dorp)
- **Dekking Sterkte** — Heatmap visualisatie van netwerkdekking (blauw = zwak, groen/geel = gemiddeld, rood = sterk)
- **Geen Dekking** — Bewoonde kernen zonder netwerkdekking (rode ruitvormige markers met waarschuwing)

### Bereik Berekening (Instelbaar)

De bereik-cirkels zijn **instelbaar** van conservatief tot maximaal bewezen bereik:

**Slider-instellingen:**
- **40-50%** — Zeer conservatief: veilige planning met marges voor obstakels
- **60-70%** — Realistisch (standaard 60%): balans tussen veiligheid en praktijk
- **80-90%** — Optimistisch: betere condities, meer line-of-sight
- **100%** — Maximum: toont langste bewezen link per node (afhankelijk van peer)

**Berekeningsmethode:**
1. **Bij <100%**: Gemiddelde van alle bewezen links × factor
   - Voorbeeld 60%: Node met links 3, 5, 8, 12 km → gemiddelde 7km → 7 × 0.6 = **4.2km**
2. **Bij 100%**: Maximum bewezen link-afstand per node
   - Voorbeeld: Node met links 3, 5, 8, 12 km → **12km**
3. Unrealistische links (>15km) worden uitgefilterd
4. Maximum visualisatie: 8km cap
5. Nodes zonder links: classificatie-gebaseerde schatting (1-4km)

**Wanneer welke instelling?**
- **Planning nieuwe nodes**: 40-60% (conservatief)
- **Analyse bestaand netwerk**: 60-70% (realistisch)
- **Optimale scenario's**: 80-90% (optimistisch)
- **Maximale capaciteit**: 100% (bewezen maximum)

### Repeater Classificatie

Repeaters worden automatisch ingedeeld in klassen 0-8 op basis van:
- **Node-gewicht** (0-40 punten)
- **Aantal links** (0-30 punten)  
- **Link betrouwbaarheid/confidence** (0-20 punten)
- **Maximum bereik** (0-10 punten)

**Klassen:**
- **8** — Backbone (90-100 punten): altijd online, hoog gewicht, veel stabiele links — donkerblauw `#003f5c`
- **7** — Zeer betrouwbaar (80-89 punten): zeer goede uptime, meerdere sterke links — blauw `#2f4b7c`
- **6** — Betrouwbaar (70-79 punten): goede uptime, meerdere links — paars-blauw `#665191`
- **5** — Goed (60-69 punten): redelijk betrouwbaar, enkele links — paars `#a05195`
- **4** — Gemiddeld (45-59 punten): matige prestaties — magenta `#d45087`
- **3** — Matig (30-44 punten): lage uptime, weinig links — roze-oranje `#f95d6a`
- **2** — Zwak (15-29 punten): vaak offline, weinig stabiele links — oranje `#ff7c43`
- **1** — Zeer zwak (5-14 punten): zelden online, instabiel — geel-oranje `#ffa600`
- **0** — Onbetrouwbaar (<5 punten): geen stabiele links — donkeroranje/bruin `#d67000`

**Kleuren zijn geoptimaliseerd voor kleurenblindheid** (deuteranopia/protanopia-vriendelijk spectrum van blauw naar oranje).

**Filteropties:**
- Gebruik de min/max sliders om alleen repeaters van bepaalde klassen te tonen
- **Slimme filtering actief:**
  - **Links** — Automatisch gefilterd, alleen verbindingen tussen zichtbare repeaters
  - **Betrouwbare Bereik** — Automatisch gefilterd, alleen cirkels voor zichtbare repeaters  
  - **Statistieken** — "Zichtbare links" toont aantal gefilterde verbindingen
- Identificeer zwakke gebieden (klasse 0-2) voor verbetering
- Focus op backbone nodes (klasse 8) voor strategische planning
- Analyseer specifieke netwerk-tiers zonder visuele ruis
- Zie visuele legende met kleur-coding

### Voorbeelden van slim filteren
- **Backbone netwerk analyseren**: Stel min=8, max=8 in → zie alleen hoogwaardige nodes en hun onderlinge verbindingen
- **Zwakke gebieden vinden**: Stel min=0, max=2 in → zie problematische nodes en hun beperkte links
- **Betrouwbare laag**: Stel min=6, max=8 in → zie stabiele infrastructuur zonder ruis van instabiele nodes

### Basislagen (schakelbaar)
- **Dark** — Donkere CartoDB kaart (standaard, past bij site-thema)
- **Light** — Lichte CartoDB kaart met duidelijke plaatsnamen
- **OpenStreetMap** — Standaard OSM kaart met volledige detail
- **Satelliet** — ESRI World Imagery satellietbeelden
- **Topografisch** — OpenTopoMap met hoogtelijnen en terrein
- **Terrein** — Stamen Terrain met relief en schaduwing
- **Straten (ESRI)** — Gedetailleerde ESRI stratenkaart
- **Humanitair** — Humanitarian OSM (clean, belangrijke features)
- **Wikimedia** — Wikimedia Maps (open source, schoon ontwerp)
- **CyclOSM** — Fiets/infrastructuur-gerichte kaart
- **Minimaal** — Stamen Toner Lite (hoog contrast, minimalistisch)

### Planning Tools
1. **Repeater Plaatsen** — Klik op de kaart om een nieuwe repeater-locatie toe te voegen
   - Standaard betrouwbaar bereik: 3 km
   - Toont bereik-cirkel per geplande locatie
   
2. **Afstand Meten** — Meet afstanden tussen punten
   - Klik om te starten, dubbel-klik om te stoppen
   - Toont afstand in kilometers
   
3. **Dekking Analyseren** — Basis-analyse van totale netwerkdekking
   - Toont statistieken van bestaande en geplande infrastructuur
   
4. **Wis Planning** — Verwijder alle geplande locaties in één keer

### Besturingselementen
- **Classificatie filters** — Min/max sliders om repeater-klassen te filteren (0-8)
- **Bereik instelling** — Slider om bereik-cirkels te schalen (40-100%)
  - 40-50%: Conservatief voor veilige planning
  - 60-70%: Realistisch (standaard)
  - 80-90%: Optimistisch
  - 100%: Maximum bewezen bereik
- **Laag toggles** — Schakel verschillende kaartlagen in/uit
  - **RF Obstructies** — Visualiseer gebouwen, bossen en andere structuren die signalen blokkeren
- **Basis-laag selector** — Kies tussen Dark, OSM, Satelliet, of Topografisch

### RF Obstructie Analyse

De **RF Obstructies** laag helpt bij het identificeren van signaal-blokkerende structuren:

**Wat wordt getoond:**
- **Gebouwen** — Solide obstructies die signalen volledig kunnen blokkeren
- **Bossen en bomen** — Veroorzaken significante verzwakking (vooral met bladeren)
- **Infrastructuur** — Wegen, spoorlijnen en andere structuren

**Planning tips:**
1. Schakel de laag in bij het plaatsen van nieuwe repeaters
2. Minimaliseer obstructies tussen nodes voor betere links
3. Zoek verhoogde locaties boven boomkruin-niveau
4. Stedelijke gebieden vereisen meer zorgvuldige planning
5. Line-of-sight is ideaal — gebruik terrein- of satelliet-laag voor hoogte-analyse

### Hoge Structuren Database

De **Hoge Structuren** laag toont geverifieerde hoge locaties in Drenthe die potentieel geschikt zijn voor repeater plaatsing:

**Wat wordt getoond (120 structuren):**
- ⛪ **Kerktorens (73)** — Protestantse en katholieke kerken, 25-57m hoog (hoogste: Grote Kerk Meppel 57m)
- 📡 **Zendmasten (14)** — Bestaande telecom infrastructuur, 47-75m (hoogste: Eelde Airport 75m)
- 💧 **Watertorens (12)** — Monumentale en moderne watertorens, 31-48m
- 🚒 **Brandweerkazernes (15)** — Met oefentorens, 11-18m, strategisch verspreid
- 🏥 **Ziekenhuizen (4)** — Treant Zorggroep locaties, 32-42m, noodstroom beschikbaar
- 🏭 **Overig (2)** — Flatgebouwen, schoorsteenpijpen (tot 65m)

**Data bronnen:**
- OpenStreetMap (kerktorens, gebouwen)
- Agentschap Telecom zendmastregister (zendmasten)
- Protestantse Kerk Nederland + RK Bisdom (kerken)
- Veiligheidsregio Drenthe (brandweerkazernes)
- Nederlandse Zorgautoriteit (ziekenhuizen)
- Lokale monumentenregisters (watertorens)

**Markers:**
- **Oranje driehoek (▲)** — Geschikt voor repeater plaatsing
- **Grijze driehoek** — Niet geschikt (beperkte toegang, monument status)
- **Grootte** — Schaling op basis van hoogte (hoger = groter)

**Gebruik:**
1. Schakel de laag in om hoge locaties te zien
2. Klik op een marker voor details (hoogte, type, geschiktheid, notities)
3. Gebruik deze locaties bij planning van nieuwe repeaters
4. Combineer met RF Obstructies laag voor optimale planning
5. **Brandweerkazernes** — Altijd bemand/bereikbaar, geschikt voor lokale hubs
6. **Ziekenhuizen** — Prioriteit voor kritische noodcommunicatie

**Data uitbreiden:**
De dataset in `data/towers-drenthe.json` kan worden uitgebreid met nieuwe geverifieerde locaties. Formaat:
```json
{
  "type": "Feature",
  "properties": {
    "name": "Naam van structuur",
    "type": "watertoren|zendmast|kerktoren|brandweerkazerne|ziekenhuis|flatgebouw|schoorsteen",
    "height_m": 45,
    "suitable_for_repeater": true,
    "address": "Locatie beschrijving",
    "notes": "Extra informatie",
    "verified": true
  },
  "geometry": {
    "type": "Point",
    "coordinates": [lon, lat]
  }
}
```

### Export
- Exporteer planning als JSON-bestand
- Bevat coördinaten, bereik en metadata
- Kan gedeeld of later geïmporteerd worden

## Technologie

- **OpenLayers 10.3** — Open-source web mapping library
- **Data bron** — Live radar data uit `../data/mc-radar/` (gesynchroniseerd via GitHub Actions)
- **Styling** — CSS Variables uit site-thema voor consistente look & feel
- **Geen frameworks** — Vanilla JavaScript voor snelheid en eenvoud

## Bestanden

```
Map/
├── index.html          # Hoofdpagina met HTML structuur
├── planning-map.js     # OpenLayers map logica en interacties
├── planning-map.css    # Styling en layout
└── README.md          # Deze documentatie
```

## Gebruik

### Lokaal testen
```bash
# Vanaf project root:
./serve.sh

# Open in browser:
# http://localhost:8000/Map/
```

### Navigatie
- **Verplaatsen** — Sleep met muis of gebruik pijltjestoetsen
- **Zoom** — Scrollwiel, +/- knoppen, of dubbel-klik
- **Basislaag wijzigen** — Dropdown rechtsboven op de kaart

### Planning workflow
1. Bekijk bestaande infrastructuur en dekking
2. Schakel relevante lagen in/uit voor overzicht
3. Selecteer "Repeater Plaatsen" tool
4. Klik op gewenste locaties om repeaters toe te voegen
5. Gebruik "Afstand Meten" om onderlinge afstanden te checken
6. Analyseer totale dekking
7. Exporteer planning voor documentatie of delen

## Data Structuur

### Export JSON formaat
```json
{
  "version": "1.0",
  "created": "2026-04-29T...",
  "planned_repeaters": [
    {
      "name": "Geplande locatie 1",
      "latitude": 52.72000,
      "longitude": 6.75000,
      "range_km": 5
    }
  ],
  "statistics": {
    "total_planned": 1,
    "existing_repeaters": 15,
    "existing_companions": 42
  }
}
```

## Toekomstige uitbreidingen

- [ ] Import functionaliteit voor eerder geëxporteerde planningen
- [ ] Bewerkbare bereik per geplande repeater
- [ ] Bewerkbare classificatie voor geplande repeaters
- [ ] RF-propagatie modellering met terreindata (SRTM)
- [ ] Link quality predictor tussen geplande nodes
- [ ] Gebouw en vegetatie obstructie-analyse
- [ ] Multi-scenario vergelijking
- [ ] Automatische optimalisatie suggesties
- [ ] Gedetailleerde coverage heatmap
- [ ] Integration met node configuratie tools

### Bewoonde Kernen (Coverage Planning)

De **Bewoonde Kernen** laag toont alle steden, plaatsen, dorpen en buurtschappen in Drenthe om te visualiseren waar netwerk-dekking nodig is:

**Wat wordt getoond (127 bewoonde kernen):**
- 🏙️ **Steden (4)** — Grote bewoonde kernen (>30.000 inwoners): Assen (68k), Emmen (57k), Hoogeveen (37k), Meppel (34k)
- 🏘️ **Plaatsen (5)** — Middelgrote kernen (10.000-14.000 inwoners): Coevorden, Zuidlaren, Beilen, Roden, Klazienaveen
- 🏡 **Dorpen (99)** — Reguliere dorpen (500-9.000 inwoners) verspreid over heel Drenthe
- 🏘️ **Buurtschappen (19)** — Kleine bewoningskernen (160-450 inwoners)

**Geografische dekking: 13 gemeenten volledig in kaart**

**Markers:**
- **Goud ruitvormig (◆)** — Steden (groot, 8px)
- **Licht goud ruitvormig** — Plaatsen (middel, 6px)
- **Geel ruitvormig** — Dorpen (4px)
- **Zeer licht geel ruitvormig** — Buurtschappen (klein, 3px)
- **Oranje rand** — Duidelijk zichtbaar op alle achtergronden

**Data per kern:**
- Naam (officiële plaatsnaam)
- Type (stad/plaats/dorp/buurtschap)
- Inwonertal (2024/2026 CBS + BAG gegevens)
- Gemeente

**Gebruik voor coverage planning:**
1. **Identificeer coverage gaps** — Dorpen zonder nabije repeaters (zie "Geen Dekking" laag)
2. **Prioriteer belangrijke kernen** — Steden > Plaatsen > Dorpen > Buurtschappen
3. **Plan strategische locaties** — Tussen bewoonde kernen voor maximale dekking
4. **Evalueer bereik** — Combineer met range circles om te zien welke kernen gedekt zijn
5. **Bevolkingsdichtheid** — Grootte markers = relatieve prioriteit

**Coverage analyse tips:**
- Zoom uit voor provincie-overzicht (127 kernen zichtbaar)
- Identificeer clusters van dorpen zonder dekking
- Plan repeaters tussen clusters voor multi-dorp coverage
- Gebruik hoge structuren in of nabij bewoonde kernen
- Check line-of-sight met satelliet/terrein lagen
- Gebruik brandweerkazernes als lokale hubs voor dorpen

**Data bronnen:**
- CBS gemeentestatistieken (officiële bevolkingsaantallen)
- Kadaster BAG (Basisregistratie Adressen en Gebouwen)
- OpenStreetMap (locaties en classificaties)
- Officiële gemeentegrenzen Drenthe

Dataset: `data/settlements-drenthe.json` (GeoJSON format)

### Dekking Sterkte & Geen Dekking (Coverage Analysis)

De tool bevat twee complementaire lagen voor dekking-analyse:

#### Dekking Sterkte (Heatmap)

Een **heatmap visualisatie** die de intensiteit van netwerkdekking toont:

**Hoe het werkt:**
- Elk repeater-punt genereert "warmte" gebaseerd op zijn classificatie (klasse 0-8)
- Hogere klasses (backbone nodes) genereren meer warmte dan lagere klasses
- Geplande repeaters worden ook meegenomen in de heatmap
- De heatmap blur radius is 25px met een point radius van 15px

**Kleurschaal:**
- 🔵 **Blauw** — Zwakke dekking (1-2 repeaters, lage klasses)
- 🔷 **Cyaan** — Matige dekking 
- 🟢 **Groen** — Goede dekking (meerdere repeaters)
- 🟡 **Geel** — Sterke dekking
- 🔴 **Rood** — Zeer sterke dekking (overlappende backbone nodes)

**Gebruik:**
1. Schakel de laag in om dekkingszones te visualiseren
2. Identificeer gebieden met zwakke dekking (blauw/cyaan)
3. Plan nieuwe repeaters in onderbediende gebieden
4. Valideer dat belangrijke gebieden goede dekking hebben (geel/rood)
5. Voorkom overbezetting door te veel overlappende repeaters

**Interpretatie:**
- **Geen kleur** — Geen dekking
- **Blauw zones** — Perifere dekking, mogelijk verbindingsproblemen
- **Groen/geel zones** — Betrouwbare dekking voor meeste use-cases
- **Rode zones** — Optimale dekking, redundantie, backbone kwaliteit

#### Geen Dekking (Coverage Gaps)

Deze laag toont **bewoonde kernen zonder netwerkdekking** als rode waarschuwingsmarkers:

**Detectie methode:**
- Controleert elke nederzetting (stad/plaats/dorp) tegen alle actieve repeaters
- Gebruikt het ingestelde bereik (range factor) van elke repeater
- Zowel bestaande als geplande repeaters worden meegenomen
- Een nederzetting heeft "geen dekking" als het buiten bereik van ALLE repeaters ligt

**Markers:**
- ⚠️ **Rode ruiten** — Grotere en prominentere dan normale settlement markers
- **Dikke rode rand** — Extra zichtbaar voor prioritering
- **Grootte varieert** — Steden (10px) > plaatsen (8px) > dorpen (6px)

**Hover informatie:**
- Naam van de nederzetting
- **⚠️ GEEN DEKKING** waarschuwing in rood
- Type (stad/plaats/dorp)
- Inwonertal
- Gemeente

**Gebruik:**
1. **Identificeer prioriteiten** — Grote nederzettingen zonder dekking
2. **Plan strategisch** — Plaats repeaters om meerdere gaps te dekken
3. **Valideer planning** — Voeg geplande repeater toe en zie of gaps verdwijnen
4. **Adjust range factor** — Test verschillende scenario's (conservatief vs optimistisch)
5. **Track progress** — Zie real-time welke nederzettingen nog dekking nodig hebben

**Interactie met filters:**
- Layer reageert op **range factor slider** — Lagere factor = meer gaps
- Reageert op **class filter** — Filteren van lage-klasse repeaters kan gaps creëren
- **Dynamische update** — Gaps verdwijnen automatisch bij toevoegen van geplande repeaters

**Planning workflow:**
1. Schakel beide lagen in: "Dekking Sterkte" en "Geen Dekking"
2. Bekijk rode markers voor prioritaire nederzettingen
3. Analyseer heatmap voor algemene dekkingspatronen
4. Gebruik "Hoge Structuren" laag voor optimale repeater-plaatsing
5. Plaats geplande repeater en zie real-time update van coverage
6. Herhaal tot alle kritieke nederzettingen gedekt zijn

**Voorbeeld scenario:**
- **Conservatief (40-50% range)** — Veel rode markers, veilige planning
- **Realistisch (60-70% range)** — Redelijke gaps zichtbaar
- **Optimistisch (80-100% range)** — Minimale gaps, beste-geval scenario

## Notities

- **Drenthe grens** — Simplified polygon voor filtering, kan verfijnd worden met echte provincie data
- **Bereik-simulatie** — Conservatieve schatting (60% van gemiddelde link-afstand) zonder RF-propagatie model
- **Realistische planning** — Gebruik betrouwbaar bereik in plaats van optimistisch maximum voor betere planning
- **Data freshness** — Nodes gezien binnen laatste 24 uur worden als "actief" beschouwd
- **Browser compatibiliteit** — Vereist moderne browser met ES6+ support

## Licentie

Onderdeel van het Drenthe Noodnetwerk project.
