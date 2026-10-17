import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// الإعدادات الافتراضية المطابقة تماماً للصور الخمس المرفقة
export const defaultThemeConfig = {
  // 1. إعدادات القالب العامة (Theme Settings)
  themeSettings: {
    primaryColor: "#E11D48",
    fontFamily: "Lato",
    siteTitle: "Smomo Store",
    faviconUrl: "",
    enableRTL: true,
  },

  // 2. إعدادات الهيدر والفوتر (Header / Footer Settings - الصورة 5)
  headerFooterSettings: {
    removeFooterBarNotice: "In order to remove the default footer bar, please add a custom domain or select one of the packs.",
    mobileHeader: {
      items: ["menu", "logo", "search", "user", "cart"],
      background: "#FFFFFF",
      buttonsColor: "#000000",
      borderEnabled: true,
      borderColor: "#F0F0F0",
    },
    desktopHeader: {
      background: "#FFFFFF",
      textColor: "#111827",
      sticky: true,
    },
    footer: {
      background: "#111827",
      textColor: "#FFFFFF",
      showSocial: true,
      showCopyright: true,
    },
    desktopNoticeBar: {
      enabled: false,
      text: "Free shipping on orders over $50!",
      background: "#E11D48",
      textColor: "#FFFFFF",
    },
    mobileNoticeBar: {
      enabled: false,
      text: "Free shipping on orders over $50!",
      background: "#E11D48",
      textColor: "#FFFFFF",
    },
  },

  // 3. إعدادات صفحة المنتج (Product Settings - الصورة 3)
  productSettings: {
    sections: {
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
    },
    stockCountdown: {
      showLowStockAlert: true,
      countdownTimer: true,
      visitorCounter: true,
    },
  },

  // 4. إعدادات صفحة الدفع (Checkout Settings - الصورة 4)
  checkoutSettings: {
    fontFamily: "Lato",
    previewText: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    colors: {
      background: "#FFFFFF",
      text: "#000000",
      headerBackground: "#FFFFFF",
      summaryBackground: "#FCFCFC",
      summaryForeground: "#1A1A1A",
      accent: "#E5E5E5",
    },
    headerLogo: {
      url: "",
      width: 60,
    },
    onePageCheckout: true,
    showCoupon: true,
  },

  // 5. بانر أسفل السلة (Cart Bottom Banner - الصورة 2)
  cartBanner: {
    note: "Note: Cart bottom banner image size should be 1064 x 132",
    imageUrl: "/uploads/230df8f1-193c-4630-a892-6d8b10bba94e.jpg",
    enabled: true,
  },

  // 6. إعدادات الصفحة الرئيسية (Homepage Settings - الصورة 1)
  homepageSettings: {
    sections: [
      {
        id: "section-slider-1",
        type: "slider",
        name: "Section Slider",
        activeTab: "slides",
        slides: [
          {
            id: "slide-1",
            imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=60",
            title: "Summer Collection",
            link: "/store/products",
          },
          {
            id: "slide-2",
            imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=60",
            title: "Special Gifts",
            link: "/store/products",
          },
        ],
      },
      {
        id: "section-products-1",
        type: "products_list",
        name: "Section Products list",
        title: "مجموعة مميزة",
        subtitle: "اعثر على كل ما تريد",
        limit: 4,
        category: "",
        viewType: "Grid",
        loadMoreButton: true,
      },
      {
        id: "section-products-2",
        type: "products_list",
        name: "Section Products list",
        title: "عروض خاصة",
        subtitle: "اعثر على كل ما تريد",
        limit: 4,
        category: "",
        viewType: "Slider",
        loadMoreButton: false,
      },
    ],
  },
}

import { getPersistentThemeConfig, savePersistentThemeConfig } from "@/lib/store-storage"

// GET /api/store/theme
export async function GET() {
  try {
    const config = getPersistentThemeConfig(defaultThemeConfig)
    return NextResponse.json({
      success: true,
      config,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load theme configuration" },
      { status: 500 }
    )
  }
}

// POST /api/store/theme - حفظ أو استيراد إعدادات القالب (محمي)
export async function POST(request: NextRequest) {
  const { requireAdminSession } = await import("@/lib/auth-guard")
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const { action, config } = body

    if (action === "reset") {
      savePersistentThemeConfig(defaultThemeConfig)
      return NextResponse.json({
        success: true,
        message: "Theme settings reset to default",
        config: defaultThemeConfig,
      })
    }

    const current = getPersistentThemeConfig(defaultThemeConfig)
    const updated = config ? { ...current, ...config } : current
    savePersistentThemeConfig(updated)

    return NextResponse.json({
      success: true,
      message: "Theme settings saved successfully",
      config: updated,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save theme configuration" },
      { status: 500 }
    )
  }
}
