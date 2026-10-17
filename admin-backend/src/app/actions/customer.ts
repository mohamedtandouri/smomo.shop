"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { requireAdminSession } from "@/lib/auth-guard"
import { z } from "zod"

const UpdateCustomerSchema = z.object({
  name: z.string().trim().min(1, "الاسم مطلوب").max(100),
  email: z.string().trim().toLowerCase().email("صيغة البريد الإلكتروني غير صحيحة"),
  phone: z.string().trim().max(30).optional().nullable(),
})

export async function deleteCustomer(userId: string) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return { error: "غير مصرح لك بتنفيذ هذه العملية" }

  // منع المسؤول من حذف حسابه الشخصي النشط
  if (auth.user?.id === userId) {
    return { error: "لا يمكنك حذف حساب المسؤول الحالي الذي تستخدمه لتسجيل الدخول" }
  }

  try {
    // تنفيذ الحذف بمعاملة ذرية آمنة
    await prisma.$transaction(async (tx) => {
      // فك ارتباط الطلبات أو الاحتفاظ بها كسجلات تاريخية
      await tx.order.updateMany({
        where: { userId },
        data: { userId: null },
      })

      await tx.review.deleteMany({ where: { userId } })
      await tx.wishlistItem.deleteMany({ where: { userId } })
      await tx.abandonedCart.deleteMany({ where: { userId } })
      await tx.profile.deleteMany({ where: { userId } })
      await tx.user.delete({ where: { id: userId } })
    })
    
    revalidatePath("/admin/customers")
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting customer:", error)
    return { error: error.message || "فشل حذف العميل" }
  }
}

export async function toggleCustomerStatus(userId: string, currentStatus: string) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return { error: "غير مصرح لك بتنفيذ هذه العملية" }

  // منع المسؤول من إيقاف حسابه الشخصي
  if (auth.user?.id === userId) {
    return { error: "لا يمكنك إيقاف حساب المسؤول الحالي الذي تستخدمه" }
  }

  try {
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE"
    
    await prisma.user.update({
      where: { id: userId },
      data: { status: newStatus },
    })
    
    revalidatePath("/admin/customers")
    return { success: true, status: newStatus }
  } catch (error: any) {
    console.error("Error updating customer status:", error)
    return { error: error.message || "فشل تحديث حالة العميل" }
  }
}

export async function updateCustomer(userId: string, data: { name: string; email: string; phone?: string }) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return { error: "غير مصرح لك بتنفيذ هذه العملية" }

  const validation = UpdateCustomerSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "بيانات الإدخال غير صالحة" }
  }

  try {
    // التحقق من فرادة البريد الإلكتروني
    const existing = await prisma.user.findUnique({ where: { email: validation.data.email } })
    if (existing && existing.id !== userId) {
      return { error: "البريد الإلكتروني مستخدم بالفعل لحساب آخر" }
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: validation.data.name,
        email: validation.data.email,
        phone: validation.data.phone || null,
      },
    })
    
    revalidatePath("/admin/customers")
    return { success: true }
  } catch (error: any) {
    console.error("Error updating customer:", error)
    return { error: error.message || "فشل تحديث بيانات العميل" }
  }
}
