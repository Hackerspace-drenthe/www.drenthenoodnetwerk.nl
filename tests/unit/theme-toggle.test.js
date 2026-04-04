/**
 * Tests voor theme-toggle.js — Dark/light mode.
 * Functions (getTheme, applyTheme) are loaded as globals via <script>
 * in test-runner.html.
 */

describe('theme-toggle — getTheme()', () => {
  it('returns "light" or "dark"', () => {
    const theme = getTheme();
    assert.ok(theme === 'light' || theme === 'dark', `Expected "light" or "dark", got "${theme}"`);
  });
});

describe('theme-toggle — applyTheme()', () => {
  it('sets data-theme attribute on <html>', () => {
    applyTheme('dark');
    assert.equal(document.documentElement.getAttribute('data-theme'), 'dark');

    applyTheme('light');
    assert.equal(document.documentElement.getAttribute('data-theme'), 'light');
  });

  it('persists theme in localStorage', () => {
    applyTheme('dark');
    assert.equal(localStorage.getItem('meshcore-theme'), 'dark');

    applyTheme('light');
    assert.equal(localStorage.getItem('meshcore-theme'), 'light');
  });
});
