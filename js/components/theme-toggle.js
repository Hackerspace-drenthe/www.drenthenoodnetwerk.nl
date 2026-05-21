/**
 * Theme Toggle — Dark/light mode switch.
 * Respecteert de systeemvoorkeur, met handmatige override via data-theme.
 * Voorkeur wordt opgeslagen in localStorage.
 */

const STORAGE_KEY = 'meshcore-theme';
const THEMES = ['light', 'dark'];

// Legacy tokens used by standalone Academy/Tools pages with custom dark-only themes.
// These are overridden in light mode so background/text actually switch with the global toggle.
const LEGACY_LIGHT_TOKENS = {
  '--dark': '#f6f8fb',
  '--mid': '#ffffff',
  '--card': '#ffffff',
  '--card2': '#eef3f7',
  '--text': '#1f2937',
  '--dim': '#4b5563',
  '--border': 'rgba(31, 41, 55, 0.16)',
  '--bg': '#f6f8fb',
  '--panel': '#ffffff',
  '--muted': '#4b5563',
};

const LEGACY_TOKEN_KEYS = Object.keys(LEGACY_LIGHT_TOKENS);

/**
 * Gets the current effective theme.
 * @returns {'light'|'dark'}
 */
function getTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && THEMES.includes(stored)) return stored;

  // Systeemvoorkeur
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

/**
 * Applies a theme to the document.
 * @param {'light'|'dark'} theme
 */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  applyLegacyThemeTokens(theme);
  localStorage.setItem(STORAGE_KEY, theme);
  updateToggleButton(theme);
}

/**
 * Applies fallback token overrides for legacy pages that define their own dark tokens.
 * @param {'light'|'dark'} theme
 */
function applyLegacyThemeTokens(theme) {
  const rootStyle = document.documentElement.style;

  if (theme === 'light') {
    Object.entries(LEGACY_LIGHT_TOKENS).forEach(([key, value]) => {
      rootStyle.setProperty(key, value);
    });
    return;
  }

  // Dark mode falls back to each page's native token definitions.
  LEGACY_TOKEN_KEYS.forEach((key) => {
    rootStyle.removeProperty(key);
  });
}

/**
 * Toggles between light and dark theme.
 * @returns {'light'|'dark'} the new theme
 */
function toggleTheme() {
  const current = getTheme();
  const next = current === 'light' ? 'dark' : 'light';
  applyTheme(next);
  return next;
}

/**
 * Updates the toggle button icon and label.
 * @param {'light'|'dark'} theme
 */
function updateToggleButton(theme) {
  const btn = document.getElementById('theme-toggle-btn');
  if (!btn) return;

  const isDark = theme === 'dark';
  btn.setAttribute('aria-label', isDark ? 'Schakel naar licht thema' : 'Schakel naar donker thema');

  // Sun icon for dark mode (click to go light), moon for light mode (click to go dark)
  btn.innerHTML = isDark
    ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>`
    : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>`;
}

/**
 * Creates and injects the theme toggle button.
 */
function createToggleButton() {
  const slot = document.getElementById('theme-toggle-slot');
  if (!slot) return;

  // Prevent duplicate buttons when initTheme runs multiple times.
  if (document.getElementById('theme-toggle-btn')) {
    return;
  }

  const btn = document.createElement('button');
  btn.id = 'theme-toggle-btn';
  btn.className = 'theme-toggle';
  btn.type = 'button';

  btn.addEventListener('click', toggleTheme);

  slot.appendChild(btn);

  // Ensure icon/label are correct when button is created after initial theme application.
  updateToggleButton(getTheme());
}

/**
 * Initializes the theme system.
 */
function initTheme() {
  // Pas thema direct toe om flicker te voorkomen
  const theme = getTheme();
  applyTheme(theme);
  createToggleButton();

  if (window.__themeMediaListenerAttached) {
    return;
  }

  window.__themeMediaListenerAttached = true;

  // Luister naar systeemwijzigingen
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    // Alleen reageren als gebruiker geen handmatige voorkeur heeft
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}
