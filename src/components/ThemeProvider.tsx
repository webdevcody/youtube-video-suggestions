"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

const getThemeFromStorage = (key: string): Theme | null => {
  if (typeof window === "undefined") return null;
  try {
    const theme = localStorage.getItem(key);
    return theme as Theme;
  } catch (e) {
    // In case localStorage is disabled or unavailable
    return null;
  }
};

const setCookie = (name: string, value: string, days: number = 365) => {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
};

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = getThemeFromStorage(storageKey);

    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // First visit - set to system theme so it can respond to OS changes
      setTheme("system");

      // Store the system preference
      try {
        localStorage.setItem(storageKey, "system");
        setCookie("ui-theme", "system");
      } catch (e) {
        // Ignore if storage is not available
      }
    }
  }, [defaultTheme, storageKey]);

  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme, mounted]);

  // Listen for system preference changes when theme is "system"
  useEffect(() => {
    if (!mounted || theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");

      const systemTheme = mediaQuery.matches ? "dark" : "light";
      root.classList.add(systemTheme);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, mounted]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      try {
        localStorage.setItem(storageKey, theme);
        // Also set a cookie for SSR
        setCookie("ui-theme", theme);
      } catch (e) {
        // Ignore if localStorage is not available
      }
      setTheme(theme);
    },
  };

  // Prevent flash of incorrect theme
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
