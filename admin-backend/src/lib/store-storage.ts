import fs from "fs"
import path from "path"

const DATA_DIR = path.resolve(process.cwd(), "prisma", "store-data")

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

// ---------------------------------------------------------------------------
// 1. STORE PAGES STORAGE
// ---------------------------------------------------------------------------
export interface CustomStorePage {
  id: string
  title: string
  slug: string
  content?: string
  status: "published" | "draft"
  lastUpdated: string
  createdAt?: string
}

const DEFAULT_PAGES: CustomStorePage[] = [
  { id: "p1", title: "About Us", slug: "about-us", content: "Learn about the Smomo brand story, mission and quality commitment.", status: "published", lastUpdated: "2024-10-20" },
  { id: "p2", title: "Privacy Policy", slug: "privacy-policy", content: "Our comprehensive privacy and customer data protection policy.", status: "published", lastUpdated: "2024-10-18" },
  { id: "p3", title: "Terms of Service", slug: "terms-of-service", content: "General terms and conditions for shopping on Smomo store.", status: "published", lastUpdated: "2024-10-15" },
  { id: "p4", title: "Shipping & Delivery", slug: "shipping-delivery", content: "Information regarding international shipping rates and delivery schedules.", status: "published", lastUpdated: "2024-10-12" },
  { id: "p5", title: "Frequently Asked Questions (FAQ)", slug: "faq", content: "Answers to common questions about orders, payments, returns and warranty.", status: "draft", lastUpdated: "2024-10-08" },
]

const PAGES_FILE = path.join(DATA_DIR, "pages.json")

export function getCustomPages(): CustomStorePage[] {
  ensureDirectoryExists()
  if (!fs.existsSync(PAGES_FILE)) {
    fs.writeFileSync(PAGES_FILE, JSON.stringify(DEFAULT_PAGES, null, 2), "utf-8")
    return DEFAULT_PAGES
  }
  try {
    const raw = fs.readFileSync(PAGES_FILE, "utf-8")
    return JSON.parse(raw)
  } catch {
    return DEFAULT_PAGES
  }
}

export function saveCustomPages(pages: CustomStorePage[]): void {
  ensureDirectoryExists()
  fs.writeFileSync(PAGES_FILE, JSON.stringify(pages, null, 2), "utf-8")
}

// ---------------------------------------------------------------------------
// 2. STORE MENUS STORAGE
// ---------------------------------------------------------------------------
export interface MenuItem {
  id: string
  label: string
  url: string
}

export interface StoreMenusConfig {
  header: MenuItem[]
  footer: MenuItem[]
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

const MENUS_FILE = path.join(DATA_DIR, "menus.json")

export function getStoreMenus(): StoreMenusConfig {
  ensureDirectoryExists()
  if (!fs.existsSync(MENUS_FILE)) {
    fs.writeFileSync(MENUS_FILE, JSON.stringify(DEFAULT_MENUS, null, 2), "utf-8")
    return DEFAULT_MENUS
  }
  try {
    const raw = fs.readFileSync(MENUS_FILE, "utf-8")
    return JSON.parse(raw)
  } catch {
    return DEFAULT_MENUS
  }
}

export function saveStoreMenus(menus: StoreMenusConfig): void {
  ensureDirectoryExists()
  fs.writeFileSync(MENUS_FILE, JSON.stringify(menus, null, 2), "utf-8")
}

// ---------------------------------------------------------------------------
// 3. STORE THEME CONFIG STORAGE
// ---------------------------------------------------------------------------
const THEME_FILE = path.join(DATA_DIR, "theme.json")

export function getPersistentThemeConfig(defaultConfig: any): any {
  ensureDirectoryExists()
  if (!fs.existsSync(THEME_FILE)) {
    fs.writeFileSync(THEME_FILE, JSON.stringify(defaultConfig, null, 2), "utf-8")
    return defaultConfig
  }
  try {
    const raw = fs.readFileSync(THEME_FILE, "utf-8")
    return JSON.parse(raw)
  } catch {
    return defaultConfig
  }
}

export function savePersistentThemeConfig(config: any): void {
  ensureDirectoryExists()
  fs.writeFileSync(THEME_FILE, JSON.stringify(config, null, 2), "utf-8")
}

// ---------------------------------------------------------------------------
// 4. STORE FUNNELS STORAGE
// ---------------------------------------------------------------------------
export interface StoreFunnel {
  id: string
  name: string
  status: "Active" | "Draft" | "Archived"
  visitors: number
  conversionRate: string
  revenue: string
  steps: string[]
  createdAt?: string
}

const DEFAULT_FUNNELS: StoreFunnel[] = [
  {
    id: "funnel-1",
    name: "Flash Sale One-Product Funnel",
    status: "Active",
    visitors: 4250,
    conversionRate: "8.4%",
    revenue: "$14,250",
    steps: ["Direct Landing Page", "Express 1-Page Checkout", "Post-Purchase Upsell", "Thank You"],
    createdAt: "2024-10-10",
  },
  {
    id: "funnel-2",
    name: "Holiday VIP Bundle Accelerator",
    status: "Active",
    visitors: 6180,
    conversionRate: "11.2%",
    revenue: "$26,890",
    steps: ["Bundle Offer Page", "Checkout with Coupon", "Fast-Track Shipping Upsell", "Thank You"],
    createdAt: "2024-10-12",
  },
  {
    id: "funnel-3",
    name: "Wireless Audio Campaign",
    status: "Draft",
    visitors: 120,
    conversionRate: "4.1%",
    revenue: "$540",
    steps: ["Product Demo Page", "Checkout", "Warranty Extension", "Thank You"],
    createdAt: "2024-10-14",
  },
]

const FUNNELS_FILE = path.join(DATA_DIR, "funnels.json")

export function getStoreFunnels(): StoreFunnel[] {
  ensureDirectoryExists()
  if (!fs.existsSync(FUNNELS_FILE)) {
    fs.writeFileSync(FUNNELS_FILE, JSON.stringify(DEFAULT_FUNNELS, null, 2), "utf-8")
    return DEFAULT_FUNNELS
  }
  try {
    const raw = fs.readFileSync(FUNNELS_FILE, "utf-8")
    return JSON.parse(raw)
  } catch {
    return DEFAULT_FUNNELS
  }
}

export function saveStoreFunnels(funnels: StoreFunnel[]): void {
  ensureDirectoryExists()
  fs.writeFileSync(FUNNELS_FILE, JSON.stringify(funnels, null, 2), "utf-8")
}

// ---------------------------------------------------------------------------
// 5. STORE APPS & INTEGRATIONS STORAGE
// ---------------------------------------------------------------------------
export interface StoreApp {
  id: string
  name: string
  description: string
  category: string
  installed: boolean
  apiKey?: string
  webhookUrl?: string
  updatedAt?: string
}

const DEFAULT_APPS: StoreApp[] = [
  {
    id: "stripe",
    name: "Stripe Payments",
    description: "Accept credit cards and digital wallets securely on your store.",
    category: "Payment",
    installed: true,
    apiKey: "pk_live_************************",
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    description: "Automate your email marketing and reach out to abandoned carts.",
    category: "Marketing",
    installed: true,
    apiKey: "mc_************************",
  },
  {
    id: "analytics",
    name: "Google Analytics 4",
    description: "Get deeper insights into your store traffic and customer behavior.",
    category: "Analytics",
    installed: false,
    apiKey: "",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Quick Order",
    description: "Let customers checkout directly and talk to customer support via WhatsApp.",
    category: "Support",
    installed: true,
    apiKey: "+966500000000",
  },
  {
    id: "tiktok",
    name: "TikTok Pixel",
    description: "Track conversions and optimize dynamic product ad campaigns on TikTok.",
    category: "Marketing",
    installed: false,
    apiKey: "",
  },
]

const APPS_FILE = path.join(DATA_DIR, "apps.json")

export function getStoreApps(): StoreApp[] {
  ensureDirectoryExists()
  if (!fs.existsSync(APPS_FILE)) {
    fs.writeFileSync(APPS_FILE, JSON.stringify(DEFAULT_APPS, null, 2), "utf-8")
    return DEFAULT_APPS
  }
  try {
    const raw = fs.readFileSync(APPS_FILE, "utf-8")
    return JSON.parse(raw)
  } catch {
    return DEFAULT_APPS
  }
}

export function saveStoreApps(apps: StoreApp[]): void {
  ensureDirectoryExists()
  fs.writeFileSync(APPS_FILE, JSON.stringify(apps, null, 2), "utf-8")
}

// ---------------------------------------------------------------------------
// 6. STORE LANGUAGES & LOCALIZATION STORAGE
// ---------------------------------------------------------------------------
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
  {
    code: "es",
    name: "Spanish (Español)",
    nativeName: "Español",
    direction: "LTR",
    isDefault: false,
    enabled: false,
    completion: 80,
    flag: "🇪🇸",
  },
]

const LANGUAGES_FILE = path.join(DATA_DIR, "languages.json")

export function getStoreLanguages(): StoreLanguageItem[] {
  ensureDirectoryExists()
  if (!fs.existsSync(LANGUAGES_FILE)) {
    fs.writeFileSync(LANGUAGES_FILE, JSON.stringify(DEFAULT_LANGUAGES, null, 2), "utf-8")
    return DEFAULT_LANGUAGES
  }
  try {
    const raw = fs.readFileSync(LANGUAGES_FILE, "utf-8")
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_LANGUAGES
  } catch {
    return DEFAULT_LANGUAGES
  }
}

export function saveStoreLanguages(languages: StoreLanguageItem[]): void {
  ensureDirectoryExists()
  fs.writeFileSync(LANGUAGES_FILE, JSON.stringify(languages, null, 2), "utf-8")
}

// ---------------------------------------------------------------------------
// 7. USER PERMISSIONS & CUSTOM ROLES STORAGE
// ---------------------------------------------------------------------------
import {
  type PermissionKey,
  type UserRoleType,
  type UserPermissionRecord,
  ALL_PERMISSIONS,
  ROLE_DEFAULT_PERMISSIONS,
} from "./permissions-config"

export {
  type PermissionKey,
  type UserRoleType,
  type UserPermissionRecord,
  ALL_PERMISSIONS,
  ROLE_DEFAULT_PERMISSIONS,
}

const USER_PERMISSIONS_FILE = path.join(DATA_DIR, "user-permissions.json")

export function getUserPermissionsMap(): Record<string, UserPermissionRecord> {
  ensureDirectoryExists()
  if (!fs.existsSync(USER_PERMISSIONS_FILE)) {
    fs.writeFileSync(USER_PERMISSIONS_FILE, JSON.stringify({}, null, 2), "utf-8")
    return {}
  }
  try {
    const raw = fs.readFileSync(USER_PERMISSIONS_FILE, "utf-8")
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

export function saveUserPermissionsMap(map: Record<string, UserPermissionRecord>): void {
  ensureDirectoryExists()
  fs.writeFileSync(USER_PERMISSIONS_FILE, JSON.stringify(map, null, 2), "utf-8")
}

export function getUserPermissions(userId: string, dbRole: string = "USER"): UserPermissionRecord {
  const map = getUserPermissionsMap()
  if (map[userId]) {
    return map[userId]
  }
  const normalizedRole: UserRoleType =
    dbRole === "ADMIN" || dbRole === "MANAGER" || dbRole === "EDITOR" || dbRole === "SUPPORT"
      ? (dbRole as UserRoleType)
      : "USER"
  return {
    userId,
    roleLabel: normalizedRole,
    permissions: ROLE_DEFAULT_PERMISSIONS[normalizedRole] || ["view_products"],
    updatedAt: new Date().toISOString(),
  }
}

export function setUserPermissions(
  userId: string,
  permissions: PermissionKey[],
  roleLabel: UserRoleType = "USER"
): UserPermissionRecord {
  const map = getUserPermissionsMap()
  const record: UserPermissionRecord = {
    userId,
    roleLabel,
    permissions: Array.from(new Set(permissions)),
    updatedAt: new Date().toISOString(),
  }
  map[userId] = record
  saveUserPermissionsMap(map)
  return record
}

export function deleteUserPermissions(userId: string): void {
  const map = getUserPermissionsMap()
  if (map[userId]) {
    delete map[userId]
    saveUserPermissionsMap(map)
  }
}

// ---------------------------------------------------------------------------
// 8. STOREFRONT HERO SECTION STORAGE
// ---------------------------------------------------------------------------
import {
  type HeroSectionData,
  DEFAULT_HERO_SECTION,
} from "./hero-config"

export { type HeroSectionData, DEFAULT_HERO_SECTION }

const HERO_FILE = path.join(DATA_DIR, "hero.json")

export function getStoreHeroSection(): HeroSectionData {
  ensureDirectoryExists()
  if (!fs.existsSync(HERO_FILE)) {
    fs.writeFileSync(HERO_FILE, JSON.stringify(DEFAULT_HERO_SECTION, null, 2), "utf-8")
    return DEFAULT_HERO_SECTION
  }
  try {
    const raw = fs.readFileSync(HERO_FILE, "utf-8")
    const parsed = JSON.parse(raw)
    return {
      ...DEFAULT_HERO_SECTION,
      ...(parsed && typeof parsed === "object" ? parsed : {}),
    }
  } catch {
    return DEFAULT_HERO_SECTION
  }
}

export function saveStoreHeroSection(data: Partial<HeroSectionData>): HeroSectionData {
  ensureDirectoryExists()
  const current = getStoreHeroSection()
  const updated: HeroSectionData = {
    ...current,
    ...data,
    id: "default_hero",
    updatedAt: new Date().toISOString(),
  }
  fs.writeFileSync(HERO_FILE, JSON.stringify(updated, null, 2), "utf-8")
  return updated
}
