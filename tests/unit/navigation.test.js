/**
 * Tests voor navigation.js — Mobiel menu toggle.
 * Function setMobileMenu is loaded as global via <script> in test-runner.html.
 */

describe('navigation — setMobileMenu()', () => {
  let toggle;
  let menu;

  // Create mock elements before each suite
  toggle = document.createElement('button');
  toggle.className = 'site-nav__toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Menu openen');

  menu = document.createElement('div');
  menu.className = 'site-nav__mobile';
  menu.id = 'mobile-menu';
  menu.setAttribute('aria-hidden', 'true');

  // Temporarily add to DOM
  document.body.appendChild(toggle);
  document.body.appendChild(menu);

  it('opens the mobile menu (open = true)', () => {
    setMobileMenu(toggle, menu, true);
    assert.equal(toggle.getAttribute('aria-expanded'), 'true');
    assert.equal(menu.getAttribute('aria-hidden'), 'false');
    assert.ok(menu.classList.contains('site-nav__mobile--open'));
  });

  it('closes the mobile menu (open = false)', () => {
    setMobileMenu(toggle, menu, false);
    assert.equal(toggle.getAttribute('aria-expanded'), 'false');
    assert.equal(menu.getAttribute('aria-hidden'), 'true');
    assert.ok(!menu.classList.contains('site-nav__mobile--open'));
  });

  it('sets correct aria-label when opening', () => {
    setMobileMenu(toggle, menu, true);
    assert.equal(toggle.getAttribute('aria-label'), 'Menu sluiten');
  });

  it('sets correct aria-label when closing', () => {
    setMobileMenu(toggle, menu, false);
    assert.equal(toggle.getAttribute('aria-label'), 'Menu openen');
  });

  // Cleanup
  toggle.remove();
  menu.remove();
});
