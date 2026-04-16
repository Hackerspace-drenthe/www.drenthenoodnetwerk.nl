// config.js — Presentatie "Mei MeshCore Maand"
// Volledige configuratie: slide-volgorde, timing, sprekers, layout, animaties.

export default {
  slides: [
    // ── Wacht-slide (inloop, 19:20–20:00) ──────────────────────────
    {
      id: '00-wachtslide',
      file: 'slides/00-wachtslide.html',
      duration: 0,
      speaker: null,
      act: 'inloop',
      layout: 'D',
      animation: 'three-pillars',
      animationOptions: { mode: 'slow-pulse' },
      triggerMode: 'auto'
    },

    // ── Akt 1 — WAAROM (~8 min) ────────────────────────────────────
    {
      id: '01-titelslide',
      file: 'slides/01-titelslide.html',
      duration: 30,
      speaker: 'peter',
      act: 'waarom',
      layout: 'D',
      animation: null,
      animationOptions: {},
      triggerMode: 'none'
    },
    {
      id: '02-opening',
      file: 'slides/02-opening.html',
      duration: 120,
      speaker: 'peter',
      act: 'waarom',
      layout: 'D',
      animation: 'three-pillars',
      animationOptions: { highlight: null },
      triggerMode: 'click'
    },
    {
      id: '03-het-probleem',
      file: 'slides/03-het-probleem.html',
      duration: 180,
      speaker: 'peter',
      act: 'waarom',
      layout: 'B',
      animation: 'emergency-scenario',
      animationOptions: {},
      triggerMode: 'click'
    },
    {
      id: '04-waarom-drenthe',
      file: 'slides/04-waarom-drenthe.html',
      duration: 150,
      speaker: 'peter',
      act: 'waarom',
      layout: 'A',
      animation: 'drenthe-coverage',
      animationOptions: { mode: 'topology' },
      triggerMode: 'click'
    },

    // ── Akt 2 — WAT (~8 min) ───────────────────────────────────────
    {
      id: '05-wat-is-meshcore',
      file: 'slides/05-wat-is-meshcore.html',
      duration: 180,
      speaker: ['maurice', 'rein'],
      act: 'wat',
      layout: 'A',
      animation: 'mesh-hop',
      animationOptions: { speed: 1 },
      triggerMode: 'click'
    },
    {
      id: '06-hoe-werkt-lora',
      file: 'slides/06-hoe-werkt-lora.html',
      duration: 150,
      speaker: ['maurice', 'rein'],
      act: 'wat',
      layout: 'A',
      animation: 'lora-waves',
      animationOptions: { speed: 1, labels: 'nl' },
      triggerMode: 'click'
    },
    {
      id: '07-node-rollen',
      file: 'slides/07-node-rollen.html',
      duration: 150,
      speaker: ['maurice', 'rein'],
      act: 'wat',
      layout: 'A',
      animation: 'node-roles',
      animationOptions: {},
      triggerMode: 'click'
    },

    // ── Intermezzo — LIVE DEMO (~5 min) ─────────────────────────────
    {
      id: '08-live-demo',
      file: 'slides/08-live-demo.html',
      duration: 300,
      speaker: ['maurice', 'rein'],
      act: 'intermezzo',
      layout: 'B',
      animation: 'mesh-dashboard',
      animationOptions: { fallback: 'data/demo-messages.json' },
      triggerMode: 'auto'
    },

    // ── Akt 3 — HOE (~18 min) ──────────────────────────────────────
    {
      id: '09-het-signaal',
      file: 'slides/09-het-signaal.html',
      duration: 120,
      speaker: ['rein', 'maurice'],
      act: 'hoe',
      layout: 'A',
      animation: 'link-budget',
      animationOptions: {},
      triggerMode: 'click'
    },
    {
      id: '10-antennes-bereik',
      file: 'slides/10-antennes-bereik.html',
      duration: 120,
      speaker: ['rein', 'maurice'],
      act: 'hoe',
      layout: 'A',
      animation: 'antenna-range',
      animationOptions: {},
      triggerMode: 'click'
    },
    {
      id: '11-hardware-overzicht',
      file: 'slides/11-hardware-overzicht.html',
      duration: 120,
      speaker: ['rein', 'maurice'],
      act: 'hoe',
      layout: 'C',
      animation: 'hardware-gallery',
      animationOptions: { dataSource: 'data/hardware.json' },
      triggerMode: 'click'
    },
    {
      id: '12-zelf-bouwen',
      file: 'slides/12-zelf-bouwen.html',
      duration: 150,
      speaker: ['rein', 'maurice'],
      act: 'hoe',
      layout: 'A',
      animation: 'diy-build',
      animationOptions: {},
      triggerMode: 'click'
    },
    {
      id: '13-firmware-configuratie',
      file: 'slides/13-firmware-configuratie.html',
      duration: 90,
      speaker: ['rein', 'maurice'],
      act: 'hoe',
      layout: 'A',
      animation: 'flash-flow',
      animationOptions: {},
      triggerMode: 'click'
    },
    {
      id: '14-drenthe-dekking',
      file: 'slides/14-drenthe-dekking.html',
      duration: 120,
      speaker: ['rein', 'maurice'],
      act: 'hoe',
      layout: 'A',
      animation: 'drenthe-coverage',
      animationOptions: { mode: 'huidig' },
      triggerMode: 'click'
    },
    {
      id: '15-bereik-in-kaart',
      file: 'slides/15-bereik-in-kaart.html',
      duration: 180,
      speaker: ['rein', 'maurice'],
      act: 'hoe',
      layout: 'A',
      animation: 'coverage-mapping',
      animationOptions: {},
      triggerMode: 'click'
    },
    {
      id: '16-strategische-punten',
      file: 'slides/16-strategische-punten.html',
      duration: 180,
      speaker: ['rein', 'maurice'],
      act: 'hoe',
      layout: 'A',
      animation: ['strategic-sites', 'solar-install'],
      animationOptions: [{}, {}],
      triggerMode: 'sequential'
    },

    // ── Akt 4 — SAMEN (~9 min) ─────────────────────────────────────
    {
      id: '17-meshcore-academy',
      file: 'slides/17-meshcore-academy.html',
      duration: 120,
      speaker: ['maurice', 'rein'],
      act: 'samen',
      layout: 'A',
      animation: 'learning-path',
      animationOptions: {},
      triggerMode: 'click'
    },
    {
      id: '18-meedoen',
      file: 'slides/18-meedoen.html',
      duration: 150,
      speaker: ['maurice', 'rein'],
      act: 'samen',
      layout: 'C',
      animation: 'community-roles',
      animationOptions: {},
      triggerMode: 'click'
    },
    {
      id: '19-de-toekomst',
      file: 'slides/19-de-toekomst.html',
      duration: 150,
      speaker: ['maurice', 'rein'],
      act: 'samen',
      layout: 'B',
      animation: 'drenthe-coverage',
      animationOptions: { mode: 'vol' },
      triggerMode: 'click'
    },
    {
      id: '20-afsluiting',
      file: 'slides/20-afsluiting.html',
      duration: 120,
      speaker: ['maurice', 'rein'],
      act: 'samen',
      layout: 'D',
      animation: 'three-pillars',
      animationOptions: { highlight: null },
      triggerMode: 'click'
    }
  ],

  speakers: {
    peter:   { name: 'Peter/Adrie', color: '#f4a261' },
    maurice: { name: 'Maurice',     color: '#74c69d' },
    rein:    { name: 'Rein',        color: '#48cae4' }
  },

  acts: [
    { id: 'inloop',      label: 'Inloop',             slides: [0] },
    { id: 'waarom',      label: 'Akt 1 — WAAROM',     slides: [1, 2, 3, 4] },
    { id: 'wat',         label: 'Akt 2 — WAT',        slides: [5, 6, 7] },
    { id: 'intermezzo',  label: 'Intermezzo — DEMO',  slides: [8] },
    { id: 'hoe',         label: 'Akt 3 — HOE',        slides: [9, 10, 11, 12, 13, 14, 15, 16] },
    { id: 'samen',       label: 'Akt 4 — SAMEN',      slides: [17, 18, 19, 20] }
  ],

  transition: {
    duration: 300,
    easing: 'ease-in-out'
  }
};
