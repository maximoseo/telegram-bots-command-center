"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved theme from localStorage
    const saved = localStorage.getItem("tg-command-center-theme") as Theme | null;
    if (saved && ["light", "dark", "system"].includes(saved)) {
      setThemeState(saved);
      applyTheme(saved);
    } else {
      applyTheme("system");
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    let resolved: "light" | "dark";
    if (newTheme === "system") {
      resolved = systemDark ? "dark" : "light";
    } else {
      resolved = newTheme;
    }
    
    setResolvedTheme(resolved);
    
    if (resolved === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("tg-command-center-theme", newTheme);
    applyTheme(newTheme);
  };

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return;
    
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      applyTheme("system");
    };
    
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [theme]);

  // Prevent flash of wrong theme
  if (!mounted) {
    return (
      <>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem("tg-command-center-theme") || "system";
                const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                const resolved = theme === "system" ? (systemDark ? "dark" : "light") : theme;
                if (resolved === "dark") document.documentElement.classList.add("dark");
              })();
            `,
          }}
        />
        {children}
      </>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Return default values during prerender or when not in provider
    return {
      theme: "system" as Theme,
      setTheme: () => {},
      resolvedTheme: "light" as "light" | "dark",
    };
  }
  return context;
}
