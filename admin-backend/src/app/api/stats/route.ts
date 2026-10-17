import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 })
    }

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // 1. حساب إحصائيات العملاء
    const [totalUsers, newUsers] = await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.user.count({
        where: {
          role: "USER",
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
    ])

    // 2. حساب إحصائيات الطلبات والإيرادات
    const [totalOrders, recentOrdersCount, ordersAggregate] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: "Cancelled" } },
      }),
    ])

    const totalRevenue = Number(ordersAggregate._sum.total || 0)

    // 3. حساب إحصائيات المنتجات والمخزون
    const [totalProducts, lowStockProducts] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { stock: { lte: 20 } } }),
    ])

    // 4. جلب آخر 5 طلبات حقيقية لعرضها في لوحة التحكم
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        total: true,
        status: true,
        createdAt: true,
      },
    })

    // 5. جلب آخر العملاء المسجلين
    const recentCustomers = await prisma.user.findMany({
      where: { role: "USER" },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

    // 6. تجميع المبيعات شهرياً للرسم البياني (آخر 6 أشهر)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
    sixMonthsAgo.setDate(1)
    sixMonthsAgo.setHours(0, 0, 0, 0)

    const ordersForChart = await prisma.order.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo },
        status: { not: "Cancelled" },
      },
      select: {
        total: true,
        createdAt: true,
      },
    })

    // بناء مصفوفة الأشهر الستة
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const monthlySalesMap: Record<string, number> = {}

    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const key = monthNames[d.getMonth()]
      monthlySalesMap[key] = 0
    }

    for (const order of ordersForChart) {
      const mName = monthNames[new Date(order.createdAt).getMonth()]
      if (monthlySalesMap[mName] !== undefined) {
        monthlySalesMap[mName] += Number(order.total)
      }
    }

    const salesChartData = Object.entries(monthlySalesMap).map(([month, sales]) => ({
      month,
      sales: Math.round(sales * 100) / 100,
    }))

    return NextResponse.json({
      success: true,
      stats: {
        revenue: {
          total: totalRevenue,
          formatted: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        },
        orders: {
          total: totalOrders,
          newLast30Days: recentOrdersCount,
        },
        customers: {
          total: totalUsers,
          newLast30Days: newUsers,
        },
        products: {
          total: totalProducts,
          lowStock: lowStockProducts,
        },
        salesChartData,
        recentOrders,
        recentCustomers,
      },
    })
  } catch (error) {
    console.error("Stats API Error:", error)
    return NextResponse.json({ success: false, error: "فشل استرجاع الإحصائيات" }, { status: 500 })
  }
}
