/* eslint-disable react-refresh/only-export-components */
/**
 * Nile Flow — Theme System
 *
 * Architecture:
 *   - Themes are applied as data-theme="light|dark" on <html>.
 *   - CSS variables (--nf-*) defined in index.css do the actual painting.
 *   - React does NOT paint anything — it only flips the attribute.
 *   - This means theme switching causes ZERO React re-renders in consumers
 *     because nothing in the JS tree changes, only the DOM attribute.
 *
 * Persistence & FOUC prevention:
 *   - An inline <script> in index.html reads localStorage and sets the
 *     attribute synchronously before React hydrates (see index.html).
 *   - This file is the runtime layer that exposes useTheme() to components.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

export const THEMES = /** @type {const} */ ({
  LIGHT: "light",
  DARK: "dark",
});

const STORAGE_KEY = "nf_theme";
const HTML_ATTR = "data-theme";

/** Read preference: localStorage → system → default light */
const resolveInitialTheme = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === THEMES.LIGHT || stored === THEMES.DARK) return stored;
  } catch {
    /* localStorage blocked (private browsing etc.) */
  }
  const prefersDark =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? THEMES.DARK : THEMES.LIGHT;
};

/** Imperatively set the attribute on <html> — no React paint involved */
const applyThemeToDOM = (theme) => {
  document.documentElement.setAttribute(HTML_ATTR, theme);
};

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  // Initialise from the resolved value immediately — never null/loading
  const [theme, setTheme] = useState(() => resolveInitialTheme());

  // Sync DOM attribute on mount (in case the inline script wasn't present)
  // and whenever the theme changes.
  useEffect(() => {
    applyThemeToDOM(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore write failures */
    }
  }, [theme]);

  // Listen for system preference changes while the app is open
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = (e) => {
      // Only follow system if the user has not set an explicit preference
      try {
        if (!localStorage.getItem(STORAGE_KEY)) {
          setTheme(e.matches ? THEMES.DARK : THEMES.LIGHT);
        }
      } catch {
        setTheme(e.matches ? THEMES.DARK : THEMES.LIGHT);
      }
    };
    mq.addEventListener("change", handleSystemChange);
    return () => mq.removeEventListener("change", handleSystemChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT));
  }, []);

  const setExplicitTheme = useCallback((newTheme) => {
    if (newTheme === THEMES.LIGHT || newTheme === THEMES.DARK) {
      setTheme(newTheme);
    }
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === THEMES.DARK,
      isLight: theme === THEMES.LIGHT,
      toggleTheme,
      setTheme: setExplicitTheme,
    }),
    [theme, toggleTheme, setExplicitTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

/**
 * useTheme — consume the theme in any component.
 *
 * Returns:
 *   theme       — "light" | "dark"
 *   isDark      — boolean
 *   isLight     — boolean
 *   toggleTheme — () => void
 *   setTheme    — (theme: "light"|"dark") => void
 */
export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
};

export default ThemeProvider;
