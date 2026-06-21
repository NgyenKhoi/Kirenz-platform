export type Theme = 'light' | 'dark' | 'auto';

let mediaQueryListener: ((e: MediaQueryListEvent) => void) | null = null;

export function getPersistedTheme(): Theme {
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark' || stored === 'auto') {
    return stored;
  }
  return 'auto';
}

export function applyTheme(theme: Theme): void {
  localStorage.setItem('theme', theme);
  const root = document.documentElement;
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  // Clean up any existing auto theme media query listener
  if (mediaQueryListener) {
    mediaQuery.removeEventListener('change', mediaQueryListener);
    mediaQueryListener = null;
  }

  const updateDOM = (isDark: boolean) => {
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  if (theme === 'auto') {
    // Initial application based on current system setting
    updateDOM(mediaQuery.matches);

    // Setup active listener
    mediaQueryListener = (e: MediaQueryListEvent) => {
      updateDOM(e.matches);
    };
    mediaQuery.addEventListener('change', mediaQueryListener);
  } else {
    updateDOM(theme === 'dark');
  }
}

export function initTheme(): void {
  const persistedTheme = getPersistedTheme();
  applyTheme(persistedTheme);
}
