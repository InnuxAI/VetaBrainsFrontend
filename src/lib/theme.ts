// src/lib/theme.ts
export type ThemeMode = 'light' | 'dark' | 'system';
const STORAGE_KEY = 'theme-mode';

export function getStoredTheme(): ThemeMode {
  try {
    const t = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    return t ?? 'system';
  } catch {
    return 'system';
  }
}

export function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
}

export function applyTheme(mode: ThemeMode) {
  const resolved = resolveTheme(mode);
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {}
}

export function initTheme() {
  const mode = getStoredTheme();
  applyTheme(mode);
  // Sync when system theme changes and mode is 'system'
  if (mode === 'system' && window.matchMedia) {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mql.addEventListener?.('change', handler);
  }
}
