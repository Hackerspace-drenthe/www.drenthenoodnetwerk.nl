// solar-install.js — A15: Zonnepaneel Montage
// Installatie-sequentie: dak → zonnepaneel → kastje + antenne → bereikscirkel groeit.

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

  // Sky gradient
  const sky = document.createElementNS(NS, 'rect');
  sky.setAttribute('x', '0'); sky.setAttribute('y', '0');
  sky.setAttribute('width', '800'); sky.setAttribute('height', '300');
  sky.setAttribute('fill', '#0a0a2e');
  svg.appendChild(sky);

  // Sun
  const sun = document.createElementNS(NS, 'circle');
  sun.setAttribute('cx', '650'); sun.setAttribute('cy', '60');
  sun.setAttribute('r', '30');
  sun.setAttribute('fill', '#ffb703'); sun.setAttribute('opacity', '0.8');
  svg.appendChild(sun);

  // Ground
  const ground = document.createElementNS(NS, 'rect');
  ground.setAttribute('x', '0'); ground.setAttribute('y', '350');
  ground.setAttribute('width', '800'); ground.setAttribute('height', '150');
  ground.setAttribute('fill', '#1a3a1a');
  svg.appendChild(ground);

  // Building / roof
  const buildingBody = document.createElementNS(NS, 'rect');
  buildingBody.setAttribute('x', '250'); buildingBody.setAttribute('y', '250');
  buildingBody.setAttribute('width', '200'); buildingBody.setAttribute('height', '100');
  buildingBody.setAttribute('fill', '#3a2a1a'); buildingBody.setAttribute('stroke', '#5a4a3a');
  svg.appendChild(buildingBody);
  const roof = document.createElementNS(NS, 'polygon');
  roof.setAttribute('points', '230,250 350,160 470,250');
  roof.setAttribute('fill', '#5a3a2a'); roof.setAttribute('stroke', '#7a5a4a');
  svg.appendChild(roof);

  // Phase elements (appear one by one)
  const phases = [];

  // Phase 1: Solar panel on roof
  const solarGroup = document.createElementNS(NS, 'g');
  solarGroup.setAttribute('opacity', '0');
  const panel = document.createElementNS(NS, 'rect');
  panel.setAttribute('x', '310'); panel.setAttribute('y', '190');
  panel.setAttribute('width', '60'); panel.setAttribute('height', '35');
  panel.setAttribute('fill', '#1a3a6a'); panel.setAttribute('stroke', '#4a6a9a');
  panel.setAttribute('stroke-width', '2'); panel.setAttribute('rx', '2');
  panel.setAttribute('transform', 'rotate(-25, 340, 207)');
  solarGroup.appendChild(panel);
  // Grid lines on panel
  for (let i = 1; i < 3; i++) {
    const h = document.createElementNS(NS, 'line');
    h.setAttribute('x1', '312'); h.setAttribute('y1', 190 + i * 12);
    h.setAttribute('x2', '368'); h.setAttribute('y2', 190 + i * 12);
    h.setAttribute('stroke', '#4a6a9a'); h.setAttribute('stroke-width', '0.5');
    h.setAttribute('transform', 'rotate(-25, 340, 207)');
    solarGroup.appendChild(h);
  }
  const solarLabel = document.createElementNS(NS, 'text');
  solarLabel.setAttribute('x', '340'); solarLabel.setAttribute('y', '175');
  solarLabel.setAttribute('text-anchor', 'middle');
  solarLabel.setAttribute('fill', '#ffb703'); solarLabel.setAttribute('font-size', '13');
  solarLabel.setAttribute('font-weight', 'bold');
  solarLabel.textContent = '☀️ Zonnepaneel';
  solarGroup.appendChild(solarLabel);
  svg.appendChild(solarGroup);
  phases.push(solarGroup);

  // Phase 2: Device box
  const deviceGroup = document.createElementNS(NS, 'g');
  deviceGroup.setAttribute('opacity', '0');
  const box = document.createElementNS(NS, 'rect');
  box.setAttribute('x', '400'); box.setAttribute('y', '215');
  box.setAttribute('width', '35'); box.setAttribute('height', '25');
  box.setAttribute('fill', 'var(--color-bg-alt, #22223a)'); box.setAttribute('rx', '4');
  box.setAttribute('stroke', 'var(--color-primary, #74c69d)'); box.setAttribute('stroke-width', '2');
  deviceGroup.appendChild(box);
  // LED
  const led = document.createElementNS(NS, 'circle');
  led.setAttribute('cx', '410'); led.setAttribute('cy', '225');
  led.setAttribute('r', '3'); led.setAttribute('fill', 'var(--color-neon-green, #39ff14)');
  deviceGroup.appendChild(led);
  // Cable from panel to device
  const cable = document.createElementNS(NS, 'path');
  cable.setAttribute('d', 'M365,210 Q385,215 400,220');
  cable.setAttribute('fill', 'none'); cable.setAttribute('stroke', '#ffb703');
  cable.setAttribute('stroke-width', '2'); cable.setAttribute('stroke-dasharray', '4,2');
  deviceGroup.appendChild(cable);
  const devLabel = document.createElementNS(NS, 'text');
  devLabel.setAttribute('x', '418'); devLabel.setAttribute('y', '260');
  devLabel.setAttribute('text-anchor', 'middle');
  devLabel.setAttribute('fill', 'var(--color-primary, #74c69d)'); devLabel.setAttribute('font-size', '12');
  devLabel.setAttribute('font-weight', 'bold');
  devLabel.textContent = '📦 Repeater';
  deviceGroup.appendChild(devLabel);
  svg.appendChild(deviceGroup);
  phases.push(deviceGroup);

  // Phase 3: Antenna
  const antennaGroup = document.createElementNS(NS, 'g');
  antennaGroup.setAttribute('opacity', '0');
  const pole = document.createElementNS(NS, 'rect');
  pole.setAttribute('x', '416'); pole.setAttribute('y', '170');
  pole.setAttribute('width', '4'); pole.setAttribute('height', '45');
  pole.setAttribute('fill', 'var(--color-primary, #74c69d)'); pole.setAttribute('rx', '2');
  antennaGroup.appendChild(pole);
  const tip = document.createElementNS(NS, 'circle');
  tip.setAttribute('cx', '418'); tip.setAttribute('cy', '168');
  tip.setAttribute('r', '5'); tip.setAttribute('fill', 'var(--color-neon-green, #39ff14)');
  antennaGroup.appendChild(tip);
  const antLabel = document.createElementNS(NS, 'text');
  antLabel.setAttribute('x', '445'); antLabel.setAttribute('y', '175');
  antLabel.setAttribute('fill', 'var(--color-neon-cyan, #00fff5)'); antLabel.setAttribute('font-size', '12');
  antLabel.textContent = '📶 Antenne';
  antennaGroup.appendChild(antLabel);
  svg.appendChild(antennaGroup);
  phases.push(antennaGroup);

  // Phase 4: Coverage circle grows
  const coverageGroup = document.createElementNS(NS, 'g');
  coverageGroup.setAttribute('opacity', '0');
  const coverage = document.createElementNS(NS, 'circle');
  coverage.setAttribute('cx', '418'); coverage.setAttribute('cy', '168');
  coverage.setAttribute('r', '0');
  coverage.setAttribute('fill', 'var(--color-neon-green, #39ff14)');
  coverage.setAttribute('opacity', '0.1');
  coverage.setAttribute('stroke', 'var(--color-neon-green, #39ff14)');
  coverage.setAttribute('stroke-width', '1.5'); coverage.setAttribute('stroke-dasharray', '6,4');
  coverageGroup.appendChild(coverage);
  const coverLabel = document.createElementNS(NS, 'text');
  coverLabel.setAttribute('x', '418'); coverLabel.setAttribute('y', '80');
  coverLabel.setAttribute('text-anchor', 'middle');
  coverLabel.setAttribute('fill', 'var(--color-neon-green, #39ff14)');
  coverLabel.setAttribute('font-size', '16'); coverLabel.setAttribute('font-weight', 'bold');
  coverLabel.setAttribute('opacity', '0');
  coverLabel.textContent = '≈ 10 km bereik!';
  coverageGroup.appendChild(coverLabel);
  svg.appendChild(coverageGroup);
  phases.push(coverageGroup);

  // Step labels
  const stepLabels = document.createElementNS(NS, 'g');
  stepLabels.setAttribute('opacity', '0');
  const stepText = document.createElementNS(NS, 'text');
  stepText.setAttribute('x', '400'); stepText.setAttribute('y', '430');
  stepText.setAttribute('text-anchor', 'middle');
  stepText.setAttribute('fill', 'var(--color-text-muted, #888)');
  stepText.setAttribute('font-size', '14');
  stepText.textContent = '🏠 Zo komt een repeater-locatie tot leven!';
  stepLabels.appendChild(stepText);
  svg.appendChild(stepLabels);

  function animate(ts) {
    if (destroyed) return;
    if (!startTime) startTime = ts;
    const elapsed = ts - startTime;
    const progress = elapsed / DURATION;

    // Reveal phases
    phases.forEach((g, i) => {
      const start = (i / phases.length) * 0.75;
      const phaseP = Math.max(0, Math.min(1, (progress - start) / 0.15));
      g.setAttribute('opacity', String(phaseP));
    });

    // Grow coverage in phase 4
    if (progress > 0.6) {
      const covP = (progress - 0.6) / 0.35;
      const r = Math.min(200, covP * 200);
      coverage.setAttribute('r', String(r));
      if (covP > 0.5) coverLabel.setAttribute('opacity', String(Math.min(1, (covP - 0.5) * 4)));
    }

    // Step labels
    if (progress > 0.85) stepLabels.setAttribute('opacity', String(Math.min(1, (progress - 0.85) * 7)));

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
        phases.forEach(g => g.setAttribute('opacity', '1'));
        coverage.setAttribute('r', '200');
        coverLabel.setAttribute('opacity', '1');
        stepLabels.setAttribute('opacity', '1');
        if (completeCallback) completeCallback();
        return;
      }
      animId = requestAnimationFrame(animate);
    },
    pause() { if (animId) { cancelAnimationFrame(animId); animId = null; } },
    reset() {
      this.pause(); startTime = 0;
      phases.forEach(g => g.setAttribute('opacity', '0'));
      coverage.setAttribute('r', '0');
      coverLabel.setAttribute('opacity', '0');
      stepLabels.setAttribute('opacity', '0');
    },
    destroy() { destroyed = true; this.pause(); svg.remove(); },
    onComplete(cb) { completeCallback = cb; }
  };
}
