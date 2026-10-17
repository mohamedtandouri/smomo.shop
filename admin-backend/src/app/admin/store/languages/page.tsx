"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useLocaleStore, LanguageCode } from "@/store/useLocaleStore"
import {
  Globe,
  Plus,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"

interface StoreLanguageItem {
  code: string
  name: string
  nativeName?: string
  direction: "RTL" | "LTR"
  isDefault: boolean
  enabled: boolean
  completion: number
  flag: string
}

export default function LanguagesManagerPage() {
  const { setLanguage, t } = useLocaleStore()
  const [languages, setLanguages] = useState<StoreLanguageItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Add Language Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newLangName, setNewLangName] = useState("")
  const [newLangCode, setNewLangCode] = useState("")
  const [newLangDir, setNewLangDir] = useState<"LTR" | "RTL">("LTR")
  const [newLangFlag, setNewLangFlag] = useState("🌐")

  // جلب اللغات المحفوظة من قاعدة البيانات/التخزين الدائم
  const fetchLanguages = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/store/languages", { cache: "no-store" })
      const data = await res.json()
      if (res.ok && data.success && Array.isArray(data.languages)) {
        setLanguages(data.languages)
      } else {
        toast.error(data.error || t("common.error", "Failed to load languages"))
      }
    } catch (err) {
      console.error("Error loading languages:", err)
      toast.error(t("common.error", "Failed to load languages"))
    } finally {
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchLanguages()
  }, [fetchLanguages])

  // تعيين لغة افتراضية للمتجر وحفظها في قاعدة البيانات
  const handleSetDefault = async (code: string) => {
    try {
      setIsSaving(true)
      const res = await fetch("/api/store/languages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, makeDefault: true }),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        if (code === "ar" || code === "en" || code === "fr") {
          setLanguage(code as LanguageCode)
        }
        setLanguages(data.languages)
        toast.success(t("languages_admin.toast_default_updated", "Default store language updated and saved!"))
      } else {
        toast.error(data.error || t("common.error", "Failed to update default language"))
      }
    } catch (err: any) {
      toast.error(err.message || t("common.error", "Failed to update default language"))
    } finally {
      setIsSaving(false)
    }
  }

  // تفعيل أو تعطيل لغة وحفظ التغيير في قاعدة البيانات
  const handleToggleLanguage = async (lang: StoreLanguageItem) => {
    if (lang.isDefault) return
    const nextEnabled = !lang.enabled

    try {
      setIsSaving(true)
      const res = await fetch("/api/store/languages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: lang.code, enabled: nextEnabled }),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setLanguages(data.languages)
        toast.success(t("languages_admin.toast_status_updated", "Language status updated and saved!"))
      } else {
        toast.error(data.error || t("common.error", "Failed to update language status"))
      }
    } catch (err: any) {
      toast.error(err.message || t("common.error", "Failed to update language status"))
    } finally {
      setIsSaving(false)
    }
  }

  // إضافة لغة جديدة
  const handleAddLanguage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLangName.trim() || !newLangCode.trim()) return

    try {
      setIsSaving(true)
      const res = await fetch("/api/store/languages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newLangName.trim(),
          code: newLangCode.trim().toLowerCase(),
          direction: newLangDir,
          flag: newLangFlag.trim() || "🌐",
          completion: 100,
        }),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setLanguages(data.languages)
        setIsAddModalOpen(false)
        setNewLangName("")
        setNewLangCode("")
        toast.success(t("languages_admin.toast_added", "New language added successfully!"))
      } else {
        toast.error(data.error || t("common.error", "Failed to add language"))
      }
    } catch (err: any) {
      toast.error(err.message || t("common.error", "Failed to add language"))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Globe className="h-6 w-6 text-[#E11D48]" />
            <span>{t("languages_admin.title", "Languages & Localization")}</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t(
              "languages_admin.subtitle",
              "Manage your multi-language storefront, set the default language, and localize store copy."
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchLanguages()}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span>{t("menus_admin.refresh", "Refresh")}</span>
          </Button>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{t("languages_admin.add_btn", "Add Language")}</span>
          </Button>
        </div>
      </div>

      {/* Languages Table Card */}
      <Card className="rounded-xl border shadow-sm">
        <CardHeader className="p-5 border-b">
          <CardTitle className="text-base font-semibold">
            {t("languages_admin.active_title", "Active Store Languages")}
          </CardTitle>
          <CardDescription className="text-xs">
            {t(
              "languages_admin.active_subtitle",
              "Customers will be able to switch languages via the currency and language selector in the header."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-10 flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm">{t("common.loading", "Loading...")}</span>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {languages.map((lang) => (
                <div
                  key={lang.code}
                  className="p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{lang.flag}</span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-foreground text-sm">{lang.name}</span>
                        {lang.isDefault && (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                            {t("languages_admin.default_badge", "Default Language")}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs font-mono">
                          {lang.direction}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${lang.completion}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {t("languages_admin.translated", "translated")} {lang.completion}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {!lang.isDefault && (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isSaving}
                        onClick={() => handleSetDefault(lang.code)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        {t("languages_admin.make_default", "Make Default")}
                      </Button>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {lang.enabled
                          ? t("languages_admin.enabled", "Enabled")
                          : t("languages_admin.disabled", "Disabled")}
                      </span>
                      <Switch
                        checked={lang.enabled}
                        disabled={lang.isDefault || isSaving}
                        onChange={() => handleToggleLanguage(lang)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Language Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("languages_admin.modal_title", "Add Store Language")}</DialogTitle>
            <DialogDescription>
              {t("languages_admin.modal_desc", "Add a new language for your storefront visitors.")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddLanguage} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-foreground">
                {t("languages_admin.lang_name", "Language Name")} *
              </label>
              <Input
                required
                placeholder="e.g. German (Deutsch)"
                value={newLangName}
                onChange={(e) => setNewLangName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">
                  {t("languages_admin.lang_code", "Language Code (ISO)")} *
                </label>
                <Input
                  required
                  dir="ltr"
                  placeholder="e.g. de"
                  maxLength={5}
                  value={newLangCode}
                  onChange={(e) => setNewLangCode(e.target.value)}
                  className="mt-1 font-mono text-xs text-left"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">Flag Emoji</label>
                <Input
                  value={newLangFlag}
                  onChange={(e) => setNewLangFlag(e.target.value)}
                  placeholder="🇩🇪"
                  className="mt-1 text-center"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground">
                {t("languages_admin.lang_dir", "Text Direction")}
              </label>
              <select
                value={newLangDir}
                onChange={(e) => setNewLangDir(e.target.value as "LTR" | "RTL")}
                className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
              >
                <option value="LTR">LTR (Left to Right)</option>
                <option value="RTL">RTL (Right to Left)</option>
              </select>
            </div>
            <DialogFooter className="pt-2 gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                {t("common.cancel", "Cancel")}
              </Button>
              <Button type="submit" disabled={isSaving} className="gap-2 bg-[#E11D48] hover:bg-[#BE123C] text-white">
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>{t("languages_admin.add_btn", "Add Language")}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
