'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'dark' | 'light';

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const stored = window.localStorage.getItem('tgcc-theme');
    const preferred: Theme = stored === 'light' ? 'light' : 'dark';
    setTheme(preferred);
    applyTheme(preferred);
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    toggleTheme: () => {
      setTheme((current) => {
        const next: Theme = current === 'dark' ? 'light' : 'dark';
        window.localStorage.setItem('tgcc-theme', next);
        applyTheme(next);
        return next;
      });
    }
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return context;
}
