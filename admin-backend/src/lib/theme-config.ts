/**
 * ============================================================================
 * وحدة ثوابت ونماذج إعدادات القالب والهيدر والفوتر مع الحماية من هجمات XSS
 * Theme, Header, Footer & Newsletter Configuration, Validation & Sanitization
 * ============================================================================
 * هذا الملف آمن للاستخدام في كلٍّ من مكونات العميل (Client Components)
 * ومكونات الخادم (Server Components / API Routes).
 */

export type HeaderItemId = "menu" | "logo" | "links" | "currency" | "language" | "search" | "user" | "cart"

export interface HeaderItemDefinition {
  id: HeaderItemId
  label: string
  labelAr: string
  category: "brand" | "navigation" | "utility"
}

export interface MobileHeaderConfig {
  activeItems: HeaderItemId[]
  hiddenItems: HeaderItemId[]
  background: string
  buttonsColor: string
  borderEnabled: boolean
  borderColor: string
}

export interface DesktopHeaderConfig {
  activeItems: HeaderItemId[]
  hiddenItems: HeaderItemId[]
  background: string
  buttonsColor: string
  textColor: string
  activeLinkColor: string
  borderEnabled: boolean
  borderColor: string
  sticky: boolean
}

export interface NoticeBarConfig {
  enabled: boolean
  text: string
  linkUrl: string
  background: string
  textColor: string
}

export interface NewsletterConfig {
  enabled: boolean
  badgeText: string
  title: string
  subtitle: string
  highlightDiscount: string
  inputPlaceholder: string
  buttonText: string
  buttonColor: string
  gradientStart: string
  gradientMiddle: string
  gradientEnd: string
  textColor: string
  showGridOverlay?: boolean
  harmonizeWithFooter?: boolean
}

export interface FooterSocialLink {
  id: string
  code: string
  label: string
  url: string
  enabled?: boolean
}

export interface FooterNavLink {
  id: string
  label: string
  url: string
}

export interface FooterContactConfig {
  email: string
  phone: string
  workingHours: string
  address?: string
}

export interface FooterConfig {
  brandName: string
  brandLogoUrl: string
  slogan: string
  accentColor: string
  backgroundColor: string
  textColor: string
  exploreTitle: string
  supportTitle: string
  contactTitle: string
  socialLinks: FooterSocialLink[]
  exploreLinks: FooterNavLink[]
  supportLinks: FooterNavLink[]
  contact: FooterContactConfig
  paymentMethods: string[]
  customPaymentBadgeUrl?: string
  copyrightText: string
  showSocial: boolean
  showPaymentMethods: boolean
  showCopyright: boolean
}

export interface HeaderFooterSettingsConfig {
  removeFooterBarNotice: string
  mobileHeader: MobileHeaderConfig
  desktopHeader: DesktopHeaderConfig
  newsletter: NewsletterConfig
  footer: FooterConfig
  desktopNoticeBar: NoticeBarConfig
  mobileNoticeBar: NoticeBarConfig
}

/**
 * العناصر القابلة للسحب والإفلات في الهيدر (Mobile & Desktop)
 */
export const HEADER_DRAGGABLE_ITEMS: HeaderItemDefinition[] = [
  { id: "logo", label: "Logo", labelAr: "الشعار (Logo)", category: "brand" },
  { id: "search", label: "Search", labelAr: "البحث (Search)", category: "utility" },
  { id: "user", label: "User", labelAr: "حساب المستخدم (User)", category: "utility" },
  { id: "cart", label: "Cart", labelAr: "سلة التسوق (Cart)", category: "utility" },
  { id: "currency", label: "Currency", labelAr: "العملة (Currency)", category: "utility" },
  { id: "language", label: "Language", labelAr: "اللغة (Language)", category: "utility" },
]

/**
 * تدرجات لونية جاهزة لقسم النشرة البريدية (Newsletter Gradient Presets)
 */
export const NEWSLETTER_GRADIENT_PRESETS = [
  {
    id: "crimson-midnight",
    name: "Crimson Midnight (StockBureaux)",
    start: "#2B0916",
    middle: "#0B0F1E",
    end: "#040711",
  },
  {
    id: "clean-light-slate",
    name: "Clean Light (Storefront Match)",
    start: "#FFF1F2",
    middle: "#F8FAFC",
    end: "#F1F5F9",
  },
  {
    id: "royal-indigo",
    name: "Royal Indigo Harmony",
    start: "#1E1B4B",
    middle: "#0F172A",
    end: "#060913",
  },
  {
    id: "emerald-obsidian",
    name: "Emerald Obsidian",
    start: "#064E3B",
    middle: "#022C22",
    end: "#040711",
  },
]

/**
 * قوالب التناغم اللوني الموحد بين النشرة البريدية والفوتر والصفحة
 * (Unified Newsletter + Footer Theme Harmony Palettes)
 */
export const THEME_HARMONY_PALETTES = [
  {
    id: "stockbureaux-midnight",
    name: "StockBureaux Midnight (Unified Dark)",
    description: "Seamless crimson-to-navy glow flowing directly into a unified deep navy footer",
    newsletterStart: "#2B0916",
    newsletterMiddle: "#0B0F1E",
    newsletterEnd: "#040711",
    newsletterText: "#FFFFFF",
    buttonColor: "#FF2D55",
    footerBg: "#040711",
    footerText: "#94A3B8",
    footerAccent: "#4F46E5",
  },
  {
    id: "crimson-harmony",
    name: "Unified Crimson & Obsidian",
    description: "Matches brand crimson accents across both newsletter CTA and footer links",
    newsletterStart: "#310B19",
    newsletterMiddle: "#110915",
    newsletterEnd: "#07080F",
    newsletterText: "#FFFFFF",
    buttonColor: "#E11D48",
    footerBg: "#07080F",
    footerText: "#9CA3AF",
    footerAccent: "#E11D48",
  },
  {
    id: "clean-storefront-light",
    name: "Clean Light Storefront",
    description: "Soft rose-to-slate light theme that blends seamlessly with white storefront pages",
    newsletterStart: "#FFF1F2",
    newsletterMiddle: "#F8FAFC",
    newsletterEnd: "#F1F5F9",
    newsletterText: "#0F172A",
    buttonColor: "#E11D48",
    footerBg: "#F1F5F9",
    footerText: "#475569",
    footerAccent: "#E11D48",
  },
  {
    id: "royal-indigo-unified",
    name: "Royal Indigo & Slate",
    description: "Cohesive deep indigo atmosphere with electric indigo highlights",
    newsletterStart: "#1E1B4B",
    newsletterMiddle: "#0F172A",
    newsletterEnd: "#060913",
    newsletterText: "#FFFFFF",
    buttonColor: "#6366F1",
    footerBg: "#060913",
    footerText: "#94A3B8",
    footerAccent: "#6366F1",
  },
]

export const SUPPORTED_PAYMENT_METHODS = [
  "VISA",
  "MASTERCARD",
  "PAYPAL",
  "APPLE PAY",
  "GOOGLE PAY",
  "STRIPE",
  "AMEX",
  "CASH ON DELIVERY",
]

/**
 * الإعدادات الافتراضية الكاملة المطابقة للتصميم المرفق (الصورة 1 والصورة 2)
 */
export const DEFAULT_HEADER_FOOTER_SETTINGS: HeaderFooterSettingsConfig = {
  removeFooterBarNotice:
    "In order to remove the default footer bar, please add a custom domain or select one of the packs.",
  mobileHeader: {
    activeItems: ["logo", "search", "user", "cart"],
    hiddenItems: [],
    background: "#FFFFFF",
    buttonsColor: "#000000",
    borderEnabled: true,
    borderColor: "#F0F0F0",
  },
  desktopHeader: {
    activeItems: ["logo", "currency", "language", "search", "user", "cart"],
    hiddenItems: [],
    background: "#FFFFFF",
    buttonsColor: "#111827",
    textColor: "#4B5563",
    activeLinkColor: "#4F46E5",
    borderEnabled: true,
    borderColor: "#F0F0F0",
    sticky: true,
  },
  newsletter: {
    enabled: true,
    badgeText: "NEWSLETTER",
    title: "Join The Club",
    subtitle:
      "Subscribe to our newsletter and get 15% off your first order, plus exclusive early access to new arrivals.",
    highlightDiscount: "15% off",
    inputPlaceholder: "Enter your email address...",
    buttonText: "Subscribe",
    buttonColor: "#FF2D55",
    gradientStart: "#2B0916",
    gradientMiddle: "#0B0F1E",
    gradientEnd: "#040711",
    textColor: "#FFFFFF",
    showGridOverlay: true,
    harmonizeWithFooter: true,
  },
  footer: {
    brandName: "StockBureaux",
    brandLogoUrl: "",
    slogan: "Votre espace de travail, vos règles",
    accentColor: "#4F46E5",
    backgroundColor: "#040711",
    textColor: "#94A3B8",
    exploreTitle: "Explore",
    supportTitle: "Support",
    contactTitle: "Contact Us",
    socialLinks: [
      { id: "soc-fb", code: "FB", label: "Facebook", url: "https://facebook.com", enabled: true },
      { id: "soc-tw", code: "TW", label: "Twitter / X", url: "https://x.com", enabled: true },
      { id: "soc-ig", code: "IG", label: "Instagram", url: "https://instagram.com", enabled: true },
      { id: "soc-yt", code: "YT", label: "YouTube", url: "https://youtube.com", enabled: true },
    ],
    exploreLinks: [
      { id: "exp-1", label: "Home", url: "/store" },
      { id: "exp-2", label: "All Products", url: "/store/products" },
      { id: "exp-3", label: "Categories", url: "/store/categories" },
      { id: "exp-4", label: "About Us", url: "/store/about" },
      { id: "exp-5", label: "Contact Us", url: "/store/contact" },
    ],
    supportLinks: [
      { id: "sup-1", label: "About Us", url: "/store/about" },
      { id: "sup-2", label: "Shipping Policy", url: "/store/shipping" },
      { id: "sup-3", label: "Privacy Policy", url: "/store/privacy" },
      { id: "sup-4", label: "FAQ", url: "/store/faq" },
    ],
    contact: {
      email: "contact@stockbureaux.com",
      phone: "+2126663933445",
      workingHours: "24/7",
    },
    paymentMethods: ["VISA", "MASTERCARD", "PAYPAL", "APPLE PAY"],
    customPaymentBadgeUrl: "",
    copyrightText: "All rights reserved.",
    showSocial: true,
    showPaymentMethods: true,
    showCopyright: true,
  },
  desktopNoticeBar: {
    enabled: false,
    text: "Free express shipping on all orders over $50!",
    linkUrl: "/store/products",
    background: "#BE123C",
    textColor: "#FFFFFF",
  },
  mobileNoticeBar: {
    enabled: false,
    text: "Free express shipping on all orders over $50!",
    linkUrl: "/store/products",
    background: "#BE123C",
    textColor: "#FFFFFF",
  },
}

// ============================================================================
// دوال الأمن السيبراني وتطهير المدخلات (XSS Sanitization & Validation)
// ============================================================================

/**
 * تطهير النصوص من أي وسوم HTML أو سكربتات خبيثة لمنع هجمات XSS قبل العرض أو الحفظ
 */
export function sanitizeText(raw: string | undefined | null, maxLength = 300): string {
  if (!raw || typeof raw !== "string") return ""
  return raw
    // إزالة وسوم <script> ومحتواها بالكامل
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // إزالة أي وسوم HTML أخرى
    .replace(/<\/?[^>]+(>|$)/g, "")
    // إزالة بروتوكولات التنفيذ الخطرة
    .replace(/javascript\s*:/gi, "")
    .replace(/vbscript\s*:/gi, "")
    .replace(/data\s*:\s*text\/html/gi, "")
    // إزالة معالجات الأحداث المضمنة مثل onerror= و onload=
    .replace(/\bon\w+\s*=/gi, "")
    .slice(0, maxLength)
}

/**
 * تطهير الروابط والتحقق من عدم احتوائها على بروتوكولات تنفيذية خبيثة (XSS via href/src)
 */
export function sanitizeUrl(rawUrl: string | undefined | null): string {
  if (!rawUrl || typeof rawUrl !== "string") return "#"
  const trimmed = rawUrl.trim()
  if (!trimmed) return "#"

  // منع البروتوكولات الخطرة مثل javascript: و data:text/html
  const lower = trimmed.toLowerCase().replace(/\s+/g, "")
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("data:text/html") ||
    lower.includes("<script") ||
    lower.includes("onerror=")
  ) {
    return "#"
  }

  return trimmed.slice(0, 500)
}

/**
 * التحقق من صحة صيغة الرابط (يقبل المسارات الداخلية /... أو روابط http/https أو #)
 */
export function isValidUrl(url: string): boolean {
  const trimmed = url.trim()
  if (!trimmed) return false
  if (trimmed === "#" || trimmed.startsWith("/")) {
    return !/[\s<>"'`]/.test(trimmed)
  }
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === "http:" || parsed.protocol === "https:" || parsed.protocol === "mailto:" || parsed.protocol === "tel:"
  } catch {
    return false
  }
}

/**
 * التحقق من صحة كود اللون بصيغة HEX (#RGB أو #RRGGBB)
 */
export function isValidHexColor(color: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color.trim())
}

/**
 * تطهير كود اللون وإرجاع لون افتراضي آمن في حال عدم صحته
 */
export function sanitizeHexColor(color: string | undefined | null, fallback = "#FFFFFF"): string {
  if (!color || typeof color !== "string") return fallback
  const trimmed = color.trim()
  return isValidHexColor(trimmed) ? trimmed.toUpperCase() : fallback
}

/**
 * التحقق من صحة البريد الإلكتروني
 */
export function isValidEmail(email: string): boolean {
  const trimmed = email.trim()
  if (!trimmed) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
}

/**
 * حساب السطوع النسبي للون HEX لمعرفة ما إذا كانت الخلفية فاتحة أم داكنة (لضمان تباين نصوص WCAG)
 */
export function isLightColor(hexColor: string | undefined | null): boolean {
  if (!hexColor || !isValidHexColor(hexColor)) return false
  let hex = hexColor.trim().replace("#", "")
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("")
  }
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  // معادلة YIQ للسطوع الإدراكي
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 150
}

/**
 * التحقق الصارم من نوع وحجم ملف الصورة المرفوع (MIME Type & Size Validation)
 */
export function validateImageMime(file: File, maxSizeMb = 3): { valid: boolean; error?: string } {
  const allowedMimes = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"]
  if (!allowedMimes.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid image format. Allowed formats: PNG, WebP, JPEG, SVG.",
    }
  }
  if (file.size > maxSizeMb * 1024 * 1024) {
    return {
      valid: false,
      error: `Image size exceeds ${maxSizeMb}MB limit.`,
    }
  }
  return { valid: true }
}

/**
 * دمج إعدادات الهيدر والفوتر المحفوظة مع القيم الافتراضية بأمان تام
 */
export function mergeHeaderFooterSettings(
  saved?: Partial<HeaderFooterSettingsConfig> | null
): HeaderFooterSettingsConfig {
  if (!saved || typeof saved !== "object") {
    return structuredClone(DEFAULT_HEADER_FOOTER_SETTINGS)
  }

  return {
    removeFooterBarNotice:
      saved.removeFooterBarNotice || DEFAULT_HEADER_FOOTER_SETTINGS.removeFooterBarNotice,
    mobileHeader: {
      ...DEFAULT_HEADER_FOOTER_SETTINGS.mobileHeader,
      ...(saved.mobileHeader || {}),
      activeItems: Array.isArray(saved.mobileHeader?.activeItems)
        ? saved.mobileHeader.activeItems
        : (saved.mobileHeader as any)?.items
        ? ((saved.mobileHeader as any).items as HeaderItemId[]).filter((i) => i !== "menu")
        : DEFAULT_HEADER_FOOTER_SETTINGS.mobileHeader.activeItems,
      hiddenItems: Array.isArray(saved.mobileHeader?.hiddenItems)
        ? saved.mobileHeader.hiddenItems
        : DEFAULT_HEADER_FOOTER_SETTINGS.mobileHeader.hiddenItems,
    },
    desktopHeader: {
      ...DEFAULT_HEADER_FOOTER_SETTINGS.desktopHeader,
      ...(saved.desktopHeader || {}),
      activeItems: Array.isArray(saved.desktopHeader?.activeItems)
        ? saved.desktopHeader.activeItems
        : DEFAULT_HEADER_FOOTER_SETTINGS.desktopHeader.activeItems,
      hiddenItems: Array.isArray(saved.desktopHeader?.hiddenItems)
        ? saved.desktopHeader.hiddenItems
        : DEFAULT_HEADER_FOOTER_SETTINGS.desktopHeader.hiddenItems,
    },
    newsletter: {
      ...DEFAULT_HEADER_FOOTER_SETTINGS.newsletter,
      ...(saved.newsletter || {}),
    },
    footer: {
      ...DEFAULT_HEADER_FOOTER_SETTINGS.footer,
      ...(saved.footer || {}),
      contact: {
        ...DEFAULT_HEADER_FOOTER_SETTINGS.footer.contact,
        ...(saved.footer?.contact || {}),
      },
      socialLinks: Array.isArray(saved.footer?.socialLinks)
        ? saved.footer.socialLinks
        : DEFAULT_HEADER_FOOTER_SETTINGS.footer.socialLinks,
      exploreLinks: Array.isArray(saved.footer?.exploreLinks)
        ? saved.footer.exploreLinks
        : DEFAULT_HEADER_FOOTER_SETTINGS.footer.exploreLinks,
      supportLinks: Array.isArray(saved.footer?.supportLinks)
        ? saved.footer.supportLinks
        : DEFAULT_HEADER_FOOTER_SETTINGS.footer.supportLinks,
      paymentMethods: Array.isArray(saved.footer?.paymentMethods)
        ? saved.footer.paymentMethods
        : DEFAULT_HEADER_FOOTER_SETTINGS.footer.paymentMethods,
    },
    desktopNoticeBar: {
      ...DEFAULT_HEADER_FOOTER_SETTINGS.desktopNoticeBar,
      ...(saved.desktopNoticeBar || {}),
    },
    mobileNoticeBar: {
      ...DEFAULT_HEADER_FOOTER_SETTINGS.mobileNoticeBar,
      ...(saved.mobileNoticeBar || {}),
    },
  }
}
