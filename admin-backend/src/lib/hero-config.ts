import { z } from "zod"

/**
 * هيكل بيانات قسم الهيرو (Hero Section Schema & Types)
 * ملف آمن للاستخدام في كل من الواجهة الأمامية (Client) والخلفية (Server) بدون الاعتماد على Node fs
 */
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
  updatedAt: new Date().toISOString(),
}

// الامتدادات والأنواع المسموحة لصور الهيرو
export const ALLOWED_HERO_IMAGE_TYPES = [
  "image/webp",
  "image/png",
  "image/jpeg",
  "image/jpg",
] as const

export const ALLOWED_HERO_IMAGE_EXTENSIONS = [".webp", ".png", ".jpg", ".jpeg"] as const

export const MAX_HERO_IMAGE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

// التحقق من صحة الرابط (يدعم الروابط الكاملة https:// أو المسارات الداخلية التي تبدأ بـ /)
export function isValidHeroUrlOrPath(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !/\s/.test(trimmed)) {
    return true
  }
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

/**
 * مخطط التحقق الصارم (Strict Zod Validation Schema) لبيانات قسم الهيرو
 */
export const heroSectionValidationSchema = z.object({
  badgeText: z
    .string()
    .trim()
    .max(60, "نص الشارة العلوية يجب ألا يتجاوز 60 حرفاً")
    .optional()
    .or(z.literal("")),
  title: z
    .string()
    .trim()
    .min(2, "العنوان الرئيسي مطلوب ويجب أن يتكون من حرفين على الأقل")
    .max(80, "العنوان الرئيسي يجب ألا يتجاوز 80 حرفاً"),
  highlightText: z
    .string()
    .trim()
    .max(50, "النص المميز يجب ألا يتجاوز 50 حرفاً")
    .optional()
    .or(z.literal("")),
  subtitle: z
    .string()
    .trim()
    .min(10, "العنوان الفرعي يجب أن يتكون من 10 أحرف على الأقل")
    .max(260, "العنوان الفرعي يجب ألا يتجاوز 260 حرفاً"),
  buttonText: z
    .string()
    .trim()
    .min(2, "نص الزر الرئيسي مطلوب (حرفان على الأقل)")
    .max(40, "نص الزر الرئيسي يجب ألا يتجاوز 40 حرفاً"),
  buttonUrl: z
    .string()
    .trim()
    .min(1, "رابط الزر الرئيسي مطلوب")
    .max(255, "الرابط طويل جداً")
    .refine(
      isValidHeroUrlOrPath,
      "يجب إدخال رابط URL صحيح (مثل https://...) أو مسار يبدأ بـ / (مثل /store/products)"
    ),
  secondaryButtonText: z
    .string()
    .trim()
    .max(40, "نص الزر الثانوي يجب ألا يتجاوز 40 حرفاً")
    .optional()
    .or(z.literal("")),
  secondaryButtonUrl: z
    .string()
    .trim()
    .max(255, "الرابط الثانوي طويل جداً")
    .refine(
      (val) => !val || isValidHeroUrlOrPath(val),
      "يجب إدخال رابط URL صحيح أو مسار يبدأ بـ / (مثل /store/categories)"
    )
    .optional()
    .or(z.literal("")),
  imagePath: z
    .string()
    .trim()
    .min(1, "مسار صورة الهيرو مطلوب")
    .refine(
      (val) =>
        val.startsWith("/") ||
        val.startsWith("http://") ||
        val.startsWith("https://") ||
        val.startsWith("data:image/"),
      "مسار الصورة غير صالح"
    ),
  backgroundColor: z
    .string()
    .trim()
    .regex(HEX_COLOR_REGEX, "لون الخلفية يجب أن يكون بصيغة Hex صحيحة (مثال: #ffffff)"),
  accentColor: z
    .string()
    .trim()
    .regex(HEX_COLOR_REGEX, "لون التمييز يجب أن يكون بصيغة Hex صحيحة (مثال: #ff2d55)"),
  textColor: z
    .string()
    .trim()
    .regex(HEX_COLOR_REGEX, "لون النص يجب أن يكون بصيغة Hex صحيحة (مثال: #111827)"),
  floatingBadgeValue: z
    .string()
    .trim()
    .max(15, "قيمة الشارة العائمة يجب ألا تتجاوز 15 حرفاً")
    .optional()
    .or(z.literal("")),
  floatingBadgeLabel: z
    .string()
    .trim()
    .max(40, "عنوان الشارة العائمة يجب ألا يتجاوز 40 حرفاً")
    .optional()
    .or(z.literal("")),
  showFloatingBadge: z.boolean().default(true),
  showTrustBadges: z.boolean().default(true),
  isActive: z.boolean().default(true),
})

export type HeroSectionFormValues = z.infer<typeof heroSectionValidationSchema>
