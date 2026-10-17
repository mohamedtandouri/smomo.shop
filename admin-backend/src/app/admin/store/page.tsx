"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLocaleStore } from "@/store/useLocaleStore"
import {
  Store,
  Palette,
  LayoutTemplate,
  Menu,
  Globe,
  FileText,
  Filter,
  ExternalLink,
  ArrowRight,
  Eye,
  Smartphone,
  Laptop,
  Sparkles,
} from "lucide-react"

export default function StoreOverviewPage() {
  const { t, direction } = useLocaleStore()
  const isRtl = direction === "rtl"

  const storeModules = [
    {
      id: "hero",
      title: t("store_admin.card.hero.title", "Hero Section"),
      description: t(
        "store_admin.card.hero.desc",
        "Manage your storefront main hero banner, headline, CTA buttons, colors, and optimized WebP imagery with live preview."
      ),
      manageLabel: t("store_admin.card.hero.manage", "Manage Hero Section"),
      href: "/admin/store/hero",
      icon: Sparkles,
      badge: t("store_admin.card.hero.badge", "Live Preview"),
      color: "text-[#e91e63] bg-pink-50 border-pink-100 dark:bg-pink-950/40 dark:border-pink-900",
    },
    {
      id: "theme",
      title: t("store_admin.card.theme.title", "Theme"),
      description: t(
        "store_admin.card.theme.desc",
        "Customize your active theme layout, header, footer, product page, and checkout styles."
      ),
      manageLabel: t("store_admin.card.theme.manage", "Manage Theme"),
      href: "/admin/store/theme",
      icon: Palette,
      badge: t("store_admin.card.theme.badge", "Customizer"),
      color: "text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-950/40 dark:border-rose-900",
    },
    {
      id: "themes",
      title: t("store_admin.card.themes.title", "Themes"),
      description: t(
        "store_admin.card.themes.desc",
        "Browse, activate, and manage your theme library. Switch between modern pre-built styles."
      ),
      manageLabel: t("store_admin.card.themes.manage", "Manage Themes"),
      href: "/admin/store/themes",
      icon: LayoutTemplate,
      badge: t("store_admin.card.themes.badge", "Library"),
      color: "text-purple-600 bg-purple-50 border-purple-100 dark:bg-purple-950/40 dark:border-purple-900",
    },
    {
      id: "menus",
      title: t("store_admin.card.menus.title", "Menus"),
      description: t(
        "store_admin.card.menus.desc",
        "Build and organize store navigation headers, mobile menus, and footer link sections."
      ),
      manageLabel: t("store_admin.card.menus.manage", "Manage Menus"),
      href: "/admin/store/menus",
      icon: Menu,
      badge: t("store_admin.card.menus.badge", "Navigation"),
      color: "text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-950/40 dark:border-blue-900",
    },
    {
      id: "languages",
      title: t("store_admin.card.languages.title", "Languages"),
      description: t(
        "store_admin.card.languages.desc",
        "Manage multi-language support (Arabic, English, French) and custom store translations."
      ),
      manageLabel: t("store_admin.card.languages.manage", "Manage Languages"),
      href: "/admin/store/languages",
      icon: Globe,
      badge: t("store_admin.card.languages.badge", "Localization"),
      color: "text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-900",
    },
    {
      id: "pages",
      title: t("store_admin.card.pages.title", "Pages"),
      description: t(
        "store_admin.card.pages.desc",
        "Create and publish static content pages: About Us, Privacy Policy, Terms, and FAQs."
      ),
      manageLabel: t("store_admin.card.pages.manage", "Manage Pages"),
      href: "/admin/store/pages",
      icon: FileText,
      badge: t("store_admin.card.pages.badge", "CMS"),
      color: "text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-950/40 dark:border-amber-900",
    },
    {
      id: "funnels",
      title: t("store_admin.card.funnels.title", "Funnels"),
      description: t(
        "store_admin.card.funnels.desc",
        "Set up high-converting sales funnels, one-product landing pages, and upsell steps."
      ),
      manageLabel: t("store_admin.card.funnels.manage", "Manage Funnels"),
      href: "/admin/store/funnels",
      icon: Filter,
      badge: t("store_admin.card.funnels.badge", "Growth"),
      color: "text-indigo-600 bg-indigo-50 border-indigo-100 dark:bg-indigo-950/40 dark:border-indigo-900",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <Store className="h-6 w-6 text-[#E11D48]" />
            <span>{t("store_admin.title", "Online Store")}</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t(
              "store_admin.subtitle",
              "Manage your storefront appearance, navigation, localization, and conversion funnels."
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="http://localhost:3001/store" target="_blank">
            <Button variant="outline" className="border-gray-200 gap-2">
              <ExternalLink className="h-4 w-4" />
              <span>{t("store_admin.view_live_store", "View Live Store")}</span>
            </Button>
          </Link>
          <Link href="/admin/store/theme">
            <Button className="bg-[#E11D48] hover:bg-[#BE123C] text-white gap-2">
              <Palette className="h-4 w-4" />
              <span>{t("store_admin.customize_theme", "Customize Theme")}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Live Store Status Hero Card */}
      <Card className="border shadow-sm rounded-xl overflow-hidden bg-gradient-to-r from-white via-rose-50/20 to-pink-50/30 dark:from-card dark:via-card dark:to-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                  {t("store_admin.status_live", "Store Status: Published & Live")}
                </Badge>
                <Badge variant="outline" className="bg-rose-50 text-[#E11D48] border-rose-200 text-xs">
                  {t("store_admin.theme_default", "Theme: Default Modern")}
                </Badge>
              </div>
              <h2 className="text-xl font-bold text-foreground">
                {t("store_admin.hero_title", "Smomo Premium E-Commerce Store")}
              </h2>
              <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
                {t(
                  "store_admin.hero_desc",
                  "Your storefront is optimized with high-speed caching, RTL/LTR support, responsive checkout, and dynamic inventory sync."
                )}
              </p>
            </div>

            <div className="flex items-center gap-3 bg-background p-3 rounded-lg border shadow-xs">
              <div className="flex gap-1.5 border-e pe-3">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  title={t("store_admin.desktop_preview", "Desktop Preview")}
                >
                  <Laptop className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-muted-foreground"
                  title={t("store_admin.mobile_preview", "Mobile Preview")}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
              <Link href="http://localhost:3001/store" target="_blank">
                <Button size="sm" className="bg-[#E11D48] hover:bg-[#BE123C] text-white h-8 text-xs gap-1.5">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{t("store_admin.preview_store", "Preview Store")}</span>
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid of Store Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {storeModules.map((module) => {
          const Icon = module.icon
          return (
            <Link key={module.id} href={module.href} className="group">
              <Card className="h-full border hover:border-rose-300 hover:shadow-md transition-all rounded-xl cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-lg border ${module.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {module.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-semibold group-hover:text-[#E11D48] transition-colors pt-3">
                    {module.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-xs leading-relaxed">
                    {module.description}
                  </CardDescription>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#E11D48]">
                    <span>{module.manageLabel}</span>
                    <ArrowRight className={`h-3.5 w-3.5 transition-transform ${isRtl ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
