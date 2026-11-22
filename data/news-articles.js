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
    date: '2026-11-19',
    category: 'aankondiging',
    title: 'Oproep: Samen bouwen aan de Landelijke MeshCore &amp; Noodnetwerk Maand (Mei 2027)',
    summary: 'Help mee om in mei 2027 door heel Nederland activiteiten rond MeshCore, noodnetwerken en off-grid communicatie te organiseren. Dit is een open uitnodiging: er ligt nog geen landelijk programma.',
    content: `
      <figure class="news-article__media">
        <img src="assets/images/news/landelijke-meshcore-maand-2027.png" alt="Poster voor mei 2027: bouw mee aan de Landelijke MeshCore &amp; Noodnetwerk Maand, met een kaart van Nederland en mensen die samen aan radioapparatuur werken." width="1024" height="572" loading="lazy" decoding="async">
        <figcaption>Oproep om mee te denken en mee te bouwen aan een landelijke MeshCore Maand in mei 2027.</figcaption>
      </figure>

      <p>In mei 2026 organiseerden we vanuit <a href="https://hackerspace-drenthe.nl/">Hackerspace Drenthe</a> en <a href="https://drenthenoodnetwerk.nl/">Drenthe Noodnetwerk</a> de MeshCore Maand. We hebben er veel plezier aan beleefd en wat ons betreft was het een groot succes. Dat smaakt naar meer. In mei 2027 organiseren we weer een MeshCore Maand in Drenthe. Hoe mooi zou het zijn als er die maand in heel Nederland wordt gebouwd, getest en geleerd?</p>

      <h3>Het idee: heel Nederland verbonden</h3>
      <p>Door lokale en landelijke initiatieven samen te brengen, kunnen we van mei dé maand maken voor off-grid communicatie, noodnetwerken en mesh-technologie. Als we de activiteiten samen plannen, kunnen we:</p>
      <ul>
        <li>Op verschillende plekken in Nederland activiteiten organiseren waar nieuwsgierige beginners en ervaren bouwers samen kunnen knutselen, testen en leren.</li>
        <li>Samen meer mensen bereiken en meer media-aandacht krijgen dan ieder voor zich.</li>
        <li>Laten zien wat burgerinitiatieven kunnen bijdragen aan communicatie als reguliere verbindingen uitvallen.</li>
      </ul>

      <h3>Wie zoeken we?</h3>
      <ul>
        <li>Hackerspaces in heel Nederland</li>
        <li>Bestaande MeshCore-initiatieven</li>
        <li>Lokale en regionale noodnetwerkinitiatieven</li>
        <li>Veiligheidsregio’s</li>
        <li>Lokale VERON-afdelingen en andere zendamateurverenigingen</li>
      </ul>

      <h3>Doe je mee? Meedenkers gezocht!</h3>
      <p><strong>Voor de landelijke editie is nog niets geregeld.</strong> Er ligt nog geen vast plan of programma. Dit is een idee en een open uitnodiging om samen te bepalen wat mogelijk is.</p>
      <p>Wil je meedenken, een activiteit in jouw regio organiseren of helpen met de landelijke coördinatie en PR? Mail Rein via <a href="mailto:rein@hackerspace-drenthe.nl?subject=Landelijke%20MeshCore%20Maand%20mei%202027">rein@hackerspace-drenthe.nl</a>. Vertel ons uit welke regio je komt en wat je graag zou willen doen/waar jullie goed in zijn.</p>
      <p>Praat mee en deel jouw idee in de <a href="https://web.telegram.org/a/#-1004365640774_127" target="_blank" rel="noopener noreferrer">Telegramgroep voor de landelijke MeshCore Maand</a>.</p>
    `,
    tags: ['meshcore-maand', 'mei-2027', 'noodnetwerk', 'samenwerking'],
    link: 'meshcore-maand-2027.html',
    featured: true
  },
  {
    id: 7,
    date: '2026-11-18',
    category: 'voortgang',
    title: 'Nieuw: volg de groei van het Drenthe Noodnetwerk op de kaart',
    summary: 'Speel de tijdlijn af en zie wanneer repeaters voor het eerst op mc-radar verschenen. Het voortgangsrapport laat ook zien waar een veldmeting nuttig kan zijn.',
    content: `
      <p>Hoe heeft het MeshCore-netwerk in Drenthe zich ontwikkeld? Op de nieuwe interactieve kaart kun je de tijdlijn afspelen of zelf een datum kiezen. Nieuwe registraties lichten op. Met de bereiklaag zie je hoe het geschatte bereik zich over de provincie heeft uitgebreid.</p>

      <p>Bij de start telde het project <strong>35 repeaters in Drenthe</strong>. In de beschikbare mc-radar-snapshots van 16 april tot en met 18 november 2026 kwamen <strong>274 unieke repeater-ID's</strong> minstens één keer voor met coördinaten binnen de CBS-provinciegrens. Daar zitten ook registraties bij die later niet meer in de data voorkomen. Het is dus geen telling van bevestigde installaties of van repeaters die nu actief zijn.</p>

      <p>Het rapport zet de radartellingen per maand op een rij en geeft aan welke plaatsen volgens het bereikmodel buiten bereik liggen. Dat zijn aanknopingspunten voor veldmetingen: een bereikcirkel op de kaart garandeert geen ontvangst.</p>
    `,
    tags: ['netwerkkaart', 'mc-radar', 'netwerkdekking', 'voortgang'],
    link: 'Map/groei.html',
    featured: true
  },
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
