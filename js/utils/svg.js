/**
 * SVG Utilities — Helpers voor SVG-creatie en manipulatie.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Creates an SVG element with optional attributes.
 * @param {string} tag - SVG element name (circle, rect, path, etc.)
 * @param {Object} attrs - attribute key/value pairs
 * @returns {SVGElement}
 */
function createSVGElement(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value);
  }
  return el;
}

/**
 * Creates a complete SVG container with viewBox.
 * @param {number} width
 * @param {number} height
 * @param {Object} attrs - extra attributes
 * @returns {SVGSVGElement}
 */
function createSVG(width, height, attrs = {}) {
  return createSVGElement('svg', {
    xmlns: SVG_NS,
    viewBox: `0 0 ${width} ${height}`,
    role: 'img',
    ...attrs,
  });
}

/**
 * Creates a circle node indicator for the map.
 * @param {number} cx
 * @param {number} cy
 * @param {number} r
 * @param {string} fill
 * @returns {SVGCircleElement}
 */
function createNodeMarker(cx, cy, r = 4, fill = 'var(--color-primary)') {
  return createSVGElement('circle', { cx, cy, r, fill });
}
