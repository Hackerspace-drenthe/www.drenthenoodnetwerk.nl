/**
 * Navigation — Mobile menu toggle, actieve pagina markering.
 */

/**
 * Initializes mobile navigation toggle behavior.
 */
function initNavigation() {
  const toggle = document.querySelector('.site-nav__toggle');
  const mobile = document.getElementById('mobile-menu');

  if (!toggle || !mobile) return;

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    setMobileMenu(toggle, mobile, !isOpen);
  });

  // Sluit menu bij Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setMobileMenu(toggle, mobile, false);
      toggle.focus();
    }
  });

  // Sluit menu bij klik op link
  mobile.addEventListener('click', (e) => {
    if (e.target.matches('.site-nav__mobile-link')) {
      setMobileMenu(toggle, mobile, false);
    }
  });
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
