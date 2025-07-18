"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

// Constants
const THEME_COOKIE_NAME = "ui-theme";
const COOKIE_EXPIRY_DAYS = 365;
const MILLISECONDS_PER_DAY = 864e5;
const DARK_MODE_MEDIA_QUERY = "(prefers-color-scheme: dark)";
const THEME_CLASSES = {
  LIGHT: "light",
  DARK: "dark",
} as const;

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

const getThemeFromCookie = (cookieName: string): Theme | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${cookieName}=([^;]+)`));
  return match ? (match[2] as Theme) : null;
};

const setCookie = (
  name: string,
  value: string,
  days: number = COOKIE_EXPIRY_DAYS
) => {
  if (typeof document === "undefined") return;
  const expires = new Date(
    Date.now() + days * MILLISECONDS_PER_DAY
  ).toUTCString();
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
    const savedTheme = getThemeFromCookie(THEME_COOKIE_NAME);

    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // First visit - set to system theme so it can respond to OS changes
      setTheme("system");

      // Store the system preference in cookie only
      setCookie(THEME_COOKIE_NAME, "system");
    }
  }, [defaultTheme]);

  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    root.classList.remove(THEME_CLASSES.LIGHT, THEME_CLASSES.DARK);

    if (theme === "system") {
      const systemTheme = window.matchMedia(DARK_MODE_MEDIA_QUERY).matches
        ? THEME_CLASSES.DARK
        : THEME_CLASSES.LIGHT;

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme, mounted]);

  // Listen for system preference changes when theme is "system"
  useEffect(() => {
    if (!mounted || theme !== "system") return;

    const mediaQuery = window.matchMedia(DARK_MODE_MEDIA_QUERY);

    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove(THEME_CLASSES.LIGHT, THEME_CLASSES.DARK);

      const systemTheme = mediaQuery.matches
        ? THEME_CLASSES.DARK
        : THEME_CLASSES.LIGHT;
      root.classList.add(systemTheme);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, mounted]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      setCookie(THEME_COOKIE_NAME, theme);
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
