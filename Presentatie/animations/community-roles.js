// community-roles.js — A14: Community Rollen
// Avatar-iconen voor bouwer, scout, designer, schrijver vinden hun plek rond het mesh.

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

  const CX = 400, CY = 250;

  // Central mesh network icon
  const meshGroup = document.createElementNS(NS, 'g');
  // Mesh nodes in center
  const meshNodes = [
    { x: CX - 30, y: CY - 20 }, { x: CX + 30, y: CY - 20 },
    { x: CX, y: CY + 25 }, { x: CX - 15, y: CY + 5 }, { x: CX + 15, y: CY + 5 }
  ];
  // Connect all
  meshNodes.forEach((a, i) => {
    meshNodes.forEach((b, j) => {
      if (j <= i) return;
      const line = document.createElementNS(NS, 'line');
      line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
      line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
      line.setAttribute('stroke', 'var(--color-primary, #74c69d)'); line.setAttribute('stroke-width', '1');
      line.setAttribute('opacity', '0.4');
      meshGroup.appendChild(line);
    });
  });
  meshNodes.forEach(n => {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', n.x); c.setAttribute('cy', n.y); c.setAttribute('r', '5');
    c.setAttribute('fill', 'var(--color-neon-green, #39ff14)');
    meshGroup.appendChild(c);
  });
  const meshLabel = document.createElementNS(NS, 'text');
  meshLabel.setAttribute('x', CX); meshLabel.setAttribute('y', CY + 60);
  meshLabel.setAttribute('text-anchor', 'middle');
  meshLabel.setAttribute('fill', 'var(--color-primary, #74c69d)');
  meshLabel.setAttribute('font-size', '14'); meshLabel.setAttribute('font-weight', 'bold');
  meshLabel.textContent = 'Mesh Netwerk';
  meshGroup.appendChild(meshLabel);
  svg.appendChild(meshGroup);

  // Community roles around the mesh
  const roles = [
    { emoji: '🔧', name: 'Bouwer', desc: 'Soldeert & assembleert', color: 'var(--color-neon-cyan, #00fff5)', angle: -90 },
    { emoji: '🔭', name: 'Scout', desc: 'Zoekt locaties & test bereik', color: 'var(--color-signal, #48cae4)', angle: -30 },
    { emoji: '🎨', name: 'Designer', desc: 'Ontwerpt behuizingen & visuals', color: 'var(--color-accent, #f4a261)', angle: 30 },
    { emoji: '✍️', name: 'Schrijver', desc: 'Documentatie & handleidingen', color: '#e0aaff', angle: 90 },
    { emoji: '🎓', name: 'Trainer', desc: 'Geeft workshops & support', color: 'var(--color-neon-green, #39ff14)', angle: 150 },
    { emoji: '🤝', name: 'Ambassadeur', desc: 'Werft locaties & draagvlak', color: 'var(--color-primary, #74c69d)', angle: 210 }
  ];

  const ORBIT_R = 170;
  const roleEls = roles.map(r => {
    const rad = (r.angle * Math.PI) / 180;
    const tx = CX + Math.cos(rad) * ORBIT_R;
    const ty = CY + Math.sin(rad) * ORBIT_R;

    const g = document.createElementNS(NS, 'g');
    g.setAttribute('opacity', '0');

    // Connection line to center
    const line = document.createElementNS(NS, 'line');
    line.setAttribute('x1', CX); line.setAttribute('y1', CY);
    line.setAttribute('x2', tx); line.setAttribute('y2', ty);
    line.setAttribute('stroke', r.color); line.setAttribute('stroke-width', '1.5');
    line.setAttribute('stroke-dasharray', '6,4'); line.setAttribute('opacity', '0.4');
    g.appendChild(line);

    // Avatar circle
    const bg = document.createElementNS(NS, 'circle');
    bg.setAttribute('cx', tx); bg.setAttribute('cy', ty); bg.setAttribute('r', '35');
    bg.setAttribute('fill', 'var(--color-bg-alt, #22223a)');
    bg.setAttribute('stroke', r.color); bg.setAttribute('stroke-width', '2');
    g.appendChild(bg);

    // Emoji
    const emoji = document.createElementNS(NS, 'text');
    emoji.setAttribute('x', tx); emoji.setAttribute('y', ty + 8);
    emoji.setAttribute('text-anchor', 'middle'); emoji.setAttribute('font-size', '28');
    emoji.textContent = r.emoji;
    g.appendChild(emoji);

    // Name
    const name = document.createElementNS(NS, 'text');
    name.setAttribute('x', tx); name.setAttribute('y', ty + 55);
    name.setAttribute('text-anchor', 'middle');
    name.setAttribute('fill', r.color); name.setAttribute('font-size', '13'); name.setAttribute('font-weight', 'bold');
    name.textContent = r.name;
    g.appendChild(name);

    // Description
    const desc = document.createElementNS(NS, 'text');
    desc.setAttribute('x', tx); desc.setAttribute('y', ty + 70);
    desc.setAttribute('text-anchor', 'middle');
    desc.setAttribute('fill', 'var(--color-text-muted, #888)'); desc.setAttribute('font-size', '10');
    desc.textContent = r.desc;
    g.appendChild(desc);

    svg.appendChild(g);
    return { el: g, bg };
  });

  let _currentStep = -1;

  function showUpTo(n) {
    roleEls.forEach((re, i) => {
      if (i <= n) {
        re.el.setAttribute('opacity', '1');
        re.bg.setAttribute('stroke-width', i === n ? '3' : '2');
        re.bg.setAttribute('filter', i === n ? `drop-shadow(0 0 6px ${roles[i].color})` : '');
      } else {
        re.el.setAttribute('opacity', '0');
        re.bg.setAttribute('stroke-width', '2');
        re.bg.setAttribute('filter', '');
      }
    });
  }

  return {
    get totalSteps() { return roles.length; },
    get currentStep() { return _currentStep; },
    goToStep(n) {
      if (destroyed || n < 0 || n >= roles.length) return;
      _currentStep = n;
      showUpTo(n);
      if (n === roles.length - 1 && completeCallback) completeCallback();
    },
    play() { if (!destroyed) this.goToStep(0); },
    pause() { if (animId) { cancelAnimationFrame(animId); animId = null; } },
    reset() {
      this.pause();
      _currentStep = -1;
      roleEls.forEach(re => { re.el.setAttribute('opacity', '0'); re.bg.setAttribute('filter', ''); });
    },
    destroy() { destroyed = true; this.pause(); svg.remove(); },
    onComplete(cb) { completeCallback = cb; }
  };
}
