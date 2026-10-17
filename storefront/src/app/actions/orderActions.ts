"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { toCents, fromCents, toDecimal } from "@/lib/finance"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const OrderStatusSchema = z.object({
  orderId: z.string().trim().min(1),
  status: z.enum(["Processing", "Shipped", "Delivered", "Cancelled"]),
})

export async function cancelCustomerOrder(orderId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || !session.user.id) {
      return { success: false, error: "يجب تسجيل الدخول لإلغاء الطلب" }
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (!order) {
      return { success: false, error: "الطلب غير موجود" }
    }

    // تأكد من أن الطلب يخص هذا المستخدم المسجل
    if (order.userId !== session.user.id) {
      return { success: false, error: "غير مصرح لك بإلغاء هذا الطلب" }
    }

    if (order.status !== "Processing") {
      return { success: false, error: "لا يمكن إلغاء الطلب بعد شحنه أو تسليمه" }
    }

    // إلغاء ذري واسترجاع للمخزون
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: "Cancelled" },
      })

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })
      }
    })

    revalidatePath("/store/dashboard/orders")
    return { success: true }
  } catch (error: any) {
    console.error("Cancel customer order error:", error)
    return { success: false, error: error.message || "فشل إلغاء الطلب" }
  }
}
