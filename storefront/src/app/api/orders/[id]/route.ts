import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// GET /api/orders/[id] - جلب تفاصيل طلب محدد للمستخدم صاحب الطلب
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "يجب تسجيل الدخول لعرض تفاصيل الطلب" },
        { status: 401 }
      )
    }

    const { id } = await params

    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: "الطلب غير موجود" },
        { status: 404 }
      )
    }

    // فحص ملكية الطلب (IDOR Prevention)
    const isOwner = order.userId === session.user.id || (order.customerEmail && order.customerEmail.toLowerCase() === session.user.email?.toLowerCase())
    if (!isOwner && (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "غير مصرح لك بعرض تفاصيل هذا الطلب" },
        { status: 403 }
      )
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch order" },
      { status: 500 }
    )
  }
}

// PUT /api/orders/[id] - إلغاء الطلب من قبل العميل إذا كان قيد المعالجة واسترجاع المخزون ذرياً
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "يجب تسجيل الدخول لتحديث الطلب" },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { action } = body

    const existingOrder = await db.order.findUnique({
      where: { id },
      include: { items: true },
    })

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: "الطلب غير موجود" },
        { status: 404 }
      )
    }

    const isOwner = existingOrder.userId === session.user.id || (existingOrder.customerEmail && existingOrder.customerEmail.toLowerCase() === session.user.email?.toLowerCase())
    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: "غير مصرح لك بتعديل هذا الطلب" },
        { status: 403 }
      )
    }

    // السماح فقط بإلغاء الطلب إذا كان قيد المعالجة (Processing)
    if (action === "cancel") {
      if (existingOrder.status !== "Processing") {
        return NextResponse.json(
          { success: false, error: "لا يمكن إلغاء الطلب بعد تجهيزه أو شحنه" },
          { status: 400 }
        )
      }

      // إلغاء ذري مع استرجاع المخزون
      await db.$transaction(async (tx) => {
        await tx.order.update({
          where: { id },
          data: { status: "Cancelled" },
        })

        for (const item of existingOrder.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
        }
      })

      return NextResponse.json({
        success: true,
        message: "تم إلغاء الطلب بنجاح واسترجاع المخزون",
      })
    }

    return NextResponse.json(
      { success: false, error: "إجراء غير مدعوم" },
      { status: 400 }
    )
  } catch (error: any) {
    console.error("Error cancelling order:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update order" },
      { status: 500 }
    )
  }
}

// DELETE /api/orders/[id] - معطل في واجهة المتجر لحماية السجلات المالية
export async function DELETE() {
  return NextResponse.json(
    { success: false, error: "حذف الطلبات غير مسموح من واجهة المتجر. يرجى التواصل مع الدعم أو استخدام الإلغاء." },
    { status: 403 }
  )
}
