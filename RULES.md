# RULES.md — Projectregels & Randvoorwaarden

Dit document definieert de verplichte regels, principes en randvoorwaarden waaraan alle projecten binnen deze workspace moeten voldoen.

---

## 0. Communicatie

| Regel | Toelichting |
|---|---|
| **Altijd vragen bij twijfel** | Als iets onduidelijk, dubbelzinnig of onzeker is: stel eerst een verduidelijkende vraag voordat je actie onderneemt. Aannames zijn niet toegestaan — vraag liever één keer te veel dan één keer te weinig. |

---

## 1. Technologie & Webstandaarden

| Regel | Toelichting |
|---|---|
| **Alleen HTML, CSS, JavaScript en SVG** | Geen server-side frameworks, geen compiled languages tenzij expliciet afgesproken. |
| **Webstandaarden (W3C)** | Alle code volgt de officiële W3C-specificaties voor HTML5, CSS3, SVG en ECMAScript. |
| **Semantische HTML** | Gebruik de juiste HTML-elementen voor hun bedoelde doel (`<nav>`, `<main>`, `<article>`, `<section>`, `<header>`, `<footer>`, etc.). |
| **Progressive Enhancement** | Basisfunctionaliteit werkt zonder JavaScript; JS voegt verbeteringen toe. |
| **Geen vendor-specifieke hacks** | Geen `-webkit-`/`-moz-`-prefixes tenzij er geen standaard-alternatief bestaat. |

---

## 2. Self-Contained & Lokaal

| Regel | Toelichting |
|---|---|
| **Geen externe bronnen** | Geen CDN-links, externe API's, Google Fonts, of hosted libraries. Alles draait volledig offline. |
| **Alle assets lokaal** | Fonts, afbeeldingen, iconen, scripts en stylesheets worden meegeleverd in de repository. |
| **Geen externe dependencies at runtime** | Het project mag niet afhankelijk zijn van een internetverbinding om te functioneren. |
| **Inline SVG waar mogelijk** | SVG-iconen en -graphics worden inline opgenomen of als lokale bestanden geladen. |
| **Zelfstandig deploybaar** | Het project is direct bruikbaar zonder build-stap. Open `index.html` in de browser — werkt ook via `file://`. Een optionele lokale server (`./serve.sh`) is handig voor development. |

---

## 3. SOLID Architectuur

Alle code wordt ontworpen volgens de SOLID-principes:

### S — Single Responsibility Principle (SRP)
- Elk bestand, module en functie heeft **één duidelijke verantwoordelijkheid**.
- HTML bevat structuur, CSS bevat presentatie, JS bevat gedrag — strikte scheiding.
- Eén JavaScript-module per functioneel domein (bijv. `navigation.js`, `form-validation.js`).

### O — Open/Closed Principle (OCP)
- Modules zijn **open voor uitbreiding, gesloten voor wijziging**.
- Gebruik configuratie-objecten en callback-patronen in plaats van hardcoded logica.
- Nieuwe functionaliteit wordt toegevoegd via nieuwe modules, niet door bestaande te wijzigen.

### L — Liskov Substitution Principle (LSP)
- Componenten met dezelfde interface zijn **onderling uitwisselbaar**.
- Herbruikbare componenten gedragen zich consistent ongeacht de context.
- Een generieke `Component`-interface kan vervangen worden door elke specifieke implementatie.

### I — Interface Segregation Principle (ISP)
- Modules exporteren **alleen wat consumenten nodig hebben**.
- Geen god-objects of mega-utilities — splits in gerichte, kleine interfaces.
- Gebruik duidelijke functienamen en splits per bestand zodat elke file een smalle API biedt.

### D — Dependency Inversion Principle (DIP)
- High-level modules zijn **niet afhankelijk van low-level details**.
- Gebruik dependency injection: geef dependencies mee als parameters.
- Configuratie en constanten worden gecentraliseerd, niet verspreid door de codebase.

---

## 4. Herbruikbare Resources

| Regel | Toelichting |
|---|---|
| **DRY-principe** | Don't Repeat Yourself — gedeelde logica wordt geëxtraheerd naar herbruikbare modules. |
| **Componentbibliotheek** | Herbruikbare UI-componenten worden verzameld in een `/components/`-map. |
| **Gedeelde utilities** | Helper-functies en constanten staan in `/utils/` of `/shared/`. |
| **CSS Custom Properties** | Design tokens (kleuren, spacing, typografie) worden gedefinieerd als CSS variabelen in een centraal `:root`-blok. |
| **SVG Sprite/Symbolen** | Herbruikbare iconen worden beheerd via SVG `<symbol>` en `<use>`. |
| **Template-patronen** | Herhalende HTML-structuren worden gegenereerd via JavaScript template-functies. |

---

## 5. PDCA-Methode (Plan-Do-Check-Act)

Elk project en elke feature doorloopt de PDCA-cyclus:

### Plan
- Definieer het doel, de scope en de acceptatiecriteria **voordat** er code wordt geschreven.
- Documenteer de aanpak in een korte beschrijving (issue, commentaar, of ontwerpdocument).
- Identificeer risico's en afhankelijkheden.

### Do
- Implementeer volgens de afgesproken specificaties en deze RULES.md.
- Werk in kleine, verifieerbare stappen (atomaire commits).
- Schrijf unit tests gelijktijdig met de implementatie.

### Check
- Voer alle unit tests uit en verifieer dat ze slagen.
- Controleer op WCAG-compliance.
- Valideer HTML/CSS via W3C-validators.
- Review code tegen de SOLID-principes en overige regels in dit document.

### Act
- Verwerk feedback en verbeter waar nodig.
- Documenteer geleerde lessen en pas het proces aan.
- Herbruikbare oplossingen worden opgenomen in de componentbibliotheek.

---

## 6. Best Practices

### Code Kwaliteit
- **Strict mode**: Alle JavaScript begint met `'use strict';` of wordt geladen via IIFE's.
- **Minimale globals**: State is ingekapseld in closures of IIFE's. Gedeelde functies worden via `<script defer>` in laadvolgorde beschikbaar.
- **Const by default**: Gebruik `const` tenzij herwijzing noodzakelijk is, dan `let`. Nooit `var`.
- **Beschrijvende naamgeving**: Code-variabelen, functies en CSS-klassen in het Engels. HTML-bestandsnamen mogen Nederlandstalig zijn als ze dienen als publieke URL's (bijv. `meedoen.html`, `woordenlijst.html`).
- **Kleine functies**: Functies doen één ding en zijn maximaal ~20 regels.
- **Geen magic numbers**: Gebruik benoemde constanten.

### Bestandsstructuur

> Dit is de generieke basisstructuur. Voor projectspecifieke uitwerking zie [PLAN.md](PLAN.md).

```
project/
├── index.html
├── css/
│   ├── variables.css      # Design tokens
│   ├── reset.css           # CSS reset/normalize
│   ├── base.css            # Basis-stijlen
│   └── components/         # Component-specifieke CSS
├── js/
│   ├── main.js             # Entry point
│   ├── components/         # UI-componenten
│   ├── utils/              # Helper-functies
│   └── config/             # Configuratie & constanten
├── assets/
│   ├── images/
│   ├── fonts/
│   └── icons/              # SVG-iconen
├── tests/
│   ├── unit/               # Unit tests
│   └── test-runner.html    # Lokale test-runner
└── RULES.md
```

### Performance
- **Lazy loading**: Laad resources pas wanneer ze nodig zijn.
- **Minimale DOM-manipulatie**: Batch DOM-updates, gebruik DocumentFragments.
- **Event delegation**: Gebruik event delegation in plaats van individuele listeners op elk element.
- **Debounce/throttle**: Pas toe op scroll-, resize- en input-events.

### Versiebeheer
- Atomaire commits met duidelijke commit-berichten.
- Feature branches met beschrijvende namen.
- Geen ongebruikte code committen — verwijder dead code.

---

## 7. WCAG Compliance (AA-niveau minimum)

### Perceivable (Waarneembaar)
- **Tekstalternatieven**: Alle niet-tekst content heeft een `alt`-attribuut of `aria-label`.
- **Kleurcontrast**: Minimaal 4.5:1 voor normale tekst, 3:1 voor grote tekst (WCAG AA).
- **Geen informatie alleen via kleur**: Gebruik ook iconen, tekst of patronen.
- **Responsive**: Content is bruikbaar op alle schermformaten (320px–2560px).

### Operable (Bedienbaar)
- **Toetsenbordtoegankelijk**: Alle interactieve elementen zijn bereikbaar en bedienbaar via toetsenbord.
- **Focus-indicatoren**: Zichtbare focusstijlen op alle interactieve elementen.
- **Skip-links**: Navigatie bevat een "skip to content"-link.
- **Geen toetsenbordvallen**: Gebruikers kunnen altijd weg navigeren van elk element.

### Understandable (Begrijpelijk)
- **Taalattribuut**: `<html lang="nl">` of de juiste taalcode.
- **Formulierlabels**: Elk invoerveld heeft een gekoppeld `<label>`.
- **Foutmeldingen**: Duidelijke, beschrijvende foutmeldingen bij formuliervalidatie.
- **Consistent gedrag**: Navigatie en interactie-patronen zijn consistent door het hele project.

### Robust (Robuust)
- **Valide HTML**: Geen validatiefouten in de W3C HTML-validator.
- **ARIA correct**: ARIA-rollen en -attributen zijn correct toegepast; gebruik native HTML-elementen waar mogelijk.
- **Compatibiliteit**: Werkt in de laatste twee versies van Chrome, Firefox, Safari en Edge.

---

## 8. Unit Tests — Standaard Vereist

| Regel | Toelichting |
|---|---|
| **Tests zijn verplicht** | Elke JavaScript-module heeft bijbehorende unit tests. |
| **Geen externe test-frameworks** | Tests draaien met een eenvoudige, lokale test-runner (self-contained). |
| **Test-bestandsnaamgeving** | `[module].test.js` naast of in de `/tests/unit/`-map. |
| **Minimale dekking** | Alle publieke functies hebben minimaal één test voor het verwachte gedrag en één voor edge cases. |
| **Assertions** | Gebruik een minimale, zelfgebouwde `assert`-library of de ingebouwde `console.assert`. |
| **Isolatie** | Tests zijn onafhankelijk van elkaar — geen gedeelde state tussen tests. |
| **Draait in de browser** | De test-runner is een HTML-bestand dat direct in de browser geopend kan worden. |

### Voorbeeld test-structuur
```javascript
// tests/unit/utils.test.js
// Functions worden geladen als globals via <script> in test-runner.html

TestRunner.describe('capitalize', () => {
  TestRunner.it('should capitalize the first letter', () => {
    TestRunner.assert(capitalize('hello') === 'Hello');
  });

  TestRunner.it('should handle empty strings', () => {
    TestRunner.assert(capitalize('') === '');
  });
});
```

---

## 9. Samenvatting Checklist

Gebruik deze checklist bij elke oplevering:

- [ ] Code volgt W3C webstandaarden (HTML5, CSS3, JavaScript, SVG)
- [ ] Geen externe bronnen — alles is lokaal en self-contained
- [ ] SOLID-principes zijn toegepast
- [ ] Herbruikbare resources zijn geëxtraheerd en gedocumenteerd
- [ ] PDCA-cyclus is doorlopen (Plan → Do → Check → Act)
- [ ] Best practices voor code kwaliteit zijn gevolgd
- [ ] WCAG AA-compliance is geverifieerd
- [ ] Unit tests zijn geschreven en slagen
- [ ] HTML is gevalideerd (geen errors)
- [ ] Bestandsstructuur volgt de afgesproken conventie

---

*Dit document is leidend voor alle projectbeslissingen. Afwijkingen worden alleen geaccepteerd met expliciete onderbouwing en documentatie.*
