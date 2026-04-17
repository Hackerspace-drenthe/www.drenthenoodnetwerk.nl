// lora-waves.js — A2: LoRa radiogolven propagatie
// Radiogolven breiden zich uit vanaf een zender. Visualiseert bereik, spreading factor, signaalsterkte.

export function init(container, options = {}) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let destroyed = false;
  let animId = null;
  let completeCallback = null;
  let startTime = 0;
  const DURATION = options.duration || 8000;

  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 800 500');
  svg.style.cssText = 'width:100%;height:100%;';
  container.appendChild(svg);

  // Defs — gradient for waves
  const defs = document.createElementNS(NS, 'defs');
  svg.appendChild(defs);

  // Background label
  const label = document.createElementNS(NS, 'text');
  label.setAttribute('x', '400'); label.setAttribute('y', '480');
  label.setAttribute('text-anchor', 'middle');
  label.setAttribute('fill', 'var(--color-text-muted, #888)');
  label.setAttribute('font-size', '16');
  label.setAttribute('font-family', 'var(--font-body, sans-serif)');
  label.textContent = 'LoRa: Long Range — bereik tot 10+ km';
  svg.appendChild(label);

  // Transmitter icon (antenna)
  const tx = document.createElementNS(NS, 'g');
  tx.setAttribute('transform', 'translate(100, 250)');
  const pole = document.createElementNS(NS, 'rect');
  pole.setAttribute('x', '-3'); pole.setAttribute('y', '-60');
  pole.setAttribute('width', '6'); pole.setAttribute('height', '80');
  pole.setAttribute('fill', 'var(--color-primary, #74c69d)'); pole.setAttribute('rx', '2');
  tx.appendChild(pole);
  const tip = document.createElementNS(NS, 'circle');
  tip.setAttribute('cx', '0'); tip.setAttribute('cy', '-65');
  tip.setAttribute('r', '8');
  tip.setAttribute('fill', 'var(--color-neon-green, #39ff14)');
  tx.appendChild(tip);
  const base = document.createElementNS(NS, 'rect');
  base.setAttribute('x', '-15'); base.setAttribute('y', '20');
  base.setAttribute('width', '30'); base.setAttribute('height', '20');
  base.setAttribute('fill', 'var(--color-primary, #74c69d)'); base.setAttribute('rx', '4');
  tx.appendChild(base);
  svg.appendChild(tx);

  // Wave rings
  const WAVE_COUNT = 6;
  const waves = [];
  for (let i = 0; i < WAVE_COUNT; i++) {
    const arc = document.createElementNS(NS, 'ellipse');
    arc.setAttribute('cx', '100'); arc.setAttribute('cy', '250');
    arc.setAttribute('rx', '0'); arc.setAttribute('ry', '0');
    arc.setAttribute('fill', 'none');
    arc.setAttribute('stroke', 'var(--color-signal, #48cae4)');
    arc.setAttribute('stroke-width', '2');
    arc.setAttribute('opacity', '0');
    svg.appendChild(arc);
    waves.push(arc);
  }

  // SF indicator
  const sfGroup = document.createElementNS(NS, 'g');
  sfGroup.setAttribute('transform', 'translate(650, 80)');
  const sfBg = document.createElementNS(NS, 'rect');
  sfBg.setAttribute('x', '-60'); sfBg.setAttribute('y', '-25');
  sfBg.setAttribute('width', '120'); sfBg.setAttribute('height', '50');
  sfBg.setAttribute('fill', 'var(--color-bg-alt, #22223a)');
  sfBg.setAttribute('rx', '8'); sfBg.setAttribute('stroke', 'var(--color-border, #3a3a50)');
  sfGroup.appendChild(sfBg);
  const sfLabel = document.createElementNS(NS, 'text');
  sfLabel.setAttribute('text-anchor', 'middle'); sfLabel.setAttribute('y', '-5');
  sfLabel.setAttribute('fill', 'var(--color-text-muted, #888)'); sfLabel.setAttribute('font-size', '12');
  sfLabel.textContent = 'Spreading Factor';
  sfGroup.appendChild(sfLabel);
  const sfValue = document.createElementNS(NS, 'text');
  sfValue.setAttribute('text-anchor', 'middle'); sfValue.setAttribute('y', '18');
  sfValue.setAttribute('fill', 'var(--color-neon-cyan, #00fff5)');
  sfValue.setAttribute('font-size', '20'); sfValue.setAttribute('font-weight', 'bold');
  sfValue.textContent = 'SF7';
  sfGroup.appendChild(sfValue);
  svg.appendChild(sfGroup);

  // Receiver dots at various distances
  const receivers = [
    { x: 350, y: 200, dist: '2 km' },
    { x: 500, y: 300, dist: '5 km' },
    { x: 680, y: 250, dist: '10 km' }
  ];
  const rxEls = receivers.map(r => {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('transform', `translate(${r.x}, ${r.y})`);
    g.setAttribute('opacity', '0.3');
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('r', '10');
    c.setAttribute('fill', 'var(--color-text-muted, #888)');
    g.appendChild(c);
    const t = document.createElementNS(NS, 'text');
    t.setAttribute('y', '30'); t.setAttribute('text-anchor', 'middle');
    t.setAttribute('fill', 'var(--color-text-muted, #888)'); t.setAttribute('font-size', '14');
    t.textContent = r.dist;
    g.appendChild(t);
    svg.appendChild(g);
    return { el: g, x: r.x };
  });

  // SF phases
  const sfPhases = [
    { sf: 'SF7', maxR: 300, speed: 1.5, color: 'var(--color-signal, #48cae4)' },
    { sf: 'SF10', maxR: 500, speed: 0.8, color: 'var(--color-primary, #74c69d)' },
    { sf: 'SF12', maxR: 700, speed: 0.5, color: 'var(--color-neon-cyan, #00fff5)' }
  ];

  let _currentStep = -1;

  function showPhase(n) {
    const phase = sfPhases[n];
    sfValue.textContent = phase.sf;

    // Static wave display for this phase
    waves.forEach((w, i) => {
      const r = ((i + 1) / WAVE_COUNT) * phase.maxR;
      w.setAttribute('rx', r);
      w.setAttribute('ry', r * 0.6);
      w.setAttribute('stroke', phase.color);
      w.setAttribute('opacity', String(0.6 - i * 0.08));
      w.setAttribute('stroke-width', String(Math.max(1, 3 * (1 - i / WAVE_COUNT))));
    });

    // Light up receivers within range
    rxEls.forEach(rx => {
      const dist = rx.x - 100;
      if (dist <= phase.maxR) {
        rx.el.setAttribute('opacity', '1');
        rx.el.querySelector('circle').setAttribute('fill', phase.color);
      } else {
        rx.el.setAttribute('opacity', '0.3');
        rx.el.querySelector('circle').setAttribute('fill', 'var(--color-text-muted, #888)');
      }
    });
  }

  return {
    get totalSteps() { return sfPhases.length; },
    get currentStep() { return _currentStep; },
    goToStep(n) {
      if (destroyed || n < 0 || n >= sfPhases.length) return;
      _currentStep = n;
      showPhase(n);
      if (n === sfPhases.length - 1 && completeCallback) completeCallback();
    },
    play() { if (!destroyed) this.goToStep(0); },
    pause() { if (animId) { cancelAnimationFrame(animId); animId = null; } },
    reset() {
      this.pause();
      _currentStep = -1;
      waves.forEach(w => { w.setAttribute('rx', '0'); w.setAttribute('ry', '0'); w.setAttribute('opacity', '0'); });
      rxEls.forEach(rx => { rx.el.setAttribute('opacity', '0.3'); });
      sfValue.textContent = 'SF7';
    },
    destroy() { destroyed = true; this.pause(); svg.remove(); },
    onComplete(cb) { completeCallback = cb; }
  };
}
