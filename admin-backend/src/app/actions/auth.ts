"use server"

import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { headers } from "next/headers"
import { checkRateLimit, recordFailedAttempt, recordSuccessfulLogin, getClientIp } from "@/lib/security"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// مخطط التحقق Zod لتسجيل دخول الإدارة (مع التطهير ضد XSS و SQLi)
const AdminLoginSchema = z.object({
  email: z.string().trim().email("صيغة البريد الإلكتروني غير صحيحة").max(100),
  password: z.string().min(1, "كلمة المرور مطلوبة").max(100),
})

// مخطط التحقق لإنشاء حساب إداري
const AdminRegisterSchema = z.object({
  name: z.string().trim().min(2, "الاسم يجب أن لا يقل عن حرفين").max(50),
  email: z.string().trim().email("صيغة البريد الإلكتروني غير صحيحة").max(100),
  phone: z.string().trim().optional().nullable(),
  password: z.string().min(8, "كلمة المرور يجب أن لا تقل عن 8 أحرف"),
  confirmPassword: z.string().min(8, "تأكيد كلمة المرور مطلوب"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
})

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

/**
 * حفظ صورة الملف الشخصي بشكل آمن مع التحقق من النوع والحجم
 */
async function saveAvatarFile(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null
  if (file.size > MAX_FILE_SIZE) {
    console.error("Avatar file exceeds 5MB limit")
    return null
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    console.error("Disallowed avatar MIME type:", file.type)
    return null
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const extensionMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  }
  const ext = extensionMap[file.type] || "jpg"
  const filename = `avatar-${uuidv4()}.${ext}`
  const uploadDir = join(process.cwd(), "public", "uploads")

  try {
    await mkdir(uploadDir, { recursive: true })
    await writeFile(join(uploadDir, filename), buffer)
    return `/uploads/${filename}`
  } catch (error) {
    console.error("Error saving avatar file:", error)
    return null
  }
}

/**
 * فحص حالة الأمان الحالية للـ IP قبل عرض نموذج الدخول
 */
export async function getClientSecurityStatus() {
  try {
    const reqHeaders = await headers()
    const ip = getClientIp(reqHeaders)
    return await checkRateLimit(ip)
  } catch (error) {
    console.warn("getClientSecurityStatus error:", error)
    return {
      allowed: true,
      isBlocked: false,
      isCoolingDown: false,
      remainingSeconds: 0,
    }
  }
}

/**
 * تسجيل الدخول للإدارة مع الحماية من التخمين (Anti-Brute Force)
 */
export async function authenticateAdminAction(data: { email: string; password: string }) {
  const reqHeaders = await headers()
  const ip = getClientIp(reqHeaders)
  const userAgent = reqHeaders.get("user-agent") || ""

  // 1. التحقق من سياسة الـ Rate Limiting قبل المعالجة
  const rateLimitStatus = await checkRateLimit(ip, data.email)
  if (!rateLimitStatus.allowed) {
    return {
      success: false,
      isBlocked: rateLimitStatus.isBlocked,
      isCoolingDown: rateLimitStatus.isCoolingDown,
      remainingSeconds: rateLimitStatus.remainingSeconds,
      error: rateLimitStatus.message,
    }
  }

  // 2. التحقق من المدخلات عبر Zod
  const validation = AdminLoginSchema.safeParse(data)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "بيانات الإدخال غير صالحة",
    }
  }

  const { email, password } = validation.data

  try {
    // 3. البحث عن المستخدم في قاعدة البيانات
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // تسجيل محاولة فاشلة
      const failResult = await recordFailedAttempt(ip, email, userAgent)
      return {
        success: false,
        isBlocked: failResult.isBlocked,
        isCoolingDown: failResult.isCoolingDown,
        remainingSeconds: failResult.remainingSeconds,
        error: failResult.message,
      }
    }

    // 4. التحقق من الصلاحيات (يجب أن يكون حسابه ADMIN)
    if (user.role !== "ADMIN") {
      const failResult = await recordFailedAttempt(ip, email, userAgent)
      return {
        success: false,
        isBlocked: failResult.isBlocked,
        isCoolingDown: failResult.isCoolingDown,
        remainingSeconds: failResult.remainingSeconds,
        error: "هذا الحساب لا يملك صلاحيات مسؤول النظام (Admin). الوصول محظور.",
      }
    }

    // 5. فحص كلمة المرور المشفرة عبر bcrypt
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      const failResult = await recordFailedAttempt(ip, email, userAgent)
      return {
        success: false,
        isBlocked: failResult.isBlocked,
        isCoolingDown: failResult.isCoolingDown,
        remainingSeconds: failResult.remainingSeconds,
        error: failResult.message,
      }
    }

    // 6. نجاح تسجيل الدخول -> إعادة تعيين عداد المحاولات وتسجيل الدخول
    await recordSuccessfulLogin(ip, email, userAgent)

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        imageUrl: user.imageUrl,
      },
    }
  } catch (error: any) {
    console.error("Admin Login Error:", error)
    if (error?.message?.includes("Can't reach database server") || error?.code === "P1001" || error?.name === "PrismaClientInitializationError") {
      return {
        success: false,
        error: "تعذر الاتصال بقاعدة البيانات. يرجى التحقق من مسار DATABASE_URL أو تشغيل خادم قاعدة البيانات.",
      }
    }
    return {
      success: false,
      error: "حدث خطأ غير متوقع في الخادم أثناء التحقق من البيانات.",
    }
  }
}

/**
 * إنشاء حساب مسؤول جديد (Admin Register)
 */
export async function registerAdminAction(formData: FormData) {
  try {
    let ip = "127.0.0.1"
    let userAgent = ""
    try {
      const reqHeaders = await headers()
      ip = getClientIp(reqHeaders)
      userAgent = reqHeaders.get("user-agent") || ""
    } catch (hErr) {
      console.warn("Could not read request headers:", hErr)
    }

    const rawData = {
      name: (formData.get("name") as string) || "",
      email: (formData.get("email") as string) || "",
      phone: (formData.get("phone") as string) || null,
      password: (formData.get("password") as string) || "",
      confirmPassword: (formData.get("confirmPassword") as string) || "",
    }

    const validation = AdminRegisterSchema.safeParse(rawData)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || "يرجى مراجعة البيانات المدخلة",
      }
    }

    const { name, email, phone, password } = validation.data

    // فحص الأمان: منع التسجيل المفتوح لحسابات المدراء إذا كان هناك مدير مسجل مسبقاً
    let existingAdminCount = 0
    try {
      existingAdminCount = await prisma.user.count({
        where: { role: "ADMIN" },
      })
    } catch (dbErr: any) {
      console.error("Database connection error in registerAdminAction:", dbErr)
      return {
        success: false,
        error: "تعذر الاتصال بقاعدة البيانات. يرجى التحقق من إعدادات قاعدة البيانات أولاً.",
      }
    }

    if (existingAdminCount > 0) {
      let session = null
      try {
        session = await getServerSession(authOptions)
      } catch (sErr) {
        console.warn("Could not fetch server session:", sErr)
      }
      if (!session || (session as any).user?.role !== "ADMIN") {
        return {
          success: false,
          error: "تم قفل التسجيل العام للمدراء. يتطلب إنشاء حساب مسؤول إذن مسؤول حالي مسجل الدخول.",
        }
      }
    }

    // التحقق من عدم وجود حساب مسبق بهذا البريد
    const existing = await prisma.user.findUnique({
      where: { email },
    })

    if (existing) {
      return {
        success: false,
        error: "البريد الإلكتروني مسجل مسبقاً في النظام.",
      }
    }

    // تشفير كلمة المرور عبر Bcrypt
    const hashedPassword = await bcrypt.hash(password, 10)

    // معالجة صورة الملف الشخصي إن وجدت
    const avatarFile = formData.get("avatar") as File | null
    let imageUrl: string | null = null
    if (avatarFile && typeof avatarFile === "object" && "size" in avatarFile && avatarFile.size > 0) {
      try {
        imageUrl = await saveAvatarFile(avatarFile)
      } catch (avErr) {
        console.warn("Avatar saving failed (proceeding without image):", avErr)
      }
    }

    // إنشاء حساب المدير
    const newAdmin = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: "ADMIN",
        status: "ACTIVE",
        imageUrl,
      },
    })

    // تدوين الحدث الأمني
    await prisma.securityLog.create({
      data: {
        eventType: "ADMIN_REGISTERED",
        severity: "INFO",
        ipAddress: ip,
        email,
        details: `New administrator account created (${newAdmin.name}). User-Agent: ${userAgent}`,
      },
    })

    return {
      success: true,
      message: "تم إنشاء حساب المسؤول بنجاح! يمكنك الآن تسجيل الدخول.",
    }
  } catch (error: any) {
    console.error("Admin Registration Error:", error)
    if (error?.message?.includes("Can't reach database server") || error?.code === "P1001" || error?.name === "PrismaClientInitializationError") {
      return {
        success: false,
        error: "تعذر الاتصال بقاعدة البيانات. يرجى التحقق من إعدادات قاعدة البيانات أولاً ثم إعادة المحاولة.",
      }
    }
    return {
      success: false,
      error: error?.message || "فشل إنشاء الحساب الإداري.",
    }
  }
}

/**
 * مخطط التحقق Zod لتحديث الملف الشخصي للمستخدم
 */
const UpdateProfileActionSchema = z.object({
  name: z.string().trim().min(2, "الاسم الكامل يجب ألا يقل عن حرفين").max(80, "الاسم طويل جداً"),
  email: z.string().trim().toLowerCase().email("صيغة البريد الإلكتروني غير صحيحة").max(100),
  phone: z.string().trim().max(30, "رقم الهاتف غير صالح").optional().nullable(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.newPassword && data.newPassword.trim().length > 0) {
    if (data.newPassword.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "كلمة المرور الجديدة يجب ألا تقل عن 8 أحرف",
        path: ["newPassword"],
      })
    }
    if (data.confirmPassword !== undefined && data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "تأكيد كلمة المرور غير مطابق لكلمة المرور الجديدة",
        path: ["confirmPassword"],
      })
    }
  }
})

/**
 * جلب بيانات الملف الشخصي للمدير مع سجلات الأمان الحديثة
 */
export async function getAdminProfileData(identifier?: string) {
  try {
    let user = null

    if (identifier) {
      // محاولة البحث عبر المعرف أولاً ثم عبر البريد الإلكتروني
      user = await prisma.user.findFirst({
        where: {
          OR: [{ id: identifier }, { email: identifier.toLowerCase() }],
        },
        include: {
          profile: true,
        },
      })
    }

    // في حال تغير البريد في الجلسة أو عدم العثور عليه، الجلب الافتراضي لأول حساب ADMIN
    if (!user) {
      user = await prisma.user.findFirst({
        where: { role: "ADMIN" },
        orderBy: { createdAt: "asc" },
        include: { profile: true },
      })
    }

    if (!user) return null

    // جلب آخر 10 سجلات أمان خاصة بالنظام
    const securityLogs = await prisma.securityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    // إجمالي المحاولات المحظورة
    const totalBlockedIps = await prisma.blockedTarget.count()

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      profile: user.profile,
      securityLogs,
      totalBlockedIps,
    }
  } catch (error) {
    console.error("Error fetching admin profile:", error)
    return null
  }
}

/**
 * تحديث بيانات الملف الشخصي للمسؤول (الاسم، البريد الإلكتروني، الهاتف، الصورة، وكلمة المرور)
 */
export async function updateAdminProfileAction(formData: FormData) {
  const reqHeaders = await headers()
  const ip = getClientIp(reqHeaders)

  const session = await getServerSession(authOptions)
  const formUserId = (formData.get("userId") as string)?.trim()
  const targetUserId = session?.user?.id || formUserId

  if (!targetUserId) {
    return { success: false, error: "غير مصرح بالوصول: يرجى تسجيل الدخول أولاً." }
  }

  const rawData = {
    name: (formData.get("name") as string) || "",
    email: (formData.get("email") as string) || "",
    phone: (formData.get("phone") as string) || null,
    currentPassword: (formData.get("currentPassword") as string) || undefined,
    newPassword: (formData.get("newPassword") as string) || undefined,
    confirmPassword: (formData.get("confirmPassword") as string) || undefined,
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
    })

    if (!user) {
      return { success: false, error: "المستخدم غير موجود." }
    }

    // إذا لم يُرسل البريد في النموذج الاحتياطي، نستخدم البريد الحالي
    if (!rawData.email) {
      rawData.email = user.email
    }

    const validation = UpdateProfileActionSchema.safeParse(rawData)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || "بيانات الإدخال غير صالحة.",
      }
    }

    const { name, email, phone, currentPassword, newPassword } = validation.data

    // التحقق من عدم استخدام البريد الإلكتروني الجديد من قبل مستخدم آخر
    if (email !== user.email.toLowerCase()) {
      const existingEmailUser = await prisma.user.findUnique({
        where: { email },
      })
      if (existingEmailUser && existingEmailUser.id !== user.id) {
        return {
          success: false,
          error: "البريد الإلكتروني مستخدم بالفعل لحساب آخر في النظام.",
        }
      }
    }

    const updateData: any = {
      name,
      email,
      phone: phone || null,
    }

    // إزالة الصورة الشخصية إذا طلب المستخدم ذلك
    const removeAvatar = formData.get("removeAvatar") === "true"
    if (removeAvatar) {
      updateData.imageUrl = null
    }

    // رفع صورة شخصية جديدة إن وجدت
    const avatarFile = formData.get("avatar") as File | null
    if (avatarFile && typeof avatarFile === "object" && avatarFile.size > 0) {
      const uploaded = await saveAvatarFile(avatarFile)
      if (!uploaded) {
        return {
          success: false,
          error: "فشل رفع الصورة. تأكد من أن الملف بصيغة (JPG, PNG, WEBP, GIF) وأقل من 5MB.",
        }
      }
      updateData.imageUrl = uploaded
    }

    // تغيير كلمة المرور إن تم طلب ذلك
    if (newPassword && newPassword.trim().length > 0) {
      if (!currentPassword) {
        return { success: false, error: "يرجى إدخال كلمة المرور الحالية لتأكيد التغيير." }
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password)
      if (!isMatch) {
        return { success: false, error: "كلمة المرور الحالية غير صحيحة." }
      }

      updateData.password = await bcrypt.hash(newPassword, 10)
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    })

    await prisma.securityLog.create({
      data: {
        eventType: "PROFILE_UPDATED",
        severity: "INFO",
        ipAddress: ip,
        email: updated.email,
        details: `Admin profile updated (${updated.name}). Email changed: ${email !== user.email}. Password changed: ${Boolean(newPassword)}`,
      },
    })

    return {
      success: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        imageUrl: updated.imageUrl,
        role: updated.role,
      },
    }
  } catch (error: any) {
    console.error("Error updating admin profile:", error)
    return { success: false, error: error.message || "فشل تحديث الملف الشخصي." }
  }
}

