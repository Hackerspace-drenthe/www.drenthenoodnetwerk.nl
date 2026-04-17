// node-roles.js — A5: Node-rollen visualisatie
// Visueel verschil tussen repeater, companion, room server + ad-hoc modus.

const NS = 'http://www.w3.org/2000/svg';

const ROLES = [
  {
    id: 'repeater',
    label: 'Repeater',
    desc: 'Doorgeefluik',
    icon: '📡',
    color: 'var(--color-node, #f4845f)',
    x: 140, y: 160
  },
  {
    id: 'companion',
    label: 'Companion',
    desc: 'Jouw radio',
    icon: '📱',
    color: 'var(--color-signal, #48cae4)',
    x: 430, y: 160
  },
  {
    id: 'room-server',
    label: 'Room Server',
    desc: 'Geheugen',
    icon: '🗄️',
    color: 'var(--color-primary, #74c69d)',
    x: 720, y: 160
  }
];

export function init(container, options = {}) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let destroyed = false;
  let completeCallback = null;
  let timeouts = [];

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 860 360');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.cssText = 'max-width: 860px; max-height: 360px;';
  container.appendChild(svg);

  // Connection lines between roles
  const lines = [];
  for (let i = 0; i < ROLES.length - 1; i++) {
    const line = document.createElementNS(NS, 'line');
    line.setAttribute('x1', ROLES[i].x);
    line.setAttribute('y1', ROLES[i].y);
    line.setAttribute('x2', ROLES[i + 1].x);
    line.setAttribute('y2', ROLES[i + 1].y);
    line.setAttribute('stroke', '#3a3a50');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-dasharray', '6 4');
    line.setAttribute('opacity', '0');
    svg.appendChild(line);
    lines.push(line);
  }

  // Role groups
  const roleGroups = ROLES.map((r, i) => {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('opacity', '0');

    // Background card
    const rect = document.createElementNS(NS, 'rect');
    rect.setAttribute('x', r.x - 75);
    rect.setAttribute('y', r.y - 75);
    rect.setAttribute('width', 150);
    rect.setAttribute('height', 150);
    rect.setAttribute('rx', 16);
    rect.setAttribute('fill', 'var(--color-bg-alt, #22223a)');
    rect.setAttribute('stroke', r.color);
    rect.setAttribute('stroke-width', '2');
    g.appendChild(rect);

    // Icon
    const icon = document.createElementNS(NS, 'text');
    icon.setAttribute('x', r.x);
    icon.setAttribute('y', r.y - 15);
    icon.setAttribute('text-anchor', 'middle');
    icon.setAttribute('font-size', '36');
    icon.textContent = r.icon;
    g.appendChild(icon);

    // Label
    const label = document.createElementNS(NS, 'text');
    label.setAttribute('x', r.x);
    label.setAttribute('y', r.y + 25);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('fill', r.color);
    label.setAttribute('font-size', '18');
    label.setAttribute('font-weight', '700');
    label.setAttribute('font-family', 'var(--font-heading, sans-serif)');
    label.textContent = r.label;
    g.appendChild(label);

    // Description
    const desc = document.createElementNS(NS, 'text');
    desc.setAttribute('x', r.x);
    desc.setAttribute('y', r.y + 48);
    desc.setAttribute('text-anchor', 'middle');
    desc.setAttribute('fill', 'var(--color-text-muted, #a0a0a0)');
    desc.setAttribute('font-size', '14');
    desc.setAttribute('font-family', 'var(--font-body, sans-serif)');
    desc.textContent = r.desc;
    g.appendChild(desc);

    svg.appendChild(g);
    return g;
  });

  // Message flow indicator (small packet)
  const flowDots = [];
  for (let i = 0; i < 3; i++) {
    const dot = document.createElementNS(NS, 'circle');
    dot.setAttribute('r', '5');
    dot.setAttribute('fill', 'var(--color-neon-cyan, #00fff5)');
    dot.setAttribute('opacity', '0');
    svg.appendChild(dot);
    flowDots.push(dot);
  }

  // Ad-hoc label
  const adHocText = document.createElementNS(NS, 'text');
  adHocText.setAttribute('x', 430);
  adHocText.setAttribute('y', 310);
  adHocText.setAttribute('text-anchor', 'middle');
  adHocText.setAttribute('fill', 'var(--color-text-muted, #a0a0a0)');
  adHocText.setAttribute('font-size', '14');
  adHocText.setAttribute('font-style', 'italic');
  adHocText.setAttribute('opacity', '0');
  adHocText.textContent = '💡 Companion kan ook tijdelijk als repeater werken (ad-hoc modus)';
  svg.appendChild(adHocText);

  let _currentStep = -1;

  function showUpTo(n) {
    roleGroups.forEach((g, i) => {
      g.setAttribute('opacity', i <= n ? '1' : '0');
      if (i <= n && i > 0) lines[i - 1].setAttribute('opacity', '1');
    });
    // Show ad-hoc text on last step
    adHocText.setAttribute('opacity', n >= ROLES.length - 1 ? '1' : '0');
    flowDots.forEach(d => d.setAttribute('opacity', '0'));
  }

  return {
    get totalSteps() { return ROLES.length; },
    get currentStep() { return _currentStep; },
    goToStep(n) {
      if (destroyed || n < 0 || n >= ROLES.length) return;
      _currentStep = n;
      showUpTo(n);
      if (n === ROLES.length - 1 && completeCallback) completeCallback();
    },
    play() { if (!destroyed) this.goToStep(0); },
    pause() {},
    reset() {
      _currentStep = -1;
      roleGroups.forEach(g => g.setAttribute('opacity', '0'));
      lines.forEach(l => l.setAttribute('opacity', '0'));
      flowDots.forEach(d => d.setAttribute('opacity', '0'));
      adHocText.setAttribute('opacity', '0');
    },
    destroy() { destroyed = true; this.reset(); svg.remove(); },
    onComplete(cb) { completeCallback = cb; }
  };
}
