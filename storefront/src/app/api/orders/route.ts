import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { toCents, toDecimal } from "@/lib/finance"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const VALID_STATUSES = ["Processing", "Shipped", "Delivered", "Cancelled", "PENDING"] as const

const StorefrontOrderSchema = z.object({
  customerName: z.string().trim().min(1, "Customer name is required").max(120),
  customerEmail: z.string().trim().email("Invalid email address").optional().or(z.literal("")),
  total: z.coerce.number().min(0, "Total must be a positive number"),
  status: z.enum(VALID_STATUSES).default("Processing"),
  note: z.string().trim().optional(),
})

// GET /api/orders - جلب طلبات المستخدم المسجل فقط
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "يجب تسجيل الدخول لعرض الطلبات" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")?.trim() || ""

    const where: any = {
      OR: [
        { userId: session.user.id },
        { customerEmail: session.user.email?.toLowerCase() },
      ],
    }

    if (status && status !== "ALL") {
      where.status = status
    }

    const orders = await db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
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

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders,
    })
  } catch (error: any) {
    console.error("Error fetching storefront orders:", error)
    return NextResponse.json(
      { success: false, error: error.message || String(error) },
      { status: 500 }
    )
  }
}

// POST /api/orders - إنشاء طلب آمن مع حسابات السنتات
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = StorefrontOrderSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0]?.message || "بيانات الطلب غير صالحة",
        },
        { status: 400 }
      )
    }

    const { customerName, customerEmail, total, status, note } = validation.data
    const totalCents = toCents(total)

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`

    const newOrder = await db.$transaction(async (tx) => {
      return tx.order.create({
        data: {
          orderNumber,
          customerName,
          customerEmail: customerEmail || null,
          total: toDecimal(totalCents),
          subtotal: toDecimal(totalCents),
          status,
          note: note || null,
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
