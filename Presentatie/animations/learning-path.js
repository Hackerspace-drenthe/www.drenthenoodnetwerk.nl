// learning-path.js — A13: Leerpad
// Kronkelend pad met 19 haltes (MeshCore Academy modules).
// Wandelaar loopt van "Wat is mesh?" naar "Eindexamen".

export function init(container, options = {}) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let destroyed = false;
  let animId = null;
  let completeCallback = null;
  let startTime = 0;
  const DURATION = options.duration || 12000;

  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 800 500');
  svg.style.cssText = 'width:100%;height:100%;';
  container.appendChild(svg);

  // Module stops along a winding path
  const modules = [
    'Wat is mesh?', 'Waarom noodnetwerk?', 'LoRa basis', 'Regelgeving',
    'Hardware', 'Firmware', 'Configuratie', 'Antenne-types',
    'Antenne-plaatsing', 'Link budget', 'Stroomverbruik', 'Channels & Rooms',
    'Packet types', 'Routering', 'Protocollen', 'Beveiliging',
    'Onderhoud', 'Netwerk-ontwerp', 'Eindexamen 🎓'
  ];

  // Generate winding path points
  const points = modules.map((_, i) => {
    const row = Math.floor(i / 5);
    const col = i % 5;
    const isReversed = row % 2 === 1;
    const x = 80 + (isReversed ? (4 - col) : col) * 165;
    const y = 70 + row * 110;
    return { x, y };
  });

  // Draw path
  let pathD = `M${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    const cpy = prev.y + (curr.y - prev.y) * 0.5;
    pathD += ` Q${cpx},${cpy} ${curr.x},${curr.y}`;
  }

  const trail = document.createElementNS(NS, 'path');
  trail.setAttribute('d', pathD);
  trail.setAttribute('fill', 'none');
  trail.setAttribute('stroke', 'var(--color-border, #3a3a50)');
  trail.setAttribute('stroke-width', '3');
  trail.setAttribute('stroke-dasharray', '8,6');
  svg.appendChild(trail);

  // Active path overlay
  const activePath = document.createElementNS(NS, 'path');
  activePath.setAttribute('d', pathD);
  activePath.setAttribute('fill', 'none');
  activePath.setAttribute('stroke', 'var(--color-neon-green, #39ff14)');
  activePath.setAttribute('stroke-width', '3');
  const totalLen = 3000; // approximate
  activePath.setAttribute('stroke-dasharray', `${totalLen}`);
  activePath.setAttribute('stroke-dashoffset', `${totalLen}`);
  svg.appendChild(activePath);

  // Module stops
  const stopEls = modules.map((name, i) => {
    const p = points[i];
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('opacity', '0.3');

    const circle = document.createElementNS(NS, 'circle');
    circle.setAttribute('cx', p.x); circle.setAttribute('cy', p.y);
    circle.setAttribute('r', '14');
    circle.setAttribute('fill', 'var(--color-bg-alt, #22223a)');
    circle.setAttribute('stroke', 'var(--color-border, #3a3a50)');
    circle.setAttribute('stroke-width', '2');
    g.appendChild(circle);

    const num = document.createElementNS(NS, 'text');
    num.setAttribute('x', p.x); num.setAttribute('y', p.y + 5);
    num.setAttribute('text-anchor', 'middle');
    num.setAttribute('fill', 'var(--color-text-muted, #888)');
    num.setAttribute('font-size', '11'); num.setAttribute('font-weight', 'bold');
    num.textContent = String(i + 1);
    g.appendChild(num);

    const label = document.createElementNS(NS, 'text');
    label.setAttribute('x', p.x); label.setAttribute('y', p.y + 30);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('fill', 'var(--color-text-muted, #888)');
    label.setAttribute('font-size', '9');
    label.textContent = name;
    g.appendChild(label);

    svg.appendChild(g);
    return { el: g, circle, num };
  });

  // Walker
  const walker = document.createElementNS(NS, 'text');
  walker.setAttribute('text-anchor', 'middle'); walker.setAttribute('font-size', '22');
  walker.setAttribute('opacity', '0');
  walker.textContent = '🚶';
  svg.appendChild(walker);

  // Encouragement text
  const encourage = document.createElementNS(NS, 'text');
  encourage.setAttribute('x', '400'); encourage.setAttribute('y', '480');
  encourage.setAttribute('text-anchor', 'middle');
  encourage.setAttribute('fill', 'var(--color-text-muted, #888)');
  encourage.setAttribute('font-size', '14'); encourage.setAttribute('opacity', '0');
  encourage.textContent = '💡 Je hoeft niet alles in één keer te doen — elke module staat op zichzelf';
  svg.appendChild(encourage);

  function animate(ts) {
    if (destroyed) return;
    if (!startTime) startTime = ts;
    const elapsed = ts - startTime;
    const progress = elapsed / DURATION;

    // Path drawing
    const dashOffset = totalLen * (1 - Math.min(1, progress * 1.2));
    activePath.setAttribute('stroke-dashoffset', String(dashOffset));

    // Walker position
    const walkerIdx = Math.min(Math.floor(progress * modules.length * 1.1), modules.length - 1);
    const wp = points[walkerIdx];
    walker.setAttribute('x', wp.x); walker.setAttribute('y', wp.y - 20);
    walker.setAttribute('opacity', '1');

    // Activate stops up to walker
    stopEls.forEach((se, i) => {
      if (i <= walkerIdx) {
        se.el.setAttribute('opacity', '1');
        se.circle.setAttribute('stroke', 'var(--color-neon-green, #39ff14)');
        se.circle.setAttribute('fill', i === walkerIdx
          ? 'var(--color-neon-green, #39ff14)'
          : 'var(--color-bg-alt, #22223a)');
        se.num.setAttribute('fill', i === walkerIdx
          ? 'var(--color-bg, #1a1a2e)'
          : 'var(--color-neon-green, #39ff14)');
      }
    });

    if (progress > 0.8) {
      encourage.setAttribute('opacity', String(Math.min(1, (progress - 0.8) * 5)));
    }

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
        activePath.setAttribute('stroke-dashoffset', '0');
        stopEls.forEach(se => {
          se.el.setAttribute('opacity', '1');
          se.circle.setAttribute('stroke', 'var(--color-neon-green, #39ff14)');
        });
        walker.setAttribute('opacity', '0');
        encourage.setAttribute('opacity', '1');
        if (completeCallback) completeCallback();
        return;
      }
      animId = requestAnimationFrame(animate);
    },
    pause() { if (animId) { cancelAnimationFrame(animId); animId = null; } },
    reset() {
      this.pause(); startTime = 0;
      activePath.setAttribute('stroke-dashoffset', String(totalLen));
      stopEls.forEach(se => {
        se.el.setAttribute('opacity', '0.3');
        se.circle.setAttribute('stroke', 'var(--color-border, #3a3a50)');
        se.circle.setAttribute('fill', 'var(--color-bg-alt, #22223a)');
        se.num.setAttribute('fill', 'var(--color-text-muted, #888)');
      });
      walker.setAttribute('opacity', '0');
      encourage.setAttribute('opacity', '0');
    },
    destroy() { destroyed = true; this.pause(); svg.remove(); },
    onComplete(cb) { completeCallback = cb; }
  };
}
