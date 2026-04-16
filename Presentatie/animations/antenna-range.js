// antenna-range.js — A7: Antenne & Bereik
// Visualiseert antennetype, hoogte en bereik-impact.
// Vergelijk: lichtbundel van een zaklantaarn.

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

  // Ground
  const ground = document.createElementNS(NS, 'rect');
  ground.setAttribute('x', '0'); ground.setAttribute('y', '400');
  ground.setAttribute('width', '800'); ground.setAttribute('height', '100');
  ground.setAttribute('fill', 'var(--color-bg-alt, #22223a)');
  svg.appendChild(ground);
  const groundLine = document.createElementNS(NS, 'line');
  groundLine.setAttribute('x1', '0'); groundLine.setAttribute('y1', '400');
  groundLine.setAttribute('x2', '800'); groundLine.setAttribute('y2', '400');
  groundLine.setAttribute('stroke', 'var(--color-border, #3a3a50)'); groundLine.setAttribute('stroke-width', '2');
  svg.appendChild(groundLine);

  // Antenna configurations
  const configs = [
    { name: 'Rubber Duck', emoji: '🧴', height: 350, rangeKm: 3, rangePx: 200, color: 'var(--color-accent, #f4a261)', gain: '2 dBi' },
    { name: 'Tuned Dipole', emoji: '📶', height: 280, rangeKm: 8, rangePx: 350, color: 'var(--color-signal, #48cae4)', gain: '5 dBi' },
    { name: 'Yagi + Hoogte', emoji: '📡', height: 150, rangeKm: 15, rangePx: 600, color: 'var(--color-neon-green, #39ff14)', gain: '9 dBi' }
  ];

  // Shared elements
  const antennaGroup = document.createElementNS(NS, 'g');
  svg.appendChild(antennaGroup);

  const rangeArc = document.createElementNS(NS, 'path');
  rangeArc.setAttribute('fill', 'none'); rangeArc.setAttribute('stroke-width', '2');
  rangeArc.setAttribute('opacity', '0');
  svg.appendChild(rangeArc);

  const rangeCircle = document.createElementNS(NS, 'ellipse');
  rangeCircle.setAttribute('fill', 'none'); rangeCircle.setAttribute('stroke-width', '1.5');
  rangeCircle.setAttribute('opacity', '0'); rangeCircle.setAttribute('stroke-dasharray', '6,3');
  svg.appendChild(rangeCircle);

  // Info panel
  const info = document.createElementNS(NS, 'g');
  info.setAttribute('transform', 'translate(600, 60)');
  info.setAttribute('opacity', '0');
  const infoBg = document.createElementNS(NS, 'rect');
  infoBg.setAttribute('x', '-80'); infoBg.setAttribute('y', '-30');
  infoBg.setAttribute('width', '200'); infoBg.setAttribute('height', '120');
  infoBg.setAttribute('fill', 'var(--color-bg-alt, #22223a)'); infoBg.setAttribute('rx', '8');
  infoBg.setAttribute('stroke', 'var(--color-border, #3a3a50)');
  info.appendChild(infoBg);
  const infoName = document.createElementNS(NS, 'text');
  infoName.setAttribute('y', '-8'); infoName.setAttribute('fill', 'var(--color-text, #e0e0e0)');
  infoName.setAttribute('font-size', '16'); infoName.setAttribute('font-weight', 'bold');
  info.appendChild(infoName);
  const infoGain = document.createElementNS(NS, 'text');
  infoGain.setAttribute('y', '18'); infoGain.setAttribute('fill', 'var(--color-text-muted, #888)');
  infoGain.setAttribute('font-size', '14');
  info.appendChild(infoGain);
  const infoRange = document.createElementNS(NS, 'text');
  infoRange.setAttribute('y', '42'); infoRange.setAttribute('font-size', '20');
  infoRange.setAttribute('font-weight', 'bold');
  info.appendChild(infoRange);
  const infoHeight = document.createElementNS(NS, 'text');
  infoHeight.setAttribute('y', '66'); infoHeight.setAttribute('fill', 'var(--color-text-muted, #888)');
  infoHeight.setAttribute('font-size', '13');
  info.appendChild(infoHeight);
  svg.appendChild(info);

  function drawAntenna(cfg, progress) {
    antennaGroup.innerHTML = '';

    const baseX = 120;
    const tipY = cfg.height;

    // Pole
    const pole = document.createElementNS(NS, 'rect');
    pole.setAttribute('x', baseX - 3); pole.setAttribute('y', tipY);
    pole.setAttribute('width', '6'); pole.setAttribute('height', 400 - tipY);
    pole.setAttribute('fill', 'var(--color-primary, #74c69d)'); pole.setAttribute('rx', '2');
    antennaGroup.appendChild(pole);

    // Height label
    const hLabel = document.createElementNS(NS, 'text');
    hLabel.setAttribute('x', baseX - 15); hLabel.setAttribute('y', (tipY + 400) / 2);
    hLabel.setAttribute('text-anchor', 'end'); hLabel.setAttribute('fill', 'var(--color-text-muted)');
    hLabel.setAttribute('font-size', '11'); hLabel.setAttribute('transform', `rotate(-90, ${baseX - 15}, ${(tipY + 400) / 2})`);
    hLabel.textContent = `${400 - tipY > 200 ? 'hoog' : 400 - tipY > 100 ? 'midden' : 'laag'}`;
    antennaGroup.appendChild(hLabel);

    // Antenna symbol
    const sym = document.createElementNS(NS, 'text');
    sym.setAttribute('x', baseX); sym.setAttribute('y', tipY - 10);
    sym.setAttribute('text-anchor', 'middle'); sym.setAttribute('font-size', '28');
    sym.textContent = cfg.emoji;
    antennaGroup.appendChild(sym);

    // Range visualization (beam cone)
    const beamLen = cfg.rangePx * Math.min(1, progress * 1.5);
    const beamAngle = 30 + (9 - parseInt(cfg.gain)) * 3; // Higher gain = narrower beam
    const rad = (beamAngle * Math.PI) / 180;
    const endX1 = baseX + beamLen;
    const endY1 = tipY - Math.sin(rad) * beamLen * 0.3;
    const endY2 = tipY + Math.sin(rad) * beamLen * 0.3;

    const beam = document.createElementNS(NS, 'path');
    beam.setAttribute('d', `M${baseX},${tipY} L${endX1},${endY1} L${endX1},${endY2} Z`);
    beam.setAttribute('fill', cfg.color); beam.setAttribute('opacity', '0.15');
    antennaGroup.appendChild(beam);

    // Range dashed circle
    rangeCircle.setAttribute('cx', baseX);
    rangeCircle.setAttribute('cy', tipY);
    rangeCircle.setAttribute('rx', beamLen);
    rangeCircle.setAttribute('ry', beamLen * 0.4);
    rangeCircle.setAttribute('stroke', cfg.color);
    rangeCircle.setAttribute('opacity', String(Math.min(0.5, progress)));

    // Info panel
    info.setAttribute('opacity', String(Math.min(1, progress * 3)));
    infoName.textContent = cfg.emoji + ' ' + cfg.name;
    infoGain.textContent = 'Gain: ' + cfg.gain;
    infoRange.textContent = '≈ ' + cfg.rangeKm + ' km bereik';
    infoRange.setAttribute('fill', cfg.color);
    infoHeight.textContent = 'Hoogte: ' + (400 - tipY > 200 ? '15m (toren)' : 400 - tipY > 100 ? '5m (dak)' : '1.5m (hand)');
  }

  function animate(ts) {
    if (destroyed) return;
    if (!startTime) startTime = ts;
    const elapsed = ts - startTime;
    const segLen = DURATION / configs.length;
    const idx = Math.min(Math.floor(elapsed / segLen), configs.length - 1);
    const segProgress = (elapsed - idx * segLen) / segLen;

    drawAntenna(configs[idx], segProgress);

    if (elapsed < DURATION) {
      animId = requestAnimationFrame(animate);
    } else {
      if (completeCallback) completeCallback();
    }
  }

  return {
    play() {
      if (destroyed) return;
      startTime = 0;
      if (reducedMotion) {
        drawAntenna(configs[configs.length - 1], 1);
        if (completeCallback) completeCallback();
        return;
      }
      animId = requestAnimationFrame(animate);
    },
    pause() { if (animId) { cancelAnimationFrame(animId); animId = null; } },
    reset() {
      this.pause(); startTime = 0;
      antennaGroup.innerHTML = '';
      rangeCircle.setAttribute('opacity', '0');
      info.setAttribute('opacity', '0');
    },
    destroy() { destroyed = true; this.pause(); svg.remove(); },
    onComplete(cb) { completeCallback = cb; }
  };
}
