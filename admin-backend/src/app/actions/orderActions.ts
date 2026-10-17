"use server"

import { revalidatePath } from "next/cache"
import { requireAdminSession } from "@/lib/auth-guard"
import { OrderService } from "@/services/order.service"
import { prisma } from "@/lib/db"
import { toCents, fromCents, toDecimal } from "@/lib/finance"
import { z } from "zod"

const AdminCreateOrderSchema = z.object({
  customerName: z.string().trim().min(1, "اسم العميل مطلوب").max(120),
  customerEmail: z.string().trim().email("صيغة البريد الإلكتروني غير صحيحة").optional().or(z.literal("")),
  discount: z.coerce.number().min(0, "لا يمكن أن يكون الخصم سالباً").default(0),
  shippingFee: z.coerce.number().min(0, "لا يمكن أن يكون الشحن سالباً").default(0),
  note: z.string().trim().optional(),
  tags: z.string().trim().optional(),
  productIds: z.array(z.string()).optional(),
  quantities: z.array(z.coerce.number().int().min(1)).optional(),
})

export async function createOrder(formData: FormData) {
  // 1. التحقق الصارم من صلاحيات المسؤول (Authentication & Authorization Guard)
  const auth = await requireAdminSession()
  if (!auth.authorized) {
    return { success: false, error: "غير مصرح: يجب تسجيل الدخول كمسؤول للنظام لتنفيذ هذا الإجراء" }
  }

  try {
    // 2. التحقق من المدخلات عبر Zod (Input Validation)
    const rawDiscount = formData.get("discount") as string
    const rawShipping = formData.get("shippingFee") as string
    const rawCustomer = (formData.get("customerName") as string) || "عميل المتجر (طلب يدوي)"
    const rawEmail = (formData.get("customerEmail") as string) || ""
    const rawNote = (formData.get("note") as string) || ""
    const rawTags = (formData.get("tags") as string) || ""
    
    // فحص إذا كان هناك منتجات مرسلة
    const rawItemsJson = formData.get("items") as string | null
    let parsedItems: { productId: string; quantity: number }[] = []
    if (rawItemsJson) {
      try {
        parsedItems = JSON.parse(rawItemsJson)
      } catch {
        parsedItems = []
      }
    }

    const validation = AdminCreateOrderSchema.safeParse({
      customerName: rawCustomer,
      customerEmail: rawEmail || undefined,
      discount: rawDiscount || 0,
      shippingFee: rawShipping || 0,
      note: rawNote,
      tags: rawTags,
    })

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || "بيانات الإدخال غير صالحة",
      }
    }

    const { customerName, customerEmail, discount, shippingFee, note, tags } = validation.data

    // 3. إذا كان هناك بنود منتجات محددة، نستخدم OrderService لجلب الأسعار من الخادم وحجز المخزون ذرياً
    if (parsedItems.length > 0) {
      const result = await OrderService.createOrder({
        customerName,
        customerEmail: customerEmail || null,
        items: parsedItems,
        manualDiscountCents: toCents(discount),
        manualShippingFeeCents: toCents(shippingFee),
        note,
        tags,
        status: "Processing",
      })

      if (!result.success) {
        return { success: false, error: result.error }
      }

      revalidatePath("/admin/orders")
      revalidatePath("/admin/invoices")
      return { success: true, orderId: result.data?.orderId }
    }

    // 4. في حالة إنشاء طلب إداري يدوي بدون سلع (Custom invoice/order)
    // نضمن الدقة المالية عبر السنتات والمعاملات الذرية
    const discountCents = toCents(discount)
    const shippingCents = toCents(shippingFee)
    // إذا كان المجموع الفرعي 0، الإجمالي لا يمكن أن يكون سالباً
    const subtotalCents = Math.max(discountCents, 0)
    const totalCents = Math.max(0, subtotalCents - discountCents + shippingCents)

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`

    const order = await prisma.$transaction(async (tx) => {
      return tx.order.create({
        data: {
          orderNumber,
          customerName,
          customerEmail: customerEmail || null,
          discount: fromCents(discountCents),
          shippingFee: fromCents(shippingCents),
          subtotal: fromCents(subtotalCents),
          total: fromCents(totalCents),
          note,
          tags,
          status: "Processing",
        },
      })
    })

    revalidatePath("/admin/orders")
    revalidatePath("/admin/invoices")
    return { success: true, orderId: order.id }
  } catch (error: any) {
    console.error("[createOrder Action] Failed:", error)
    return { success: false, error: error.message || "فشل إنشاء الطلب" }
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  const auth = await requireAdminSession()
  if (!auth.authorized) {
    return { success: false, error: "غير مصرح لك بتنفيذ هذه العملية" }
  }

  const result = await OrderService.updateOrderStatus(orderId, status)
  if (result.success) {
    revalidatePath("/admin/orders")
    revalidatePath("/admin/invoices")
  }
  return result
}

export async function cancelOrder(orderId: string) {
  const auth = await requireAdminSession()
  if (!auth.authorized) {
    return { success: false, error: "غير مصرح لك بتنفيذ هذه العملية" }
  }

  const result = await OrderService.cancelOrder(orderId)
  if (result.success) {
    revalidatePath("/admin/orders")
    revalidatePath("/admin/invoices")
  }
  return result
}
