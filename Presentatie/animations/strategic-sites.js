// strategic-sites.js — A9: Strategische locaties in Drenthe
// Kerktorens, watertorens, gemeentegebouwen — hoog = ver bereik.

export function init(container, options = {}) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let destroyed = false;
  let animId = null;
  let completeCallback = null;
  let startTime = 0;
  const DURATION = options.duration || 10000;

  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 800 500');
  svg.style.cssText = 'width:100%;height:100%;';
  container.appendChild(svg);

  // Simplified Drenthe outline (reuse from drenthe-coverage)
  const drenthePath = 'M340,30 L410,25 L470,40 L520,80 L540,140 L530,200 L520,260 L500,310 L470,360 L430,400 L380,430 L330,440 L280,430 L240,400 L210,360 L200,310 L210,250 L230,190 L260,130 L290,80 Z';
  const outline = document.createElementNS(NS, 'path');
  outline.setAttribute('d', drenthePath);
  outline.setAttribute('fill', 'rgba(116,198,157,0.05)');
  outline.setAttribute('stroke', 'var(--color-primary, #74c69d)');
  outline.setAttribute('stroke-width', '2');
  svg.appendChild(outline);

  // Strategic sites
  const sites = [
    { name: 'Kerktoren Assen', emoji: '⛪', x: 370, y: 180, type: 'kerk', height: '35m', rangeKm: 12 },
    { name: 'Watertoren Coevorden', emoji: '🏢', x: 430, y: 350, type: 'watertoren', height: '40m', rangeKm: 15 },
    { name: 'Brandweertoren Emmen', emoji: '🚒', x: 490, y: 290, type: 'hulpdienst', height: '25m', rangeKm: 10 },
    { name: 'Gemeentehuis Hoogeveen', emoji: '🏛️', x: 350, y: 310, type: 'gemeente', height: '20m', rangeKm: 8 },
    { name: 'Kerktoren Meppel', emoji: '⛪', x: 290, y: 390, type: 'kerk', height: '30m', rangeKm: 11 },
    { name: 'TV-toren Smilde', emoji: '📡', x: 320, y: 230, type: 'toren', height: '303m', rangeKm: 50 },
    { name: 'Boerenschuur Beilen', emoji: '🏠', x: 340, y: 260, type: 'particulier', height: '10m', rangeKm: 5 }
  ];

  const typeColors = {
    kerk: 'var(--color-neon-cyan, #00fff5)',
    watertoren: 'var(--color-signal, #48cae4)',
    hulpdienst: '#ff6b6b',
    gemeente: 'var(--color-accent, #f4a261)',
    toren: 'var(--color-neon-green, #39ff14)',
    particulier: 'var(--color-primary, #74c69d)'
  };

  // Create site groups
  const siteEls = sites.map(s => {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('opacity', '0');

    // Range circle
    const rangeR = s.rangeKm * 3;
    const range = document.createElementNS(NS, 'circle');
    range.setAttribute('cx', s.x); range.setAttribute('cy', s.y);
    range.setAttribute('r', '0');
    range.setAttribute('fill', typeColors[s.type]);
    range.setAttribute('opacity', '0.1');
    range.setAttribute('stroke', typeColors[s.type]);
    range.setAttribute('stroke-width', '1'); range.setAttribute('stroke-dasharray', '4,2');
    g.appendChild(range);

    // Icon
    const icon = document.createElementNS(NS, 'text');
    icon.setAttribute('x', s.x); icon.setAttribute('y', s.y + 6);
    icon.setAttribute('text-anchor', 'middle'); icon.setAttribute('font-size', '22');
    icon.textContent = s.emoji;
    g.appendChild(icon);

    // Label
    const label = document.createElementNS(NS, 'text');
    label.setAttribute('x', s.x); label.setAttribute('y', s.y + 30);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('fill', typeColors[s.type]);
    label.setAttribute('font-size', '10'); label.setAttribute('font-weight', 'bold');
    label.textContent = s.name;
    g.appendChild(label);

    svg.appendChild(g);
    return { el: g, range, rangeR, site: s };
  });

  // Legend (right side)
  const legend = document.createElementNS(NS, 'g');
  legend.setAttribute('transform', 'translate(620, 60)');
  legend.setAttribute('opacity', '0');
  const lgBg = document.createElementNS(NS, 'rect');
  lgBg.setAttribute('x', '-10'); lgBg.setAttribute('y', '-20');
  lgBg.setAttribute('width', '180'); lgBg.setAttribute('height', '200');
  lgBg.setAttribute('fill', 'var(--color-bg-alt, #22223a)'); lgBg.setAttribute('rx', '8');
  lgBg.setAttribute('stroke', 'var(--color-border, #3a3a50)');
  legend.appendChild(lgBg);

  const lgTitle = document.createElementNS(NS, 'text');
  lgTitle.setAttribute('y', '0'); lgTitle.setAttribute('fill', 'var(--color-text, #e0e0e0)');
  lgTitle.setAttribute('font-size', '14'); lgTitle.setAttribute('font-weight', 'bold');
  lgTitle.textContent = 'Locatietypes';
  legend.appendChild(lgTitle);

  Object.entries(typeColors).forEach(([type, color], i) => {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', '6'); c.setAttribute('cy', 25 + i * 24);
    c.setAttribute('r', '5'); c.setAttribute('fill', color);
    legend.appendChild(c);
    const t = document.createElementNS(NS, 'text');
    t.setAttribute('x', '18'); t.setAttribute('y', 29 + i * 24);
    t.setAttribute('fill', 'var(--color-text, #e0e0e0)'); t.setAttribute('font-size', '12');
    t.textContent = type;
    legend.appendChild(t);
  });
  svg.appendChild(legend);

  // Insight text
  const insight = document.createElementNS(NS, 'text');
  insight.setAttribute('x', '400'); insight.setAttribute('y', '480');
  insight.setAttribute('text-anchor', 'middle');
  insight.setAttribute('fill', 'var(--color-text-muted, #888)'); insight.setAttribute('font-size', '14');
  insight.setAttribute('opacity', '0');
  insight.textContent = '💡 Hoog = ver bereik. Vraag toestemming, check stroomvoorziening.';
  svg.appendChild(insight);

  let _currentStep = -1;

  function showUpTo(n) {
    siteEls.forEach((se, i) => {
      if (i <= n) {
        se.el.setAttribute('opacity', '1');
        se.range.setAttribute('r', String(se.rangeR));
      } else {
        se.el.setAttribute('opacity', '0');
        se.range.setAttribute('r', '0');
      }
    });
    legend.setAttribute('opacity', n >= 3 ? '1' : '0');
    insight.setAttribute('opacity', n >= sites.length - 1 ? '1' : '0');
  }

  return {
    get totalSteps() { return sites.length; },
    get currentStep() { return _currentStep; },
    goToStep(n) {
      if (destroyed || n < 0 || n >= sites.length) return;
      _currentStep = n;
      showUpTo(n);
      if (n === sites.length - 1 && completeCallback) completeCallback();
    },
    play() { if (!destroyed) this.goToStep(0); },
    pause() { if (animId) { cancelAnimationFrame(animId); animId = null; } },
    reset() {
      this.pause();
      _currentStep = -1;
      siteEls.forEach(se => { se.el.setAttribute('opacity', '0'); se.range.setAttribute('r', '0'); });
      legend.setAttribute('opacity', '0');
      insight.setAttribute('opacity', '0');
    },
    destroy() { destroyed = true; this.pause(); svg.remove(); },
    onComplete(cb) { completeCallback = cb; }
  };
}
