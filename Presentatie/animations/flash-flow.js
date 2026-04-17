// flash-flow.js — A12: Firmware flashen stap-voor-stap
// Browser openen → USB erin → voortgang → kastje knippert groen → klaar!

export function init(container, options = {}) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let destroyed = false;
  let animId = null;
  let completeCallback = null;
  let startTime = 0;
  const DURATION = options.duration || 9000;

  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 800 500');
  svg.style.cssText = 'width:100%;height:100%;';
  container.appendChild(svg);

  const steps = [
    { emoji: '🌐', label: 'Open flasher.meshtastic.org', x: 80, color: 'var(--color-signal, #48cae4)' },
    { emoji: '🔌', label: 'USB-kabel aansluiten', x: 240, color: 'var(--color-accent, #f4a261)' },
    { emoji: '⬇️', label: 'Firmware downloaden', x: 400, color: 'var(--color-primary, #74c69d)' },
    { emoji: '⏳', label: 'Flashen…', x: 560, color: 'var(--color-neon-cyan, #00fff5)' },
    { emoji: '✅', label: 'Klaar! Kastje knippert groen', x: 720, color: 'var(--color-neon-green, #39ff14)' }
  ];

  // Step elements
  const stepEls = steps.map((s, i) => {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('opacity', '0');

    // Circle bg
    const bg = document.createElementNS(NS, 'circle');
    bg.setAttribute('cx', s.x); bg.setAttribute('cy', '200');
    bg.setAttribute('r', '45');
    bg.setAttribute('fill', 'var(--color-bg-alt, #22223a)');
    bg.setAttribute('stroke', s.color); bg.setAttribute('stroke-width', '2');
    g.appendChild(bg);

    // Emoji
    const emoji = document.createElementNS(NS, 'text');
    emoji.setAttribute('x', s.x); emoji.setAttribute('y', '210');
    emoji.setAttribute('text-anchor', 'middle'); emoji.setAttribute('font-size', '32');
    emoji.textContent = s.emoji;
    g.appendChild(emoji);

    // Label
    const label = document.createElementNS(NS, 'text');
    label.setAttribute('x', s.x); label.setAttribute('y', '280');
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('fill', s.color); label.setAttribute('font-size', '13');
    label.setAttribute('font-weight', 'bold');
    // Wrap long labels
    const words = s.label.split(' ');
    if (words.length > 2) {
      label.textContent = words.slice(0, 2).join(' ');
      const line2 = document.createElementNS(NS, 'text');
      line2.setAttribute('x', s.x); line2.setAttribute('y', '296');
      line2.setAttribute('text-anchor', 'middle');
      line2.setAttribute('fill', s.color); line2.setAttribute('font-size', '13');
      line2.textContent = words.slice(2).join(' ');
      g.appendChild(line2);
    } else {
      label.textContent = s.label;
    }
    g.appendChild(label);

    // Arrow to next
    if (i < steps.length - 1) {
      const arrow = document.createElementNS(NS, 'line');
      arrow.setAttribute('x1', s.x + 50); arrow.setAttribute('y1', '200');
      arrow.setAttribute('x2', steps[i + 1].x - 50); arrow.setAttribute('y2', '200');
      arrow.setAttribute('stroke', 'var(--color-border, #3a3a50)');
      arrow.setAttribute('stroke-width', '2'); arrow.setAttribute('marker-end', 'url(#arrowhead)');
      g.appendChild(arrow);
    }

    svg.appendChild(g);
    return g;
  });

  // Arrow marker
  const defs = document.createElementNS(NS, 'defs');
  const marker = document.createElementNS(NS, 'marker');
  marker.setAttribute('id', 'arrowhead'); marker.setAttribute('markerWidth', '8');
  marker.setAttribute('markerHeight', '6'); marker.setAttribute('refX', '8');
  marker.setAttribute('refY', '3'); marker.setAttribute('orient', 'auto');
  const arrowPath = document.createElementNS(NS, 'path');
  arrowPath.setAttribute('d', 'M0,0 L8,3 L0,6'); arrowPath.setAttribute('fill', 'var(--color-border, #3a3a50)');
  marker.appendChild(arrowPath);
  defs.appendChild(marker);
  svg.appendChild(defs);

  // Progress bar (for flash step)
  const barGroup = document.createElementNS(NS, 'g');
  barGroup.setAttribute('opacity', '0');
  const barBg = document.createElementNS(NS, 'rect');
  barBg.setAttribute('x', '200'); barBg.setAttribute('y', '360');
  barBg.setAttribute('width', '400'); barBg.setAttribute('height', '12');
  barBg.setAttribute('fill', 'var(--color-border, #3a3a50)'); barBg.setAttribute('rx', '6');
  barGroup.appendChild(barBg);
  const barFill = document.createElementNS(NS, 'rect');
  barFill.setAttribute('x', '200'); barFill.setAttribute('y', '360');
  barFill.setAttribute('width', '0'); barFill.setAttribute('height', '12');
  barFill.setAttribute('fill', 'var(--color-neon-green, #39ff14)'); barFill.setAttribute('rx', '6');
  barGroup.appendChild(barFill);
  const barLabel = document.createElementNS(NS, 'text');
  barLabel.setAttribute('x', '400'); barLabel.setAttribute('y', '395');
  barLabel.setAttribute('text-anchor', 'middle');
  barLabel.setAttribute('fill', 'var(--color-text-muted, #888)'); barLabel.setAttribute('font-size', '13');
  barLabel.textContent = 'Firmware installeren…';
  barGroup.appendChild(barLabel);
  svg.appendChild(barGroup);

  // Title
  const title = document.createElementNS(NS, 'text');
  title.setAttribute('x', '400'); title.setAttribute('y', '60');
  title.setAttribute('text-anchor', 'middle');
  title.setAttribute('fill', 'var(--color-text, #e0e0e0)');
  title.setAttribute('font-size', '18'); title.setAttribute('font-weight', 'bold');
  title.textContent = '📲 Firmware flashen — net zo simpel als een app installeren';
  svg.appendChild(title);

  // Time label
  const timeLabel = document.createElementNS(NS, 'text');
  timeLabel.setAttribute('x', '400'); timeLabel.setAttribute('y', '450');
  timeLabel.setAttribute('text-anchor', 'middle');
  timeLabel.setAttribute('fill', 'var(--color-neon-green, #39ff14)');
  timeLabel.setAttribute('font-size', '16'); timeLabel.setAttribute('opacity', '0');
  timeLabel.textContent = '⏱ Totale tijd: ±5 minuten';
  svg.appendChild(timeLabel);

  let _currentStep = -1;

  function showUpTo(n) {
    stepEls.forEach((g, i) => {
      g.setAttribute('opacity', i <= n ? '1' : '0');
    });
    // Show progress bar on step 3+
    if (n >= 3) {
      barGroup.setAttribute('opacity', '1');
      barFill.setAttribute('width', n >= 4 ? '400' : '200');
      barLabel.textContent = n >= 4 ? 'Firmware installeren… 100%' : 'Firmware installeren… 50%';
    } else {
      barGroup.setAttribute('opacity', '0');
      barFill.setAttribute('width', '0');
    }
    // Time label on last step
    timeLabel.setAttribute('opacity', n >= steps.length - 1 ? '1' : '0');
  }

  return {
    get totalSteps() { return steps.length; },
    get currentStep() { return _currentStep; },
    goToStep(n) {
      if (destroyed || n < 0 || n >= steps.length) return;
      _currentStep = n;
      showUpTo(n);
      if (n === steps.length - 1 && completeCallback) completeCallback();
    },
    play() { if (!destroyed) this.goToStep(0); },
    pause() { if (animId) { cancelAnimationFrame(animId); animId = null; } },
    reset() {
      this.pause();
      _currentStep = -1;
      stepEls.forEach(g => g.setAttribute('opacity', '0'));
      barGroup.setAttribute('opacity', '0'); barFill.setAttribute('width', '0');
      timeLabel.setAttribute('opacity', '0');
    },
    destroy() { destroyed = true; this.pause(); svg.remove(); },
    onComplete(cb) { completeCallback = cb; }
  };
}
