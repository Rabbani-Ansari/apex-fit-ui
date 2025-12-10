import { createContext, useContext, useEffect, useState, memo, useCallback, ReactNode } from "react";

export type ThemeMode = "light" | "dark" | "system";

export interface AccentColor {
  name: string;
  hue: number;
  saturation: number;
  lightness: number;
}

export const ACCENT_COLORS: AccentColor[] = [
  { name: "Orange", hue: 24, saturation: 100, lightness: 50 },
  { name: "Blue", hue: 220, saturation: 90, lightness: 55 },
  { name: "Green", hue: 142, saturation: 76, lightness: 46 },
  { name: "Purple", hue: 280, saturation: 100, lightness: 60 },
  { name: "Pink", hue: 330, saturation: 100, lightness: 60 },
  { name: "Teal", hue: 180, saturation: 70, lightness: 45 },
  { name: "Red", hue: 0, saturation: 84, lightness: 60 },
  { name: "Yellow", hue: 45, saturation: 100, lightness: 50 },
];

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  effectiveTheme: "light" | "dark";
  isTransitioning: boolean;
  isSyncedToCloud: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "fitness-theme-mode";
const ACCENT_STORAGE_KEY = "fitness-accent-color";

function getSystemTheme(): "light" | "dark" {
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "dark";
}

// Internal context for sharing state setters with the sync hook
interface ThemeInternalContextType {
  setThemeModeState: (mode: ThemeMode) => void;
  setAccentColorState: (color: AccentColor) => void;
  applyTheme: (theme: "light" | "dark", accent: AccentColor) => void;
}

export const ThemeInternalContext = createContext<ThemeInternalContextType | undefined>(undefined);

export const ThemeProvider = memo(({ children }: { children: ReactNode }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "light" || stored === "dark" || stored === "system") {
        return stored;
      }
    }
    return "light";
  });

  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(ACCENT_STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // ignore
        }
      }
    }
    return ACCENT_COLORS[2]; // Green default
  });

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSyncedToCloud, setIsSyncedToCloud] = useState(false);

  const effectiveTheme = themeMode === "system" ? getSystemTheme() : themeMode;

  const applyTheme = useCallback((theme: "light" | "dark", accent: AccentColor) => {
    const root = document.documentElement;

    // Add transition class for smooth theme change
    root.style.setProperty("--theme-transition", "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease");

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Apply accent color
    const lightVariant = theme === "dark" ? accent.lightness + 5 : accent.lightness;
    root.style.setProperty("--primary", `${accent.hue} ${accent.saturation}% ${lightVariant}%`);
    root.style.setProperty("--ring", `${accent.hue} ${accent.saturation}% ${lightVariant}%`);
    root.style.setProperty("--fitness-orange", `${accent.hue} ${accent.saturation}% ${lightVariant}%`);

    // Update status bar color for mobile
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", theme === "dark" ? "#0a0a0f" : "#ffffff");
    }
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setIsTransitioning(true);
    setThemeModeState(mode);
    localStorage.setItem(THEME_STORAGE_KEY, mode);

    const newEffectiveTheme = mode === "system" ? getSystemTheme() : mode;
    applyTheme(newEffectiveTheme, accentColor);

    setTimeout(() => setIsTransitioning(false), 300);
  }, [accentColor, applyTheme]);

  const setAccentColor = useCallback((color: AccentColor) => {
    setIsTransitioning(true);
    setAccentColorState(color);
    localStorage.setItem(ACCENT_STORAGE_KEY, JSON.stringify(color));
    applyTheme(effectiveTheme, color);

    setTimeout(() => setIsTransitioning(false), 300);
  }, [effectiveTheme, applyTheme]);

  // Apply theme on mount
  useEffect(() => {
    applyTheme(effectiveTheme, accentColor);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (themeMode !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      applyTheme(getSystemTheme(), accentColor);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [themeMode, accentColor, applyTheme]);

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        setThemeMode,
        accentColor,
        setAccentColor,
        effectiveTheme,
        isTransitioning,
        isSyncedToCloud,
      }}
    >
      <ThemeInternalContext.Provider
        value={{
          setThemeModeState,
          setAccentColorState,
          applyTheme,
        }}
      >
        {children}
      </ThemeInternalContext.Provider>
    </ThemeContext.Provider>
  );
});

ThemeProvider.displayName = "ThemeProvider";

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function useThemeInternal() {
  const context = useContext(ThemeInternalContext);
  if (!context) {
    throw new Error("useThemeInternal must be used within a ThemeProvider");
  }
  return context;
}
