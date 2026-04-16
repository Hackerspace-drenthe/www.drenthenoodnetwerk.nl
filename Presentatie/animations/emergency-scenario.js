// emergency-scenario.js — A6: Noodscenario storytelling
// Netwerk valt uit → mesh neemt over → berichten bereiken hulpdiensten.
// Fullscreen animatie met 4 fasen: normaal → uitval → duisternis → mesh redt.

const NS = 'http://www.w3.org/2000/svg';

export function init(container, options = {}) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let destroyed = false;
  let completeCallback = null;
  let timeouts = [];
  let animFrameId = null;

  // Wrapper
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    position: relative; width: 100%; height: 100%;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    overflow: hidden; background: var(--color-bg, #1a1a2e);
  `;
  container.appendChild(wrapper);

  // Scene SVG
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 960 540');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.cssText = 'position: absolute; inset: 0;';
  wrapper.appendChild(svg);

  // Text overlay
  const textOverlay = document.createElement('div');
  textOverlay.style.cssText = `
    position: absolute; bottom: 10%; left: 50%; transform: translateX(-50%);
    text-align: center; z-index: 10; max-width: 80%;
    font-family: var(--font-heading, sans-serif); font-size: 2rem;
    color: var(--color-text, #e0e0e0); opacity: 0;
    transition: opacity 0.8s ease, color 0.8s ease;
  `;
  wrapper.appendChild(textOverlay);

  // Phases elements
  // Phase 1: Normal — cell towers with signals
  const towers = [
    { x: 200, y: 180 }, { x: 480, y: 140 }, { x: 760, y: 200 }
  ];
  const towerEls = towers.map(t => {
    const g = document.createElementNS(NS, 'g');
    // Tower
    const rect = document.createElementNS(NS, 'rect');
    rect.setAttribute('x', t.x - 6);
    rect.setAttribute('y', t.y - 40);
    rect.setAttribute('width', 12);
    rect.setAttribute('height', 60);
    rect.setAttribute('fill', '#666');
    rect.setAttribute('rx', 2);
    g.appendChild(rect);

    // Signal waves
    for (let i = 1; i <= 3; i++) {
      const arc = document.createElementNS(NS, 'circle');
      arc.setAttribute('cx', t.x);
      arc.setAttribute('cy', t.y - 40);
      arc.setAttribute('r', i * 20);
      arc.setAttribute('fill', 'none');
      arc.setAttribute('stroke', 'var(--color-signal, #48cae4)');
      arc.setAttribute('stroke-width', '2');
      arc.setAttribute('stroke-opacity', 0.6 - i * 0.15);
      arc.classList.add('signal-wave');
      g.appendChild(arc);
    }

    g.setAttribute('opacity', '0');
    svg.appendChild(g);
    return g;
  });

  // Houses
  const houses = [
    { x: 300, y: 360 }, { x: 480, y: 340 }, { x: 660, y: 370 }, { x: 140, y: 350 }, { x: 820, y: 350 }
  ];
  const houseEls = houses.map(h => {
    const g = document.createElementNS(NS, 'g');
    // House body
    const body = document.createElementNS(NS, 'rect');
    body.setAttribute('x', h.x - 20);
    body.setAttribute('y', h.y - 15);
    body.setAttribute('width', 40);
    body.setAttribute('height', 30);
    body.setAttribute('fill', '#555');
    body.setAttribute('rx', 3);
    g.appendChild(body);
    // Roof
    const roof = document.createElementNS(NS, 'polygon');
    roof.setAttribute('points', `${h.x - 25},${h.y - 15} ${h.x},${h.y - 35} ${h.x + 25},${h.y - 15}`);
    roof.setAttribute('fill', '#777');
    g.appendChild(roof);
    // Light (window)
    const win = document.createElementNS(NS, 'rect');
    win.setAttribute('x', h.x - 6);
    win.setAttribute('y', h.y - 8);
    win.setAttribute('width', 12);
    win.setAttribute('height', 10);
    win.setAttribute('fill', '#ffd700');
    win.setAttribute('rx', 1);
    win.classList.add('house-light');
    g.appendChild(win);

    g.setAttribute('opacity', '0');
    svg.appendChild(g);
    return g;
  });

  // Phase 3: Mesh nodes that appear
  const meshNodes = [
    { x: 300, y: 330 }, { x: 480, y: 310 }, { x: 660, y: 340 }
  ];
  const meshEls = meshNodes.map(n => {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('opacity', '0');

    const dot = document.createElementNS(NS, 'circle');
    dot.setAttribute('cx', n.x);
    dot.setAttribute('cy', n.y);
    dot.setAttribute('r', '8');
    dot.setAttribute('fill', 'var(--color-neon-green, #39ff14)');
    g.appendChild(dot);

    // Glow
    const glow = document.createElementNS(NS, 'circle');
    glow.setAttribute('cx', n.x);
    glow.setAttribute('cy', n.y);
    glow.setAttribute('r', '20');
    glow.setAttribute('fill', 'none');
    glow.setAttribute('stroke', 'var(--color-neon-green, #39ff14)');
    glow.setAttribute('stroke-width', '2');
    glow.setAttribute('stroke-opacity', '0.4');
    g.appendChild(glow);

    svg.appendChild(g);
    return g;
  });

  // Mesh connection lines
  const meshLines = [];
  for (let i = 0; i < meshNodes.length - 1; i++) {
    const line = document.createElementNS(NS, 'line');
    line.setAttribute('x1', meshNodes[i].x);
    line.setAttribute('y1', meshNodes[i].y);
    line.setAttribute('x2', meshNodes[i + 1].x);
    line.setAttribute('y2', meshNodes[i + 1].y);
    line.setAttribute('stroke', 'var(--color-neon-green, #39ff14)');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-opacity', '0');
    svg.appendChild(line);
    meshLines.push(line);
  }

  // Full-screen dark overlay for "blackout" phase
  const blackout = document.createElementNS(NS, 'rect');
  blackout.setAttribute('width', '960');
  blackout.setAttribute('height', '540');
  blackout.setAttribute('fill', '#000');
  blackout.setAttribute('opacity', '0');
  svg.appendChild(blackout);

  function schedule(fn, delay) {
    const id = setTimeout(() => { if (!destroyed) fn(); }, reducedMotion ? delay * 0.1 : delay);
    timeouts.push(id);
  }

  function setText(text, color) {
    textOverlay.textContent = text;
    textOverlay.style.opacity = '1';
    if (color) textOverlay.style.color = color;
  }

  function clearText() {
    textOverlay.style.opacity = '0';
  }

  return {
    play() {
      if (destroyed) return;
      this.reset();

      // Phase 1: Normal — towers and houses visible (2s)
      schedule(() => {
        towerEls.forEach(t => t.setAttribute('opacity', '1'));
        houseEls.forEach(h => h.setAttribute('opacity', '1'));
        setText('Alles werkt. GSM, WiFi, stroom.', 'var(--color-text, #e0e0e0)');
      }, 200);

      // Phase 2: Blackout — towers fail, lights out (starts at 2.5s)
      schedule(() => clearText(), 2200);
      schedule(() => {
        setText('⚡ Storm. Stroomuitval.', 'var(--color-accent, #f4a261)');
        // Red flash on towers
        towerEls.forEach(t => {
          const waves = t.querySelectorAll('.signal-wave');
          waves.forEach(w => { w.setAttribute('stroke', '#ff4444'); w.setAttribute('stroke-opacity', '0.8'); });
        });
      }, 2800);

      // Towers go dark, lights off
      schedule(() => {
        towerEls.forEach(t => {
          const waves = t.querySelectorAll('.signal-wave');
          waves.forEach(w => w.setAttribute('stroke-opacity', '0'));
        });
        houseEls.forEach(h => {
          const win = h.querySelector('.house-light');
          if (win) win.setAttribute('fill', '#333');
        });
        blackout.setAttribute('opacity', '0.6');
        setText('Geen bereik. Geen internet. Stilte.', '#ff6b6b');
      }, 4000);

      // Phase 3: Mesh activates (starts at 6s)
      schedule(() => clearText(), 5800);
      schedule(() => {
        blackout.setAttribute('opacity', '0.3');
        setText('Maar dan…', 'var(--color-neon-green, #39ff14)');
      }, 6200);

      // Mesh nodes light up
      meshEls.forEach((el, i) => {
        schedule(() => el.setAttribute('opacity', '1'), 7000 + i * 500);
      });

      // Mesh connections
      meshLines.forEach((line, i) => {
        schedule(() => line.setAttribute('stroke-opacity', '0.7'), 8200 + i * 400);
      });

      // Final message
      schedule(() => {
        blackout.setAttribute('opacity', '0.1');
        setText('Het mesh-netwerk draait door. Berichten komen aan. 🔗', 'var(--color-neon-green, #39ff14)');
      }, 9200);

      // Complete
      schedule(() => {
        if (completeCallback) completeCallback();
      }, 11000);
    },

    pause() {
      if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
    },

    reset() {
      timeouts.forEach(clearTimeout);
      timeouts = [];
      towerEls.forEach(t => {
        t.setAttribute('opacity', '0');
        const waves = t.querySelectorAll('.signal-wave');
        waves.forEach(w => { w.setAttribute('stroke', 'var(--color-signal, #48cae4)'); w.setAttribute('stroke-opacity', '0.45'); });
      });
      houseEls.forEach(h => {
        h.setAttribute('opacity', '0');
        const win = h.querySelector('.house-light');
        if (win) win.setAttribute('fill', '#ffd700');
      });
      meshEls.forEach(el => el.setAttribute('opacity', '0'));
      meshLines.forEach(l => l.setAttribute('stroke-opacity', '0'));
      blackout.setAttribute('opacity', '0');
      textOverlay.style.opacity = '0';
    },

    destroy() {
      destroyed = true;
      this.reset();
      wrapper.remove();
    },

    onComplete(cb) { completeCallback = cb; }
  };
}
