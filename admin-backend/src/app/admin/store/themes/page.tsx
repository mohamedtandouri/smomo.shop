"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLocaleStore } from "@/store/useLocaleStore"
import {
  LayoutTemplate,
  Palette,
  Eye,
  CheckCircle2,
  Upload,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

export default function ThemesLibraryPage() {
  const { t } = useLocaleStore()
  const [activeThemeId, setActiveThemeId] = useState("theme-1")
  const [isSaving, setIsSaving] = useState(false)

  // جلب القالب النشط من قاعدة البيانات/التخزين الدائم عند التحميل
  useEffect(() => {
    fetch("/api/store/theme", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.config?.activeThemeId) {
          setActiveThemeId(data.config.activeThemeId)
        }
      })
      .catch((err) => console.error("Error fetching active theme:", err))
  }, [])

  const themes = [
    {
      id: "theme-1",
      name: t("themes_admin.theme1.name", "Smomo Modern (Default)"),
      version: "v2.4.0",
      description: t(
        "themes_admin.theme1.desc",
        "Clean, conversion-optimized responsive theme with fast checkout and dynamic sliders."
      ),
      previewImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=60",
      tag: t("themes_admin.theme1.tag", "Active Theme"),
      author: "Smomo Design Lab",
      primaryColor: "#ff2d55",
    },
    {
      id: "theme-2",
      name: t("themes_admin.theme2.name", "Minimalist Boutique"),
      version: "v1.8.2",
      description: t(
        "themes_admin.theme2.desc",
        "Focus on photography and sleek typography for high-end fashion and lifestyle brands."
      ),
      previewImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=60",
      tag: t("themes_admin.theme2.tag", "Popular"),
      author: "Smomo Studio",
      primaryColor: "#0f172a",
    },
    {
      id: "theme-3",
      name: t("themes_admin.theme3.name", "Dark Tech & Gadgets"),
      version: "v2.1.0",
      description: t(
        "themes_admin.theme3.desc",
        "Dark-mode aesthetic tailored for electronic accessories, smart tech, and gear stores."
      ),
      previewImage: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&auto=format&fit=crop&q=60",
      tag: t("themes_admin.theme3.tag", "Trending"),
      author: "Smomo Studio",
      primaryColor: "#4f46e5",
    },
    {
      id: "theme-4",
      name: t("themes_admin.theme4.name", "Bold Retailer"),
      version: "v1.5.0",
      description: t(
        "themes_admin.theme4.desc",
        "High volume catalog layout with multi-level mega menus and quick buy drawers."
      ),
      previewImage: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&auto=format&fit=crop&q=60",
      tag: t("themes_admin.theme4.tag", "Multi-Product"),
      author: "Smomo Studio",
      primaryColor: "#059669",
    },
  ]

  const handleActivate = async (theme: typeof themes[0]) => {
    setActiveThemeId(theme.id)
    setIsSaving(true)
    try {
      const [themeRes, settingsRes] = await Promise.all([
        fetch("/api/store/theme", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            config: {
              activeThemeId: theme.id,
              themeSettings: {
                primaryColor: theme.primaryColor,
                fontFamily: "Lato",
                siteTitle: "Smomo Store",
                faviconUrl: "",
                enableRTL: true,
              },
            },
          }),
        }),
        fetch("/api/store/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            primaryColor: theme.primaryColor,
          }),
        }),
      ])

      const data = await themeRes.json()
      if (themeRes.ok && data.success && settingsRes.ok) {
        toast.success(`${t("themes_admin.toast_activated", "Theme activated and saved!")} (${theme.name})`)
      } else {
        toast.error(data.error || t("common.error", "Failed to save theme"))
      }
    } catch (err: any) {
      toast.error(err.message || t("common.error", "Failed to save theme"))
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
            <LayoutTemplate className="h-6 w-6 text-[#E11D48]" />
            <span>{t("themes_admin.title", "Themes Library")}</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t(
              "themes_admin.subtitle",
              "Manage your store templates. Customize your active layout or switch between styles."
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-gray-200 text-xs gap-1.5">
            <Upload className="h-3.5 w-3.5" />
            <span>{t("themes_admin.upload_zip", "Upload Theme (ZIP)")}</span>
          </Button>
          <Link href="/admin/store/theme">
            <Button className="bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs gap-1.5">
              <Palette className="h-3.5 w-3.5" />
              <span>{t("themes_admin.customize_active", "Customize Active Theme")}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Active Theme Highlight Hero Card */}
      {themes
        .filter((item) => item.id === activeThemeId)
        .map((active) => (
          <Card key={active.id} className="border-2 border-rose-200 rounded-xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
              <div className="md:col-span-5 rounded-lg overflow-hidden aspect-video border shadow-xs bg-gray-100">
                <img
                  src={active.previewImage}
                  alt={active.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{t("themes_admin.currently_active", "Currently Active")}</span>
                    </Badge>
                    <span dir="ltr" className="text-xs text-muted-foreground font-mono">
                      {active.version}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-foreground">{active.name}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {active.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("themes_admin.author", "Author:")} {active.author}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link href="/admin/store/theme">
                    <Button className="bg-[#E11D48] hover:bg-[#BE123C] text-white gap-2">
                      <Palette className="h-4 w-4" />
                      <span>{t("themes_admin.customize_btn", "Customize Theme")}</span>
                    </Button>
                  </Link>
                  <Link href="http://localhost:3001/store" target="_blank">
                    <Button variant="outline" className="gap-2">
                      <Eye className="h-4 w-4" />
                      <span>{t("themes_admin.live_preview", "Live Preview")}</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        ))}

      {/* Available Themes Section */}
      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-semibold text-foreground">
          {t("themes_admin.explore", "Explore Available Themes")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {themes
            .filter((item) => item.id !== activeThemeId)
            .map((theme) => (
              <Card key={theme.id} className="rounded-xl border overflow-hidden hover:shadow-md transition-all">
                <div className="aspect-video bg-gray-100 overflow-hidden relative group">
                  <img
                    src={theme.previewImage}
                    alt={theme.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 end-2">
                    <Badge variant="secondary" className="text-xs">
                      {theme.tag}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base font-semibold">{theme.name}</CardTitle>
                    <span dir="ltr" className="text-xs text-muted-foreground font-mono">
                      {theme.version}
                    </span>
                  </div>
                  <CardDescription className="text-xs line-clamp-2 pt-1">
                    {theme.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-2 flex items-center justify-between border-t border-border mt-2">
                  <span className="text-xs text-muted-foreground">{theme.author}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isSaving}
                      onClick={() => handleActivate(theme)}
                      className="h-8 text-xs hover:text-[#E11D48] gap-1.5"
                    >
                      {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      <span>{t("themes_admin.activate", "Activate")}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  )
}
