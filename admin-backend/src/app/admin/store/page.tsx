"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  CheckCircle2,
  Sparkles,
  Smartphone,
  Laptop,
} from "lucide-react"

export default function StoreOverviewPage() {
  const storeModules = [
    {
      title: "Theme",
      description: "Customize your active theme layout, header, footer, product page, and checkout styles.",
      href: "/admin/store/theme",
      icon: Palette,
      badge: "Customizer",
      color: "text-rose-600 bg-rose-50 border-rose-100",
    },
    {
      title: "Themes",
      description: "Browse, activate, and manage your theme library. Switch between modern pre-built styles.",
      href: "/admin/store/themes",
      icon: LayoutTemplate,
      badge: "Library",
      color: "text-purple-600 bg-purple-50 border-purple-100",
    },
    {
      title: "Menus",
      description: "Build and organize store navigation headers, mobile menus, and footer link sections.",
      href: "/admin/store/menus",
      icon: Menu,
      badge: "Navigation",
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      title: "Languages",
      description: "Manage multi-language support (Arabic, English, French) and custom store translations.",
      href: "/admin/store/languages",
      icon: Globe,
      badge: "Localization",
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      title: "Pages",
      description: "Create and publish static content pages: About Us, Privacy Policy, Terms, and FAQs.",
      href: "/admin/store/pages",
      icon: FileText,
      badge: "CMS",
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      title: "Funnels",
      description: "Set up high-converting sales funnels, one-product landing pages, and upsell steps.",
      href: "/admin/store/funnels",
      icon: Filter,
      badge: "Growth",
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <Store className="h-6 w-6 text-[#E11D48]" />
            Online Store
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage your storefront appearance, navigation, localization, and conversion funnels.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/store/products" target="_blank">
            <Button variant="outline" className="border-gray-200">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Live Store
            </Button>
          </Link>
          <Link href="/admin/store/theme">
            <Button className="bg-[#E11D48] hover:bg-[#BE123C] text-white">
              <Palette className="h-4 w-4 mr-2" />
              Customize Theme
            </Button>
          </Link>
        </div>
      </div>

      {/* Live Store Status Hero Card */}
      <Card className="border shadow-sm rounded-xl overflow-hidden bg-gradient-to-r from-white via-rose-50/20 to-pink-50/30">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                  Store Status: Published & Live
                </Badge>
                <Badge variant="outline" className="bg-rose-50 text-[#E11D48] border-rose-200 text-xs font-mono">
                  Theme: Default Modern
                </Badge>
              </div>
              <h2 className="text-xl font-bold text-foreground">Smomo Premium E-Commerce Store</h2>
              <p className="text-sm text-muted-foreground max-w-xl">
                Your storefront is optimized with high-speed caching, RTL/LTR support, responsive checkout, and dynamic inventory sync.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white p-3 rounded-lg border shadow-xs">
              <div className="flex gap-1.5 border-r pr-3">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Desktop Preview">
                  <Laptop className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground" title="Mobile Preview">
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
              <Link href="/store/products" target="_blank">
                <Button size="sm" className="bg-[#E11D48] hover:bg-[#BE123C] text-white h-8 text-xs">
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  Preview Store
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
            <Link key={module.title} href={module.href} className="group">
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
                  <div className="flex items-center text-xs font-semibold text-[#E11D48] group-hover:translate-x-1 transition-transform">
                    <span>Manage {module.title}</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
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
