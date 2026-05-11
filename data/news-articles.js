/**
 * News Articles Data
 * Central repository for all news items
 * 
 * Article Structure:
 * {
 *   id: number,
 *   date: 'YYYY-MM-DD',
 *   category: 'aankondiging' | 'voortgang' | 'technisch' | 'evenement',
 *   title: string,
 *   summary: string,
 *   content: string (HTML allowed),
 *   tags: string[],
 *   link: string (optional),
 *   featured: boolean (optional)
 * }
 */

export const newsData = [
  {
    id: 8,
    date: '2026-05-11',
    category: 'voortgang',
    title: 'Eerste 10 Nodes Actief in Drenthe',
    summary: 'Een belangrijke mijlpaal: we hebben nu 10 actieve nodes in het netwerk, verspreid over Coevorden, Emmen en omgeving.',
    content: `
      <p>Het Meshcore Drenthe netwerk groeit gestaag! Deze week hebben we de 10e node geactiveerd, wat betekent dat we nu een werkend mesh-netwerk hebben dat meerdere dorpen verbindt.</p>
      <p><strong>Actieve locaties:</strong></p>
      <ul>
        <li>Coevorden centrum (3 nodes)</li>
        <li>Emmen noord (2 nodes)</li>
        <li>Zweeloo (1 node)</li>
        <li>Dalen (2 nodes)</li>
        <li>Sleen (2 nodes)</li>
      </ul>
      <p>De gemiddelde hop-count tussen nodes is momenteel 2.3, wat betekent dat berichten gemiddeld via 2-3 tussenliggende nodes gaan voordat ze hun bestemming bereiken.</p>
    `,
    tags: ['netwerk', 'mijlpaal', 'nodes', 'dekking'],
    featured: true
  },
  {
    id: 7,
    date: '2026-05-08',
    category: 'evenement',
    title: 'Presentatie Systeem Live',
    summary: 'We hebben een automatische presentatie ontwikkeld die het Meshcore project uitlegt met Nederlandse voice-over.',
    content: `
      <p>Voor de komende evenementen hebben we een professioneel presentatiesysteem gebouwd. De presentatie draait automatisch, heeft Nederlandse spraaksynthese, en legt in 8 slides uit wat Meshcore is en hoe je kunt meedoen.</p>
      <p>Perfect voor gebruik tijdens open dagen, marktplaatsen, of als iemand meer wil weten over het project!</p>
    `,
    tags: ['presentatie', 'automatisering', 'communicatie'],
    link: 'Presentation/index.html'
  },
  {
    id: 6,
    date: '2026-05-07',
    category: 'technisch',
    title: 'MeshCore Academy Nu Live',
    summary: 'Volledige cursusreeks met 19 modules om alles te leren over mesh-netwerken, van basis tot gevorderd.',
    content: `
      <p>De MeshCore Academy is gelanceerd! Een complete gratis cursus die je meeneemt van de basis van LoRa-technologie tot gevorderde onderwerpen zoals link budget planning en netwerk-ontwerp.</p>
      <p><strong>Wat kun je leren?</strong></p>
      <ul>
        <li>Wat is mesh networking en waarom is het belangrijk?</li>
        <li>Hoe werkt LoRa-technologie precies?</li>
        <li>Regelgeving en frequentiebeheer</li>
        <li>Hardware installeren en configureren</li>
        <li>Antennes kiezen en plaatsen</li>
        <li>Netwerk ontwerpen en troubleshooten</li>
      </ul>
      <p>Elke module bevat quizzen, praktische tools, en een certificaat na voltooiing!</p>
    `,
    tags: ['educatie', 'cursus', 'lora', 'training'],
    link: 'MeshAcademy/index.html'
  },
  {
    id: 5,
    date: '2026-05-06',
    category: 'evenement',
    title: 'Meshcore Maand van Start! 🎉',
    summary: 'Mei 2026 is officieel Meshcore Maand. Elke woensdag werken we samen aan het netwerk bij Hackerspace Drenthe.',
    content: `
      <p>Het is zover! Mei 2026 is Meshcore Maand bij Hackerspace Drenthe. Een hele maand gewijd aan het opzetten van een decentraal noodnetwerk voor Drenthe.</p>
      <p><strong>Planning:</strong></p>
      <ul>
        <li><strong>6 mei:</strong> Kick-off en eerste prototypes</li>
        <li><strong>13 mei:</strong> Firmware configuratie en eerste tests</li>
        <li><strong>20 mei:</strong> Antenne-installatie en bereik optimaliseren</li>
        <li><strong>27 mei:</strong> Netwerk-analyse en documentatie</li>
      </ul>
      <p>Locatie: De Nieuwe Veste, Coevorden<br>
      Tijd: 19:00 deur open, 20:00 start</p>
      <p>Iedereen is welkom, of je nu ervaring hebt of voor het eerst komt kijken!</p>
    `,
    tags: ['evenement', 'hackavond', 'mei', 'kick-off'],
    featured: true
  },
  {
    id: 4,
    date: '2026-04-28',
    category: 'aankondiging',
    title: 'Website Gelanceerd',
    summary: 'De officiële Meshcore Drenthe website is nu live met alle informatie over het project.',
    content: `
      <p>We zijn trots om de officiële Meshcore Drenthe website te lanceren! Hier vind je alle informatie over:</p>
      <ul>
        <li>Wat Meshcore is en hoe het werkt</li>
        <li>De netwerkkaart van Drenthe</li>
        <li>Hoe je kunt meedoen</li>
        <li>Handleidingen en documentatie</li>
        <li>Planning en evenementen</li>
        <li>Veelgestelde vragen</li>
      </ul>
      <p>De site is volledig open-source en staat op GitHub. Suggesties en verbeteringen zijn altijd welkom!</p>
    `,
    tags: ['website', 'documentatie', 'open-source']
  },
  {
    id: 3,
    date: '2026-04-15',
    category: 'technisch',
    title: 'Hardware Keuze Gemaakt',
    summary: 'Na uitgebreid testen hebben we gekozen voor de Heltec V3 en RAK WisBlock als primaire hardware platforms.',
    content: `
      <p>We hebben verschillende LoRa-boards getest en vergeleken. Onze keuze is gevallen op:</p>
      <p><strong>Voor beginners:</strong> Heltec LoRa 32 V3<br>
      - Ingebouwd display<br>
      - USB-C aansluiting<br>
      - WiFi en Bluetooth<br>
      - Goede documentatie<br>
      - Prijs: ~€25</p>
      <p><strong>Voor gevorderden:</strong> RAK WisBlock<br>
      - Modulair systeem<br>
      - Uitbreidbaar met sensoren<br>
      - Zeer laag stroomverbruik<br>
      - Professionele behuizingen<br>
      - Prijs: vanaf €30</p>
      <p>Beide platforms worden volledig ondersteund door Meshcore firmware en hebben actieve communities.</p>
    `,
    tags: ['hardware', 'lora', 'heltec', 'rak', 'apparaten']
  },
  {
    id: 2,
    date: '2026-03-20',
    category: 'voortgang',
    title: 'Eerste Succesvolle Verbinding',
    summary: 'We hebben de eerste werkende mesh-verbinding opgezet tussen Coevorden en Sleen (12 km).',
    content: `
      <p>Een belangrijke mijlpaal: de eerste succesvolle mesh-verbinding over 12 kilometer!</p>
      <p>Twee nodes, één in Coevorden en één in Sleen, konden elkaar bereiken met een sterke signaalsterkte van -89 dBm. De verbinding bleef stabiel gedurende 48 uur continue testen.</p>
      <p><strong>Setup:</strong></p>
      <ul>
        <li>Heltec V3 boards</li>
        <li>868 MHz frequentie</li>
        <li>Spreading Factor 10</li>
        <li>5 dBi externe antennes op 8 meter hoogte</li>
      </ul>
      <p>Dit bewijst dat lange-afstand mesh-communicatie in Drenthe perfect mogelijk is!</p>
    `,
    tags: ['test', 'bereik', 'verbinding', 'mijlpaal']
  },
  {
    id: 1,
    date: '2026-03-01',
    category: 'aankondiging',
    title: 'Project Meshcore Drenthe Aangekondigd',
    summary: 'Hackerspace Drenthe start met het opzetten van een decentraal mesh-netwerk voor de hele provincie.',
    content: `
      <p>Vandaag kondigen we Project Meshcore Drenthe aan: een ambitieus plan om een decentraal mesh-communicatienetwerk op te zetten voor de gehele provincie Drenthe.</p>
      <p><strong>Waarom?</strong></p>
      <p>Bij stroomuitval of calamiteiten valt de reguliere communicatie-infrastructuur vaak uit. Een mesh-netwerk biedt een robuuste backup die werkt zonder stroom, internet of telecom-providers.</p>
      <p><strong>De visie:</strong></p>
      <p>Een netwerk van LoRa-nodes verspreid over Drenthe, beheerd door vrijwilligers en gemeenschappen. Open-source, decentraal, en toegankelijk voor iedereen.</p>
      <p>We starten in mei 2026 met een kickstart-maand waarbij iedereen kan meedoen!</p>
    `,
    tags: ['aankondiging', 'start', 'visie', 'meshcore'],
    featured: true
  }
];

// Helper functions
export function getArticleById(id) {
  return newsData.find(article => article.id === id);
}

export function getArticlesByCategory(category) {
  return newsData.filter(article => article.category === category);
}

export function getFeaturedArticles() {
  return newsData.filter(article => article.featured === true);
}

export function getLatestArticles(count = 5) {
  return [...newsData]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, count);
}

export default newsData;
