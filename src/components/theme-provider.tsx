'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark';
type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};
const STORAGE_KEY = 'trainview-theme';
const CHANGE_EVENT = 'trainview-theme-change';
let memoryTheme: Theme | undefined;
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function readTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem('garmin-coach-theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // Private browsing and embedded browsers may deny storage.
  }
  return memoryTheme ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}
function subscribe(onChange: () => void) {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  window.addEventListener('storage', onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  media.addEventListener('change', onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
    media.removeEventListener('change', onChange);
  };
}
const serverTheme = (): Theme => 'light';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, readTheme, serverTheme);
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);
  const setTheme = useCallback((next: Theme) => {
    memoryTheme = next;
    try { window.localStorage.setItem(STORAGE_KEY, next); } catch {}
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);
  const toggleTheme = useCallback(() => setTheme(readTheme() === 'light' ? 'dark' : 'light'), [setTheme]);
  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
