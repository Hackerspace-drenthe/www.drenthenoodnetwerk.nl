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
    id: 6,
    date: '2026-05-21',
    category: 'voortgang',
    title: 'Statusupdate Drenthe Noodnetwerk: Ontwikkelingen na week 3',
    summary: 'In drie weken is het Drenthe Noodnetwerk van concept naar operationele testfases gegaan. De focus verschuift nu naar netwerkoptimalisatie en strategische opschaling met de Veiligheidsregio Drenthe.',
    content: `
      <p>In een tijdsbestek van drie weken heeft het Drenthe Noodnetwerk de transitie gemaakt van conceptfase naar de eerste operationele testfases. Door een hoge participatiegraad van radioamateurs en technisch georienteerde beginners is de hardware-basis nu provinciaal uitgerold.</p>

      <figure class="news-article__media">
        <img src="assets/images/news/statusupdate-week3-2026-05-21.png" alt="Statusvisual van Drenthe Noodnetwerk na week 3" loading="lazy" decoding="async">
        <figcaption>Statusvisual van het netwerk na de eerste drie werkweken.</figcaption>
      </figure>

      <p><strong>Evaluatie bijeenkomsten 1 t/m 3</strong></p>
      <ul>
        <li><strong>Avond 1 (Introductie & Protocol):</strong> Presentatie over Meshcore-technologie aan een doelgroep van 15+ technisch georienteerde deelnemers. Introductie van de decentrale netwerkarchitectuur, bijgewoond door RTV Drenthe.</li>
        <li><strong>Avond 2 (Hardware-integratie):</strong> Praktische assemblagefase. Alle aanwezige deelnemers hebben een functionele node geconfigureerd. Ook zijn de specificaties vastgesteld voor vervolgexperimenten met externe antennes, behuizingsontwerpen, accucapaciteit en off-grid zonne-energiesystemen.</li>
        <li><strong>Avond 3 (Infrastructuur & Werkgroepen):</strong> Gastpresentatie door Wilco (VRD) over de roadmap en actuele netwerkstatus van de veiligheidsregio. De groep is daarna opgesplitst in twee operationele eenheden:</li>
      </ul>

      <p><strong>Werkgroepen</strong></p>
      <ul>
        <li><strong>Werkgroep Analyse:</strong> Verantwoordelijk voor packet-tracking, link-budget berekeningen en QoS-monitoring ("komen mijn berichten aan?").</li>
        <li><strong>Werkgroep 3D-Printen:</strong> Verantwoordelijk voor het ontwerpen en produceren van weerbestendige (IP-rated) outdoor-behuizingen.</li>
      </ul>

      <p><strong>Actuele netwerktopologie en dekking</strong></p>
      <ul>
        <li><strong>RF-link Emmer-Compascuum:</strong> Bevindt zich momenteel nog out-of-range. Dit segment heeft hoge prioriteit voor de komende uitrolfase.</li>
        <li><strong>Regio Emmen & Coevorden:</strong> Vertonen een stabiele netwerkverbinding met betrouwbare data-throughput.</li>
        <li><strong>Langeafstandslink:</strong> Succesvolle point-to-point verbinding gerealiseerd door Vincent vanaf Emlichheim rechtstreeks naar de NAM-locatie.</li>
      </ul>

      <p><strong>Nieuwe targets en schaalvergroting (week 3)</strong></p>
      <ul>
        <li><strong>Locatie-inventarisatie scholengemeenschap:</strong> Er is een verkennend overleg gestart om 8 strategische locaties te screenen op geschiktheid voor repeater-installaties. Dit biedt voordelen in geografische spreiding en antennehoogte.</li>
        <li><strong>VRD-coordinatie:</strong> De Veiligheidsregio Drenthe start op korte termijn met de uitrol van 8 eigen repeaters op hoge locaties. Integratie van schoollocaties wordt direct afgestemd om overlap te voorkomen en blinde vlekken efficient op te vullen.</li>
      </ul>

      <p>Technische documentatie, updates en netwerkdata zijn beschikbaar via <a href="https://www.drenthenoodnetwerk.nl" rel="noopener noreferrer" target="_blank">drenthenoodnetwerk.nl</a>.</p>
    `,
    tags: ['statusupdate', 'week-3', 'vrd', 'netwerkdekking', 'werkgroepen'],
    featured: true
  },
  {
    id: 5,
    date: '2026-05-07',
    category: 'voortgang',
    title: 'RTV Drenthe Publiceert Artikel over Meshcore Drenthe',
    summary: 'RTV Drenthe publiceert uitgebreid artikel: "Hackerspace Drenthe werkt aan een noodnetwerk voor de provincie"',
    content: `
      <p>Dinsdagavond 7 mei publiceerde RTV Drenthe een uitgebreid artikel over het Meshcore Drenthe project. Journalist Mart Beuker sprak met Maurice Kremer en Rein Velt over het noodnetwerk.</p>
      
      <p><strong>Hoogtepunten uit het artikel:</strong></p>
      <ul>
        <li><strong>Veiligheidsregio Drenthe</strong> bevestigt dat ook zij aan het experimenteren is met de technologie</li>
        <li><strong>Huidige dekking:</strong> Grotere plaatsen zoals Emmen en Assen hebben al verbinding, kleinere dorpen zoals Erica, Weerdinge en Nieuw-Weerdinge nog niet</li>
        <li><strong>Kosten:</strong> Basis node tussen €20-50, met zonnepaneel €60-100</li>
        <li><strong>Droomscenario:</strong> Volgend jaar een dekkend netwerk in heel Drenthe</li>
        <li><strong>Oproep:</strong> "Heb je een hoge plek, meld je bij ons, dan knallen we er een antenne op"</li>
      </ul>
      
      <p>Het artikel beschrijft het netwerk als een "walkietalkie-estafette" waarbij berichten van apparaat naar apparaat springen. Een heldere uitleg voor een breed publiek!</p>
      
      <p>Ook wordt benadrukt dat we <strong>elke woensdag in het Fablab in Coevorden</strong> werken aan het project. Iedereen die hulp nodig heeft is welkom om langs te komen.</p>
      
      <p>De publiciteit via RTV Drenthe helpt enorm om meer mensen te bereiken en het belang van decentrale communicatie onder de aandacht te brengen.</p>
    `,
    tags: ['rtv-drenthe', 'media', 'publiciteit', 'veiligheidsregio'],
    link: 'https://www.rtvdrenthe.nl/nieuws/18438486/hackerspace-drenthe-werkt-aan-een-noodnetwerk-voor-de-provincie',
    featured: true
  },
  {
    id: 4,
    date: '2026-05-17',
    category: 'evenement',
    title: 'Radio Interview bij ZO!34',
    summary: 'Live radio-interview bij ZO!34 over het Meshcore Drenthe project op zondag 17 mei om 10:10 uur.',
    content: `
      <p>Zondag 17 mei om 10:10 uur is Meshcore Drenthe te gast bij lokale radiozender ZO!34 voor een uitgebreid interview over het project.</p>
      <p>We vertellen over de kickoff, de deelnemers, en wat de plannen zijn voor de komende weken. Een mooie kans om het project onder de aandacht te brengen bij een breed publiek!</p>
      <p><strong>Details:</strong></p>
      <ul>
        <li>Datum: Zondag 17 mei 2026</li>
        <li>Tijd: 10:10 uur</li>
        <li>Zender: ZO!34</li>
      </ul>
    `,
    tags: ['media', 'radio', 'zo34', 'interview'],
    featured: false
  },
  {
    id: 3,
    date: '2026-05-08',
    category: 'evenement',
    title: 'Radio Interview bij RTV Drenthe',
    summary: 'Vroeg op vrijdagochtend waren we live te gast bij RTV Drenthe om te vertellen over Meshcore Drenthe.',
    content: `
      <p>Vrijdag 8 mei om 8:45 uur waren we te gast in het ochtendprogramma van RTV Drenthe Radio. Een prachtige gelegenheid om het Meshcore Drenthe project te introduceren aan een breed publiek.</p>
      <p>We bespraken wat mesh-netwerken zijn, waarom ze belangrijk zijn voor Drenthe, en hoe mensen kunnen meedoen met het project. De interesse was groot en de vragen waren scherp!</p>
      <p><strong>Details:</strong></p>
      <ul>
        <li>Datum: Vrijdag 8 mei 2026</li>
        <li>Tijd: 8:45 uur</li>
        <li>Zender: RTV Drenthe Radio</li>
      </ul>
    `,
    tags: ['media', 'radio', 'rtv-drenthe', 'interview'],
    featured: true
  },
  {
    id: 2,
    date: '2026-05-06',
    category: 'evenement',
    title: 'Succesvolle Kickoff Meshcore Maand! 🎉',
    summary: 'Woensdag 6 mei was de kickoff van Meshcore Maand een groot succes met veel nieuwe deelnemers en expertise.',
    content: `
      <p>De kickoff van Meshcore Maand op 6 mei was een overweldigend succes! Veel meer deelnemers dan verwacht kwamen naar De Nieuwe Veste in Coevorden om kennis te maken met het project.</p>
      
      <p><strong>Hoogtepunten:</strong></p>
      <ul>
        <li>Grote opkomst van nieuwe deelnemers</li>
        <li>Diverse expertise aanwezig, waaronder gecertificeerde radioamateurs</li>
        <li>RTV Drenthe was aanwezig om opnames te maken</li>
        <li>Eerste nodes zijn geconfigureerd en getest</li>
        <li>Enthousiaste sfeer en veel technische discussies</li>
      </ul>
      
      <p>Bijzonder waardevol was de aanwezigheid van meerdere gecertificeerde radioamateurs. Hun kennis van RF-technologie, antennes en propagatie is van onschatbare waarde voor het project. Ze kunnen ons helpen met optimale plaatsing van nodes en bereik-optimalisatie.</p>
      
      <p>RTV Drenthe maakte opnames voor een reportage over het project. Dit zal helpen om nog meer mensen te bereiken en het belang van decentrale communicatie onder de aandacht te brengen.</p>
      
      <p>Komende woensdagen bouwen we verder op deze succesvolle start!</p>
    `,
    tags: ['kickoff', 'hackavond', 'radioamateurs', 'rtv-drenthe', 'mei-2026'],
    featured: true
  },
  {
    id: 1,
    date: '2026-04-28',
    category: 'aankondiging',
    title: 'Meshcore Maand Mei 2026 Aangekondigd',
    summary: 'Hackerspace Drenthe kondigt Meshcore Maand aan: een hele maand gewijd aan het opzetten van een decentraal noodnetwerk.',
    content: `
      <p>Mei 2026 wordt Meshcore Maand bij Hackerspace Drenthe! Een hele maand gewijd aan het bouwen van een decentraal mesh-communicatienetwerk voor de provincie Drenthe.</p>
      
      <p><strong>Wat is het plan?</strong></p>
      <p>Elke woensdag in mei komen we samen in De Nieuwe Veste in Coevorden om te werken aan het netwerk. We starten met de kickoff op 6 mei, gevolgd door werkavonden op 13, 20 en 27 mei.</p>
      
      <p><strong>Waarom een mesh-netwerk?</strong></p>
      <p>Bij stroomuitval of calamiteiten valt reguliere communicatie vaak uit. Een mesh-netwerk op LoRa-technologie biedt een robuuste backup:</p>
      <ul>
        <li>Werkt zonder internet of telefoonnetwerk</li>
        <li>Lange afstanden (tot 15 km in open terrein)</li>
        <li>Zeer laag stroomverbruik</li>
        <li>Kan draaien op zonne-energie</li>
        <li>Decentraal en zelfhelend</li>
      </ul>
      
      <p><strong>Meedoen?</strong></p>
      <p>Iedereen is welkom, ongeacht technische achtergrond. Of je nu ervaring hebt met radio, elektronica, programmeren, of gewoon nieuwsgierig bent - er is een rol voor iedereen!</p>
      
      <p>Locatie: De Nieuwe Veste, Coevorden<br>
      Tijd: 19:00 deur open, 20:00 start<br>
      Data: elke woensdag in mei 2026</p>
    `,
    tags: ['aankondiging', 'meshcore-maand', 'mei-2026', 'kickoff'],
    featured: false
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
