"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ThemeName = "classic" | "emerald" | "rose" | "amber";

type ThemeContextValue = {
  theme: ThemeName;
  setTheme: (name: ThemeName) => void;
  cycleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_STORAGE_KEY = "dm-color-theme";
const THEME_CLASS_PREFIX = "theme-";
const ALL_THEMES: ThemeName[] = ["classic", "emerald", "rose", "amber"];

function applyThemeClass(theme: ThemeName) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  // Remove any previous theme-* class
  const toRemove: string[] = [];
  root.classList.forEach((cls) => {
    if (cls.startsWith(THEME_CLASS_PREFIX)) toRemove.push(cls);
  });
  toRemove.forEach((cls) => root.classList.remove(cls));
  root.classList.add(`${THEME_CLASS_PREFIX}${theme}`);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("classic");

  useEffect(() => {
    const saved =
      (typeof window !== "undefined" &&
        (localStorage.getItem(THEME_STORAGE_KEY) as ThemeName | null)) ||
      null;
    const initial: ThemeName =
      saved && ALL_THEMES.includes(saved) ? saved : "classic";
    setThemeState(initial);
    applyThemeClass(initial);
  }, []);

  const setTheme = useCallback((name: ThemeName) => {
    setThemeState(name);
    if (typeof window !== "undefined") {
      localStorage.setItem(THEME_STORAGE_KEY, name);
    }
    applyThemeClass(name);
  }, []);

  const cycleTheme = useCallback(() => {
    const current = theme ?? "classic";
    const idx = ALL_THEMES.indexOf(current);
    const next = ALL_THEMES[(idx + 1) % ALL_THEMES.length];
    if (typeof window !== "undefined") {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    }
    applyThemeClass(next);
    setThemeState(next);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, cycleTheme }),
    [theme, setTheme, cycleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useThemeColor() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeColor must be used within ThemeProvider");
  return ctx;
}
