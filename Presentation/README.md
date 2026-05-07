# Meshcore Drenthe Presentatie Systeem

Een interactieve presentatie met Nederlandse spraaksynthese over het Meshcore Drenthe project.

## 🏗️ Architectuur

Dit project volgt **SOLID principes** en de **PDCA methodologie**.

### SOLID Principes

#### Single Responsibility Principle (SRP)
Elk component heeft één duidelijke verantwoordelijkheid:
- `SpeechService`: Alleen spraaksynthese
- `SlideManager`: Alleen slide-beheer
- `NavigationController`: Alleen navigatie-logica
- `PresentationController`: Alleen orkestratie

#### Open/Closed Principle (OCP)
- Componenten zijn open voor uitbreiding (nieuwe features toevoegen)
- Gesloten voor modificatie (core functionaliteit blijft stabiel)
- Voorbeeld: Nieuwe slide-types kunnen worden toegevoegd zonder bestaande code te wijzigen

#### Liskov Substitution Principle (LSP)
- Services kunnen worden vervangen door alternatieve implementaties
- Interface-based design maakt substitutie mogelijk

#### Interface Segregation Principle (ISP)
- Kleine, gefocuste interfaces
- Controllers gebruiken alleen de methoden die ze nodig hebben

#### Dependency Inversion Principle (DIP)
- High-level modules (PresentationController) zijn niet afhankelijk van low-level modules
- Beide zijn afhankelijk van abstracties
- Dependency injection wordt gebruikt voor loose coupling

### PDCA Methodologie

Het presentatiesysteem implementeert de **Plan-Do-Check-Act** cyclus:

#### 1️⃣ PLAN (Plannen)
- Initialisatie van alle services
- Laden van slide-data
- Setup van event listeners
- Preloaden van afbeeldingen

#### 2️⃣ DO (Uitvoeren)
- Presentatie uitvoeren
- Spraak afspelen
- Navigeren tussen slides

#### 3️⃣ CHECK (Controleren)
- Voortgang monitoren
- Slide-views tracken
- Metrics verzamelen
- Valideren van gebruikersacties

#### 4️⃣ ACT (Aanpassen)
- Optimalisaties doorvoeren
- Reageren op voltooiing
- Analytics verzamelen
- Feedback verwerken

De PDCA-fase is zichtbaar in de UI (rechtsboven) en wordt automatisch bijgewerkt.

## 📁 Project Structuur

```
Presentation/
├── index.html                  # Hoofdpagina
├── presentation.css            # Styling
├── app.js                      # Entry point
├── config/
│   └── slides.js              # Slide data en configuratie
├── services/
│   ├── SpeechService.js       # Spraaksynthese service
│   └── SlideManager.js        # Slide management service
├── controllers/
│   ├── NavigationController.js # Navigatie controller
│   └── PresentationController.js # Hoofd controller (PDCA)
└── utils/
    └── helpers.js             # Helper functies
```

## 🚀 Features

### Core Features
- ✅ 7 slides met afbeeldingen uit assets/images
- ✅ Nederlandse spraaksynthese
- ✅ Keyboard navigatie (pijltjestoetsen, spatie, Home, End)
- ✅ Auto-play functionaliteit
- ✅ Aanpasbare spraaksnelheid
- ✅ Voortgangsbalk
- ✅ PDCA fase-indicator
- ✅ Responsive design
- ✅ Toegankelijkheid (ARIA labels, keyboard support)

### Navigatie
- **Vorige/Volgende** knoppen
- **Pijltjestoetsen**: ← vorige, → volgende
- **Spatiebalk**: volgende slide
- **Home**: eerste slide
- **End**: laatste slide

### Spraakbesturing
- **Uitleg knop**: Spreek huidige slide uit
- **Pauzeer knop**: Pauzeer/hervat spraak
- **Stop knop**: Stop spraak
- **Snelheidsregelaar**: Pas spraaksnelheid aan (0.5x - 2x)

### Auto-play
- Automatisch door slides gaan
- Instelbare vertraging tussen slides (standaard 10 seconden)
- Toggle aan/uit

## 🎯 Gebruik

### Basis Gebruik
1. Open `index.html` in een moderne browser
2. Gebruik navigatieknoppen of toetsenbord om door slides te gaan
3. Klik op "Uitleg" om de Nederlandse uitleg te horen
4. Pas spraaksnelheid aan indien gewenst

### Keyboard Shortcuts
| Toets | Actie |
|-------|-------|
| `←` / `PageUp` | Vorige slide |
| `→` / `PageDown` / `Space` | Volgende slide |
| `Home` | Eerste slide |
| `End` | Laatste slide |

### Auto-play
1. Schakel "Auto-play" toggle in
2. Presentatie gaat automatisch door elke 10 seconden
3. Schakel uit om handmatig te navigeren

## 🛠️ Technische Details

### Technologieën
- **HTML5**: Semantische markup
- **CSS3**: Modern styling met CSS Grid/Flexbox
- **JavaScript ES6+**: Modules, classes, async/await
- **Web Speech API**: Text-to-speech

### Browser Compatibiliteit
Werkt in moderne browsers met Web Speech API ondersteuning:
- ✅ Chrome/Edge (aanbevolen)
- ✅ Firefox
- ⚠️ Safari (beperkte spraakondersteuning)

### Performance Optimalisaties
- Lazy loading van afbeeldingen (behalve eerste slide)
- Image preloading voor smooth transitions
- Debounced event handlers
- Efficient DOM updates

## 📊 Metrics & Analytics

Het systeem verzamelt automatisch metrics:
- **Slides bekeken**: Aantal unieke slides
- **Spraakgebruik**: Aantal keren spraak gebruikt
- **Navigatiekliks**: Totaal aantal navigaties
- **Tijdsduur**: Totale presentatieduur
- **Voltooiingspercentage**: Voortgang door presentatie

Bekijk metrics in console: `window.presentationApp.presentationController.getMetrics()`

## 🔧 Configuratie

### Slides Toevoegen/Wijzigen
Bewerk `config/slides.js`:

```javascript
{
  id: 8,
  title: "Nieuwe Slide",
  image: "../assets/images/nieuwe-afbeelding.jpeg",
  description: "Korte beschrijving",
  speechText: "Volledige Nederlandse uitleg tekst...",
  keywords: ["tag1", "tag2"],
  category: "info"
}
```

### Spraaksnelheid Aanpassen
In `app.js` of via UI slider (0.5x - 2x)

### Auto-play Interval Aanpassen
In `controllers/NavigationController.js`:
```javascript
this.autoPlayDelay = 10000; // 10 seconden (in milliseconds)
```

## 🎨 Styling Aanpassen

Bewerk CSS variabelen in `presentation.css`:

```css
:root {
  --color-primary: #2d6a4f;
  --color-accent: #f4a261;
  --font-heading: 'Space Grotesk', sans-serif;
  /* ... meer variabelen */
}
```

## 🧪 Development

### Debug Mode
Open browser console voor gedetailleerde logs:
- Initialisatie stappen
- PDCA fase-overgangen
- Navigatie events
- Spraak events
- System information

### Global Access
Applicatie is beschikbaar via: `window.presentationApp`

Handige commando's:
```javascript
// Huidige metrics bekijken
window.presentationApp.presentationController.getMetrics()

// PDCA fase bekijken
window.presentationApp.presentationController.getPDCAPhase()

// Reset presentatie
window.presentationApp.presentationController.reset()

// Beschikbare stemmen
window.presentationApp.presentationController.getAvailableVoices()
```

## ♿ Toegankelijkheid

- **ARIA labels** op alle interactieve elementen
- **Keyboard navigatie** volledig ondersteund
- **Screen reader** ondersteuning via live regions
- **Focus indicators** voor keyboard gebruikers
- **Reduced motion** support voor gebruikers met bewegingsgevoeligheid
- **Semantische HTML** voor betere structuur

## 📝 Licentie

Open-source project van Hackerspace Drenthe.

## 👥 Contact

- **Website**: [drenthenoodnetwerk.nl](https://drenthenoodnetwerk.nl)
- **Locatie**: De Nieuwe Veste, Coevorden
- **Bijeenkomsten**: Elke woensdag 19:00-21:00

## 🚀 Toekomstige Verbeteringen

- [ ] PDF export functionaliteit
- [ ] Presenter notes weergave
- [ ] Timer voor presentaties
- [ ] Slide thumbnails overzicht
- [ ] Fullscreen mode
- [ ] Custom slide transitions
- [ ] Analytics dashboard
- [ ] Remote control via smartphone
- [ ] Offline mode met Service Worker
- [ ] Multi-language support

---

**Gebouwd met ❤️ door Hackerspace Drenthe voor Meshcore Maand Mei 2026**
