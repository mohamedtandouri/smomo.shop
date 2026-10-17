"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useLocaleStore, LanguageCode } from "@/store/useLocaleStore"
import {
  Globe,
  Plus,
  CheckCircle2,
  Check,
  Languages,
  ArrowRight,
  Settings2,
} from "lucide-react"

export default function LanguagesManagerPage() {
  const { language, setLanguage } = useLocaleStore()
  const [languages, setLanguages] = useState([
    {
      code: "ar",
      name: "Arabic (العربية)",
      direction: "RTL",
      isDefault: false,
      enabled: true,
      completion: 100,
      flag: "🇸🇦",
    },
    {
      code: "en",
      name: "English (US)",
      direction: "LTR",
      isDefault: true,
      enabled: true,
      completion: 100,
      flag: "🇺🇸",
    },
    {
      code: "fr",
      name: "French (Français)",
      direction: "LTR",
      isDefault: false,
      enabled: true,
      completion: 96,
      flag: "🇫🇷",
    },
    {
      code: "es",
      name: "Spanish (Español)",
      direction: "LTR",
      isDefault: false,
      enabled: false,
      completion: 80,
      flag: "🇪🇸",
    },
  ])

  useEffect(() => {
    setLanguages((prev) =>
      prev.map((l) => ({
        ...l,
        isDefault: l.code === language,
        enabled: l.code === language ? true : l.enabled,
      }))
    )
  }, [language])

  const [notification, setNotification] = useState<string | null>(null)

  const handleSetDefault = (code: string) => {
    if (code === "ar" || code === "en" || code === "fr") {
      setLanguage(code as LanguageCode)
    }
    setLanguages(
      languages.map((l) => ({
        ...l,
        isDefault: l.code === code,
        enabled: l.code === code ? true : l.enabled,
      }))
    )
    setNotification(`Default store language updated!`)
    setTimeout(() => setNotification(null), 3000)
  }

  const handleToggleLanguage = (code: string) => {
    setLanguages(
      languages.map((l) => {
        if (l.code === code && !l.isDefault) {
          return { ...l, enabled: !l.enabled }
        }
        return l
      })
    )
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {notification && (
        <div className="flex items-center justify-between px-4 py-3 rounded-lg border bg-emerald-50 text-emerald-800 border-emerald-200 text-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>{notification}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Globe className="h-6 w-6 text-[#E11D48]" />
            Languages & Localization
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage your multi-language storefront, set the default language, and localize store copy.
          </p>
        </div>
        <Button className="bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs">
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add Language
        </Button>
      </div>

      {/* Languages Table Card */}
      <Card className="rounded-xl border shadow-sm">
        <CardHeader className="p-5 border-b">
          <CardTitle className="text-base font-semibold">Active Store Languages</CardTitle>
          <CardDescription className="text-xs">
            Customers will be able to switch languages via the currency and language selector in the header.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {languages.map((lang) => (
              <div key={lang.code} className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{lang.flag}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm">{lang.name}</span>
                      {lang.isDefault && (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                          Default Language
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs font-mono">
                        {lang.direction}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${lang.completion}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{lang.completion}% translated</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {!lang.isDefault && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSetDefault(lang.code)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Make Default
                    </Button>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{lang.enabled ? "Enabled" : "Disabled"}</span>
                    <Switch
                      checked={lang.enabled}
                      disabled={lang.isDefault}
                      onChange={() => handleToggleLanguage(lang.code)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
