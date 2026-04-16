// three-pillars.js — A10: Drie pijlers visualisatie
// Drie kolommen (🔗🤝🎓) bouwen zich op als bouwblokken.
// Modi: default (highlight per pijler), slow-pulse (wachtslide achtergrond).

const PILLARS = [
  { emoji: '🔗', label: 'Verbinden', color: 'var(--color-signal)', desc: 'Letterlijk & figuurlijk' },
  { emoji: '🤝', label: 'Samenwerken', color: 'var(--color-primary)', desc: 'Samen bouwen' },
  { emoji: '🎓', label: 'Leren', color: 'var(--color-accent)', desc: 'Door te doen' }
];

export function init(container, options = {}) {
  const mode = options.mode || 'default';
  const highlight = options.highlight ?? null;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let destroyed = false;
  let animFrameId = null;
  let completeCallback = null;
  let playing = false;
  let startTime = null;

  // Build DOM
  const wrapper = document.createElement('div');
  wrapper.className = 'three-pillars';
  wrapper.style.cssText = `
    display: flex; gap: 2rem; align-items: flex-end; justify-content: center;
    width: 100%; height: 100%; padding: 2rem;
  `;

  const pillarEls = PILLARS.map((p, i) => {
    const col = document.createElement('div');
    col.className = 'pillar';
    col.dataset.pillar = p.label.toLowerCase();
    col.style.cssText = `
      display: flex; flex-direction: column; align-items: center; gap: 1rem;
      flex: 1; max-width: 280px; opacity: 0; transform: translateY(40px);
      transition: opacity 0.6s ease, transform 0.6s ease, box-shadow 0.4s ease;
    `;

    const icon = document.createElement('div');
    icon.style.cssText = 'font-size: 3.5rem; line-height: 1;';
    icon.textContent = p.emoji;

    const label = document.createElement('div');
    label.style.cssText = `
      font-family: var(--font-heading); font-size: 1.75rem; font-weight: 700;
      color: ${p.color};
    `;
    label.textContent = p.label;

    const desc = document.createElement('div');
    desc.style.cssText = 'font-size: 1.25rem; color: var(--color-text-muted); text-align: center;';
    desc.textContent = p.desc;

    const bar = document.createElement('div');
    bar.className = 'pillar-bar';
    bar.style.cssText = `
      width: 100%; height: 6px; border-radius: 3px; background: ${p.color};
      transform: scaleX(0); transform-origin: left; transition: transform 0.8s ease;
    `;

    col.append(icon, label, desc, bar);
    return col;
  });

  pillarEls.forEach(el => wrapper.appendChild(el));
  container.appendChild(wrapper);

  function showPillar(el, delayMs) {
    if (reducedMotion) {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
      el.querySelector('.pillar-bar').style.transform = 'scaleX(1)';
      return;
    }
    setTimeout(() => {
      if (destroyed) return;
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
      setTimeout(() => {
        if (destroyed) return;
        el.querySelector('.pillar-bar').style.transform = 'scaleX(1)';
      }, 300);
    }, delayMs);
  }

  function highlightPillar(name) {
    pillarEls.forEach(el => {
      const isTarget = name === null || el.dataset.pillar === name;
      el.style.opacity = isTarget ? '1' : '0.3';
      el.style.filter = isTarget ? 'none' : 'grayscale(0.8)';
    });
  }

  function pulseLoop(timestamp) {
    if (destroyed || !playing) return;
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const cycle = 9000;
    const phase = (elapsed % cycle) / cycle;
    const activeIndex = Math.floor(phase * 3);

    pillarEls.forEach((el, i) => {
      const localPhase = ((phase * 3) - i + 3) % 3;
      let glow = 0;
      let scale = 1;
      if (i === activeIndex) {
        const t = localPhase % 1;
        glow = Math.sin(t * Math.PI) * 0.6;
        scale = 1 + glow * 0.05;
      }
      el.style.transform = `translateY(0) scale(${scale})`;
      el.style.filter = glow > 0.1
        ? `drop-shadow(0 0 ${8 + glow * 12}px ${PILLARS[i].color})`
        : 'none';
    });

    animFrameId = requestAnimationFrame(pulseLoop);
  }

  return {
    play() {
      if (destroyed) return;
      playing = true;

      if (mode === 'slow-pulse') {
        pillarEls.forEach(el => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          el.querySelector('.pillar-bar').style.transform = 'scaleX(1)';
        });
        if (!reducedMotion) {
          startTime = null;
          animFrameId = requestAnimationFrame(pulseLoop);
        }
      } else {
        pillarEls.forEach((el, i) => showPillar(el, i * 500));
        const totalRevealTime = (pillarEls.length - 1) * 500 + 1200;
        setTimeout(() => {
          if (destroyed) return;
          if (highlight !== undefined) highlightPillar(highlight);
          if (completeCallback) completeCallback();
        }, reducedMotion ? 100 : totalRevealTime);
      }
    },

    pause() {
      playing = false;
      if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
    },

    reset() {
      this.pause();
      startTime = null;
      pillarEls.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
        el.style.filter = 'none';
        el.querySelector('.pillar-bar').style.transform = 'scaleX(0)';
      });
    },

    destroy() {
      destroyed = true;
      this.pause();
      wrapper.remove();
    },

    onComplete(cb) { completeCallback = cb; }
  };
}
