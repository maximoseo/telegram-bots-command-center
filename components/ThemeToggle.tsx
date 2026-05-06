"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={cn("flex items-center gap-1 rounded-lg bg-bg-sunken p-1 border border-line", className)}>
      <button
        onClick={() => setTheme("light")}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-all",
          theme === "light"
            ? "bg-bg-elevated text-text shadow-sm"
            : "text-muted hover:text-text-secondary"
        )}
        aria-label="Light mode"
        title="Light mode"
      >
        <Sun className="h-4 w-4" />
        <span className="hidden sm:inline">Light</span>
      </button>
      
      <button
        onClick={() => setTheme("dark")}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-all",
          theme === "dark"
            ? "bg-bg-elevated text-text shadow-sm"
            : "text-muted hover:text-text-secondary"
        )}
        aria-label="Dark mode"
        title="Dark mode"
      >
        <Moon className="h-4 w-4" />
        <span className="hidden sm:inline">Dark</span>
      </button>
      
      <button
        onClick={() => setTheme("system")}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-all",
          theme === "system"
            ? "bg-bg-elevated text-text shadow-sm"
            : "text-muted hover:text-text-secondary"
        )}
        aria-label="System preference"
        title="System preference"
      >
        <Monitor className="h-4 w-4" />
        <span className="hidden sm:inline">Auto</span>
      </button>
    </div>
  );
}
