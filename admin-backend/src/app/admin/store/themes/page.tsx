"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  LayoutTemplate,
  Palette,
  Eye,
  CheckCircle2,
  Sparkles,
  Upload,
  ArrowRight,
  ExternalLink,
} from "lucide-react"

export default function ThemesLibraryPage() {
  const [activeThemeId, setActiveThemeId] = useState("theme-1")
  const [notification, setNotification] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch active theme on mount
  useEffect(() => {
    fetch("/api/store/theme")
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
      name: "Smomo Modern (Default)",
      version: "v2.4.0",
      description: "Clean, conversion-optimized responsive theme with fast checkout and dynamic sliders.",
      previewImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=60",
      tag: "Active Theme",
      author: "Smomo Design Lab",
    },
    {
      id: "theme-2",
      name: "Minimalist Boutique",
      version: "v1.8.2",
      description: "Focus on photography and sleek typography for high-end fashion and lifestyle brands.",
      previewImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=60",
      tag: "Popular",
      author: "Smomo Studio",
    },
    {
      id: "theme-3",
      name: "Dark Tech & Gadgets",
      version: "v2.1.0",
      description: "Dark-mode aesthetic tailored for electronic accessories, smart tech, and gear stores.",
      previewImage: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&auto=format&fit=crop&q=60",
      tag: "Trending",
      author: "Smomo Studio",
    },
    {
      id: "theme-4",
      name: "Bold Retailer",
      version: "v1.5.0",
      description: "High volume catalog layout with multi-level mega menus and quick buy drawers.",
      previewImage: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&auto=format&fit=crop&q=60",
      tag: "Multi-Product",
      author: "Smomo Studio",
    },
  ]

  const handleActivate = async (id: string, name: string) => {
    setActiveThemeId(id)
    setIsSaving(true)
    try {
      await fetch("/api/store/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: { activeThemeId: id },
        }),
      })
      setNotification(`Theme "${name}" activated and saved to database!`)
    } catch {
      setNotification(`Theme "${name}" activated!`)
    } finally {
      setIsSaving(false)
      setTimeout(() => setNotification(null), 3500)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="flex items-center justify-between px-4 py-3 rounded-lg border bg-emerald-50 text-emerald-800 border-emerald-200 text-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{notification}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <LayoutTemplate className="h-6 w-6 text-[#E11D48]" />
            Themes Library
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage your store templates. Customize your active layout or switch between styles.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-gray-200 text-xs">
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            Upload Theme (ZIP)
          </Button>
          <Link href="/admin/store/theme">
            <Button className="bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs">
              <Palette className="h-3.5 w-3.5 mr-1.5" />
              Customize Active Theme
            </Button>
          </Link>
        </div>
      </div>

      {/* Active Theme Highlight Hero Card */}
      {themes
        .filter((t) => t.id === activeThemeId)
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
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Currently Active
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">{active.version}</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{active.name}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {active.description}
                  </p>
                  <p className="text-xs text-gray-500">Author: {active.author}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link href="/admin/store/theme">
                    <Button className="bg-[#E11D48] hover:bg-[#BE123C] text-white">
                      <Palette className="h-4 w-4 mr-2" />
                      Customize Theme
                    </Button>
                  </Link>
                  <Link href="/store/products" target="_blank">
                    <Button variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Live Preview
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        ))}

      {/* Available Themes Section */}
      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-semibold text-gray-900">Explore Available Themes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {themes
            .filter((t) => t.id !== activeThemeId)
            .map((theme) => (
              <Card key={theme.id} className="rounded-xl border overflow-hidden hover:shadow-md transition-all">
                <div className="aspect-video bg-gray-100 overflow-hidden relative group">
                  <img
                    src={theme.previewImage}
                    alt={theme.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="text-xs">
                      {theme.tag}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">{theme.name}</CardTitle>
                    <span className="text-xs text-muted-foreground font-mono">{theme.version}</span>
                  </div>
                  <CardDescription className="text-xs line-clamp-2 pt-1">
                    {theme.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-2 flex items-center justify-between border-t border-gray-100 mt-2">
                  <span className="text-xs text-gray-500">{theme.author}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleActivate(theme.id, theme.name)}
                      className="h-8 text-xs hover:text-[#E11D48]"
                    >
                      Activate
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
