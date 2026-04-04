/**
 * A11y Utilities — Accessibility helpers.
 */

/**
 * Traps focus within a container (used for modals, mobile menu).
 * @param {Element} container
 * @param {KeyboardEvent} event
 */
function trapFocus(container, event) {
  const focusable = container.querySelectorAll(
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
  );
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.key === 'Tab') {
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}

/**
 * Announces a message to screen readers via a live region.
 * @param {string} message
 * @param {'polite'|'assertive'} priority
 */
function announce(message, priority = 'polite') {
  let region = document.getElementById('sr-announcer');
  if (!region) {
    region = document.createElement('div');
    region.id = 'sr-announcer';
    region.className = 'sr-only';
    region.setAttribute('aria-live', priority);
    region.setAttribute('aria-atomic', 'true');
    document.body.appendChild(region);
  }
  region.setAttribute('aria-live', priority);
  region.textContent = '';
  // Force DOM update for screen reader
  requestAnimationFrame(() => {
    region.textContent = message;
  });
}

/**
 * Checks whether the user prefers reduced motion.
 * @returns {boolean}
 */
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
