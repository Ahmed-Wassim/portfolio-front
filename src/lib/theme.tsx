"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

type Theme = "light" | "dark"

const STORAGE_KEY = "portfolio.theme"

interface ThemeContextValue {
  theme: Theme
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function resolveInitialTheme(): Theme {
  // Reads the data-theme the no-FOUC script already set on <html>.
  // Falls back to system preference, then light.
  if (typeof document === "undefined") return "light"
  const attr = document.documentElement.getAttribute("data-theme")
  if (attr === "dark" || attr === "light") return attr
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark"
  return "light"
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Seeded during the first render, not in an effect. The server always
  // renders "light" while the no-FOUC script may have already flipped <html>
  // to dark, so the first client render must read the DOM to avoid a mismatch;
  // after that the state is authoritative and the toggle drives it.
  const [theme, setTheme] = useState<Theme>(resolveInitialTheme)

  const toggle = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
  }, [])

  // Single place that applies theme to DOM + storage.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // localStorage blocked — in-session only, still works
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>")
  return ctx
}
