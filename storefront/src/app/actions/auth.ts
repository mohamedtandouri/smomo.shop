"use server"

import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { headers } from "next/headers"
import { checkRateLimit, getClientIp } from "@/lib/security"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// مخطط التحقق Zod لتسجيل دخول العميل
const CustomerLoginSchema = z.object({
  email: z.string().trim().email("صيغة البريد الإلكتروني غير صحيحة").max(100),
  password: z.string().min(1, "كلمة المرور مطلوبة").max(100),
})

/**
 * فحص حالة الأمان للـ IP
 */
export async function getClientSecurityStatus() {
  const reqHeaders = await headers()
  const ip = getClientIp(reqHeaders)
  return await checkRateLimit(ip)
}

/**
 * جلب بيانات الملف الشخصي للمستخدم الحالي (مؤمن ضد IDOR باستخدام الجلسة)
 */
export async function getCustomerProfileData() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return null
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
      },
    })

    if (!user) return null

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      imageUrl: user.imageUrl,
      profile: user.profile,
    }
  } catch (error) {
    console.error("Error fetching customer profile:", error)
    return null
  }
}

/**
 * تحديث بيانات الملف الشخصي للعميل (مؤمن ضد IDOR - يعتمد حصراً على معرف الجلسة session.user.id)
 */
export async function updateCustomerProfileAction(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { success: false, error: "غير مصرح: يرجى تسجيل الدخول أولاً." }
  }

  // استخدام المعرف من الجلسة حصراً وليس من المدخلات
  const userId = session.user.id
  const name = (formData.get("name") as string)?.trim()
  const phone = (formData.get("phone") as string)?.trim() || null
  const currentPassword = formData.get("currentPassword") as string
  const newPassword = formData.get("newPassword") as string

  if (!name) {
    return { success: false, error: "الاسم مطلوب." }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return { success: false, error: "المستخدم غير موجود." }
    }

    // إذا طلب العميل تغيير كلمة المرور
    let updatedPasswordHash = user.password
    if (newPassword && newPassword.trim().length > 0) {
      if (!currentPassword) {
        return { success: false, error: "يرجى إدخال كلمة المرور الحالية لتغيير كلمة المرور." }
      }
      const isCurrentValid = await bcrypt.compare(currentPassword, user.password)
      if (!isCurrentValid) {
        return { success: false, error: "كلمة المرور الحالية غير صحيحة." }
      }
      if (newPassword.length < 6) {
        return { success: false, error: "كلمة المرور الجديدة يجب أن لا تقل عن 6 أحرف." }
      }
      updatedPasswordHash = await bcrypt.hash(newPassword, 10)
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phone,
        password: updatedPasswordHash,
      },
    })

    return { success: true, message: "تم تحديث الملف الشخصي بنجاح." }
  } catch (error: any) {
    console.error("Profile update error:", error)
    return { success: false, error: error?.message || "فشل تحديث البيانات." }
  }
}
