import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

/**
 * دالة مساعدة لحماية نقاط الاتصال (API Route Handlers)
 * تتأكد من أن المستخدم مسجل دخول ويملك رتبة ADMIN
 */
export async function requireAdminSession() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return {
        authorized: false,
        response: NextResponse.json(
          { success: false, error: "غير مصرح بالوصول: يرجى تسجيل الدخول كمسؤول أولاً" },
          { status: 401 }
        ),
      }
    }

    if ((session.user as any).role !== "ADMIN") {
      return {
        authorized: false,
        response: NextResponse.json(
          { success: false, error: "ممنوع: هذا المسار مخصص لمدراء النظام فقط" },
          { status: 403 }
        ),
      }
    }

    return {
      authorized: true,
      user: session.user,
    }
  } catch (error) {
    console.error("Auth guard error:", error)
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: "حدث خطأ أثناء التحقق من الصلاحيات" },
        { status: 500 }
      ),
    }
  }
}

/**
 * دالة الحماية المخصصة لـ Server Actions الإدارية
 * ترمي استثناء أو تعيد بيانات المسؤول في حال التصريح
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    throw new Error("غير مصرح: يجب تسجيل الدخول كمسؤول أولاً")
  }

  if ((session.user as any).role !== "ADMIN") {
    throw new Error("ممنوع: هذه العملية مخصصة لمدراء النظام فقط")
  }

  return session.user
}
