import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/abandoned-carts - جلب جميع العربات المهجورة (محمي: للمدراء فقط)
export async function GET(request: NextRequest) {
  const { requireAdminSession } = await import("@/lib/auth-guard")
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const search = (searchParams.get("search") || searchParams.get("q") || "").trim()
    const status = searchParams.get("status")?.trim() || ""

    const where: any = {}

    // تصفية حسب الحالة
    if (status && status !== "ALL") {
      where.status = {
        equals: status,
      }
    }

    // البحث في اسم العميل أو بريده الإلكتروني
    if (search) {
      where.OR = [
        { customerName: { contains: search } },
        { customerEmail: { contains: search } },
      ]
    }

    const [carts, totalCount, allCarts] = await Promise.all([
      db.abandonedCart.findMany({
        where,
        orderBy: { abandonedAt: "desc" },
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
        },
      }),
      db.abandonedCart.count({ where }),
      db.abandonedCart.findMany({
        select: {
          totalValue: true,
          status: true,
        },
      }),
    ])

    // حساب المقاييس السريعة للإحصائيات (Metrics)
    const totalPotentialRevenue = allCarts.reduce((acc, c) => acc + (c.totalValue || 0), 0)
    const recoveredCount = allCarts.filter((c) => c.status === "RECOVERED").length
    const emailSentCount = allCarts.filter((c) => c.status === "EMAIL_SENT").length
    const abandonedCount = allCarts.filter((c) => c.status === "ABANDONED").length

    return NextResponse.json({
      success: true,
      count: totalCount,
      metrics: {
        totalPotentialRevenue,
        totalCarts: allCarts.length,
        abandonedCount,
        emailSentCount,
        recoveredCount,
      },
      carts,
    })
  } catch (error: any) {
    console.error("Error fetching abandoned carts:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch abandoned carts" },
      { status: 500 }
    )
  }
}

// POST /api/abandoned-carts - إضافة عربة مهجورة جديدة
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerName, customerEmail, itemsCount, totalValue, abandonedAt, status } = body

    if (!customerName || !customerEmail) {
      return NextResponse.json(
        { success: false, error: "Customer name and email are required" },
        { status: 400 }
      )
    }

    const newCart = await db.abandonedCart.create({
      data: {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        itemsCount: Number(itemsCount) || 1,
        totalValue: Number(totalValue) || 0,
        abandonedAt: abandonedAt ? new Date(abandonedAt) : new Date(),
        status: status || "ABANDONED",
      },
    })

    return NextResponse.json(
      { success: true, message: "Abandoned cart created successfully", cart: newCart },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error creating abandoned cart:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create abandoned cart" },
      { status: 500 }
    )
  }
}
