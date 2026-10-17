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

