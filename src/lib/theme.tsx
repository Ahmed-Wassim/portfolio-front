"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react"

type Theme = "light" | "dark"

const STORAGE_KEY = "portfolio.theme"

interface ThemeContextValue {
  theme: Theme
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

/**
 * The DOM is the source of truth. The no-FOUC script in the root layout writes
 * `data-theme` on <html> before first paint, so reading it here reflects the
 * user's stored choice even on a cold load.
 */
function readTheme(): Theme {
  if (typeof document === "undefined") return "light"
  const attr = document.documentElement.getAttribute("data-theme")
  return attr === "dark" ? "dark" : "light"
}

/** The server has no DOM and no localStorage. */
function getServerTheme(): Theme {
  return "light"
}

const listeners = new Set<() => void>()

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  return () => listeners.delete(onChange)
}

function writeTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme)
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // localStorage blocked — in-session only, still works
  }
  for (const listener of listeners) listener()
}

/**
 * useSyncExternalStore rather than useState + useEffect.
 *
 * Reading the DOM during render makes the client's first render disagree with
 * the server's ("light"), which is a hydration mismatch — and the header renders
 * a different icon per theme, so the mismatch is visible. This hook tells React
 * to use the server snapshot for the hydration render and swap to the real value
 * straight after, with no setState-in-effect cascade.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, readTheme, getServerTheme)

  const toggle = useCallback(() => {
    writeTheme(readTheme() === "light" ? "dark" : "light")
  }, [])

  const value = useMemo(() => ({ theme, toggle }), [theme, toggle])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>")
  return ctx
}
