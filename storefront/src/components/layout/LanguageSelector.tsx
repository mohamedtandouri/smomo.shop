"use client"

import { useState, useEffect } from "react"
import { Globe, Check } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLocaleStore, SUPPORTED_LANGUAGES, LanguageCode } from "@/store/useLocaleStore"

export function LanguageSelector({ variant = "default" }: { variant?: "default" | "compact" }) {
  const { language, setLanguage } = useLocaleStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0]

  if (!mounted) {
    return (
      <div className="h-8 w-8 rounded-md flex items-center justify-center opacity-70">
        <Globe className="h-4 w-4 text-muted-foreground" />
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors bg-muted/40 hover:bg-muted/80 border border-border/50 text-foreground cursor-pointer shadow-2xs"
        title="Change Language"
      >
        <span className="text-sm">{currentLang.flag}</span>
        {variant !== "compact" && <span>{currentLang.nativeName}</span>}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 z-50">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className="flex items-center justify-between cursor-pointer text-xs py-2"
          >
            <div className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span className={language === lang.code ? "font-semibold text-primary" : ""}>
                {lang.nativeName}
              </span>
            </div>
            {language === lang.code && <Check className="h-3.5 w-3.5 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
