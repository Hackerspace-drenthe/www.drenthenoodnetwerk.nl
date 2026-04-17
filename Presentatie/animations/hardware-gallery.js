// hardware-gallery.js — A11: Hardware Galerij
// Step-based: each card appears on button press.

export function init(container, options = {}) {
  let destroyed = false;
  let completeCallback = null;
  let _currentStep = -1;

  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    display: flex; gap: 1.5rem; justify-content: center; align-items: stretch;
    width: 100%; height: 100%; padding: 2rem; flex-wrap: wrap;
    font-family: var(--font-body, sans-serif);
  `;
  container.appendChild(wrapper);

  const devices = [
    { name: 'Heltec V3', price: '€18–25', role: 'Companion / Repeater', emoji: '📡', highlight: 'Goedkoopste instap — direct flashen via browser' },
    { name: 'Heltec T114', price: '€25–40', role: 'Companion / Repeater', emoji: '⭐', highlight: 'Beste prijs-kwaliteit 2026 — weken op batterij' },
    { name: 'RAK WisMesh Tag', price: '€28–35', role: 'Companion / Repeater', emoji: '🌧️', highlight: 'IP66 waterdicht — GPS ingebouwd' },
    { name: 'SenseCAP Solar P1', price: '€68–80', role: 'Repeater', emoji: '☀️', highlight: 'Zonnepaneel ingebouwd — weken autonoom' },
    { name: 'T-LoRa Pager', price: '€55–70', role: 'Standalone', emoji: '📟', highlight: 'Toetsenbord + scherm — geen telefoon nodig' },
    { name: 'T-Deck Plus', price: '€75–95', role: 'Standalone', emoji: '⌨️', highlight: 'Populairste standalone — QWERTY + touchscreen' }
  ];

  const cards = devices.map(dev => {
    const card = document.createElement('div');
    card.style.cssText = `
      flex: 0 0 auto; width: 150px; padding: 1.25rem 1rem;
      background: var(--color-bg-alt, #22223a); border-radius: 1rem;
      border: 2px solid var(--color-border, #3a3a50);
      display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
      opacity: 0; transform: translateY(30px) scale(0.9);
      transition: opacity 0.4s ease, transform 0.4s ease, border-color 0.3s;
    `;
    const emoji = document.createElement('div');
    emoji.style.cssText = 'font-size: 2.5rem;';
    emoji.textContent = dev.emoji || '📦';
    const name = document.createElement('div');
    name.style.cssText = 'font-family: var(--font-heading); font-size: 1.1rem; font-weight: bold; color: var(--color-text, #e0e0e0); text-align: center;';
    name.textContent = dev.name;
    const price = document.createElement('div');
    price.style.cssText = 'font-size: 1.3rem; font-weight: bold; color: var(--color-neon-green, #39ff14);';
    price.textContent = dev.price;
    const role = document.createElement('div');
    role.style.cssText = 'font-size: 0.85rem; color: var(--color-signal, #48cae4); padding: 0.2rem 0.6rem; border-radius: 1rem; background: rgba(72,202,228,0.15);';
    role.textContent = dev.role;
    const hl = document.createElement('div');
    hl.style.cssText = 'font-size: 0.8rem; color: var(--color-text-muted, #888); text-align: center; margin-top: auto;';
    hl.textContent = dev.highlight || '';
    card.append(emoji, name, price, role, hl);
    wrapper.appendChild(card);
    return card;
  });

  function showUpTo(n) {
    cards.forEach((card, i) => {
      if (i <= n) {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0) scale(1)';
        card.style.borderColor = i === n ? 'var(--color-neon-green, #39ff14)' : 'var(--color-border, #3a3a50)';
        card.style.boxShadow = i === n ? '0 0 20px rgba(57,255,20,0.3)' : 'none';
      } else {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px) scale(0.9)';
      }
    });
  }

  return {
    get totalSteps() { return devices.length; },
    get currentStep() { return _currentStep; },
    goToStep(n) {
      if (destroyed || n < 0 || n >= devices.length) return;
      _currentStep = n;
      showUpTo(n);
      if (n === devices.length - 1 && completeCallback) completeCallback();
    },
    play() { if (!destroyed) this.goToStep(0); },
    pause() {},
    reset() { _currentStep = -1; cards.forEach(c => { c.style.opacity = '0'; c.style.transform = 'translateY(30px) scale(0.9)'; }); },
    destroy() { destroyed = true; wrapper.remove(); },
    onComplete(cb) { completeCallback = cb; }
  };
}
