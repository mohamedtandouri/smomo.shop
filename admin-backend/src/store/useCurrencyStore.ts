import { create } from "zustand"
import { persist } from "zustand/middleware"

export type CurrencyCode = "USD" | "EUR" | "MAD" | "SAR" | "GBP"

export interface CurrencyConfig {
  code: CurrencyCode
  symbol: string
  name: string
  rate: number // Rate relative to 1 USD
  symbolPosition: "before" | "after"
  flag: string
}

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    rate: 1.0,
    symbolPosition: "before",
    flag: "🇺🇸",
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    rate: 0.92,
    symbolPosition: "after",
    flag: "🇪🇺",
  },
  MAD: {
    code: "MAD",
    symbol: "د.م.",
    name: "Moroccan Dirham",
    rate: 10.0,
    symbolPosition: "after",
    flag: "🇲🇦",
  },
  SAR: {
    code: "SAR",
    symbol: "ر.س",
    name: "Saudi Riyal",
    rate: 3.75,
    symbolPosition: "after",
    flag: "🇸🇦",
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    rate: 0.79,
    symbolPosition: "before",
    flag: "🇬🇧",
  },
}

interface CurrencyState {
  currency: CurrencyCode
  setCurrency: (currency: CurrencyCode) => void
  convertPrice: (amountInUSD: number, targetCurrency?: CurrencyCode) => number
  formatPrice: (amountInUSD: number, targetCurrency?: CurrencyCode) => string
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: "USD",
      setCurrency: (currency: CurrencyCode) => set({ currency }),
      convertPrice: (amountInUSD: number, targetCurrency?: CurrencyCode) => {
        const active = targetCurrency || get().currency || "USD"
        const config = SUPPORTED_CURRENCIES[active] || SUPPORTED_CURRENCIES.USD
        return amountInUSD * config.rate
      },
      formatPrice: (amountInUSD: number, targetCurrency?: CurrencyCode) => {
        const active = targetCurrency || get().currency || "USD"
        const config = SUPPORTED_CURRENCIES[active] || SUPPORTED_CURRENCIES.USD
        const converted = amountInUSD * config.rate

        const formattedNumber = converted.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })

        if (config.symbolPosition === "before") {
          return `${config.symbol}${formattedNumber}`
        }
        return `${formattedNumber} ${config.symbol}`
      },
    }),
    {
      name: "smomo-currency-storage",
    }
  )
)
