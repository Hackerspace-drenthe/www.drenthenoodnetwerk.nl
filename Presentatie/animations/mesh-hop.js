// mesh-hop.js — A1: Mesh hop visualisatie
// Bericht springt van node naar node via het mesh-netwerk. Nodes lichten op bij ontvangst.

const NS = 'http://www.w3.org/2000/svg';

const NODES = [
  { x: 80,  y: 200, label: 'Zender' },
  { x: 260, y: 120, label: 'Repeater' },
  { x: 440, y: 220, label: 'Repeater' },
  { x: 620, y: 100, label: 'Repeater' },
  { x: 780, y: 200, label: 'Ontvanger' }
];

export function init(container, options = {}) {
  const speed = options.speed || 1;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let destroyed = false;
  let animFrameId = null;
  let completeCallback = null;
  let playing = false;
  let startTime = null;
  let hopIndex = -1;

  // SVG canvas
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 860 320');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.cssText = 'max-width: 860px; max-height: 320px;';
  container.appendChild(svg);

  // Draw edges
  const edges = [];
  for (let i = 0; i < NODES.length - 1; i++) {
    const line = document.createElementNS(NS, 'line');
    line.setAttribute('x1', NODES[i].x);
    line.setAttribute('y1', NODES[i].y);
    line.setAttribute('x2', NODES[i + 1].x);
    line.setAttribute('y2', NODES[i + 1].y);
    line.setAttribute('stroke', '#3a3a50');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-dasharray', '8 4');
    svg.appendChild(line);
    edges.push(line);
  }

  // Draw nodes
  const nodeGroups = NODES.map((n, i) => {
    const g = document.createElementNS(NS, 'g');

    // Glow circle (hidden initially)
    const glow = document.createElementNS(NS, 'circle');
    glow.setAttribute('cx', n.x);
    glow.setAttribute('cy', n.y);
    glow.setAttribute('r', '32');
    glow.setAttribute('fill', 'none');
    glow.setAttribute('stroke', 'var(--color-neon-green, #39ff14)');
    glow.setAttribute('stroke-width', '3');
    glow.setAttribute('opacity', '0');
    g.appendChild(glow);

    // Node circle
    const circle = document.createElementNS(NS, 'circle');
    circle.setAttribute('cx', n.x);
    circle.setAttribute('cy', n.y);
    circle.setAttribute('r', '22');
    circle.setAttribute('fill', i === 0 ? 'var(--color-signal, #48cae4)' : i === NODES.length - 1 ? 'var(--color-primary, #74c69d)' : 'var(--color-node, #f4845f)');
    circle.setAttribute('stroke', 'var(--color-bg-alt, #22223a)');
    circle.setAttribute('stroke-width', '3');
    g.appendChild(circle);

    // Label
    const text = document.createElementNS(NS, 'text');
    text.setAttribute('x', n.x);
    text.setAttribute('y', n.y + 45);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', 'var(--color-text-muted, #a0a0a0)');
    text.setAttribute('font-size', '14');
    text.setAttribute('font-family', 'var(--font-body, Inter, sans-serif)');
    text.textContent = n.label;
    g.appendChild(text);

    svg.appendChild(g);
    return { g, glow, circle };
  });

  // Message packet (moving dot)
  const packet = document.createElementNS(NS, 'circle');
  packet.setAttribute('r', '10');
  packet.setAttribute('fill', 'var(--color-neon-cyan, #00fff5)');
  packet.setAttribute('opacity', '0');
  svg.appendChild(packet);

  // Message label
  const msgLabel = document.createElementNS(NS, 'text');
  msgLabel.setAttribute('text-anchor', 'middle');
  msgLabel.setAttribute('fill', 'var(--color-text, #e0e0e0)');
  msgLabel.setAttribute('font-size', '13');
  msgLabel.setAttribute('font-family', 'var(--font-mono, monospace)');
  msgLabel.setAttribute('opacity', '0');
  msgLabel.textContent = '📨';
  svg.appendChild(msgLabel);

  let _currentStep = -1;

  function showUpTo(n) {
    // Reset all
    nodeGroups.forEach(({ glow }) => glow.setAttribute('opacity', '0'));
    edges.forEach(e => { e.setAttribute('stroke', '#3a3a50'); e.setAttribute('stroke-width', '2'); });
    packet.setAttribute('opacity', '0');
    msgLabel.setAttribute('opacity', '0');

    // Activate nodes up to n
    for (let i = 0; i <= n && i < NODES.length; i++) {
      nodeGroups[i].glow.setAttribute('opacity', i === n ? '0.8' : '0.2');
      if (i > 0) {
        edges[i - 1].setAttribute('stroke', 'var(--color-neon-green, #39ff14)');
        edges[i - 1].setAttribute('stroke-width', '3');
      }
    }
  }

  return {
    get totalSteps() { return NODES.length; },
    get currentStep() { return _currentStep; },
    goToStep(n) {
      if (destroyed || n < 0 || n >= NODES.length) return;
      _currentStep = n;
      showUpTo(n);
      if (n === NODES.length - 1 && completeCallback) completeCallback();
    },
    play() { if (!destroyed) this.goToStep(0); },
    pause() {
      if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
    },
    reset() {
      this.pause();
      _currentStep = -1;
      nodeGroups.forEach(({ glow }) => glow.setAttribute('opacity', '0'));
      edges.forEach(e => { e.setAttribute('stroke', '#3a3a50'); e.setAttribute('stroke-width', '2'); });
      packet.setAttribute('opacity', '0');
      msgLabel.setAttribute('opacity', '0');
    },
    destroy() { destroyed = true; this.pause(); svg.remove(); },
    onComplete(cb) { completeCallback = cb; }
  };
}
