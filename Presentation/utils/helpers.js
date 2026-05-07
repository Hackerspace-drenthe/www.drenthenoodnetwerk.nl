/**
 * Helper Utilities
 * Reusable utility functions
 */

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Format duration to readable string
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration
 */
export function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}u ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Get element safely
 * @param {string} selector - CSS selector
 * @returns {HTMLElement|null}
 */
export function getElement(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    console.warn(`Element not found: ${selector}`);
  }
  return element;
}

/**
 * Get all elements safely
 * @param {string} selector - CSS selector
 * @returns {NodeList}
 */
export function getAllElements(selector) {
  return document.querySelectorAll(selector);
}

/**
 * Create element with attributes
 * @param {string} tag - HTML tag
 * @param {Object} attributes - Element attributes
 * @param {string} textContent - Text content
 * @returns {HTMLElement}
 */
export function createElement(tag, attributes = {}, textContent = '') {
  const element = document.createElement(tag);
  
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'class') {
      element.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else {
      element.setAttribute(key, value);
    }
  });
  
  if (textContent) {
    element.textContent = textContent;
  }
  
  return element;
}

/**
 * Show element
 * @param {HTMLElement} element
 * @param {string} display - Display value
 */
export function show(element, display = 'block') {
  if (element) {
    element.style.display = display;
  }
}

/**
 * Hide element
 * @param {HTMLElement} element
 */
export function hide(element) {
  if (element) {
    element.style.display = 'none';
  }
}

/**
 * Toggle element visibility
 * @param {HTMLElement} element
 * @param {string} display - Display value when shown
 */
export function toggle(element, display = 'block') {
  if (element) {
    element.style.display = element.style.display === 'none' ? display : 'none';
  }
}

/**
 * Add class to element
 * @param {HTMLElement} element
 * @param {string} className
 */
export function addClass(element, className) {
  if (element) {
    element.classList.add(className);
  }
}

/**
 * Remove class from element
 * @param {HTMLElement} element
 * @param {string} className
 */
export function removeClass(element, className) {
  if (element) {
    element.classList.remove(className);
  }
}

/**
 * Toggle class on element
 * @param {HTMLElement} element
 * @param {string} className
 */
export function toggleClass(element, className) {
  if (element) {
    element.classList.toggle(className);
  }
}

/**
 * Wait for specified time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise}
 */
export function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if element is in viewport
 * @param {HTMLElement} element
 * @returns {boolean}
 */
export function isInViewport(element) {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Clamp value between min and max
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate unique ID
 * @param {string} prefix - Optional prefix
 * @returns {string}
 */
export function generateId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if browser supports feature
 * @param {string} feature - Feature name
 * @returns {boolean}
 */
export function isSupported(feature) {
  switch (feature) {
    case 'speechSynthesis':
      return 'speechSynthesis' in window;
    case 'localStorage':
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch (e) {
        return false;
      }
    case 'serviceWorker':
      return 'serviceWorker' in navigator;
    default:
      return false;
  }
}

/**
 * Log with timestamp
 * @param {string} message
 * @param {string} type - log, warn, error
 */
export function log(message, type = 'log') {
  const timestamp = new Date().toISOString();
  console[type](`[${timestamp}] ${message}`);
}

export default {
  debounce,
  throttle,
  formatDuration,
  getElement,
  getAllElements,
  createElement,
  show,
  hide,
  toggle,
  addClass,
  removeClass,
  toggleClass,
  wait,
  isInViewport,
  clamp,
  generateId,
  isSupported,
  log
};
