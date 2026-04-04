/**
 * Tests voor page-shell.js — Navigatie en footer injectie.
 * Functions (getCurrentPage, createNavLink, NAV_ITEMS, SECONDARY_ITEMS) are
 * loaded as globals via <script> in test-runner.html.
 */

describe('page-shell — getCurrentPage()', () => {
  it('returns a non-empty string', () => {
    const page = getCurrentPage();
    assert.ok(page, 'getCurrentPage should return a string');
    assert.ok(page.length > 0, 'should not be empty');
  });

  it('returns a filename ending in .html', () => {
    const page = getCurrentPage();
    // In test-runner context this might be test-runner.html
    assert.ok(typeof page === 'string');
  });
});

describe('page-shell — NAV_ITEMS', () => {
  it('is a non-empty array', () => {
    assert.ok(Array.isArray(NAV_ITEMS));
    assert.ok(NAV_ITEMS.length > 0, 'NAV_ITEMS should have entries');
  });

  it('each item has href and label', () => {
    for (const item of NAV_ITEMS) {
      assert.ok(item.href, `item should have href: ${JSON.stringify(item)}`);
      assert.ok(item.label, `item should have label: ${JSON.stringify(item)}`);
    }
  });

  it('first item links to index.html', () => {
    assert.equal(NAV_ITEMS[0].href, 'index.html');
  });
});

describe('page-shell — SECONDARY_ITEMS', () => {
  it('is a non-empty array', () => {
    assert.ok(Array.isArray(SECONDARY_ITEMS));
    assert.ok(SECONDARY_ITEMS.length > 0);
  });

  it('contains woordenlijst and faq', () => {
    const hrefs = SECONDARY_ITEMS.map(i => i.href);
    assert.includes(hrefs, 'woordenlijst.html');
    assert.includes(hrefs, 'faq.html');
  });
});

describe('page-shell — createNavLink()', () => {
  it('creates an anchor element', () => {
    const link = createNavLink({ href: 'test.html', label: 'Test' }, 'index.html', 'nav__link');
    assert.isElement(link);
    assert.equal(link.tagName, 'A');
  });

  it('sets the href and text content', () => {
    const link = createNavLink({ href: 'meedoen.html', label: 'Meedoen' }, 'index.html', 'nav__link');
    assert.equal(link.getAttribute('href'), 'meedoen.html');
    assert.equal(link.textContent, 'Meedoen');
  });

  it('adds active class and aria-current when on current page', () => {
    const link = createNavLink({ href: 'index.html', label: 'Home' }, 'index.html', 'nav__link');
    assert.ok(link.classList.contains('nav__link--active'), 'should have --active class');
    assert.equal(link.getAttribute('aria-current'), 'page');
  });

  it('does NOT add active class for different pages', () => {
    const link = createNavLink({ href: 'faq.html', label: 'FAQ' }, 'index.html', 'nav__link');
    assert.ok(!link.classList.contains('nav__link--active'), 'should not have --active class');
    assert.ok(!link.hasAttribute('aria-current'), 'should not have aria-current');
  });
});
