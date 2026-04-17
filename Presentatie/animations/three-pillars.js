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

  let _currentStep = -1;

  function showUpTo(n) {
    pillarEls.forEach((el, i) => {
      if (i <= n) {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        el.querySelector('.pillar-bar').style.transform = 'scaleX(1)';
        el.style.filter = 'none';
      } else {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
        el.querySelector('.pillar-bar').style.transform = 'scaleX(0)';
      }
    });
  }

  return {
    get totalSteps() { return PILLARS.length; },
    get currentStep() { return _currentStep; },
    goToStep(n) {
      if (destroyed || n < 0 || n >= PILLARS.length) return;
      _currentStep = n;
      showUpTo(n);
      if (n === PILLARS.length - 1 && completeCallback) completeCallback();
    },
    play() { if (!destroyed) this.goToStep(0); },
    pause() {},
    reset() {
      _currentStep = -1;
      pillarEls.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
        el.style.filter = 'none';
        el.querySelector('.pillar-bar').style.transform = 'scaleX(0)';
      });
    },
    destroy() { destroyed = true; wrapper.remove(); },
    onComplete(cb) { completeCallback = cb; }
  };
}
