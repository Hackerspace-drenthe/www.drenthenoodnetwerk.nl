// coverage-mapping.js — A8: Coverage Mapping / Bereik in kaart brengen
// Hoe ver komt jouw signaal? Wandel met een kastje, meet waar het werkt.

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

  // Simple area map (roads grid)
  const roads = [
    'M100,250 L700,250', 'M100,150 L700,150', 'M100,350 L700,350',
    'M200,80 L200,450', 'M400,80 L400,450', 'M600,80 L600,450'
  ];
  roads.forEach(d => {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d); p.setAttribute('stroke', 'var(--color-border, #3a3a50)');
    p.setAttribute('stroke-width', '1'); p.setAttribute('fill', 'none');
    svg.appendChild(p);
  });

  // Node (transmitter) at center
  const nodeX = 400, nodeY = 250;
  const nodeCircle = document.createElementNS(NS, 'circle');
  nodeCircle.setAttribute('cx', nodeX); nodeCircle.setAttribute('cy', nodeY);
  nodeCircle.setAttribute('r', '12');
  nodeCircle.setAttribute('fill', 'var(--color-neon-green, #39ff14)');
  svg.appendChild(nodeCircle);
  const nodeLabel = document.createElementNS(NS, 'text');
  nodeLabel.setAttribute('x', nodeX); nodeLabel.setAttribute('y', nodeY - 20);
  nodeLabel.setAttribute('text-anchor', 'middle'); nodeLabel.setAttribute('fill', 'var(--color-neon-green, #39ff14)');
  nodeLabel.setAttribute('font-size', '13'); nodeLabel.setAttribute('font-weight', 'bold');
  nodeLabel.textContent = '📡 Repeater';
  svg.appendChild(nodeLabel);

  // Test walk path (irregular route around the node)
  const walkPath = [
    { x: 400, y: 250 }, { x: 450, y: 220 }, { x: 500, y: 200 },
    { x: 550, y: 180 }, { x: 600, y: 170 }, { x: 650, y: 180 },
    { x: 680, y: 220 }, { x: 700, y: 270 }, { x: 690, y: 320 },
    { x: 650, y: 360 }, { x: 600, y: 380 }, { x: 550, y: 370 },
    { x: 500, y: 340 }, { x: 450, y: 310 }, { x: 380, y: 300 },
    { x: 320, y: 280 }, { x: 260, y: 260 }, { x: 200, y: 230 },
    { x: 160, y: 200 }, { x: 140, y: 170 }, { x: 150, y: 140 },
    { x: 200, y: 130 }, { x: 260, y: 150 }, { x: 320, y: 180 },
    { x: 370, y: 220 }, { x: 400, y: 250 }
  ];

  // Signal strength per point (based on distance from node)
  function signalStrength(x, y) {
    const dist = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
    if (dist < 100) return 'strong';
    if (dist < 200) return 'good';
    if (dist < 280) return 'weak';
    return 'none';
  }

  const colors = {
    strong: 'var(--color-neon-green, #39ff14)',
    good: 'var(--color-signal, #48cae4)',
    weak: 'var(--color-accent, #f4a261)',
    none: '#ff6b6b'
  };

  // Walk dots (test points)
  const dots = walkPath.map(p => {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', p.x); c.setAttribute('cy', p.y);
    c.setAttribute('r', '6'); c.setAttribute('fill', 'var(--color-text-muted, #888)');
    c.setAttribute('opacity', '0');
    svg.appendChild(c);
    return c;
  });

  // Walker icon
  const walker = document.createElementNS(NS, 'text');
  walker.setAttribute('x', walkPath[0].x); walker.setAttribute('y', walkPath[0].y);
  walker.setAttribute('text-anchor', 'middle'); walker.setAttribute('font-size', '24');
  walker.setAttribute('opacity', '0');
  walker.textContent = '🚶';
  svg.appendChild(walker);

  // Legend
  const legend = document.createElementNS(NS, 'g');
  legend.setAttribute('transform', 'translate(60, 430)');
  legend.setAttribute('opacity', '0');
  [
    { label: 'Sterk', color: colors.strong },
    { label: 'Goed', color: colors.good },
    { label: 'Zwak', color: colors.weak },
    { label: 'Geen signaal', color: colors.none }
  ].forEach((item, i) => {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', i * 160); c.setAttribute('cy', '0');
    c.setAttribute('r', '6'); c.setAttribute('fill', item.color);
    legend.appendChild(c);
    const t = document.createElementNS(NS, 'text');
    t.setAttribute('x', i * 160 + 14); t.setAttribute('y', '5');
    t.setAttribute('fill', 'var(--color-text, #e0e0e0)'); t.setAttribute('font-size', '12');
    t.textContent = item.label;
    legend.appendChild(t);
  });
  svg.appendChild(legend);

  // White spot highlight
  const whiteSpot = document.createElementNS(NS, 'ellipse');
  whiteSpot.setAttribute('cx', '660'); whiteSpot.setAttribute('cy', '180');
  whiteSpot.setAttribute('rx', '60'); whiteSpot.setAttribute('ry', '40');
  whiteSpot.setAttribute('fill', 'none'); whiteSpot.setAttribute('stroke', '#ff6b6b');
  whiteSpot.setAttribute('stroke-width', '2'); whiteSpot.setAttribute('stroke-dasharray', '6,3');
  whiteSpot.setAttribute('opacity', '0');
  svg.appendChild(whiteSpot);
  const wsLabel = document.createElementNS(NS, 'text');
  wsLabel.setAttribute('x', '660'); wsLabel.setAttribute('y', '140');
  wsLabel.setAttribute('text-anchor', 'middle'); wsLabel.setAttribute('fill', '#ff6b6b');
  wsLabel.setAttribute('font-size', '13'); wsLabel.setAttribute('font-weight', 'bold');
  wsLabel.setAttribute('opacity', '0');
  wsLabel.textContent = '⚠️ Witte vlek!';
  svg.appendChild(wsLabel);

  function animate(ts) {
    if (destroyed) return;
    if (!startTime) startTime = ts;
    const elapsed = ts - startTime;
    const progress = Math.min(1, elapsed / DURATION);

    // Walk along the path
    const pointIdx = Math.min(Math.floor(progress * walkPath.length * 1.2), walkPath.length - 1);

    walker.setAttribute('opacity', '1');
    walker.setAttribute('x', walkPath[pointIdx].x);
    walker.setAttribute('y', walkPath[pointIdx].y - 12);

    // Reveal dots up to current position
    for (let i = 0; i <= pointIdx; i++) {
      const str = signalStrength(walkPath[i].x, walkPath[i].y);
      dots[i].setAttribute('fill', colors[str]);
      dots[i].setAttribute('opacity', '0.8');
    }

    // Show legend after 30%
    if (progress > 0.3) {
      legend.setAttribute('opacity', String(Math.min(1, (progress - 0.3) * 5)));
    }

    // Highlight white spot at 70%
    if (progress > 0.7) {
      const spotOpacity = Math.min(1, (progress - 0.7) * 5);
      whiteSpot.setAttribute('opacity', String(spotOpacity));
      wsLabel.setAttribute('opacity', String(spotOpacity));
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
        walkPath.forEach((p, i) => {
          const str = signalStrength(p.x, p.y);
          dots[i].setAttribute('fill', colors[str]);
          dots[i].setAttribute('opacity', '0.8');
        });
        legend.setAttribute('opacity', '1');
        whiteSpot.setAttribute('opacity', '1');
        wsLabel.setAttribute('opacity', '1');
        walker.setAttribute('opacity', '0');
        if (completeCallback) completeCallback();
        return;
      }
      animId = requestAnimationFrame(animate);
    },
    pause() { if (animId) { cancelAnimationFrame(animId); animId = null; } },
    reset() {
      this.pause(); startTime = 0;
      dots.forEach(d => d.setAttribute('opacity', '0'));
      walker.setAttribute('opacity', '0');
      legend.setAttribute('opacity', '0');
      whiteSpot.setAttribute('opacity', '0');
      wsLabel.setAttribute('opacity', '0');
    },
    destroy() { destroyed = true; this.pause(); svg.remove(); },
    onComplete(cb) { completeCallback = cb; }
  };
}
