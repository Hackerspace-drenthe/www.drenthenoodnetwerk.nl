// link-budget.js — A4: Spectrum visualisatie — signaal vs noise floor vs gevoeligheid
// Vergelijk: hoor je iemand fluisteren in een drukke kantine?

export function init(container, options = {}) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let destroyed = false;
  let animId = null;
  let completeCallback = null;
  let startTime = 0;
  const DURATION = options.duration || 7000;

  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 800 500');
  svg.style.cssText = 'width:100%;height:100%;';
  container.appendChild(svg);

  const CHART = { x: 80, y: 40, w: 660, h: 380 };

  // Axes
  const axisColor = 'var(--color-text-muted, #888)';
  const xAxis = document.createElementNS(NS, 'line');
  xAxis.setAttribute('x1', CHART.x); xAxis.setAttribute('y1', CHART.y + CHART.h);
  xAxis.setAttribute('x2', CHART.x + CHART.w); xAxis.setAttribute('y2', CHART.y + CHART.h);
  xAxis.setAttribute('stroke', axisColor); xAxis.setAttribute('stroke-width', '1');
  svg.appendChild(xAxis);
  const yAxis = document.createElementNS(NS, 'line');
  yAxis.setAttribute('x1', CHART.x); yAxis.setAttribute('y1', CHART.y);
  yAxis.setAttribute('x2', CHART.x); yAxis.setAttribute('y2', CHART.y + CHART.h);
  yAxis.setAttribute('stroke', axisColor); yAxis.setAttribute('stroke-width', '1');
  svg.appendChild(yAxis);

  // Y-axis labels (dBm)
  [-40, -60, -80, -100, -120, -140].forEach(db => {
    const yPos = CHART.y + ((db + 40) / -100) * CHART.h * -1;
    const mappedY = CHART.y + ((db - (-140)) / ((-40) - (-140))) * -CHART.h + CHART.h;
    const t = document.createElementNS(NS, 'text');
    t.setAttribute('x', CHART.x - 8); t.setAttribute('y', mappedY + 4);
    t.setAttribute('text-anchor', 'end'); t.setAttribute('fill', axisColor);
    t.setAttribute('font-size', '11');
    t.textContent = db + ' dBm';
    svg.appendChild(t);
    const gridLine = document.createElementNS(NS, 'line');
    gridLine.setAttribute('x1', CHART.x); gridLine.setAttribute('y1', mappedY);
    gridLine.setAttribute('x2', CHART.x + CHART.w); gridLine.setAttribute('y2', mappedY);
    gridLine.setAttribute('stroke', axisColor); gridLine.setAttribute('stroke-width', '0.3');
    svg.appendChild(gridLine);
  });

  function dbToY(db) {
    return CHART.y + ((db - (-140)) / ((-40) - (-140))) * -CHART.h + CHART.h;
  }

  // Noise floor zone
  const noiseY = dbToY(-120);
  const noiseRect = document.createElementNS(NS, 'rect');
  noiseRect.setAttribute('x', CHART.x); noiseRect.setAttribute('y', noiseY);
  noiseRect.setAttribute('width', CHART.w);
  noiseRect.setAttribute('height', CHART.y + CHART.h - noiseY);
  noiseRect.setAttribute('fill', 'rgba(255,100,100,0.1)');
  svg.appendChild(noiseRect);
  const noiseLine = document.createElementNS(NS, 'line');
  noiseLine.setAttribute('x1', CHART.x); noiseLine.setAttribute('y1', noiseY);
  noiseLine.setAttribute('x2', CHART.x + CHART.w); noiseLine.setAttribute('y2', noiseY);
  noiseLine.setAttribute('stroke', '#ff6b6b'); noiseLine.setAttribute('stroke-width', '2');
  noiseLine.setAttribute('stroke-dasharray', '8,4');
  svg.appendChild(noiseLine);
  const noiseLabel = document.createElementNS(NS, 'text');
  noiseLabel.setAttribute('x', CHART.x + CHART.w - 5); noiseLabel.setAttribute('y', noiseY - 6);
  noiseLabel.setAttribute('text-anchor', 'end'); noiseLabel.setAttribute('fill', '#ff6b6b');
  noiseLabel.setAttribute('font-size', '13');
  noiseLabel.textContent = '🔇 Noise floor (-120 dBm)';
  svg.appendChild(noiseLabel);

  // Sensitivity threshold
  const sensY = dbToY(-137);
  const sensLine = document.createElementNS(NS, 'line');
  sensLine.setAttribute('x1', CHART.x); sensLine.setAttribute('y1', sensY);
  sensLine.setAttribute('x2', CHART.x + CHART.w); sensLine.setAttribute('y2', sensY);
  sensLine.setAttribute('stroke', 'var(--color-accent, #f4a261)'); sensLine.setAttribute('stroke-width', '2');
  sensLine.setAttribute('stroke-dasharray', '4,4');
  svg.appendChild(sensLine);
  const sensLabel = document.createElementNS(NS, 'text');
  sensLabel.setAttribute('x', CHART.x + 5); sensLabel.setAttribute('y', sensY - 6);
  sensLabel.setAttribute('fill', 'var(--color-accent, #f4a261)');
  sensLabel.setAttribute('font-size', '13');
  sensLabel.textContent = '👂 LoRa gevoeligheid (-137 dBm)';
  svg.appendChild(sensLabel);

  // Signal bar (animated)
  const signalGroup = document.createElementNS(NS, 'g');
  signalGroup.setAttribute('opacity', '0');
  const signalBar = document.createElementNS(NS, 'rect');
  signalBar.setAttribute('x', CHART.x + 280);
  signalBar.setAttribute('width', '60'); signalBar.setAttribute('rx', '4');
  signalBar.setAttribute('fill', 'var(--color-neon-green, #39ff14)');
  signalBar.setAttribute('opacity', '0.8');
  signalGroup.appendChild(signalBar);
  const signalLabel = document.createElementNS(NS, 'text');
  signalLabel.setAttribute('x', CHART.x + 310); signalLabel.setAttribute('text-anchor', 'middle');
  signalLabel.setAttribute('fill', 'var(--color-neon-green, #39ff14)');
  signalLabel.setAttribute('font-size', '14'); signalLabel.setAttribute('font-weight', 'bold');
  signalGroup.appendChild(signalLabel);
  svg.appendChild(signalGroup);

  // SNR indicator
  const snrText = document.createElementNS(NS, 'text');
  snrText.setAttribute('x', CHART.x + 500); snrText.setAttribute('y', CHART.y + 30);
  snrText.setAttribute('fill', 'var(--color-neon-cyan, #00fff5)');
  snrText.setAttribute('font-size', '22'); snrText.setAttribute('font-weight', 'bold');
  snrText.setAttribute('opacity', '0');
  svg.appendChild(snrText);

  const snrSubtext = document.createElementNS(NS, 'text');
  snrSubtext.setAttribute('x', CHART.x + 500); snrSubtext.setAttribute('y', CHART.y + 52);
  snrSubtext.setAttribute('fill', 'var(--color-text-muted, #888)');
  snrSubtext.setAttribute('font-size', '14');
  snrSubtext.setAttribute('opacity', '0');
  svg.appendChild(snrSubtext);

  // Distance labels
  const distances = ['1 km', '3 km', '5 km', '10 km'];
  distances.forEach((d, i) => {
    const x = CHART.x + (i + 1) * (CHART.w / (distances.length + 1));
    const t = document.createElementNS(NS, 'text');
    t.setAttribute('x', x); t.setAttribute('y', CHART.y + CHART.h + 20);
    t.setAttribute('text-anchor', 'middle'); t.setAttribute('fill', axisColor);
    t.setAttribute('font-size', '12');
    t.textContent = d;
    svg.appendChild(t);
  });

  // Signal strength scenarios
  const scenarios = [
    { db: -70, label: '📶 Sterk signaal (-70 dBm)', snr: 'SNR: 50 dB', sub: 'Dichtbij — uitstekend' },
    { db: -100, label: '📶 Matig signaal (-100 dBm)', snr: 'SNR: 20 dB', sub: '5 km — goed leesbaar' },
    { db: -130, label: '📶 Zwak signaal (-130 dBm)', snr: 'SNR: -10 dB', sub: '10 km — nét hoorbaar' }
  ];

  function showScenario(idx, progress) {
    const s = scenarios[idx];
    const sigY = dbToY(s.db);
    const barH = CHART.y + CHART.h - sigY;
    const xPos = CHART.x + 100 + idx * 200;

    signalBar.setAttribute('x', xPos);
    signalBar.setAttribute('y', sigY);
    signalBar.setAttribute('height', barH);
    signalLabel.setAttribute('x', xPos + 30);
    signalLabel.setAttribute('y', sigY - 8);
    signalLabel.textContent = s.label;
    signalGroup.setAttribute('opacity', String(Math.min(1, progress * 3)));

    snrText.textContent = s.snr;
    snrText.setAttribute('opacity', String(Math.min(1, progress * 2)));
    snrSubtext.textContent = s.sub;
    snrSubtext.setAttribute('opacity', String(Math.min(1, progress * 2)));

    // Change bar color based on quality
    const colors = ['var(--color-neon-green, #39ff14)', 'var(--color-signal, #48cae4)', 'var(--color-accent, #f4a261)'];
    signalBar.setAttribute('fill', colors[idx]);
    signalLabel.setAttribute('fill', colors[idx]);
  }

  let _currentStep = -1;

  return {
    get totalSteps() { return scenarios.length; },
    get currentStep() { return _currentStep; },
    goToStep(n) {
      if (destroyed || n < 0 || n >= scenarios.length) return;
      _currentStep = n;
      showScenario(n, 1);
      if (n === scenarios.length - 1 && completeCallback) completeCallback();
    },
    play() { if (!destroyed) this.goToStep(0); },
    pause() { if (animId) { cancelAnimationFrame(animId); animId = null; } },
    reset() {
      this.pause();
      _currentStep = -1;
      signalGroup.setAttribute('opacity', '0');
      snrText.setAttribute('opacity', '0');
      snrSubtext.setAttribute('opacity', '0');
    },
    destroy() { destroyed = true; this.pause(); svg.remove(); },
    onComplete(cb) { completeCallback = cb; }
  };
}
