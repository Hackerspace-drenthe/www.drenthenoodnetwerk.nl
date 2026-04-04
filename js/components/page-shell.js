/**
 * Page Shell — Injects shared navigation and footer into every page.
 * Single point of maintenance for site-wide layout elements.
 */

const NAV_ITEMS = [
  { href: 'index.html', label: 'Home' },
  { href: 'wat-is-meshcore.html', label: 'Wat is Meshcore?' },
  { href: 'hoe-werkt-het.html', label: 'Hoe werkt het?' },
  { href: 'netwerk-drenthe.html', label: 'Netwerk Kaart' },
  { href: 'meedoen.html', label: 'Meedoen' },
  { href: 'planning.html', label: 'Planning' },
  { href: 'handleidingen.html', label: 'Handleidingen' },
];

const SECONDARY_ITEMS = [
  { href: 'apparaten.html', label: 'Apparaten' },
  { href: 'woordenlijst.html', label: 'Woordenlijst' },
  { href: 'faq.html', label: 'FAQ' },
];

/**
 * Determines the current page from the URL.
 * @returns {string} filename like 'index.html'
 */
function getCurrentPage() {
  const path = window.location.pathname;
  const filename = path.substring(path.lastIndexOf('/') + 1);
  return filename || 'index.html';
}

/**
 * Creates a nav link element.
 * @param {Object} item - { href, label }
 * @param {string} currentPage - current filename
 * @param {string} className - CSS class prefix
 * @returns {HTMLAnchorElement}
 */
function createNavLink(item, currentPage, className) {
  const a = document.createElement('a');
  a.href = item.href;
  a.textContent = item.label;
  a.className = className;

  if (item.href === currentPage) {
    a.classList.add(`${className}--active`);
    a.setAttribute('aria-current', 'page');
  }

  return a;
}

/**
 * Builds and injects the site navigation.
 * @param {string} currentPage
 */
function injectNav(currentPage) {
  const nav = document.createElement('nav');
  nav.className = 'site-nav';
  nav.setAttribute('aria-label', 'Hoofdnavigatie');

  const inner = document.createElement('div');
  inner.className = 'site-nav__inner';

  // Logo
  const logo = document.createElement('a');
  logo.href = 'index.html';
  logo.className = 'site-nav__logo';
  logo.setAttribute('aria-label', 'Meshcore Drenthe — Home');
  logo.innerHTML = `
    <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">
      <circle cx="8" cy="8" r="3" fill="currentColor" opacity="0.7"/>
      <circle cx="24" cy="8" r="3" fill="currentColor" opacity="0.7"/>
      <circle cx="16" cy="24" r="3" fill="currentColor"/>
      <circle cx="4" cy="20" r="2" fill="currentColor" opacity="0.5"/>
      <circle cx="28" cy="20" r="2" fill="currentColor" opacity="0.5"/>
      <line x1="8" y1="8" x2="24" y2="8" stroke="currentColor" stroke-width="1" opacity="0.3"/>
      <line x1="8" y1="8" x2="16" y2="24" stroke="currentColor" stroke-width="1" opacity="0.3"/>
      <line x1="24" y1="8" x2="16" y2="24" stroke="currentColor" stroke-width="1" opacity="0.3"/>
      <line x1="4" y1="20" x2="16" y2="24" stroke="currentColor" stroke-width="1" opacity="0.3"/>
      <line x1="28" y1="20" x2="16" y2="24" stroke="currentColor" stroke-width="1" opacity="0.3"/>
      <line x1="4" y1="20" x2="8" y2="8" stroke="currentColor" stroke-width="1" opacity="0.2"/>
      <line x1="28" y1="20" x2="24" y2="8" stroke="currentColor" stroke-width="1" opacity="0.2"/>
    </svg>
    <span>Meshcore Drenthe</span>`;

  // Desktop menu
  const menu = document.createElement('div');
  menu.className = 'site-nav__menu';
  menu.setAttribute('role', 'menubar');

  NAV_ITEMS.forEach(item => {
    menu.appendChild(createNavLink(item, currentPage, 'site-nav__link'));
  });

  // Theme toggle placeholder (wordt door theme-toggle.js gevuld)
  const themeSlot = document.createElement('div');
  themeSlot.id = 'theme-toggle-slot';
  menu.appendChild(themeSlot);

  // Hamburger
  const toggle = document.createElement('button');
  toggle.className = 'site-nav__toggle';
  toggle.setAttribute('aria-label', 'Menu openen');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'mobile-menu');
  toggle.innerHTML = '<span class="site-nav__toggle-icon" aria-hidden="true"></span>';

  // Mobile menu
  const mobile = document.createElement('div');
  mobile.className = 'site-nav__mobile';
  mobile.id = 'mobile-menu';
  mobile.setAttribute('aria-hidden', 'true');
  mobile.setAttribute('role', 'menu');

  [...NAV_ITEMS, ...SECONDARY_ITEMS].forEach(item => {
    mobile.appendChild(createNavLink(item, currentPage, 'site-nav__mobile-link'));
  });

  inner.appendChild(logo);
  inner.appendChild(menu);
  inner.appendChild(toggle);
  nav.appendChild(inner);

  document.body.prepend(mobile);
  document.body.prepend(nav);
}

/**
 * Builds and injects the site footer.
 */
function injectFooter() {
  const footer = document.createElement('footer');
  footer.className = 'site-footer';

  footer.innerHTML = `
    <div class="site-footer__inner">
      <div class="site-footer__brand">
        <a href="https://www.hackerspace-drenthe.nl/" class="site-footer__logo" rel="noopener noreferrer">
          <img src="assets/images/logo-hackerspace.png" alt="Hackerspace Drenthe logo" width="56" height="40">
        </a>
        <p class="site-footer__description">
          Een project van <strong>Hackerspace Drenthe</strong> — voor hackers en makers in Coevorden, Emmen en de rest van Drenthe.
        </p>
      </div>
      <div class="site-footer__links">
        <div class="site-footer__column">
          <h4>Website</h4>
          <ul>
            <li><a href="wat-is-meshcore.html">Wat is Meshcore?</a></li>
            <li><a href="hoe-werkt-het.html">Hoe werkt het?</a></li>
            <li><a href="netwerk-drenthe.html">Netwerk Kaart</a></li>
            <li><a href="apparaten.html">Apparaten</a></li>
            <li><a href="handleidingen.html">Handleidingen</a></li>
          </ul>
        </div>
        <div class="site-footer__column">
          <h4>Meedoen</h4>
          <ul>
            <li><a href="meedoen.html">Doe mee</a></li>
            <li><a href="planning.html">Planning</a></li>
            <li><a href="faq.html">FAQ</a></li>
            <li><a href="woordenlijst.html">Woordenlijst</a></li>
          </ul>
        </div>
        <div class="site-footer__column">
          <h4>Hackerspace Drenthe</h4>
          <ul>
            <li><a href="https://www.hackerspace-drenthe.nl/" rel="noopener noreferrer">Website</a></li>
            <li><a href="https://t.me/+GTTYOvZTRVNhNThk" rel="noopener noreferrer">Telegram</a></li>
            <li>Elke woensdag 19:00–21:00</li>
            <li>Coevorden — De Nieuwe Veste</li>
          </ul>
        </div>
      </div>
      <div class="site-footer__bottom">
        <span>Meshcore Drenthe — Een open-source noodnetwerk voor de provincie</span>
        <span>Hackerspace Drenthe — KVK: 82345023</span>
      </div>
    </div>`;

  document.body.appendChild(footer);
}

/**
 * Initializes the page shell (nav + footer).
 */
function initPageShell() {
  const currentPage = getCurrentPage();
  injectNav(currentPage);
  injectFooter();
}
