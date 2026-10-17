"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Sliders,
  SlidersHorizontal,
  Tag,
  ShoppingCart,
  ShoppingBag,
  Home,
  Info,
  Trash2,
  Edit2,
  Plus,
  CloudUpload,
  Download,
  Upload,
  Save,
  Check,
  ChevronUp,
  ChevronDown,
  Search,
  Menu,
  User,
  ExternalLink,
  Sparkles,
} from "lucide-react"

type ActiveTabType =
  | "theme_settings"
  | "header_footer"
  | "product_settings"
  | "checkout_settings"
  | "cart_banner"
  | "homepage_settings"

export default function ThemeCustomizerPage() {
  const [activeTab, setActiveTab] = useState<ActiveTabType>("homepage_settings")
  const [loading, setLoading] = useState(false)
  const [savedNotification, setSavedNotification] = useState(false)

  // 1. Homepage Settings State (الصورة 1)
  const [sliderOpen, setSliderOpen] = useState(true)
  const [sliderTab, setSliderTab] = useState<"slides" | "settings">("slides")
  const [slides, setSlides] = useState([
    {
      id: "slide-1",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=60",
    },
    {
      id: "slide-2",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=60",
    },
  ])

  // Products List Section 1 (Featured)
  const [sec1Open, setSec1Open] = useState(true)
  const [sec1Tab, setSec1Tab] = useState<"settings" | "checkout_styles">("settings")
  const [sec1Title, setSec1Title] = useState("مجموعة مميزة")
  const [sec1Subtitle, setSec1Subtitle] = useState("اعثر على كل ما تريد")
  const [sec1Limit, setSec1Limit] = useState(4)
  const [sec1Category, setSec1Category] = useState("")
  const [sec1ViewType, setSec1ViewType] = useState("Grid")
  const [sec1LoadMore, setSec1LoadMore] = useState(true)

  // Products List Section 2 (Special Offers)
  const [sec2Open, setSec2Open] = useState(true)
  const [sec2Tab, setSec2Tab] = useState<"settings" | "checkout_styles">("settings")
  const [sec2Title, setSec2Title] = useState("عروض خاصة")
  const [sec2Subtitle, setSec2Subtitle] = useState("اعثر على كل ما تريد")
  const [sec2Limit, setSec2Limit] = useState(4)
  const [sec2Category, setSec2Category] = useState("")
  const [sec2ViewType, setSec2ViewType] = useState("Slider")
  const [sec2LoadMore, setSec2LoadMore] = useState(false)

  // 2. Cart Bottom Banner State (الصورة 2)
  const [cartBannerImage, setCartBannerImage] = useState<string>("")
  const bannerFileRef = useRef<HTMLInputElement>(null)

  // 3. Product Settings State (الصورة 3)
  const [productTab, setProductTab] = useState<"sections" | "stock" | "advanced" | "styles">("sections")
  const [productSections, setProductSections] = useState({
    title: true,
    images: true,
    price: true,
    variants: true,
    scarcity: true,
    visitors: true,
    description: true,
    expressCheckoutForm: false,
    addToCartAndQuantity: true,
    bundles: false,
  })

  // 4. Checkout Settings State (الصورة 4)
  const [checkoutFont, setCheckoutFont] = useState("Lato")
  const [checkoutColors, setCheckoutColors] = useState({
    backgroundColor: "#FFFFFF",
    textColor: "#000000",
    headerBackground: "#FFFFFF",
    summaryBackground: "#FCFCFC",
    summaryForeground: "#1A1A1A",
    accentColor: "#E5E5E5",
  })
  const [logoWidth, setLogoWidth] = useState(60)
  const [onePageCheckout, setOnePageCheckout] = useState(true)
  const [showCoupon, setShowCoupon] = useState(true)
  const [headerLogoUrl, setHeaderLogoUrl] = useState("")

  // 5. Header / Footer Settings State (الصورة 5)
  const [headerFooterTab, setHeaderFooterTab] = useState<
    "mobile_header" | "desktop_header" | "footer" | "desktop_notice" | "mobile_notice"
  >("mobile_header")
  const [mobileHeaderBg, setMobileHeaderBg] = useState("#FFFFFF")
  const [mobileHeaderButtonsColor, setMobileHeaderButtonsColor] = useState("#000000")
  const [mobileHeaderBorder, setMobileHeaderBorder] = useState(true)
  const [mobileHeaderBorderColor, setMobileHeaderBorderColor] = useState("#F0F0F0")

  // Load existing theme configuration
  useEffect(() => {
    async function loadTheme() {
      try {
        const res = await fetch("/api/store/theme")
        const data = await res.json()
        if (data.success && data.config) {
          const c = data.config
          if (c.productSettings?.sections) {
            setProductSections((prev) => ({ ...prev, ...c.productSettings.sections }))
          }
          if (c.checkoutSettings?.colors) {
            setCheckoutColors((prev) => ({ ...prev, ...c.checkoutSettings.colors }))
          }
          if (c.checkoutSettings?.fontFamily) {
            setCheckoutFont(c.checkoutSettings.fontFamily)
          }
          if (c.cartBanner?.imageUrl) {
            setCartBannerImage(c.cartBanner.imageUrl)
          }
        }
      } catch (e) {
        console.error("Error loading theme:", e)
      }
    }
    loadTheme()
  }, [])

  // Save action
  const handleSave = async () => {
    setLoading(true)
    try {
      const payload = {
        homepageSettings: {
          sections: [
            {
              id: "slider-1",
              type: "slider",
              slides,
            },
            {
              id: "products-1",
              type: "products_list",
              title: sec1Title,
              subtitle: sec1Subtitle,
              limit: sec1Limit,
              category: sec1Category,
              viewType: sec1ViewType,
              loadMore: sec1LoadMore,
            },
            {
              id: "products-2",
              type: "products_list",
              title: sec2Title,
              subtitle: sec2Subtitle,
              limit: sec2Limit,
              category: sec2Category,
              viewType: sec2ViewType,
              loadMore: sec2LoadMore,
            },
          ],
        },
        cartBanner: {
          imageUrl: cartBannerImage,
        },
        productSettings: {
          sections: productSections,
        },
        checkoutSettings: {
          fontFamily: checkoutFont,
          colors: checkoutColors,
          logoWidth,
          onePageCheckout,
          showCoupon,
          headerLogoUrl,
        },
        headerFooterSettings: {
          mobileHeader: {
            background: mobileHeaderBg,
            buttonsColor: mobileHeaderButtonsColor,
            borderEnabled: mobileHeaderBorder,
            borderColor: mobileHeaderBorderColor,
          },
        },
      }

      const res = await fetch("/api/store/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: payload }),
      })
      const result = await res.json()
      if (result.success) {
        setSavedNotification(true)
        setTimeout(() => setSavedNotification(false), 3000)
      }
    } catch (e) {
      console.error("Failed to save theme:", e)
    } finally {
      setLoading(false)
    }
  }

  // Export action
  const handleExport = () => {
    const configData = {
      homepageSettings: { sec1Title, sec2Title, slides },
      productSections,
      checkoutColors,
      checkoutFont,
    }
    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `smomo-theme-config-${new Date().toISOString().split("T")[0]}.json`
    a.click()
  }

  // Import action
  const handleImport = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e: any) => {
      const file = e.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            const parsed = JSON.parse(event.target?.result as string)
            if (parsed.productSections) setProductSections(parsed.productSections)
            if (parsed.checkoutColors) setCheckoutColors(parsed.checkoutColors)
            alert("Theme settings imported successfully!")
          } catch (err) {
            alert("Invalid JSON file")
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  return (
    <div className="space-y-6 pb-28">
      {/* Page Title matching screenshot */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Theme</h1>
      </div>

      {/* Global Blue Alert Banner matching all 5 screenshots */}
      <div className="flex items-center gap-3 bg-blue-50/60 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
        <Info className="h-4 w-4 text-blue-500 shrink-0" />
        <span>Apart from checkout settings, all other settings on this page do not apply to new themes.</span>
      </div>

      {/* Toast Notification */}
      {savedNotification && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm animate-in fade-in slide-in-from-top-4">
          <Check className="h-4 w-4" />
          <span>Theme settings saved successfully!</span>
        </div>
      )}

      {/* Main Grid: Left Vertical Navigation + Right Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side Navigation Tabs */}
        <div className="lg:col-span-3 bg-white border border-gray-100 rounded-xl p-2 shadow-sm space-y-1">
          {/* 1. Theme settings */}
          <button
            onClick={() => setActiveTab("theme_settings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left relative ${
              activeTab === "theme_settings"
                ? "text-[#BE123C] bg-rose-50/50 font-semibold"
                : "text-muted-foreground hover:bg-gray-50 hover:text-foreground"
            }`}
          >
            {activeTab === "theme_settings" && (
              <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#BE123C] rounded-r-full" />
            )}
            <Sliders className="h-4 w-4 shrink-0" />
            <span>Theme settings</span>
          </button>

          {/* 2. Header / Footer settings */}
          <button
            onClick={() => setActiveTab("header_footer")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left relative ${
              activeTab === "header_footer"
                ? "text-[#BE123C] bg-rose-50/50 font-semibold"
                : "text-muted-foreground hover:bg-gray-50 hover:text-foreground"
            }`}
          >
            {activeTab === "header_footer" && (
              <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#BE123C] rounded-r-full" />
            )}
            <SlidersHorizontal className="h-4 w-4 shrink-0" />
            <span>Header / Footer settings</span>
          </button>

          {/* 3. Product settings */}
          <button
            onClick={() => setActiveTab("product_settings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left relative ${
              activeTab === "product_settings"
                ? "text-[#BE123C] bg-rose-50/50 font-semibold"
                : "text-muted-foreground hover:bg-gray-50 hover:text-foreground"
            }`}
          >
            {activeTab === "product_settings" && (
              <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#BE123C] rounded-r-full" />
            )}
            <Tag className="h-4 w-4 shrink-0" />
            <span>Product settings</span>
          </button>

          {/* 4. Checkout settings */}
          <button
            onClick={() => setActiveTab("checkout_settings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left relative ${
              activeTab === "checkout_settings"
                ? "text-[#BE123C] bg-rose-50/50 font-semibold"
                : "text-muted-foreground hover:bg-gray-50 hover:text-foreground"
            }`}
          >
            {activeTab === "checkout_settings" && (
              <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#BE123C] rounded-r-full" />
            )}
            <ShoppingCart className="h-4 w-4 shrink-0" />
            <span>Checkout settings</span>
          </button>

          {/* 5. Cart bottom banner */}
          <button
            onClick={() => setActiveTab("cart_banner")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left relative ${
              activeTab === "cart_banner"
                ? "text-[#BE123C] bg-rose-50/50 font-semibold"
                : "text-muted-foreground hover:bg-gray-50 hover:text-foreground"
            }`}
          >
            {activeTab === "cart_banner" && (
              <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#BE123C] rounded-r-full" />
            )}
            <ShoppingBag className="h-4 w-4 shrink-0" />
            <span>Cart bottom banner</span>
          </button>

          {/* 6. Homepage settings (Active in Screenshot 1) */}
          <button
            onClick={() => setActiveTab("homepage_settings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left relative ${
              activeTab === "homepage_settings"
                ? "text-[#BE123C] bg-rose-50/50 font-semibold"
                : "text-muted-foreground hover:bg-gray-50 hover:text-foreground"
            }`}
          >
            {activeTab === "homepage_settings" && (
              <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#BE123C] rounded-r-full" />
            )}
            <Home className="h-4 w-4 shrink-0" />
            <span>Homepage settings</span>
          </button>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-9 space-y-6">
          {/* ========================================================= */}
          {/* TAB 6: HOMEPAGE SETTINGS (Screenshot 1)                   */}
          {/* ========================================================= */}
          {activeTab === "homepage_settings" && (
            <div className="space-y-6">
              {/* Accordion 1: Section Slider */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50/30">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSliderOpen(!sliderOpen)}
                      className="text-gray-500 hover:text-gray-800"
                    >
                      {sliderOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                    <span className="font-semibold text-gray-800">Section Slider</span>
                  </div>
                  <button className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {sliderOpen && (
                  <div className="p-5 space-y-5">
                    {/* Sub-tabs: Slides | Settings */}
                    <div className="flex gap-6 border-b border-gray-200 pb-2">
                      <button
                        onClick={() => setSliderTab("slides")}
                        className={`pb-2 text-sm font-medium transition-colors relative ${
                          sliderTab === "slides"
                            ? "text-[#BE123C] font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Slides
                        {sliderTab === "slides" && (
                          <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#BE123C]" />
                        )}
                      </button>
                      <button
                        onClick={() => setSliderTab("settings")}
                        className={`pb-2 text-sm font-medium transition-colors relative ${
                          sliderTab === "settings"
                            ? "text-[#BE123C] font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Settings
                        {sliderTab === "settings" && (
                          <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#BE123C]" />
                        )}
                      </button>
                    </div>

                    {/* Slides Previews Grid */}
                    {sliderTab === "slides" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {slides.map((slide, idx) => (
                            <div
                              key={slide.id}
                              className="relative group rounded-xl border border-gray-200 overflow-hidden bg-gray-50 aspect-video flex items-center justify-center shadow-sm"
                            >
                              <img
                                src={slide.image}
                                alt={`Slide ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              {/* Edit / Delete overlay buttons */}
                              <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-white/90 backdrop-blur-xs p-1 rounded-md shadow-xs">
                                <button
                                  className="text-red-500 hover:text-red-700 p-1"
                                  onClick={() => setSlides(slides.filter((s) => s.id !== slide.id))}
                                  title="Delete slide"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                                <button className="text-gray-600 hover:text-gray-900 p-1" title="Edit slide">
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* + Add slide Button (Sky Blue) */}
                        <Button
                          type="button"
                          onClick={() =>
                            setSlides([
                              ...slides,
                              {
                                id: `slide-${Date.now()}`,
                                image:
                                  "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&auto=format&fit=crop&q=60",
                              },
                            ])
                          }
                          className="w-full bg-[#00A3FF] hover:bg-[#008fe0] text-white font-medium h-10 rounded-lg shadow-sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add slide
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Accordion 2: Section Products list 1 */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50/30">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSec1Open(!sec1Open)}
                      className="text-gray-500 hover:text-gray-800"
                    >
                      {sec1Open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                    <span className="font-semibold text-gray-800">Section Products list</span>
                  </div>
                  <button className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {sec1Open && (
                  <div className="p-5 space-y-5">
                    {/* Sub-tabs: Settings | Checkout Styles */}
                    <div className="flex gap-6 border-b border-gray-200 pb-2">
                      <button
                        onClick={() => setSec1Tab("settings")}
                        className={`pb-2 text-sm font-medium transition-colors relative ${
                          sec1Tab === "settings"
                            ? "text-[#BE123C] font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Settings
                        {sec1Tab === "settings" && (
                          <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#BE123C]" />
                        )}
                      </button>
                      <button
                        onClick={() => setSec1Tab("checkout_styles")}
                        className={`pb-2 text-sm font-medium transition-colors relative ${
                          sec1Tab === "checkout_styles"
                            ? "text-[#BE123C] font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Checkout Styles
                        {sec1Tab === "checkout_styles" && (
                          <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#BE123C]" />
                        )}
                      </button>
                    </div>

                    {/* Inputs Form */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-gray-700">Title</label>
                          <Input
                            value={sec1Title}
                            onChange={(e) => setSec1Title(e.target.value)}
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-gray-700">Subtitle</label>
                          <Input
                            value={sec1Subtitle}
                            onChange={(e) => setSec1Subtitle(e.target.value)}
                            className="bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-gray-700">Limit</label>
                          <Input
                            type="number"
                            value={sec1Limit}
                            onChange={(e) => setSec1Limit(Number(e.target.value))}
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-gray-700">Select category</label>
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="Start typing to search for categories"
                              value={sec1Category}
                              onChange={(e) => setSec1Category(e.target.value)}
                              className="pl-9 bg-white text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-2">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-gray-700">View type</label>
                          <select
                            value={sec1ViewType}
                            onChange={(e) => setSec1ViewType(e.target.value)}
                            className="w-full h-10 px-3 rounded-md border border-input bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                          >
                            <option value="Grid">Grid</option>
                            <option value="Slider">Slider</option>
                          </select>
                        </div>
                        <div className="space-y-1.5 pt-4 flex items-center justify-between md:justify-start md:gap-6">
                          <label className="text-xs font-semibold text-gray-700">Load more button</label>
                          <Switch
                            checked={sec1LoadMore}
                            onChange={(e) => setSec1LoadMore(e.target.checked)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 3: Section Products list 2 (Special Offers) */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50/30">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSec2Open(!sec2Open)}
                      className="text-gray-500 hover:text-gray-800"
                    >
                      {sec2Open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                    <span className="font-semibold text-gray-800">Section Products list</span>
                  </div>
                  <button className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {sec2Open && (
                  <div className="p-5 space-y-5">
                    {/* Sub-tabs */}
                    <div className="flex gap-6 border-b border-gray-200 pb-2">
                      <button
                        onClick={() => setSec2Tab("settings")}
                        className={`pb-2 text-sm font-medium transition-colors relative ${
                          sec2Tab === "settings"
                            ? "text-[#BE123C] font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Settings
                        {sec2Tab === "settings" && (
                          <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#BE123C]" />
                        )}
                      </button>
                      <button
                        onClick={() => setSec2Tab("checkout_styles")}
                        className={`pb-2 text-sm font-medium transition-colors relative ${
                          sec2Tab === "checkout_styles"
                            ? "text-[#BE123C] font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Checkout Styles
                        {sec2Tab === "checkout_styles" && (
                          <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#BE123C]" />
                        )}
                      </button>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-gray-700">Title</label>
                          <Input
                            value={sec2Title}
                            onChange={(e) => setSec2Title(e.target.value)}
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-gray-700">Subtitle</label>
                          <Input
                            value={sec2Subtitle}
                            onChange={(e) => setSec2Subtitle(e.target.value)}
                            className="bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-gray-700">Limit</label>
                          <Input
                            type="number"
                            value={sec2Limit}
                            onChange={(e) => setSec2Limit(Number(e.target.value))}
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-gray-700">Select category</label>
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="Start typing to search for categories"
                              value={sec2Category}
                              onChange={(e) => setSec2Category(e.target.value)}
                              className="pl-9 bg-white text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-2">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-gray-700">View type</label>
                          <select
                            value={sec2ViewType}
                            onChange={(e) => setSec2ViewType(e.target.value)}
                            className="w-full h-10 px-3 rounded-md border border-input bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                          >
                            <option value="Slider">Slider</option>
                            <option value="Grid">Grid</option>
                          </select>
                        </div>
                        <div className="space-y-1.5 pt-4 flex items-center justify-between md:justify-start md:gap-6">
                          <label className="text-xs font-semibold text-gray-700">Load more button</label>
                          <Switch
                            checked={sec2LoadMore}
                            onChange={(e) => setSec2LoadMore(e.target.checked)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* + Add section Button */}
              <Button
                type="button"
                className="w-full bg-[#00A3FF] hover:bg-[#008fe0] text-white font-medium h-10 rounded-lg shadow-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add section
              </Button>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: CART BOTTOM BANNER (Screenshot 2)                  */}
          {/* ========================================================= */}
          {activeTab === "cart_banner" && (
            <div className="space-y-6">
              {/* Blue Alert Banner */}
              <div className="flex items-center gap-3 bg-blue-50/60 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
                <Info className="h-4 w-4 text-blue-500 shrink-0" />
                <span>Note: Cart bottom banner image size should be 1064 x 132</span>
              </div>

              {/* Upload Box */}
              <div
                onClick={() => bannerFileRef.current?.click()}
                className="bg-white border-2 border-dashed border-gray-200 hover:border-gray-300 rounded-xl p-16 flex flex-col items-center justify-center text-center cursor-pointer transition-colors shadow-sm"
              >
                <input
                  type="file"
                  ref={bannerFileRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const url = URL.createObjectURL(file)
                      setCartBannerImage(url)
                    }
                  }}
                />
                {cartBannerImage ? (
                  <div className="space-y-4 w-full">
                    <img
                      src={cartBannerImage}
                      alt="Cart bottom banner"
                      className="w-full max-h-32 object-contain mx-auto rounded border"
                    />
                    <p className="text-xs text-muted-foreground">Click to replace banner image</p>
                  </div>
                ) : (
                  <>
                    <CloudUpload className="h-14 w-14 text-gray-400 mb-3" />
                    <span className="text-sm font-medium text-gray-700">Choose file to upload</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: PRODUCT SETTINGS (Screenshot 3)                    */}
          {/* ========================================================= */}
          {activeTab === "product_settings" && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
              {/* Product Sub-tabs */}
              <div className="flex gap-8 border-b border-gray-200 pb-2 text-sm">
                <button
                  onClick={() => setProductTab("sections")}
                  className={`pb-2 font-medium relative ${
                    productTab === "sections" ? "text-[#BE123C] font-semibold" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Sections
                  {productTab === "sections" && (
                    <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#BE123C]" />
                  )}
                </button>
                <button
                  onClick={() => setProductTab("stock")}
                  className={`pb-2 font-medium relative ${
                    productTab === "stock" ? "text-[#BE123C] font-semibold" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Stock, visitors & countdown
                  {productTab === "stock" && (
                    <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#BE123C]" />
                  )}
                </button>
                <button
                  onClick={() => setProductTab("advanced")}
                  className={`pb-2 font-medium relative ${
                    productTab === "advanced" ? "text-[#BE123C] font-semibold" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Advanced
                  {productTab === "advanced" && (
                    <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#BE123C]" />
                  )}
                </button>
                <button
                  onClick={() => setProductTab("styles")}
                  className={`pb-2 font-medium relative ${
                    productTab === "styles" ? "text-[#BE123C] font-semibold" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Styles
                  {productTab === "styles" && (
                    <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#BE123C]" />
                  )}
                </button>
              </div>

              {/* Sections Toggle List */}
              <div className="space-y-3">
                {[
                  { key: "title", label: "Title" },
                  { key: "images", label: "Images" },
                  { key: "price", label: "Price" },
                  { key: "variants", label: "Variants" },
                  { key: "scarcity", label: "Scarcity" },
                  { key: "visitors", label: "Visitors" },
                  { key: "description", label: "Description" },
                  { key: "expressCheckoutForm", label: "Express checkout form" },
                  { key: "addToCartAndQuantity", label: "Add to cart + Quantity" },
                  { key: "bundles", label: "Bundles" },
                ].map(({ key, label }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3.5 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-800">{label}</span>
                    <Switch
                      checked={(productSections as Record<string, boolean>)[key]}
                      onChange={(e) =>
                        setProductSections((prev) => ({ ...prev, [key]: e.target.checked }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: CHECKOUT SETTINGS (Screenshot 4)                   */}
          {/* ========================================================= */}
          {activeTab === "checkout_settings" && (
            <div className="space-y-6">
              {/* Gradient Banner: A new way to customize your checkout page */}
              <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-purple-50 border border-rose-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
                <div className="space-y-2 max-w-lg">
                  <h3 className="font-bold text-gray-900 text-lg">A new way to customize your checkout page</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Customize your checkout's appearance. Control colors, add your branding, and adjust layout options. No custom code needed.
                  </p>
                  <div className="pt-2">
                    <Button className="bg-[#BE123C] hover:bg-[#9f0f32] text-white text-xs px-4 h-8 rounded-md">
                      Start customizing
                    </Button>
                  </div>
                </div>
                <div className="w-48 h-24 bg-white/80 backdrop-blur-xs border rounded-lg p-2 flex flex-col justify-between shadow-xs">
                  <div className="flex justify-between items-center text-[10px] text-gray-400 border-b pb-1">
                    <span>Checkout</span>
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="w-full h-2 bg-gray-100 rounded" />
                    <div className="w-3/4 h-2 bg-gray-100 rounded" />
                  </div>
                  <div className="text-right text-[10px] font-semibold">$99.00</div>
                </div>
              </div>

              {/* Page Font */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
                <h4 className="font-semibold text-sm text-gray-900">Page font</h4>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500">Font family</label>
                  <select
                    value={checkoutFont}
                    onChange={(e) => setCheckoutFont(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="Lato">Lato</option>
                    <option value="Inter">Inter</option>
                    <option value="Cairo">Cairo (عربي)</option>
                    <option value="Tajawal">Tajawal (عربي)</option>
                    <option value="Roboto">Roboto</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500">Preview</label>
                  <div
                    style={{ fontFamily: checkoutFont }}
                    className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600 border border-gray-100"
                  >
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
                  </div>
                </div>
              </div>

              {/* Page Colors */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
                <h4 className="font-semibold text-sm text-gray-900">Page colors</h4>
                <div className="space-y-3">
                  {[
                    { key: "backgroundColor", label: "Background color" },
                    { key: "textColor", label: "Text color" },
                    { key: "headerBackground", label: "Header background color" },
                    { key: "summaryBackground", label: "Summary background color" },
                    { key: "summaryForeground", label: "Summary foreground color" },
                    { key: "accentColor", label: "Accent color" },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between p-2 rounded border border-gray-100">
                      <span className="text-xs font-medium text-gray-700">{label}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={(checkoutColors as any)[key]}
                          onChange={(e) =>
                            setCheckoutColors((prev) => ({ ...prev, [key]: e.target.value }))
                          }
                          className="w-7 h-7 rounded cursor-pointer border border-gray-200"
                        />
                        <Input
                          value={(checkoutColors as any)[key]}
                          onChange={(e) =>
                            setCheckoutColors((prev) => ({ ...prev, [key]: e.target.value }))
                          }
                          className="w-28 h-8 font-mono text-xs uppercase"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Header Logo */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
                <h4 className="font-semibold text-sm text-gray-900">Custom header logo</h4>
                <div className="flex items-center gap-3 bg-blue-50/60 border border-blue-200 text-blue-700 px-3 py-2 rounded-lg text-xs">
                  <Info className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  <span>Note: Size should be 450 x 100</span>
                </div>

                <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center flex flex-col items-center justify-center cursor-pointer hover:border-gray-300">
                  <CloudUpload className="h-8 w-8 text-gray-400 mb-1" />
                  <span className="text-xs font-medium text-gray-600">Choose file to upload</span>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Logo width</span>
                    <span className="font-mono">{logoWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="200"
                    value={logoWidth}
                    onChange={(e) => setLogoWidth(Number(e.target.value))}
                    className="w-full accent-[#BE123C]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between p-2 rounded border border-gray-100">
                    <span className="text-xs font-medium text-gray-700">One page checkout</span>
                    <Switch
                      checked={onePageCheckout}
                      onChange={(e) => setOnePageCheckout(e.target.checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded border border-gray-100">
                    <span className="text-xs font-medium text-gray-700">Show coupon</span>
                    <Switch
                      checked={showCoupon}
                      onChange={(e) => setShowCoupon(e.target.checked)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: HEADER / FOOTER SETTINGS (Screenshot 5)            */}
          {/* ========================================================= */}
          {activeTab === "header_footer" && (
            <div className="space-y-6">
              {/* Blue Alert Banner */}
              <div className="flex items-center gap-3 bg-blue-50/60 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
                <Info className="h-4 w-4 text-blue-500 shrink-0" />
                <span>In order to remove the default footer bar, please add a custom domain or select one of the packs.</span>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
                {/* Header Footer Sub-tabs */}
                <div className="flex gap-6 border-b border-gray-200 pb-2 text-sm overflow-x-auto">
                  <button
                    onClick={() => setHeaderFooterTab("mobile_header")}
                    className={`pb-2 font-medium whitespace-nowrap relative ${
                      headerFooterTab === "mobile_header"
                        ? "text-[#BE123C] font-semibold"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    Mobile header
                    {headerFooterTab === "mobile_header" && (
                      <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#BE123C]" />
                    )}
                  </button>
                  <button
                    onClick={() => setHeaderFooterTab("desktop_header")}
                    className={`pb-2 font-medium whitespace-nowrap relative ${
                      headerFooterTab === "desktop_header"
                        ? "text-[#BE123C] font-semibold"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    Desktop header
                    {headerFooterTab === "desktop_header" && (
                      <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#BE123C]" />
                    )}
                  </button>
                  <button
                    onClick={() => setHeaderFooterTab("footer")}
                    className={`pb-2 font-medium whitespace-nowrap relative ${
                      headerFooterTab === "footer"
                        ? "text-[#BE123C] font-semibold"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    Footer
                    {headerFooterTab === "footer" && (
                      <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#BE123C]" />
                    )}
                  </button>
                  <button
                    onClick={() => setHeaderFooterTab("desktop_notice")}
                    className={`pb-2 font-medium whitespace-nowrap relative ${
                      headerFooterTab === "desktop_notice"
                        ? "text-[#BE123C] font-semibold"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    Desktop notice bar
                    {headerFooterTab === "desktop_notice" && (
                      <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#BE123C]" />
                    )}
                  </button>
                  <button
                    onClick={() => setHeaderFooterTab("mobile_notice")}
                    className={`pb-2 font-medium whitespace-nowrap relative ${
                      headerFooterTab === "mobile_notice"
                        ? "text-[#BE123C] font-semibold"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    Mobile notice bar
                    {headerFooterTab === "mobile_notice" && (
                      <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#BE123C]" />
                    )}
                  </button>
                </div>

                {/* Mobile Header Visual Layout Mockup */}
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-xl p-3 flex items-center justify-between bg-white shadow-xs">
                    <div className="flex items-center gap-2 border border-dashed rounded px-3 py-1.5">
                      <Menu className="h-4 w-4 text-gray-700" />
                      <span className="text-xs font-semibold text-gray-800">Logo</span>
                    </div>

                    <div className="flex items-center gap-3 border border-dashed rounded px-3 py-1.5 text-gray-600">
                      <Search className="h-4 w-4" />
                      <User className="h-4 w-4" />
                      <ShoppingCart className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Drop unwanted items here */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500">Drop unwanted items here</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl h-24 flex items-center justify-center text-xs text-gray-400 bg-gray-50/50">
                      Drag and drop here to hide from mobile navbar
                    </div>
                  </div>

                  {/* Mobile Header Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center justify-between p-2.5 rounded border border-gray-100">
                      <span className="text-xs font-medium text-gray-700">Header background</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={mobileHeaderBg}
                          onChange={(e) => setMobileHeaderBg(e.target.value)}
                          className="w-7 h-7 rounded cursor-pointer border"
                        />
                        <Input
                          value={mobileHeaderBg}
                          onChange={(e) => setMobileHeaderBg(e.target.value)}
                          className="w-24 h-8 font-mono text-xs uppercase"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded border border-gray-100">
                      <span className="text-xs font-medium text-gray-700">Header buttons color</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={mobileHeaderButtonsColor}
                          onChange={(e) => setMobileHeaderButtonsColor(e.target.value)}
                          className="w-7 h-7 rounded cursor-pointer border"
                        />
                        <Input
                          value={mobileHeaderButtonsColor}
                          onChange={(e) => setMobileHeaderButtonsColor(e.target.value)}
                          className="w-24 h-8 font-mono text-xs uppercase"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded border border-gray-100">
                      <span className="text-xs font-medium text-gray-700">Header border</span>
                      <Switch
                        checked={mobileHeaderBorder}
                        onChange={(e) => setMobileHeaderBorder(e.target.checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded border border-gray-100">
                      <span className="text-xs font-medium text-gray-700">Header border color</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={mobileHeaderBorderColor}
                          onChange={(e) => setMobileHeaderBorderColor(e.target.value)}
                          className="w-7 h-7 rounded cursor-pointer border"
                        />
                        <Input
                          value={mobileHeaderBorderColor}
                          onChange={(e) => setMobileHeaderBorderColor(e.target.value)}
                          className="w-24 h-8 font-mono text-xs uppercase"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 1: THEME SETTINGS                                     */}
          {/* ========================================================= */}
          {activeTab === "theme_settings" && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Sliders className="h-5 w-5 text-[#BE123C]" />
                General Theme Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Primary Brand Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" defaultValue="#E11D48" className="w-8 h-8 rounded border cursor-pointer" />
                    <Input defaultValue="#E11D48" className="font-mono text-xs uppercase" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Site Direction</label>
                  <select className="w-full h-10 px-3 rounded-md border border-input text-sm">
                    <option value="rtl">RTL (عربي - من اليمين لليسار)</option>
                    <option value="ltr">LTR (English - Left to Right)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Action Bar matching all 5 screenshots */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 py-3.5 px-6 z-40 shadow-lg flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleImport}
          className="bg-[#9D174D] hover:bg-[#831843] text-white border-none text-xs font-medium h-9 px-4 rounded-lg shadow-sm"
        >
          <Download className="h-3.5 w-3.5 mr-1.5" />
          Import
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleExport}
          className="bg-[#9D174D] hover:bg-[#831843] text-white border-none text-xs font-medium h-9 px-4 rounded-lg shadow-sm"
        >
          <Upload className="h-3.5 w-3.5 mr-1.5" />
          Export
        </Button>

        <Button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="bg-[#9D174D] hover:bg-[#831843] text-white border-none text-xs font-medium h-9 px-5 rounded-lg shadow-sm"
        >
          <Save className="h-3.5 w-3.5 mr-1.5" />
          {loading ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  )
}
