// mesh-dashboard.js — A17: Live mesh-dashboard (slide 08)
// Toont inkomende berichten, afzender-node, hop-count, mesh-topologie.
// Connecteert via Web Bluetooth/Serial of speelt fallback demo-messages af.

export function init(container, options = {}) {
  const fallbackUrl = options.fallback || 'data/demo-messages.json';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let destroyed = false;
  let completeCallback = null;
  let timeouts = [];
  let demoData = null;

  // Dashboard layout
  const wrapper = document.createElement('div');
  wrapper.className = 'mesh-dashboard';
  wrapper.style.cssText = `
    display: grid; grid-template-columns: 1fr 320px; grid-template-rows: auto 1fr;
    gap: 1rem; width: 100%; height: 100%; padding: 1.5rem;
    font-family: var(--font-mono, monospace); color: var(--color-text, #e0e0e0);
  `;
  container.appendChild(wrapper);

  // Header
  const header = document.createElement('div');
  header.style.cssText = `
    grid-column: 1 / -1; display: flex; justify-content: space-between;
    align-items: center; padding: 0.5rem 1rem;
    background: var(--color-bg-alt, #22223a); border-radius: 0.5rem;
  `;
  header.innerHTML = `
    <span style="font-family: var(--font-heading); font-size: 1.5rem; color: var(--color-neon-green, #39ff14);">
      📡 Mesh Dashboard
    </span>
    <span class="dash-status" style="font-size: 0.9rem; color: var(--color-text-muted);">
      ⏳ Wachten op verbinding…
    </span>
  `;
  wrapper.appendChild(header);
  const statusEl = header.querySelector('.dash-status');

  // Message feed
  const feed = document.createElement('div');
  feed.style.cssText = `
    display: flex; flex-direction: column; gap: 0.5rem;
    overflow-y: auto; padding: 0.5rem;
    background: rgba(0,0,0,0.3); border-radius: 0.5rem;
    border: 1px solid var(--color-border, #3a3a50);
  `;
  wrapper.appendChild(feed);

  // Stats sidebar
  const sidebar = document.createElement('div');
  sidebar.style.cssText = `
    display: flex; flex-direction: column; gap: 0.75rem; padding: 0.5rem;
  `;
  wrapper.appendChild(sidebar);

  // Stats cards
  const stats = { messages: 0, nodes: new Set(), maxHops: 0 };
  const statsEls = {};

  [
    { key: 'messages', label: '📨 Berichten', value: '0' },
    { key: 'nodes', label: '📡 Nodes gezien', value: '0' },
    { key: 'maxHops', label: '🔗 Max hops', value: '0' }
  ].forEach(s => {
    const card = document.createElement('div');
    card.style.cssText = `
      padding: 0.75rem; background: var(--color-bg-alt, #22223a);
      border-radius: 0.5rem; border-left: 3px solid var(--color-primary, #74c69d);
    `;
    const label = document.createElement('div');
    label.style.cssText = 'font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 0.25rem;';
    label.textContent = s.label;
    const val = document.createElement('div');
    val.style.cssText = 'font-size: 1.5rem; font-weight: bold; color: var(--color-neon-green, #39ff14);';
    val.textContent = s.value;
    card.append(label, val);
    sidebar.appendChild(card);
    statsEls[s.key] = val;
  });

  // Network hint
  const hint = document.createElement('div');
  hint.style.cssText = `
    margin-top: auto; padding: 0.75rem; font-size: 0.85rem;
    color: var(--color-text-muted); text-align: center;
    border: 1px dashed var(--color-border, #3a3a50); border-radius: 0.5rem;
  `;
  hint.textContent = '💡 Stuur een bericht met je node — het verschijnt hier live!';
  sidebar.appendChild(hint);

  function addMessage(msg) {
    if (destroyed) return;

    stats.messages++;
    stats.nodes.add(msg.from);
    stats.maxHops = Math.max(stats.maxHops, msg.hops || 0);

    statsEls.messages.textContent = stats.messages;
    statsEls.nodes.textContent = stats.nodes.size;
    statsEls.maxHops.textContent = stats.maxHops;

    const el = document.createElement('div');
    el.style.cssText = `
      padding: 0.75rem; background: var(--color-bg-alt, #22223a);
      border-radius: 0.5rem; opacity: 0; transform: translateY(10px);
      transition: opacity 0.3s ease, transform 0.3s ease;
      border-left: 3px solid var(--color-signal, #48cae4);
    `;
    el.innerHTML = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
        <span style="color: var(--color-signal, #48cae4); font-weight: bold; font-size: 0.9rem;">
          ${escapeHtml(msg.from)}
        </span>
        <span style="color: var(--color-text-muted); font-size: 0.75rem;">
          ${msg.hops != null ? msg.hops + ' hop' + (msg.hops !== 1 ? 's' : '') : ''}
          ${msg.rssi != null ? ' · ' + msg.rssi + ' dBm' : ''}
        </span>
      </div>
      <div style="font-size: 1.1rem;">${escapeHtml(msg.text)}</div>
    `;

    feed.prepend(el);
    // Trigger animation
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });

    // Keep feed manageable
    while (feed.children.length > 20) {
      feed.lastChild.remove();
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('span');
    div.textContent = str;
    return div.innerHTML;
  }

  async function loadFallback() {
    try {
      const resp = await fetch(fallbackUrl);
      if (resp.ok) demoData = await resp.json();
    } catch { /* no fallback available */ }
  }

  function playFallback() {
    if (!demoData || !demoData.messages) return;

    statusEl.textContent = '🎬 Demo-modus (pre-recorded)';
    statusEl.style.color = 'var(--color-accent, #f4a261)';

    demoData.messages.forEach((msg, i) => {
      const delay = reducedMotion ? i * 500 : (msg.timestamp || i * 3000);
      const id = setTimeout(() => {
        if (!destroyed) addMessage(msg);
      }, delay);
      timeouts.push(id);
    });

    // Complete after last message + buffer
    const lastTime = demoData.messages[demoData.messages.length - 1]?.timestamp || demoData.messages.length * 3000;
    const id = setTimeout(() => {
      if (!destroyed && completeCallback) completeCallback();
    }, (reducedMotion ? demoData.messages.length * 500 : lastTime) + 2000);
    timeouts.push(id);
  }

  // TODO (Cyclus 2b): Add Web Bluetooth / Web Serial connection
  // For now, always use fallback demo data.

  return {
    async play() {
      if (destroyed) return;

      // Reset state
      feed.innerHTML = '';
      stats.messages = 0;
      stats.nodes.clear();
      stats.maxHops = 0;
      Object.values(statsEls).forEach(el => { el.textContent = '0'; });

      await loadFallback();
      playFallback();
    },

    pause() {
      timeouts.forEach(clearTimeout);
      timeouts = [];
    },

    reset() {
      this.pause();
      feed.innerHTML = '';
      stats.messages = 0;
      stats.nodes.clear();
      stats.maxHops = 0;
      Object.values(statsEls).forEach(el => { el.textContent = '0'; });
      statusEl.textContent = '⏳ Wachten op verbinding…';
      statusEl.style.color = 'var(--color-text-muted)';
    },

    destroy() {
      destroyed = true;
      this.pause();
      wrapper.remove();
    },

    onComplete(cb) { completeCallback = cb; }
  };
}
