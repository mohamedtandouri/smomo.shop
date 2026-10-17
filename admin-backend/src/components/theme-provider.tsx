"use client"

import * as React from "react"

export type Theme = "dark" | "light" | "system"

export interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  attribute?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: "dark" | "light"
  themes: Theme[]
  systemTheme?: "dark" | "light"
}

const ThemeContext = React.createContext<ThemeContextType>({
  theme: "system",
  setTheme: () => {},
  resolvedTheme: "light",
  themes: ["light", "dark", "system"],
})

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  enableSystem = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = React.useState<"dark" | "light">("light")

  React.useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(storageKey) as Theme | null
      if (savedTheme) {
        setThemeState(savedTheme)
      }
    } catch {
      // ignore
    }
  }, [storageKey])

  const applyTheme = React.useCallback(
    (t: Theme) => {
      if (typeof window === "undefined") return
      const root = document.documentElement
      let resolved: "dark" | "light" = "light"

      if (t === "system" && enableSystem) {
        resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      } else if (t === "dark") {
        resolved = "dark"
      } else {
        resolved = "light"
      }

      setResolvedTheme(resolved)
      if (resolved === "dark") {
        root.classList.add("dark")
      } else {
        root.classList.remove("dark")
      }
    },
    [enableSystem]
  )

  React.useEffect(() => {
    applyTheme(theme)

    if (theme === "system" && enableSystem) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = () => applyTheme("system")
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    }
  }, [theme, enableSystem, applyTheme])

  const setTheme = React.useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme)
      try {
        localStorage.setItem(storageKey, newTheme)
      } catch {
        // ignore
      }
    },
    [storageKey]
  )

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        resolvedTheme,
        themes: ["light", "dark", "system"],
        systemTheme: resolvedTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => React.useContext(ThemeContext)
