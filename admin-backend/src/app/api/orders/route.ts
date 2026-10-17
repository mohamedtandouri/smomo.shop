import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdminSession } from "@/lib/auth-guard"
import { OrderService } from "@/services/order.service"
import { fromCents, toCents, toDecimal } from "@/lib/finance"
import { z } from "zod"

const VALID_STATUSES = ["Processing", "Shipped", "Delivered", "Cancelled", "PENDING"] as const

const PostOrderSchema = z.object({
  customerName: z.string().trim().min(1, "Customer name is required").max(120),
  customerEmail: z.string().trim().email("Invalid email format").nullish(),
  status: z.enum(VALID_STATUSES).default("Processing"),
  note: z.string().trim().nullish(),
  tags: z.string().trim().nullish(),
  discount: z.coerce.number().min(0).default(0),
  shippingFee: z.coerce.number().min(0).default(0),
  total: z.coerce.number().min(0).optional(),
  items: z.array(
    z.object({
      productId: z.string().trim().min(1, "Product ID is required"),
      quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
    })
  ).optional(),
})

// GET /api/orders - جلب جميع الطلبات مع دعم البحث والفلترة (محمي: للمدراء فقط)
export async function GET(request: NextRequest) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.trim() || ""
    const status = searchParams.get("status")?.trim() || ""

    // بناء شروط الاستعلام
    const where: any = {}

    if (status && status !== "ALL") {
      where.status = {
        equals: status,
      }
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customerName: { contains: search } },
        { customerEmail: { contains: search } },
      ]
    }

    const orders = await db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            imageUrl: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                stock: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders,
    })
  } catch (error: any) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { success: false, error: error.message || String(error) },
      { status: 500 }
    )
  }
}

// POST /api/orders - إضافة طلب جديد آمن محمياً ومتحققاً من الأسعار والمخزون خادمياً
export async function POST(request: NextRequest) {
  // 1. فحص مصادقة المسؤول (Admin Authentication Guard)
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const validation = PostOrderSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0]?.message || "Invalid order payload",
          details: validation.error.format(),
        },
        { status: 400 }
      )
    }

    const { customerName, customerEmail, status, note, tags, discount, shippingFee, items, total } = validation.data

    // 2. إذا كانت هناك بنود: استخدام OrderService لجلب الأسعار من الخادم وحجز المخزون ذرياً
    if (items && items.length > 0) {
      const serviceResult = await OrderService.createOrder({
        customerName,
        customerEmail: customerEmail || null,
        items,
        manualDiscountCents: toCents(discount),
        manualShippingFeeCents: toCents(shippingFee),
        note: note || null,
        tags: tags || null,
        status,
      })

      if (!serviceResult.success) {
        return NextResponse.json(
          { success: false, error: serviceResult.error },
          { status: serviceResult.statusCode || 400 }
        )
      }

      const fullOrder = await OrderService.getOrderById(serviceResult.data!.orderId)

      return NextResponse.json(
        {
          success: true,
          message: "Order created successfully with server-side price verification and atomic stock reservation",
          order: fullOrder,
        },
        { status: 201 }
      )
    }

    // 3. طلب مخصص يدوي بدون بنود: حساب مالي دقيق بالسنتات وتنفيذ ذري
    const discountCents = toCents(discount)
    const shippingCents = toCents(shippingFee)
    const rawTotalCents = total !== undefined ? toCents(total) : Math.max(0, shippingCents - discountCents)
    const subtotalCents = Math.max(0, rawTotalCents + discountCents - shippingCents)

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`

    const newOrder = await db.$transaction(async (tx) => {
      return tx.order.create({
        data: {
          orderNumber,
          customerName,
          customerEmail: customerEmail || null,
          status,
          subtotal: fromCents(subtotalCents),
          discount: fromCents(discountCents),
          shippingFee: fromCents(shippingCents),
          total: fromCents(rawTotalCents),
          note: note || null,
          tags: tags || null,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })
    })

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        order: newOrder,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create order" },
      { status: 500 }
    )
  }
}
