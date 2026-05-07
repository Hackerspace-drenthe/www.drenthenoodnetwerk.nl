/**
 * Slide Configuration
 * Single Responsibility: Manages slide data and content
 * Following SOLID principles - data separated from logic
 */

export const slidesData = [
  {
    id: 1,
    title: "Meshcore Maand - Mei 2026",
    image: "../assets/images/01-meshcoremaand.png",
    description: "Mei 2026 is Meshcore Maand bij Hackerspace Drenthe. Een hele maand gewijd aan het bouwen van een decentraal noodnetwerk voor Drenthe.",
    speechText: `Welkom bij de Meshcore Drenthe presentatie. 
    Mei 2026 is Meshcore Maand. Een hele maand gewijd aan het bouwen van een decentraal noodnetwerk voor de provincie Drenthe. 
    Elke woensdag komen we samen in De Nieuwe Veste in Coevorden om te werken aan dit bijzondere project. 
    De kick-off is vandaag, 6 mei, waar we beginnen met de eerste prototypes en iedereen kan meedoen.`,
    keywords: ["meshcore", "mei", "drenthe", "noodnetwerk", "hackerspace"],
    category: "intro"
  },
  {
    id: 2,
    title: "Wat is Meshcore?",
    image: "../assets/images/02-wat-is-meshcore.jpeg",
    description: "Stel je voor: een estafette van walkietalkies. Elk apparaat geeft berichten door aan het volgende. Geen zendmast, geen abonnement, geen internet.",
    speechText: `Wat is Meshcore precies? 
    Stel je voor: een estafette van walkietalkies. Elk apparaat geeft berichten door aan het volgende, totdat het bericht aankomt. 
    Geen zendmast nodig, geen abonnement, geen internet. Dát is Meshcore. 
    Het is een open-source mesh-netwerk dat draait op Lora-technologie. 
    Nodes sturen berichten door van punt naar punt, volledig decentraal. 
    Als één punt uitvalt, vinden berichten automatisch een andere route. 
    Het netwerk heelt zichzelf.`,
    keywords: ["meshcore", "mesh netwerk", "lora", "decentraal", "open source"],
    category: "explanation"
  },
  {
    id: 3,
    title: "Hoe werkt het?",
    image: "../assets/images/03-hoe-werkt-het.jpeg",
    description: "Van LoRa-radiogolven tot Meshcore-firmware: stap voor stap begrijpen hoe het mesh-netwerk werkt.",
    speechText: `Hoe werkt het mesh-netwerk technisch? 
    Het netwerk gebruikt Lora-technologie: Long Range, low power radiogolven op 868 megahertz. 
    Deze frequentie is vrij te gebruiken in Europa en heeft een bereik tot 15 kilometer in open terrein. 
    Elk apparaat draait Meshcore firmware, die automatisch verbindingen maakt met omliggende nodes. 
    Berichten worden versleuteld en efficiënt gerouteerd door het netwerk. 
    Het verbruik is zo laag dat nodes maandenlang op een batterij kunnen draaien, 
    of oneindig op zonne-energie.`,
    keywords: ["lora", "technologie", "868 mhz", "bereik", "firmware"],
    category: "technical"
  },
  {
    id: 4,
    title: "Netwerk Kaart Drenthe",
    image: "../assets/images/04-netwerk-kaart.jpeg",
    description: "Interactieve kaart van het geplande netwerk. Bekijk waar nodes komen en hoe ze Drenthe gaan bedekken.",
    speechText: `De netwerkkaart van Drenthe. 
    Op deze kaart zie je alle geplande en actieve node-locaties. 
    De grote steden zijn al goed gedekt: Emmen, Assen en Hoogeveen hebben bereik dankzij zendamateurs van DARES. 
    Maar daartussen is er weinig tot geen dekking. 
    Plaatsen als Borger, Emmer-Compascuum en Weerdinge hebben meestal geen bereik. 
    Drenthe is het perfecte testgebied: grote afstanden, verspreide dorpen, en kwetsbaar bij stroomuitval. 
    Daar kunnen we wat aan veranderen door in onze eigen omgeving aansluiting te zoeken en een fijnmazig netwerk op te zetten. 
    We richten ons eerst op strategische locaties: hoge gebouwen, kerktorens, en gemeenschapscentra. 
    Het doel is niet om overal direct dekking te hebben, maar om een robuuste basis te leggen 
    die kan groeien naarmate meer mensen meedoen. 
    Elk extra punt versterkt het netwerk.`,
    keywords: ["netwerk", "kaart", "drenthe", "nodes", "dekking"],
    category: "planning"
  },
  {
    id: 5,
    title: "Meedoen",
    image: "../assets/images/05-meedoen.jpeg",
    description: "Doe mee! Of je nu soldeer-ervaring hebt of voor het eerst een schroevendraaier vasthoudt — er is een rol voor iedereen.",
    speechText: `Hoe kun je meedoen? 
    Er is een rol voor iedereen, ongeacht je technische achtergrond. 
    Ben je handig met solderen? Help met het bouwen van nodes. 
    Meer interesse in software? Help met firmware-configuratie en testing. 
    Heb je een hoge locatie beschikbaar? Overweeg een repeater-node te plaatsen. 
    Wil je graag documenteren of lesgeven? Help anderen op weg. 
    Geen ervaring? Geen probleem. Tijdens de hak-avonden begeleiden we je stap voor stap. 
    Je eigen hardware kost tussen de 20 en 50 euro.`,
    keywords: ["meedoen", "vrijwilligers", "community", "hardware", "hulp"],
    category: "participation"
  },
  {
    id: 6,
    title: "Planning & Roadmap",
    image: "../assets/images/06-planning.jpeg",
    description: "Mei 2026 is de jumpstart. Bekijk de tijdlijn en activiteiten voor de komende weken.",
    speechText: `De planning voor Meshcore Maand. 
    Mei is de maand om het project op gang te krijgen. Niet het eindresultaat, maar de vonk. 
    Elke woensdag in mei komen we samen: 6 mei voor de kick-off, daarna op 13, 20 en 27 mei. 
    Deur open om 19 uur, koffie om half 8, start om 8 uur. 
    De eerste avond richten we ons op firmware flashen en eerste configuratie. 
    Daarna gaan we verder met bereik optimaliseren, antennes installeren, en netwerk-analyse. 
    Na mei gaan we gewoon door, elke woensdag bij Hackerspace Drenthe.`,
    keywords: ["planning", "mei", "woensdagen", "tijdlijn", "activiteiten"],
    category: "schedule"
  },
  {
    id: 7,
    title: "MeshCore Academy",
    image: "../assets/images/07-meshcore-academy.jpeg",
    description: "Leer alles over mesh-netwerken in onze gratis interactieve cursusreeks. 19 modules, quizzen en certificering.",
    speechText: `De Meshcore Academy. 
    Wil je dieper duiken in de technologie? We hebben een complete gratis cursusreeks ontwikkeld. 
    19 interactieve modules die je meenemen van de basis van Lora, 
    tot gevorderde onderwerpen als link budget planning en netwerk-ontwerp. 
    Elke module bevat quizzen om je kennis te testen, 
    praktische tools zoals een bereik-calculator, 
    en duidelijke uitleg met visualisaties. 
    Voltooi je alle modules? Dan ontvang je een certificaat. 
    Perfect voor beginners én voor mensen die hun kennis willen verdiepen. 
    De Academy is toegankelijk via de website.`,
    keywords: ["academy", "cursus", "leren", "certificaat", "opleiding"],
    category: "education"
  }
];

/**
 * Get slide by ID
 * @param {number} id - Slide ID
 * @returns {Object|null} Slide data or null
 */
export function getSlideById(id) {
  return slidesData.find(slide => slide.id === id) || null;
}

/**
 * Get total number of slides
 * @returns {number} Total slides
 */
export function getTotalSlides() {
  return slidesData.length;
}

/**
 * Get slides by category
 * @param {string} category - Category name
 * @returns {Array} Filtered slides
 */
export function getSlidesByCategory(category) {
  return slidesData.filter(slide => slide.category === category);
}

/**
 * Validate slide data structure
 * @param {Object} slide - Slide object
 * @returns {boolean} Is valid
 */
export function validateSlide(slide) {
  return (
    slide &&
    typeof slide.id === 'number' &&
    typeof slide.title === 'string' &&
    typeof slide.image === 'string' &&
    typeof slide.description === 'string' &&
    typeof slide.speechText === 'string' &&
    Array.isArray(slide.keywords) &&
    typeof slide.category === 'string'
  );
}

export default slidesData;
