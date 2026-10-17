"use client"

import { useState, useEffect } from "react"
import { Coins, Check } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCurrencyStore, SUPPORTED_CURRENCIES, CurrencyCode } from "@/store/useCurrencyStore"

export function CurrencySelector({ variant = "default" }: { variant?: "default" | "compact" }) {
  const { currency, setCurrency } = useCurrencyStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentCurrency = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.USD

  if (!mounted) {
    return (
      <div className="h-8 w-8 rounded-md flex items-center justify-center opacity-70">
        <Coins className="h-4 w-4 text-muted-foreground" />
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors bg-muted/40 hover:bg-muted/80 border border-border/50 text-foreground cursor-pointer font-mono shadow-2xs"
        title="Change Currency"
      >
        <span>{currentCurrency.flag}</span>
        <span className="font-semibold text-primary">{currentCurrency.code}</span>
        <span>({currentCurrency.symbol})</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 z-50">
        {(Object.keys(SUPPORTED_CURRENCIES) as CurrencyCode[]).map((code) => {
          const config = SUPPORTED_CURRENCIES[code]
          const isSelected = currency === code
          return (
            <DropdownMenuItem
              key={code}
              onClick={() => setCurrency(code)}
              className="flex items-center justify-between cursor-pointer text-xs py-2"
            >
              <div className="flex items-center gap-2">
                <span>{config.flag}</span>
                <span className={isSelected ? "font-semibold text-primary" : ""}>
                  {config.name}
                </span>
                <span className="text-muted-foreground font-mono">({config.symbol})</span>
              </div>
              {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
