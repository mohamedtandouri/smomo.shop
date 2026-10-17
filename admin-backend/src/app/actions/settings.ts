"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"
import { z } from "zod"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// دالة مساعدة لحفظ الصور المرفوعة (مثل الشعار) مع التحقق الأمني
async function saveLogoFile(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null
  if (file.size > MAX_FILE_SIZE) {
    console.error("Logo file exceeds size limit (5MB)")
    return null
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    console.error("Disallowed logo MIME type:", file.type)
    return null
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const extMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  }
  const ext = extMap[file.type] || "png"
  const filename = `logo-${uuidv4()}.${ext}`
  const uploadDir = join(process.cwd(), 'public', 'uploads')

  try {
    await mkdir(uploadDir, { recursive: true })
    await writeFile(join(uploadDir, filename), buffer)

    // نسخ الشعار المرفوع أيضاً إلى مجلد public/uploads الخاص بواجهة المتجر (storefront) لضمان ظهوره فوراً
    try {
      const storefrontUploadDir = join(process.cwd(), "..", "storefront", "public", "uploads")
      await mkdir(storefrontUploadDir, { recursive: true })
      await writeFile(join(storefrontUploadDir, filename), buffer)
    } catch {
      // تجاهل الخطأ في حال عدم وجود مجلد المتجر المنفصل
    }

    return `/uploads/${filename}`
  } catch (error) {
    console.error("Error saving logo file:", error)
    return null
  }
}

// مخطط التحقق Zod لإعدادات المتجر
const StoreSettingsSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  storeDescription: z.string().optional().nullable(),
  contactEmail: z.string().email().optional().or(z.literal("")).nullable(),
  contactPhone: z.string().optional().nullable(),
  currency: z.string().min(1).max(5),
  primaryColor: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Invalid HEX color format"),
  secondaryColor: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Invalid HEX color format"),
  accentColor: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Invalid HEX color format"),
  announcementActive: z.boolean(),
  announcementText: z.string().optional().nullable(),
  announcementUrl: z.string().optional().nullable(),
  isMaintenanceMode: z.boolean(),
})

// جلب إعدادات المتجر الحالية أو إنشاء السجل الافتراضي
export async function getStoreSettings() {
  try {
    let settings = await prisma.storeSettings.findUnique({
      where: { id: "store_config" }
    })

    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {
          id: "store_config",
          storeName: "Smomo",
          storeDescription: "Your premium online store",
          primaryColor: "#ff2d55",
          secondaryColor: "#111827",
          accentColor: "#3b82f6",
          currency: "USD",
          contactEmail: "contact@smomo.shop",
          contactPhone: "+1 (555) 000-0000",
          announcementActive: true,
          announcementText: "Welcome to Smomo! Enjoy free express shipping on orders over $50.",
          announcementUrl: "/store/products",
          isMaintenanceMode: false,
        }
      })
    }

    return settings
  } catch (error) {
    console.error("Error fetching store settings:", error)
    // Fallback default
    return {
      id: "store_config",
      storeName: "Smomo",
      storeDescription: "Your premium online store",
      logoUrl: null,
      faviconUrl: null,
      primaryColor: "#ff2d55",
      secondaryColor: "#111827",
      accentColor: "#3b82f6",
      currency: "USD",
      contactEmail: "contact@smomo.shop",
      contactPhone: "+1 (555) 000-0000",
      announcementActive: false,
      announcementText: "",
      announcementUrl: "/store/products",
      isMaintenanceMode: false,
      updatedAt: new Date()
    }
  }
}

// تحديث إعدادات المتجر من لوحة التحكم
export async function updateStoreSettings(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user || (session.user as any).role !== "ADMIN") {
    return { success: false, error: "غير مصرح: يجب تسجيل الدخول كمسؤول." }
  }

  try {
    const rawData = {
      storeName: formData.get("storeName") as string,
      storeDescription: (formData.get("storeDescription") as string) || null,
      contactEmail: (formData.get("contactEmail") as string) || null,
      contactPhone: (formData.get("contactPhone") as string) || null,
      currency: (formData.get("currency") as string) || "USD",
      primaryColor: (formData.get("primaryColor") as string) || "#ff2d55",
      secondaryColor: (formData.get("secondaryColor") as string) || "#111827",
      accentColor: (formData.get("accentColor") as string) || "#3b82f6",
      announcementActive: formData.get("announcementActive") === "true",
      announcementText: (formData.get("announcementText") as string) || null,
      announcementUrl: (formData.get("announcementUrl") as string) || "/store/products",
      isMaintenanceMode: formData.get("isMaintenanceMode") === "true",
    }

    const validation = StoreSettingsSchema.safeParse(rawData)
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message || "Invalid input data" }
    }

    // فحص رفع ملف شعار جديد
    const logoFile = formData.get("logo") as File | null
    let logoUrl = formData.get("logoUrl") as string | null

    if (logoFile && logoFile.size > 0) {
      const uploadedUrl = await saveLogoFile(logoFile)
      if (uploadedUrl) {
        logoUrl = uploadedUrl
      }
    }

    const updated = await prisma.storeSettings.upsert({
      where: { id: "store_config" },
      update: {
        ...validation.data,
        ...(logoUrl !== undefined ? { logoUrl } : {})
      },
      create: {
        id: "store_config",
        ...validation.data,
        logoUrl
      }
    })

    // إبطال الكاش فورياً لتنعكس التعديلات على المتجر واللوحة
    revalidatePath("/store")
    revalidatePath("/store", "layout")
    revalidatePath("/admin/settings")

    return { success: true, settings: updated }
  } catch (error: any) {
    console.error("Error updating store settings:", error)
    return { success: false, error: error.message || "Failed to update store settings" }
  }
}

// تحديث ملف المستخدم الشخصي - محمي ضد ثغرة IDOR بالاعتماد على معرف الجلسة
export async function updateProfileSettings(
  _clientUserId: string, 
  data: { 
    name: string
    phone?: string
    address?: string
    city?: string
    zipCode?: string
    country?: string
  }
) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user || !session.user.id) {
    return { error: "غير مصرح: يرجى تسجيل الدخول أولاً" }
  }

  const authenticatedUserId = session.user.id

  try {
    await prisma.user.update({
      where: { id: authenticatedUserId },
      data: {
        name: data.name,
        phone: data.phone,
        profile: {
          upsert: {
            create: {
              address: data.address,
              city: data.city,
              zipCode: data.zipCode,
              country: data.country,
            },
            update: {
              address: data.address,
              city: data.city,
              zipCode: data.zipCode,
              country: data.country,
            }
          }
        }
      }
    })

    revalidatePath("/store/dashboard/settings")
    return { success: true }
  } catch (error) {
    console.error("Error updating profile settings:", error)
    return { error: "Failed to update profile settings" }
  }
}
