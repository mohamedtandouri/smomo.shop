"use client"

import * as React from "react"

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode
  [key: string]: any
}) {
  return <>{children}</>
}

export function useTheme() {
  return {
    theme: "light",
    resolvedTheme: "light",
    setTheme: () => {},
    themes: ["light"],
    systemTheme: "light" as const,
  }
}
