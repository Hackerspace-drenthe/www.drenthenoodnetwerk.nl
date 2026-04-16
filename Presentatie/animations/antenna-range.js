// antenna-range.js — Animation stub (Cyclus 2: replace with real implementation)
import { createStub } from './_interface.js';

export function init(container, options = {}) {
  // Placeholder visual
  const el = document.createElement('div');
  el.style.cssText = 'display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:var(--color-text-muted);font-size:1.25rem;border:2px dashed var(--color-border);border-radius:1rem;';
  el.textContent = '🎬 antenna-range';
  container.appendChild(el);

  const stub = createStub('antenna-range');
  return {
    ...stub,
    destroy() {
      el.remove();
      stub.destroy();
    }
  };
}
