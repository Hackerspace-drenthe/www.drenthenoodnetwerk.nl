// diy-build.js — A16: DIY Build
// Stap-voor-stap bouwproces: kaal bord → solderen → behuizing → antenne → werkend kastje.

export function init(container, options = {}) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let destroyed = false;
  let animId = null;
  let completeCallback = null;
  let startTime = 0;
  const DURATION = options.duration || 10000;

  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 900 500');
  svg.style.cssText = 'width:100%;height:100%;';
  container.appendChild(svg);

  const steps = [
    {
      label: '1. Kaal bord',
      emoji: '📟',
      desc: 'ESP32 + LoRa module bestellen (±€20)',
      color: 'var(--color-text-muted, #888)',
      draw(g) {
        // PCB rectangle
        const pcb = document.createElementNS(NS, 'rect');
        pcb.setAttribute('x', '30'); pcb.setAttribute('y', '20');
        pcb.setAttribute('width', '100'); pcb.setAttribute('height', '60');
        pcb.setAttribute('fill', '#1a472a'); pcb.setAttribute('rx', '4');
        pcb.setAttribute('stroke', '#2d7a4a'); pcb.setAttribute('stroke-width', '1');
        g.appendChild(pcb);
        // Chip
        const chip = document.createElementNS(NS, 'rect');
        chip.setAttribute('x', '55'); chip.setAttribute('y', '35');
        chip.setAttribute('width', '30'); chip.setAttribute('height', '20');
        chip.setAttribute('fill', '#333'); chip.setAttribute('rx', '2');
        g.appendChild(chip);
        // Pins
        for (let i = 0; i < 8; i++) {
          const pin = document.createElementNS(NS, 'rect');
          pin.setAttribute('x', 40 + i * 10); pin.setAttribute('y', '78');
          pin.setAttribute('width', '4'); pin.setAttribute('height', '8');
          pin.setAttribute('fill', '#aaa');
          g.appendChild(pin);
        }
      }
    },
    {
      label: '2. Solderen',
      emoji: '🔧',
      desc: 'Headers, antenne-connector, batterijkabel',
      color: 'var(--color-accent, #f4a261)',
      draw(g) {
        // PCB with solder points
        const pcb = document.createElementNS(NS, 'rect');
        pcb.setAttribute('x', '30'); pcb.setAttribute('y', '20');
        pcb.setAttribute('width', '100'); pcb.setAttribute('height', '60');
        pcb.setAttribute('fill', '#1a472a'); pcb.setAttribute('rx', '4');
        g.appendChild(pcb);
        // Solder iron
        const iron = document.createElementNS(NS, 'text');
        iron.setAttribute('x', '20'); iron.setAttribute('y', '60');
        iron.setAttribute('font-size', '24');
        iron.textContent = '🔧';
        g.appendChild(iron);
        // Spark effects
        [{ x: 65, y: 70 }, { x: 80, y: 72 }, { x: 95, y: 68 }].forEach(p => {
          const spark = document.createElementNS(NS, 'circle');
          spark.setAttribute('cx', p.x); spark.setAttribute('cy', p.y);
          spark.setAttribute('r', '3');
          spark.setAttribute('fill', 'var(--color-accent, #f4a261)');
          spark.setAttribute('opacity', '0.8');
          g.appendChild(spark);
        });
      }
    },
    {
      label: '3. Behuizing',
      emoji: '🖨️',
      desc: '3D-geprint bij de Hackerspace',
      color: 'var(--color-signal, #48cae4)',
      draw(g) {
        // 3D printed case
        const caseBot = document.createElementNS(NS, 'rect');
        caseBot.setAttribute('x', '25'); caseBot.setAttribute('y', '15');
        caseBot.setAttribute('width', '110'); caseBot.setAttribute('height', '75');
        caseBot.setAttribute('fill', 'var(--color-bg-alt, #22223a)');
        caseBot.setAttribute('rx', '8');
        caseBot.setAttribute('stroke', 'var(--color-signal, #48cae4)');
        caseBot.setAttribute('stroke-width', '2');
        g.appendChild(caseBot);
        // PCB visible inside
        const pcb = document.createElementNS(NS, 'rect');
        pcb.setAttribute('x', '35'); pcb.setAttribute('y', '25');
        pcb.setAttribute('width', '90'); pcb.setAttribute('height', '50');
        pcb.setAttribute('fill', '#1a472a'); pcb.setAttribute('rx', '3');
        pcb.setAttribute('opacity', '0.6');
        g.appendChild(pcb);
        // 3D printer icon
        const printer = document.createElementNS(NS, 'text');
        printer.setAttribute('x', '140'); printer.setAttribute('y', '55');
        printer.setAttribute('font-size', '20');
        printer.textContent = '🖨️';
        g.appendChild(printer);
      }
    },
    {
      label: '4. Antenne',
      emoji: '📶',
      desc: 'Goede antenne = goed bereik!',
      color: 'var(--color-primary, #74c69d)',
      draw(g) {
        // Case with antenna
        const caseEl = document.createElementNS(NS, 'rect');
        caseEl.setAttribute('x', '35'); caseEl.setAttribute('y', '35');
        caseEl.setAttribute('width', '90'); caseEl.setAttribute('height', '55');
        caseEl.setAttribute('fill', 'var(--color-bg-alt, #22223a)');
        caseEl.setAttribute('rx', '8');
        caseEl.setAttribute('stroke', 'var(--color-primary, #74c69d)');
        caseEl.setAttribute('stroke-width', '2');
        g.appendChild(caseEl);
        // Antenna pole
        const pole = document.createElementNS(NS, 'rect');
        pole.setAttribute('x', '78'); pole.setAttribute('y', '0');
        pole.setAttribute('width', '4'); pole.setAttribute('height', '38');
        pole.setAttribute('fill', 'var(--color-primary, #74c69d)'); pole.setAttribute('rx', '2');
        g.appendChild(pole);
        // Antenna tip
        const tip = document.createElementNS(NS, 'circle');
        tip.setAttribute('cx', '80'); tip.setAttribute('cy', '0');
        tip.setAttribute('r', '4');
        tip.setAttribute('fill', 'var(--color-neon-green, #39ff14)');
        g.appendChild(tip);
        // Signal waves
        for (let i = 1; i <= 3; i++) {
          const wave = document.createElementNS(NS, 'ellipse');
          wave.setAttribute('cx', '80'); wave.setAttribute('cy', '0');
          wave.setAttribute('rx', i * 15); wave.setAttribute('ry', i * 8);
          wave.setAttribute('fill', 'none');
          wave.setAttribute('stroke', 'var(--color-neon-green, #39ff14)');
          wave.setAttribute('stroke-width', '1'); wave.setAttribute('opacity', String(0.5 / i));
          g.appendChild(wave);
        }
      }
    },
    {
      label: '5. Klaar!',
      emoji: '✅',
      desc: 'Firmware flashen (5 min) en het netwerk in!',
      color: 'var(--color-neon-green, #39ff14)',
      draw(g) {
        // Complete device with glow
        const glow = document.createElementNS(NS, 'rect');
        glow.setAttribute('x', '30'); glow.setAttribute('y', '25');
        glow.setAttribute('width', '100'); glow.setAttribute('height', '65');
        glow.setAttribute('fill', 'none'); glow.setAttribute('rx', '10');
        glow.setAttribute('stroke', 'var(--color-neon-green, #39ff14)');
        glow.setAttribute('stroke-width', '3');
        glow.setAttribute('filter', 'drop-shadow(0 0 8px rgba(57,255,20,0.6))');
        g.appendChild(glow);
        const caseEl = document.createElementNS(NS, 'rect');
        caseEl.setAttribute('x', '32'); caseEl.setAttribute('y', '27');
        caseEl.setAttribute('width', '96'); caseEl.setAttribute('height', '61');
        caseEl.setAttribute('fill', 'var(--color-bg-alt, #22223a)'); caseEl.setAttribute('rx', '8');
        g.appendChild(caseEl);
        // LED indicator (green blink)
        const led = document.createElementNS(NS, 'circle');
        led.setAttribute('cx', '50'); led.setAttribute('cy', '40');
        led.setAttribute('r', '4');
        led.setAttribute('fill', 'var(--color-neon-green, #39ff14)');
        g.appendChild(led);
        // Antenna
        const pole = document.createElementNS(NS, 'rect');
        pole.setAttribute('x', '78'); pole.setAttribute('y', '0');
        pole.setAttribute('width', '4'); pole.setAttribute('height', '30');
        pole.setAttribute('fill', 'var(--color-primary, #74c69d)'); pole.setAttribute('rx', '2');
        g.appendChild(pole);
        // Check mark
        const check = document.createElementNS(NS, 'text');
        check.setAttribute('x', '80'); check.setAttribute('y', '75');
        check.setAttribute('text-anchor', 'middle'); check.setAttribute('font-size', '20');
        check.textContent = '✅';
        g.appendChild(check);
      }
    }
  ];

  // Progress bar
  const barBg = document.createElementNS(NS, 'rect');
  barBg.setAttribute('x', '80'); barBg.setAttribute('y', '460');
  barBg.setAttribute('width', '740'); barBg.setAttribute('height', '6');
  barBg.setAttribute('fill', 'var(--color-border, #3a3a50)'); barBg.setAttribute('rx', '3');
  svg.appendChild(barBg);
  const barFill = document.createElementNS(NS, 'rect');
  barFill.setAttribute('x', '80'); barFill.setAttribute('y', '460');
  barFill.setAttribute('width', '0'); barFill.setAttribute('height', '6');
  barFill.setAttribute('fill', 'var(--color-neon-green, #39ff14)'); barFill.setAttribute('rx', '3');
  svg.appendChild(barFill);

  // Step containers
  const stepWidth = 160;
  const stepGroups = steps.map((step, i) => {
    const g = document.createElementNS(NS, 'g');
    const tx = 80 + i * stepWidth;
    g.setAttribute('transform', `translate(${tx}, 120)`);
    g.setAttribute('opacity', '0');

    // Step number & label
    const labelText = document.createElementNS(NS, 'text');
    labelText.setAttribute('x', '80'); labelText.setAttribute('y', '-10');
    labelText.setAttribute('text-anchor', 'middle');
    labelText.setAttribute('fill', step.color);
    labelText.setAttribute('font-size', '14'); labelText.setAttribute('font-weight', 'bold');
    labelText.textContent = step.label;
    g.appendChild(labelText);

    // Draw the step visual
    step.draw(g);

    // Description
    const desc = document.createElementNS(NS, 'text');
    desc.setAttribute('x', '80'); desc.setAttribute('y', '115');
    desc.setAttribute('text-anchor', 'middle');
    desc.setAttribute('fill', 'var(--color-text-muted, #888)'); desc.setAttribute('font-size', '11');
    desc.textContent = step.desc;
    g.appendChild(desc);

    // Arrow to next step
    if (i < steps.length - 1) {
      const arrow = document.createElementNS(NS, 'text');
      arrow.setAttribute('x', '155'); arrow.setAttribute('y', '55');
      arrow.setAttribute('fill', 'var(--color-text-muted, #888)'); arrow.setAttribute('font-size', '20');
      arrow.textContent = '→';
      g.appendChild(arrow);
    }

    svg.appendChild(g);
    return g;
  });

  // Hackerspace callout
  const callout = document.createElementNS(NS, 'text');
  callout.setAttribute('x', '450'); callout.setAttribute('y', '430');
  callout.setAttribute('text-anchor', 'middle');
  callout.setAttribute('fill', 'var(--color-signal, #48cae4)'); callout.setAttribute('font-size', '15');
  callout.setAttribute('opacity', '0');
  callout.textContent = '🏭 Solderen & 3D-printen kan bij de Hackerspace — elke woensdagavond!';
  svg.appendChild(callout);

  let _currentStep = -1;

  function showUpTo(n) {
    stepGroups.forEach((g, i) => {
      g.setAttribute('opacity', i <= n ? '1' : '0');
    });
    barFill.setAttribute('width', String(740 * ((n + 1) / steps.length)));
    callout.setAttribute('opacity', n >= steps.length - 1 ? '1' : '0');
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
    pause() {},
    reset() {
      _currentStep = -1;
      stepGroups.forEach(g => g.setAttribute('opacity', '0'));
      barFill.setAttribute('width', '0');
      callout.setAttribute('opacity', '0');
    },
    destroy() { destroyed = true; svg.remove(); },
    onComplete(cb) { completeCallback = cb; }
  };
}
