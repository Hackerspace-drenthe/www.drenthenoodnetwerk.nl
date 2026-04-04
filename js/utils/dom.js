/**
 * DOM Utilities — Herbruikbare DOM helper-functies.
 */

/**
 * Shorthand for querySelector.
 * @param {string} selector
 * @param {Element|Document} context
 * @returns {Element|null}
 */
function qs(selector, context = document) {
  return context.querySelector(selector);
}

/**
 * Shorthand for querySelectorAll returning a real array.
 * @param {string} selector
 * @param {Element|Document} context
 * @returns {Element[]}
 */
function qsa(selector, context = document) {
  return [...context.querySelectorAll(selector)];
}

/**
 * Creates an element with optional attributes and children.
 * @param {string} tag
 * @param {Object} attrs - attribute key/value pairs
 * @param  {...(string|Element)} children
 * @returns {HTMLElement}
 */
function createElement(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'className') {
      el.className = value;
    } else if (key.startsWith('data')) {
      el.setAttribute(key.replace(/([A-Z])/g, '-$1').toLowerCase(), value);
    } else {
      el.setAttribute(key, value);
    }
  }

  for (const child of children) {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else if (child instanceof Element) {
      el.appendChild(child);
    }
  }

  return el;
}

/**
 * Adds an event listener with optional delegation.
 * @param {Element} parent
 * @param {string} event
 * @param {string} selector - child selector to delegate to
 * @param {Function} handler
 */
function delegate(parent, event, selector, handler) {
  parent.addEventListener(event, (e) => {
    const target = e.target.closest(selector);
    if (target && parent.contains(target)) {
      handler(e, target);
    }
  });
}
