import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdminSession } from "@/lib/auth-guard"
import { OrderService } from "@/services/order.service"
import { fromCents, safeDecimal, toCents, toDecimal } from "@/lib/finance"

const VALID_STATUSES = ["Processing", "Shipped", "Delivered", "Cancelled", "PENDING"]

// GET /api/orders/[id] - جلب تفاصيل طلب محدد (مع دعم البحث برقم الطلب orderNumber أو الـ id)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const order = await db.order.findFirst({
      where: {
        OR: [
          { id },
          { orderNumber: id },
        ],
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
              },
            },
          },
        },
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: "لم يتم العثور على الطلب المطلوب" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json(
      { success: false, error: "فشل استرجاع بيانات الطلب" },
      { status: 500 }
    )
  }
}

// PUT /api/orders/[id] - تحديث حالة الطلب أو بيانات العميل (محمي: للمدراء فقط)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const { id } = await params
    const body = await request.json()
    const { status, customerName, total, imageUrl, customerEmail, note } = body

    // التحقق من وجود الطلب
    const existingOrder = await db.order.findUnique({
      where: { id },
      include: { items: true },
    })

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      )
    }

    // إذا كان التحديث إلى "Cancelled" والطلب لم يكن ملغى: تنفيذ الإلغاء الذري واسترجاع المخزون
    if (status === "Cancelled" && existingOrder.status !== "Cancelled") {
      const cancelResult = await OrderService.cancelOrder(existingOrder.id)
      if (!cancelResult.success) {
        return NextResponse.json(
          { success: false, error: cancelResult.error },
          { status: 500 }
        )
      }
    }

    // تجهيز حقول التحديث مع التحقق
    const updateData: any = {}

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
          },
          { status: 400 }
        )
      }
      updateData.status = status
    }

    if (customerName !== undefined) {
      if (typeof customerName !== "string" || customerName.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: "Customer name cannot be empty" },
          { status: 400 }
        )
      }
      updateData.customerName = customerName.trim()
    }

    if (total !== undefined) {
      const totalCents = toCents(total)
      updateData.total = fromCents(totalCents)
      updateData.subtotal = fromCents(totalCents)
    }

    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl?.trim() || null
    }

    if (customerEmail !== undefined) {
      updateData.customerEmail = customerEmail?.trim() || null
    }

    if (note !== undefined) {
      updateData.note = note?.trim() || null
    }

    const updatedOrder = await db.order.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      order: updatedOrder,
    })
  } catch (error: any) {
    console.error("Error updating order:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update order" },
      { status: 500 }
    )
  }
}

// DELETE /api/orders/[id] - حذف الطلب ذرياً (محمي: للمدراء فقط)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const { id } = await params

    const existingOrder = await db.order.findUnique({
      where: { id },
    })

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      )
    }

    await db.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({ where: { orderId: id } })
      await tx.order.delete({ where: { id } })
    })

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
      deletedId: id,
    })
  } catch (error: any) {
    console.error("Error deleting order:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete order" },
      { status: 500 }
    )
  }
}
