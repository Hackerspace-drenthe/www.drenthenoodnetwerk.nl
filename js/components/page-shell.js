/**
 * Page Shell - injects shared navigation, breadcrumb and footer.
 * Single point of maintenance for site-wide shell elements.
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
      { href: 'links-sites.html', label: 'Links / Sites' },
    ]
  },
  { href: 'meedoen.html', label: 'Meedoen' },
  { href: 'nieuws.html', label: 'Nieuws' },
];

const SECONDARY_ITEMS = [
  { href: 'sponsor-drenthe-noodnetwerk.html', label: 'Sponsor' },
];

const SECTION_PREFIX_MAP = {
  Info: ['Presentation/'],
  Netwerk: ['Map/'],
  Leren: ['MeshAcademy/', 'Tools/'],
};

const REQUIRED_SHELL_STYLES = [
  'css/variables.css',
  'css/components/nav.css',
  'css/components/footer.css',
  'css/components/theme-toggle.css',
];

/**
 * Resolves the site root URL based on page-shell script location.
 * Works for both server-hosted pages and local file previews.
 * @returns {URL}
 */
function getSiteRootUrl() {
  let scriptEl = document.currentScript;

  if (!scriptEl || !scriptEl.getAttribute('src')) {
    scriptEl = Array.from(document.querySelectorAll('script[src]')).find(el => {
      const src = el.getAttribute('src') || '';
      return src.includes('js/components/page-shell.js');
    }) || null;
  }

  if (!scriptEl) {
    return new URL('./', window.location.href);
  }

  const scriptSrc = scriptEl.getAttribute('src') || '';
  const scriptUrl = new URL(scriptSrc, window.location.href);
  return new URL('../../', scriptUrl);
}

const SITE_ROOT_URL = getSiteRootUrl();

/**
 * Determines the current path from URL.
 * @returns {string} e.g. 'index.html' or 'MeshAcademy/c01-wat-is-mesh.html'
 */
function getCurrentPath() {
  const currentUrl = new URL(window.location.href);
  const rootPath = SITE_ROOT_URL.pathname;

  let relativePath = currentUrl.pathname;
  if (relativePath.startsWith(rootPath)) {
    relativePath = relativePath.slice(rootPath.length);
  }

  const trimmed = decodeURIComponent(relativePath.replace(/^\/+/, ''));

  if (!trimmed || trimmed.endsWith('/')) {
    return 'index.html';
  }

  return trimmed;
}

/**
 * Determines the current page from URL.
 * @returns {string} filename like 'index.html'
 */
function getCurrentPage() {
  const currentPath = getCurrentPath();
  const filename = currentPath.substring(currentPath.lastIndexOf('/') + 1);
  return filename || 'index.html';
}

/**
 * Builds relative prefix back to root for nested pages.
 * @returns {string}
 */
function getPathPrefix() {
  const depth = getCurrentPath().split('/').length - 1;
  return depth > 0 ? '../'.repeat(depth) : '';
}

/**
 * Returns true for external links that should not be prefixed.
 * @param {string} value
 * @returns {boolean}
 */
function isExternalUrl(value) {
  if (!value) return true;

  return (
    /^([a-z]+:)?\/\//i.test(value) ||
    value.startsWith('mailto:') ||
    value.startsWith('tel:') ||
    value.startsWith('#') ||
    value.startsWith('/')
  );
}

/**
 * Prefixes a relative URL with pathPrefix.
 * @param {string} url
 * @param {string} pathPrefix
 * @returns {string}
 */
function withPrefix(url, pathPrefix) {
  if (isExternalUrl(url)) {
    return url;
  }

  return `${pathPrefix}${url}`;
}

/**
 * Returns true when a target href matches current path/page.
 * @param {string} href
 * @param {string} currentPath
 * @param {string} currentPage
 * @returns {boolean}
 */
function hrefMatchesCurrent(href, currentPath, currentPage) {
  return href === currentPath || href === currentPage;
}

/**
 * Gets a readable label for current page from h1/title.
 * @param {string} currentPage
 * @returns {string}
 */
function getCurrentPageLabel(currentPage) {
  const pageHeading = document.querySelector('#main-content h1, main h1, h1');

  if (pageHeading && pageHeading.textContent.trim()) {
    return pageHeading.textContent.trim();
  }

  if (document.title) {
    return document.title.split(' - ')[0].split('—')[0].split('|')[0].trim();
  }

  return currentPage.replace(/\.html$/i, '').replace(/[-_]/g, ' ');
}

/**
 * Computes breadcrumb items for current page.
 * @param {string} currentPage
 * @param {string} currentPath
 * @returns {Array<{label: string, href?: string}>}
 */
function getBreadcrumbItems(currentPage, currentPath) {
  const items = [{ label: 'Home', href: 'index.html' }];

  if (currentPath === 'index.html') {
    return items;
  }

  for (const navItem of NAV_ITEMS) {
    if (navItem.href && hrefMatchesCurrent(navItem.href, currentPath, currentPage)) {
      if (navItem.href !== 'index.html') {
        items.push({ label: navItem.label, href: navItem.href });
      }
      return items;
    }

    if (navItem.dropdown) {
      const activeChild = navItem.dropdown.find(child => hrefMatchesCurrent(child.href, currentPath, currentPage));
      if (activeChild) {
        items.push({ label: navItem.label });
        items.push({ label: activeChild.label, href: activeChild.href });
        return items;
      }
    }
  }

  if (currentPath.startsWith('MeshAcademy/')) {
    items.push({ label: 'Leren' });
    items.push({ label: 'MeshAcademy', href: 'MeshAcademy/course-hub.html' });
    items.push({ label: getCurrentPageLabel(currentPage) });
    return items;
  }

  if (currentPath.startsWith('Tools/')) {
    items.push({ label: 'Leren' });
    items.push({ label: 'Tools en simulatoren', href: 'tools.html' });
    items.push({ label: getCurrentPageLabel(currentPage) });
    return items;
  }

  if (currentPath.startsWith('Map/')) {
    items.push({ label: 'Netwerk' });
    items.push({ label: 'Planningkaart', href: 'Map/index.html' });
    return items;
  }

  if (currentPath.startsWith('Presentation/')) {
    items.push({ label: 'Info' });
    items.push({ label: 'Presentatie', href: 'Presentation/index.html' });
    return items;
  }

  if (currentPage === 'sponsor-drenthe-noodnetwerk.html') {
    items.push({ label: 'Meedoen' });
    items.push({ label: 'Sponsor', href: 'sponsor-drenthe-noodnetwerk.html' });
    return items;
  }

  items.push({ label: getCurrentPageLabel(currentPage) });
  return items;
}

/**
 * Creates a single breadcrumb list item.
 * @param {{label: string, href?: string}} item
 * @param {boolean} isCurrent
 * @param {string} pathPrefix
 * @returns {HTMLElement}
 */
function createBreadcrumbNode(item, isCurrent, pathPrefix) {
  const li = document.createElement('li');
  li.className = 'site-breadcrumb__item';

  if (!isCurrent && item.href) {
    const link = document.createElement('a');
    link.href = withPrefix(item.href, pathPrefix);
    link.textContent = item.label;
    li.appendChild(link);
    return li;
  }

  const text = document.createElement('span');
  text.className = 'site-breadcrumb__current';
  text.textContent = item.label;

  if (isCurrent) {
    text.setAttribute('aria-current', 'page');
  }

  li.appendChild(text);
  return li;
}

/**
 * Ensures required shell styles are available.
 * @param {string} pathPrefix
 */
function ensureShellStyles(pathPrefix) {
  const hasStylesheet = (targetPath) => {
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    return Array.from(links).some(link => {
      const href = link.getAttribute('href') || '';
      return href === targetPath || href.endsWith(targetPath);
    });
  };

  REQUIRED_SHELL_STYLES.forEach(stylePath => {
    if (hasStylesheet(stylePath)) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = withPrefix(stylePath, pathPrefix);
    link.setAttribute('data-page-shell-style', stylePath);
    document.head.appendChild(link);
  });
}

/**
 * Adds top spacing for pages without layout shell spacing.
 * @param {string} currentPath
 */
function ensureMainOffset(currentPath) {
  // Academy pages have their own top headers before <main>.
  // Offset the whole page so the fixed global nav never overlaps course headers.
  if (currentPath.startsWith('MeshAcademy/')) {
    const bodyPaddingTop = parseFloat(window.getComputedStyle(document.body).paddingTop || '0');
    if (bodyPaddingTop < 40) {
      document.body.style.paddingTop = 'var(--nav-height, 64px)';
    }
    return;
  }

  const main = document.querySelector('#main-content, main');
  if (!main) return;

  const mainPaddingTop = parseFloat(window.getComputedStyle(main).paddingTop || '0');
  const navHeightVar = window.getComputedStyle(document.documentElement).getPropertyValue('--nav-height');
  const navHeight = parseFloat(navHeightVar) || 64;

  if (mainPaddingTop < navHeight - 8) {
    main.style.paddingTop = 'calc(var(--nav-height, 64px) + 1rem)';
  }
}

/**
 * Creates a nav link element.
 * @param {Object} item - { href, label }
 * @param {string} currentPage - current filename
 * @param {string} className - CSS class prefix
 * @param {string} currentPath - current relative path
 * @param {string} pathPrefix - path back to root
 * @returns {HTMLAnchorElement}
 */
function createNavLink(item, currentPage, className, currentPath = currentPage, pathPrefix = '') {
  const a = document.createElement('a');
  a.href = withPrefix(item.href, pathPrefix);
  a.textContent = item.label;
  a.className = className;

  if (hrefMatchesCurrent(item.href, currentPath, currentPage)) {
    a.classList.add(`${className}--active`);
    a.setAttribute('aria-current', 'page');
  }

  return a;
}

/**
 * Creates a dropdown menu item for desktop navigation.
 * @param {Object} item - { label, dropdown: [] }
 * @param {string} currentPage
 * @param {string} currentPath
 * @param {string} pathPrefix
 * @returns {HTMLElement}
 */
function createDropdown(item, currentPage, currentPath, pathPrefix) {
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

  let hasActiveChild = false;
  item.dropdown.forEach(child => {
    const link = createNavLink(child, currentPage, 'site-nav__dropdown-link', currentPath, pathPrefix);
    link.setAttribute('role', 'menuitem');
    dropdownContent.appendChild(link);

    if (hrefMatchesCurrent(child.href, currentPath, currentPage)) {
      hasActiveChild = true;
    }
  });

  if (!hasActiveChild) {
    const sectionPrefixes = SECTION_PREFIX_MAP[item.label] || [];
    if (sectionPrefixes.some(prefix => currentPath.startsWith(prefix))) {
      hasActiveChild = true;
    }
  }

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
 * @param {string} currentPath
 * @param {string} pathPrefix
 * @returns {HTMLElement}
 */
function createMobileAccordion(item, currentPage, currentPath, pathPrefix) {
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
    content.appendChild(createNavLink(child, currentPage, 'site-nav__mobile-link', currentPath, pathPrefix));
  });

  container.appendChild(button);
  container.appendChild(content);
  return container;
}

/**
 * Builds and injects the site navigation.
 * @param {string} currentPage
 * @param {string} currentPath
 * @param {string} pathPrefix
 */
function injectNav(currentPage, currentPath, pathPrefix) {
  if (document.querySelector('.site-nav')) {
    return;
  }

  const nav = document.createElement('nav');
  nav.className = 'site-nav';
  nav.setAttribute('aria-label', 'Hoofdnavigatie');

  const inner = document.createElement('div');
  inner.className = 'site-nav__inner';

  const logo = document.createElement('a');
  logo.href = withPrefix('index.html', pathPrefix);
  logo.className = 'site-nav__logo';
  logo.setAttribute('aria-label', 'Drenthe Noodnetwerk - Home');
  logo.innerHTML = `
    <img src="https://www.hackerspace-drenthe.nl/wp-content/uploads/2021/11/cropped-cropped-4018_Hackerspace-Drenthe_01_small.png" alt="Hackerspace Drenthe logo" width="40" height="40" loading="lazy" decoding="async">
    <span class="site-nav__logo-text">
      <span class="site-nav__logo-title">Drenthe Noodnetwerk</span>
      <span class="site-nav__logo-subtitle">Hackerspace Drenthe</span>
    </span>`;

  const menu = document.createElement('div');
  menu.className = 'site-nav__menu';
  menu.setAttribute('role', 'menubar');

  NAV_ITEMS.forEach(item => {
    if (item.dropdown) {
      menu.appendChild(createDropdown(item, currentPage, currentPath, pathPrefix));
    } else {
      menu.appendChild(createNavLink(item, currentPage, 'site-nav__link', currentPath, pathPrefix));
    }
  });

  const themeSlot = document.createElement('div');
  themeSlot.id = 'theme-toggle-slot';
  menu.appendChild(themeSlot);

  const toggle = document.createElement('button');
  toggle.className = 'site-nav__toggle';
  toggle.setAttribute('aria-label', 'Menu openen');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'mobile-menu');
  toggle.innerHTML = '<span class="site-nav__toggle-icon" aria-hidden="true"></span>';

  const mobile = document.createElement('div');
  mobile.className = 'site-nav__mobile';
  mobile.id = 'mobile-menu';
  mobile.setAttribute('aria-hidden', 'true');
  mobile.setAttribute('role', 'menu');

  NAV_ITEMS.forEach(item => {
    if (item.dropdown) {
      mobile.appendChild(createMobileAccordion(item, currentPage, currentPath, pathPrefix));
    } else {
      mobile.appendChild(createNavLink(item, currentPage, 'site-nav__mobile-link', currentPath, pathPrefix));
    }
  });

  SECONDARY_ITEMS.forEach(item => {
    mobile.appendChild(createNavLink(item, currentPage, 'site-nav__mobile-link', currentPath, pathPrefix));
  });

  inner.appendChild(logo);
  inner.appendChild(menu);
  inner.appendChild(toggle);
  nav.appendChild(inner);

  document.body.prepend(mobile);
  document.body.prepend(nav);
}

/**
 * Builds and injects breadcrumb navigation.
 * @param {string} currentPage
 * @param {string} currentPath
 * @param {string} pathPrefix
 */
function injectBreadcrumb(currentPage, currentPath, pathPrefix) {
  const main = document.querySelector('#main-content, main');
  const existing = document.querySelector('.site-breadcrumb');

  if (existing) {
    return;
  }

  const items = getBreadcrumbItems(currentPage, currentPath);
  if (!items.length) {
    return;
  }

  const nav = document.createElement('nav');
  nav.className = 'site-breadcrumb';
  nav.setAttribute('aria-label', 'Breadcrumb');

  const list = document.createElement('ol');
  list.className = 'site-breadcrumb__list';

  items.forEach((item, index) => {
    const isCurrent = index === items.length - 1;
    list.appendChild(createBreadcrumbNode(item, isCurrent, pathPrefix));
  });

  nav.appendChild(list);

  if (main) {
    main.prepend(nav);
    return;
  }

  nav.classList.add('site-breadcrumb--floating');
  const siteNav = document.querySelector('.site-nav');
  if (siteNav) {
    siteNav.insertAdjacentElement('afterend', nav);
  }
}

/**
 * Prefixes relative links and image paths in footer.
 * @param {HTMLElement} footer
 * @param {string} pathPrefix
 */
function prefixFooterUrls(footer, pathPrefix) {
  const anchors = footer.querySelectorAll('a[href]');
  anchors.forEach(anchor => {
    const href = anchor.getAttribute('href');
    if (href && !isExternalUrl(href)) {
      anchor.setAttribute('href', withPrefix(href, pathPrefix));
    }
  });

  const images = footer.querySelectorAll('img[src]');
  images.forEach(image => {
    const src = image.getAttribute('src');
    if (src && !isExternalUrl(src)) {
      image.setAttribute('src', withPrefix(src, pathPrefix));
    }
  });
}

/**
 * Builds and injects the site footer.
 * @param {string} pathPrefix
 */
function injectFooter(pathPrefix) {
  if (document.querySelector('.site-footer')) {
    return;
  }

  const footer = document.createElement('footer');
  footer.className = 'site-footer';

  footer.innerHTML = `
    <div class="site-footer__inner">
      <div class="site-footer__brand">
        <a href="https://www.hackerspace-drenthe.nl/" class="site-footer__logo" rel="noopener noreferrer">
          <img src="assets/images/logo-hackerspace.png" alt="Hackerspace Drenthe logo" width="56" height="40">
        </a>
        <p class="site-footer__description">
          Een project van <strong>Hackerspace Drenthe</strong> - voor hackers en makers in Coevorden, Emmen en de rest van Drenthe.
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
            <li>Elke woensdag 19:00-21:00</li>
            <li>Coevorden - De Nieuwe Veste</li>
          </ul>
        </div>
      </div>
      <div class="site-footer__bottom">
        <span>Meshcore Drenthe - Een open-source noodnetwerk voor de provincie</span>
        <span>Hackerspace Drenthe - KVK: 82345023</span>
      </div>
    </div>`;

  prefixFooterUrls(footer, pathPrefix);
  document.body.appendChild(footer);
}

/**
 * Initializes the page shell.
 */
function initPageShell() {
  if (window.__pageShellInitialized) {
    return;
  }

  window.__pageShellInitialized = true;

  const currentPath = getCurrentPath();
  const currentPage = getCurrentPage();
  const pathPrefix = getPathPrefix();

  ensureShellStyles(pathPrefix);
  injectNav(currentPage, currentPath, pathPrefix);
  injectBreadcrumb(currentPage, currentPath, pathPrefix);
  injectFooter(pathPrefix);
  ensureMainOffset(currentPath);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPageShell);
} else {
  initPageShell();
}
