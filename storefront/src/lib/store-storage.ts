import fs from "fs"
import path from "path"

// قراءة بيانات المتجر المشتركة مباشرة من مجلد admin-backend/prisma/store-data لضمان المزامنة الفورية
function resolveSharedDataDir(): string {
  const sharedDir = path.resolve(process.cwd(), "..", "admin-backend", "prisma", "store-data")
  if (fs.existsSync(sharedDir)) {
    return sharedDir
  }
  const localDir = path.resolve(process.cwd(), "prisma", "store-data")
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true })
  }
  return localDir
}

export interface CustomStorePage {
  id: string
  title: string
  slug: string
  content?: string
  status: "published" | "draft" | "Published" | "Draft"
  lastUpdated?: string
  updatedAt?: string
  createdAt?: string
}

export interface MenuItem {
  id: string
  label: string
  url: string
  order?: number
}

export type StoreMenuItem = MenuItem

export interface StoreMenusConfig {
  header: MenuItem[]
  footer: MenuItem[]
}

export interface StoreLanguageItem {
  code: string
  name: string
  nativeName: string
  direction: "RTL" | "LTR"
  isDefault: boolean
  enabled: boolean
  completion: number
  flag: string
}

const DEFAULT_MENUS: StoreMenusConfig = {
  header: [
    { id: "m1", label: "Home", url: "/store" },
    { id: "m2", label: "All Products", url: "/store/products" },
    { id: "m3", label: "Categories", url: "/store/categories" },
    { id: "m4", label: "About Us", url: "/store/about" },
    { id: "m5", label: "Contact Us", url: "/store/contact" },
  ],
  footer: [
    { id: "f1", label: "About Us", url: "/store/about" },
    { id: "f2", label: "Shipping Policy", url: "/store/shipping" },
    { id: "f3", label: "Privacy Policy", url: "/store/privacy" },
    { id: "f4", label: "FAQ", url: "/store/faq" },
  ],
}

const DEFAULT_LANGUAGES: StoreLanguageItem[] = [
  {
    code: "ar",
    name: "Arabic (العربية)",
    nativeName: "العربية",
    direction: "RTL",
    isDefault: true,
    enabled: true,
    completion: 100,
    flag: "🇸🇦",
  },
  {
    code: "en",
    name: "English (US)",
    nativeName: "English (US)",
    direction: "LTR",
    isDefault: false,
    enabled: true,
    completion: 100,
    flag: "🇺🇸",
  },
  {
    code: "fr",
    name: "French (Français)",
    nativeName: "Français",
    direction: "LTR",
    isDefault: false,
    enabled: true,
    completion: 96,
    flag: "🇫🇷",
  },
]

export function getStoreMenus(): StoreMenusConfig {
  try {
    const file = path.join(resolveSharedDataDir(), "menus.json")
    if (!fs.existsSync(file)) return DEFAULT_MENUS
    return JSON.parse(fs.readFileSync(file, "utf-8"))
  } catch {
    return DEFAULT_MENUS
  }
}

export function getCustomPages(): CustomStorePage[] {
  try {
    const file = path.join(resolveSharedDataDir(), "pages.json")
    if (!fs.existsSync(file)) return []
    return JSON.parse(fs.readFileSync(file, "utf-8"))
  } catch {
    return []
  }
}

export function getPersistentThemeConfig(defaultConfig: any = {}): any {
  try {
    const file = path.join(resolveSharedDataDir(), "theme.json")
    if (!fs.existsSync(file)) return defaultConfig
    return JSON.parse(fs.readFileSync(file, "utf-8"))
  } catch {
    return defaultConfig
  }
}

export function savePersistentThemeConfig(config: any): void {
  const dir = resolveSharedDataDir()
  const file = path.join(dir, "theme.json")
  fs.writeFileSync(file, JSON.stringify(config, null, 2), "utf-8")
}

export function getStoreLanguages(): StoreLanguageItem[] {
  try {
    const file = path.join(resolveSharedDataDir(), "languages.json")
    if (!fs.existsSync(file)) return DEFAULT_LANGUAGES
    const parsed = JSON.parse(fs.readFileSync(file, "utf-8"))
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_LANGUAGES
  } catch {
    return DEFAULT_LANGUAGES
  }
}

export interface HeroSectionData {
  id: string
  badgeText: string
  title: string
  highlightText: string
  subtitle: string
  buttonText: string
  buttonUrl: string
  secondaryButtonText: string
  secondaryButtonUrl: string
  imagePath: string
  backgroundColor: string
  accentColor: string
  textColor: string
  floatingBadgeValue: string
  floatingBadgeLabel: string
  showFloatingBadge: boolean
  showTrustBadges: boolean
  isActive: boolean
  updatedAt?: string
}

export const DEFAULT_HERO_SECTION: HeroSectionData = {
  id: "default_hero",
  badgeText: "Premium E-Commerce Experience",
  title: "Elevate Your",
  highlightText: "Lifestyle.",
  subtitle:
    "Discover our curated collection of premium products. Experience fast shipping, secure payments, and unparalleled quality.",
  buttonText: "Shop Collection",
  buttonUrl: "/store/products",
  secondaryButtonText: "Browse Categories",
  secondaryButtonUrl: "/store/categories",
  imagePath: "/hero_products.png",
  backgroundColor: "#ffffff",
  accentColor: "#ff2d55",
  textColor: "#111827",
  floatingBadgeValue: "10k+",
  floatingBadgeLabel: "Happy Customers",
  showFloatingBadge: true,
  showTrustBadges: true,
  isActive: true,
}

export function getStoreHeroSection(): HeroSectionData {
  try {
    const file = path.join(resolveSharedDataDir(), "hero.json")
    if (!fs.existsSync(file)) return DEFAULT_HERO_SECTION
    const parsed = JSON.parse(fs.readFileSync(file, "utf-8"))
    return {
      ...DEFAULT_HERO_SECTION,
      ...(parsed && typeof parsed === "object" ? parsed : {}),
    }
  } catch {
    return DEFAULT_HERO_SECTION
  }
}

