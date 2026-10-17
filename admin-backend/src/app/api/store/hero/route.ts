import { NextRequest, NextResponse } from "next/server"
import path from "path"
import fs from "fs"
import { randomUUID } from "crypto"
import { db } from "@/lib/db"
import { requireAdminSession } from "@/lib/auth-guard"
import {
  getStoreHeroSection,
  saveStoreHeroSection,
  DEFAULT_HERO_SECTION,
  type HeroSectionData,
} from "@/lib/store-storage"
import {
  heroSectionValidationSchema,
  ALLOWED_HERO_IMAGE_TYPES,
  ALLOWED_HERO_IMAGE_EXTENSIONS,
  MAX_HERO_IMAGE_SIZE_BYTES,
} from "@/lib/hero-config"

export const dynamic = "force-dynamic"

/**
 * معالجة وتحسين صورة قسم الهيرو تلقائياً باستخدام مكتبة sharp
 * - التحقق من الامتداد والنوع والحجم
 * - تصغير الأبعاد القصوى إلى 1200x1000 مع الحفاظ على نسبة العرض للطول
 * - تحويل الصورة إلى صيغة WebP عالية الأداء لتقليل وقت تحميل الواجهة الأمامية
 * - حفظ الصورة في مجلدات public الخاصة بلوحة التحكم والمتجر معاً
 */
async function processAndSaveHeroImage(file: File): Promise<{
  imagePath: string
  optimization: {
    originalSize: number
    optimizedSize: number
    savedPercent: number
    width?: number
    height?: number
    format: string
  }
}> {
  // 1. التحقق من نوع الملف (MIME Type)
  if (
    !ALLOWED_HERO_IMAGE_TYPES.includes(
      file.type as (typeof ALLOWED_HERO_IMAGE_TYPES)[number]
    )
  ) {
    throw new Error(
      "صيغة الصورة غير مدعومة. يرجى رفع صورة بصيغة WebP أو PNG أو JPEG فقط."
    )
  }

  // 2. التحقق من الامتداد
  const originalExt = path.extname(file.name || "").toLowerCase()
  if (
    originalExt &&
    !ALLOWED_HERO_IMAGE_EXTENSIONS.includes(
      originalExt as (typeof ALLOWED_HERO_IMAGE_EXTENSIONS)[number]
    )
  ) {
    throw new Error(
      "امتداد الملف غير مسموح به. الامتدادات المسموحة: .webp, .png, .jpg, .jpeg"
    )
  }

  // 3. التحقق من الحجم الأقصى (5MB)
  if (file.size > MAX_HERO_IMAGE_SIZE_BYTES) {
    throw new Error("حجم الصورة يتجاوز الحد الأقصى المسموح به (5 ميجابايت).")
  }

  const rawBuffer = Buffer.from(await file.arrayBuffer())
  const originalSize = rawBuffer.byteLength

  let outputBuffer: Buffer = rawBuffer
  let outputExt = ".webp"
  let width: number | undefined
  let height: number | undefined

  // 4. ضغط وتحسين الصورة تلقائياً عبر مكتبة sharp إلى WebP
  try {
    const sharpModule = await import("sharp")
    const sharp = sharpModule.default || sharpModule
    const pipeline = sharp(rawBuffer)
      .rotate() // تصحيح الاتجاه التلقائي من EXIF
      .resize({
        width: 1200,
        height: 1000,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: 85,
        effort: 4,
      })

    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true })
    outputBuffer = data
    width = info.width
    height = info.height
    outputExt = ".webp"
  } catch (sharpErr) {
    console.warn("Sharp optimization fallback:", sharpErr)
    outputExt = originalExt || ".png"
  }

  const fileName = `hero-${Date.now()}-${randomUUID().slice(0, 8)}${outputExt}`
  const relativeUrl = `/uploads/hero/${fileName}`

  // حفظ الصورة المحسنة في مجلد public الخاص بلوحة التحكم (3000) والمتجر (3001)
  const targetPublicDirs = [
    path.resolve(process.cwd(), "public", "uploads", "hero"),
    path.resolve(process.cwd(), "..", "storefront", "public", "uploads", "hero"),
    path.resolve(process.cwd(), "..", "public", "uploads", "hero"),
  ]

  for (const dir of targetPublicDirs) {
    try {
      const parentPublic = path.dirname(path.dirname(dir))
      if (fs.existsSync(parentPublic)) {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true })
        }
        fs.writeFileSync(path.join(dir, fileName), outputBuffer)
      }
    } catch (writeErr) {
      console.warn(`Could not write hero image to ${dir}:`, writeErr)
    }
  }

  const optimizedSize = outputBuffer.byteLength
  const savedPercent =
    originalSize > 0
      ? Math.max(0, Math.round(((originalSize - optimizedSize) / originalSize) * 100))
      : 0

  return {
    imagePath: relativeUrl,
    optimization: {
      originalSize,
      optimizedSize,
      savedPercent,
      width,
      height,
      format: outputExt.replace(".", ""),
    },
  }
}

/**
 * مزامنة بيانات الهيرو مع قاعدة البيانات (Prisma HeroSection) إن وجدت
 */
async function syncHeroWithDatabase(heroData: HeroSectionData) {
  try {
    const prismaAny = db as any
    if (prismaAny.heroSection && typeof prismaAny.heroSection.upsert === "function") {
      await prismaAny.heroSection.upsert({
        where: { id: "default_hero" },
        update: {
          badgeText: heroData.badgeText,
          title: heroData.title,
          highlightText: heroData.highlightText,
          subtitle: heroData.subtitle,
          buttonText: heroData.buttonText,
          buttonUrl: heroData.buttonUrl,
          secondaryButtonText: heroData.secondaryButtonText,
          secondaryButtonUrl: heroData.secondaryButtonUrl,
          imagePath: heroData.imagePath,
          backgroundColor: heroData.backgroundColor,
          accentColor: heroData.accentColor,
          textColor: heroData.textColor,
          floatingBadgeValue: heroData.floatingBadgeValue,
          floatingBadgeLabel: heroData.floatingBadgeLabel,
          showFloatingBadge: heroData.showFloatingBadge,
          showTrustBadges: heroData.showTrustBadges,
          isActive: heroData.isActive,
        },
        create: {
          id: "default_hero",
          badgeText: heroData.badgeText,
          title: heroData.title,
          highlightText: heroData.highlightText,
          subtitle: heroData.subtitle,
          buttonText: heroData.buttonText,
          buttonUrl: heroData.buttonUrl,
          secondaryButtonText: heroData.secondaryButtonText,
          secondaryButtonUrl: heroData.secondaryButtonUrl,
          imagePath: heroData.imagePath,
          backgroundColor: heroData.backgroundColor,
          accentColor: heroData.accentColor,
          textColor: heroData.textColor,
          floatingBadgeValue: heroData.floatingBadgeValue,
          floatingBadgeLabel: heroData.floatingBadgeLabel,
          showFloatingBadge: heroData.showFloatingBadge,
          showTrustBadges: heroData.showTrustBadges,
          isActive: heroData.isActive,
        },
      })
    }
  } catch {
    // في حال عدم توليد جدول HeroSection بعد، يتم الاعتماد على التخزين المشترك في hero.json
  }
}

/**
 * GET /api/store/hero
 * جلب البيانات الحالية لقسم الهيرو في الواجهة الأمامية
 */
export async function GET() {
  try {
    const hero = getStoreHeroSection()
    return NextResponse.json({
      success: true,
      hero,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "فشل جلب بيانات قسم الهيرو",
      },
      { status: 500 }
    )
  }
}

/**
 * معالج مشترك لطلبات التحديث PUT و PATCH
 * محمي بصلاحيات المسؤول (requireAdminSession) ويدعم رفع الصور ومعالجتها والتحقق الصارم
 */
async function handleUpdateHero(request: NextRequest) {
  // 1. التحقق من صلاحية المسؤول (Middleware / Session Authentication)
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response!

  try {
    const contentType = request.headers.get("content-type") || ""
    const currentHero = getStoreHeroSection()

    let rawPayload: Record<string, any> = {}
    let optimizationResult: any = null

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()

      // فحص ما إذا كان الطلب لإعادة التعيين للافتراضي
      if (formData.get("action") === "reset") {
        const resetHero = saveStoreHeroSection(DEFAULT_HERO_SECTION)
        await syncHeroWithDatabase(resetHero)
        return NextResponse.json({
          success: true,
          message: "تمت استعادة الإعدادات الافتراضية لقسم الهيرو بنجاح",
          hero: resetHero,
        })
      }

      // معالجة الصورة المرفوعة إن وجدت
      const uploadedFile = formData.get("image")
      let resolvedImagePath =
        (formData.get("imagePath") as string)?.trim() || currentHero.imagePath

      if (uploadedFile && uploadedFile instanceof File && uploadedFile.size > 0) {
        const processed = await processAndSaveHeroImage(uploadedFile)
        resolvedImagePath = processed.imagePath
        optimizationResult = processed.optimization
      }

      rawPayload = {
        badgeText:
          formData.get("badgeText") !== null
            ? String(formData.get("badgeText"))
            : currentHero.badgeText,
        title:
          formData.get("title") !== null
            ? String(formData.get("title"))
            : currentHero.title,
        highlightText:
          formData.get("highlightText") !== null
            ? String(formData.get("highlightText"))
            : currentHero.highlightText,
        subtitle:
          formData.get("subtitle") !== null
            ? String(formData.get("subtitle"))
            : currentHero.subtitle,
        buttonText:
          formData.get("buttonText") !== null
            ? String(formData.get("buttonText"))
            : currentHero.buttonText,
        buttonUrl:
          formData.get("buttonUrl") !== null
            ? String(formData.get("buttonUrl"))
            : currentHero.buttonUrl,
        secondaryButtonText:
          formData.get("secondaryButtonText") !== null
            ? String(formData.get("secondaryButtonText"))
            : currentHero.secondaryButtonText,
        secondaryButtonUrl:
          formData.get("secondaryButtonUrl") !== null
            ? String(formData.get("secondaryButtonUrl"))
            : currentHero.secondaryButtonUrl,
        imagePath: resolvedImagePath,
        backgroundColor:
          formData.get("backgroundColor") !== null
            ? String(formData.get("backgroundColor"))
            : currentHero.backgroundColor,
        accentColor:
          formData.get("accentColor") !== null
            ? String(formData.get("accentColor"))
            : currentHero.accentColor,
        textColor:
          formData.get("textColor") !== null
            ? String(formData.get("textColor"))
            : currentHero.textColor,
        floatingBadgeValue:
          formData.get("floatingBadgeValue") !== null
            ? String(formData.get("floatingBadgeValue"))
            : currentHero.floatingBadgeValue,
        floatingBadgeLabel:
          formData.get("floatingBadgeLabel") !== null
            ? String(formData.get("floatingBadgeLabel"))
            : currentHero.floatingBadgeLabel,
        showFloatingBadge:
          formData.get("showFloatingBadge") !== null
            ? formData.get("showFloatingBadge") === "true"
            : currentHero.showFloatingBadge,
        showTrustBadges:
          formData.get("showTrustBadges") !== null
            ? formData.get("showTrustBadges") === "true"
            : currentHero.showTrustBadges,
        isActive:
          formData.get("isActive") !== null
            ? formData.get("isActive") === "true"
            : currentHero.isActive,
      }
    } else {
      const body = await request.json()

      if (body.action === "reset") {
        const resetHero = saveStoreHeroSection(DEFAULT_HERO_SECTION)
        await syncHeroWithDatabase(resetHero)
        return NextResponse.json({
          success: true,
          message: "تمت استعادة الإعدادات الافتراضية لقسم الهيرو بنجاح",
          hero: resetHero,
        })
      }

      rawPayload = {
        ...currentHero,
        ...(body.hero || body),
      }
    }

    // 2. التحقق الصارم من المدخلات عبر Zod
    const parsed = heroSectionValidationSchema.safeParse(rawPayload)
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      const firstError =
        parsed.error.issues[0]?.message || "البيانات المدخلة غير صالحة"
      return NextResponse.json(
        {
          success: false,
          error: firstError,
          errors: fieldErrors,
        },
        { status: 400 }
      )
    }

    // 3. حفظ البيانات في التخزين المشترك وقاعدة البيانات
    const updatedHero = saveStoreHeroSection({
      ...parsed.data,
      badgeText: parsed.data.badgeText || "",
      highlightText: parsed.data.highlightText || "",
      secondaryButtonText: parsed.data.secondaryButtonText || "",
      secondaryButtonUrl: parsed.data.secondaryButtonUrl || "",
      floatingBadgeValue: parsed.data.floatingBadgeValue || "",
      floatingBadgeLabel: parsed.data.floatingBadgeLabel || "",
    })

    await syncHeroWithDatabase(updatedHero)

    // 4. تسجيل العملية في سجل الأمان (Security Audit Log)
    try {
      await db.securityLog.create({
        data: {
          eventType: "HERO_SECTION_UPDATED",
          severity: "INFO",
          ipAddress: "admin-panel",
          email: auth.user?.email || "admin@smomo.shop",
          details: `Updated Hero Section: "${updatedHero.title} ${updatedHero.highlightText}"`,
        },
      })
    } catch {
      // تجاهل خطأ السجل إذا لم يكن متوفراً
    }

    return NextResponse.json({
      success: true,
      message: "تم تحديث قسم الهيرو وحفظ التغييرات بنجاح",
      hero: updatedHero,
      optimization: optimizationResult,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "حدث خطأ أثناء تحديث بيانات قسم الهيرو",
      },
      { status: 400 }
    )
  }
}

export async function PUT(request: NextRequest) {
  return handleUpdateHero(request)
}

export async function PATCH(request: NextRequest) {
  return handleUpdateHero(request)
}

export async function POST(request: NextRequest) {
  return handleUpdateHero(request)
}
