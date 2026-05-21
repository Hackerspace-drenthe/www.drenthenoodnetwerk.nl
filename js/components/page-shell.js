/**
 * Page Shell — Injects shared navigation and footer into every page.
 * Single point of maintenance for site-wide layout elements.
 */

const NAV_ITEMS = [
  { href: 'index.html', label: 'Home' },
  { 
    label: 'Info', 
    dropdown: [
      { href: 'wat-is-meshcore.html', label: 'Wat is Meshcore?' },
      { href: 'hoe-werkt-het.html', label: 'Hoe werkt het?' },
      { href: 'woordenlijst.html', label: 'Woordenlijst' },
      { href: 'faq.html', label: 'FAQ' },
    ]
  },
  { 
    label: 'Netwerk',
    dropdown: [
      { href: 'netwerk-drenthe.html', label: 'Netwerk Kaart' },
      { href: 'planning.html', label: 'Planning' },
    ]
  },
  { 
    label: 'Leren',
    dropdown: [
      { href: 'MeshAcademy/course-hub.html', label: 'MeshAcademy' },
      { href: 'handleidingen.html', label: 'Handleidingen' },
      { href: 'apparaten.html', label: 'Apparaten' },
      { href: 'tools.html', label: 'Tools en simulatoren' },
    ]
  },
  { href: 'meedoen.html', label: 'Meedoen' },
  { href: 'nieuws.html', label: 'Nieuws' },
];

const SECONDARY_ITEMS = [
  { href: 'sponsor-drenthe-noodnetwerk.html', label: 'Sponsor' },
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
 * Creates a dropdown menu item for desktop navigation.
 * @param {Object} item - { label, dropdown: [] }
 * @param {string} currentPage
 * @returns {HTMLElement}
 */
function createDropdown(item, currentPage) {
  const container = document.createElement('div');
  container.className = 'site-nav__dropdown';

  const button = document.createElement('button');
  button.className = 'site-nav__link site-nav__link--dropdown';
  button.textContent = item.label;
  button.setAttribute('aria-haspopup', 'true');
  button.setAttribute('aria-expanded', 'false');

  const dropdownContent = document.createElement('div');
  dropdownContent.className = 'site-nav__dropdown-content';
  dropdownContent.setAttribute('role', 'menu');

  // Check if any child is active
  let hasActiveChild = false;
  item.dropdown.forEach(child => {
    const link = createNavLink(child, currentPage, 'site-nav__dropdown-link');
    link.setAttribute('role', 'menuitem');
    dropdownContent.appendChild(link);
    
    if (child.href === currentPage) {
      hasActiveChild = true;
    }
  });

  // Mark parent as active if child is active
  if (hasActiveChild) {
    button.classList.add('site-nav__link--active');
  }

  container.appendChild(button);
  container.appendChild(dropdownContent);
  return container;
}

/**
 * Creates a mobile accordion item.
 * @param {Object} item - { label, dropdown: [] }
 * @param {string} currentPage
 * @returns {HTMLElement}
 */
function createMobileAccordion(item, currentPage) {
  const container = document.createElement('div');
  container.className = 'site-nav__mobile-accordion';

  const button = document.createElement('button');
  button.className = 'site-nav__mobile-accordion-btn';
  button.textContent = item.label;
  button.setAttribute('aria-expanded', 'false');

  const content = document.createElement('div');
  content.className = 'site-nav__mobile-accordion-content';
  content.setAttribute('aria-hidden', 'true');

  item.dropdown.forEach(child => {
    content.appendChild(createNavLink(child, currentPage, 'site-nav__mobile-link'));
  });

  container.appendChild(button);
  container.appendChild(content);
  return container;
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
    if (item.dropdown) {
      menu.appendChild(createDropdown(item, currentPage));
    } else {
      menu.appendChild(createNavLink(item, currentPage, 'site-nav__link'));
    }
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

  NAV_ITEMS.forEach(item => {
    if (item.dropdown) {
      mobile.appendChild(createMobileAccordion(item, currentPage));
    } else {
      mobile.appendChild(createNavLink(item, currentPage, 'site-nav__mobile-link'));
    }
  });

  // Add secondary items at the bottom
  SECONDARY_ITEMS.forEach(item => {
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
            <li><a href="sponsor-drenthe-noodnetwerk.html">Sponsor worden</a></li>
            <li><a href="faq.html">FAQ</a></li>
            <li><a href="woordenlijst.html">Woordenlijst</a></li>
          </ul>
        </div>
        <div class="site-footer__column">
          <h4>Hackerspace Drenthe</h4>
          <ul>
            <li><a href="https://www.hackerspace-drenthe.nl/" rel="noopener noreferrer">Website</a></li>
            <li><a href="mailto:bestuur@hackerspace-drenthe.nl">bestuur@hackerspace-drenthe.nl</a></li>
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
