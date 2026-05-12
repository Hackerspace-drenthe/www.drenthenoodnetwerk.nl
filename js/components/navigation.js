/**
 * Navigation — Mobile menu toggle, dropdown interactions, keyboard navigation.
 */

/**
 * Initializes mobile navigation toggle behavior.
 */
function initNavigation() {
  const toggle = document.querySelector('.site-nav__toggle');
  const mobile = document.getElementById('mobile-menu');

  if (!toggle || !mobile) return;

  // Mobile menu toggle
  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    setMobileMenu(toggle, mobile, !isOpen);
  });

  // Close menu on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setMobileMenu(toggle, mobile, false);
      toggle.focus();
    }
  });

  // Close menu when clicking a link
  mobile.addEventListener('click', (e) => {
    if (e.target.matches('.site-nav__mobile-link')) {
      setMobileMenu(toggle, mobile, false);
    }
  });

  // Initialize mobile accordions
  initMobileAccordions();

  // Initialize desktop dropdown keyboard navigation
  initDesktopDropdowns();
}

/**
 * Opens or closes the mobile menu.
 * @param {HTMLElement} toggle - the hamburger button
 * @param {HTMLElement} mobile - the mobile menu panel
 * @param {boolean} open - desired state
 */
function setMobileMenu(toggle, mobile, open) {
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
  mobile.setAttribute('aria-hidden', String(!open));
  mobile.classList.toggle('site-nav__mobile--open', open);

  if (open) {
    // Focus eerste link in mobiel menu
    const firstLink = mobile.querySelector('a');
    if (firstLink) firstLink.focus();
  }
}

/**
 * Initializes mobile accordion behavior.
 */
function initMobileAccordions() {
  const accordionButtons = document.querySelectorAll('.site-nav__mobile-accordion-btn');
  
  accordionButtons.forEach(button => {
    button.addEventListener('click', () => {
      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      const content = button.nextElementSibling;
      
      button.setAttribute('aria-expanded', String(!isExpanded));
      content.setAttribute('aria-hidden', String(isExpanded));
    });
  });
}

/**
 * Initializes desktop dropdown keyboard navigation.
 */
function initDesktopDropdowns() {
  const dropdowns = document.querySelectorAll('.site-nav__dropdown');
  
  dropdowns.forEach(dropdown => {
    const button = dropdown.querySelector('.site-nav__link--dropdown');
    const content = dropdown.querySelector('.site-nav__dropdown-content');
    const links = content.querySelectorAll('.site-nav__dropdown-link');
    
    // Keyboard navigation
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', String(!isExpanded));
        
        if (!isExpanded && links.length > 0) {
          links[0].focus();
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        button.setAttribute('aria-expanded', 'true');
        if (links.length > 0) links[0].focus();
      }
    });
    
    // Navigate within dropdown
    links.forEach((link, index) => {
      link.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const next = links[index + 1] || links[0];
          next.focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = links[index - 1] || button;
          prev.focus();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          button.setAttribute('aria-expanded', 'false');
          button.focus();
        }
      });
    });
    
    // Close dropdown when focus leaves
    dropdown.addEventListener('focusout', (e) => {
      // Small delay to allow focus to move
      setTimeout(() => {
        if (!dropdown.contains(document.activeElement)) {
          button.setAttribute('aria-expanded', 'false');
        }
      }, 100);
    });
  });
}
