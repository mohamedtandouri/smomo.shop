"use client"

import { useEffect, useState } from "react"
import { useLocaleStore, SUPPORTED_LANGUAGES } from "@/store/useLocaleStore"

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const { language, direction } = useLocaleStore()

  useEffect(() => {
    // Rehydrate persisted locale from localStorage after initial render/hydration
    useLocaleStore.persist.rehydrate()
  }, [])

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language
      document.documentElement.dir = direction
    }
  }, [language, direction])

  return <>{children}</>
}
