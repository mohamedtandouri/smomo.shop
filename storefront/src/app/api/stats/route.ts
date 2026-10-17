import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current date and 30 days ago for "new" metrics
    const now = new Date()
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30))

    // 1. Users Stats
    const totalUsers = await prisma.user.count({
      where: { role: "USER" }
    })
    
    const newUsers = await prisma.user.count({
      where: { 
        role: "USER",
        createdAt: { gte: thirtyDaysAgo }
      }
    })

    // 2. Orders Stats
    const totalOrders = await prisma.order.count()
    const totalRevenue = await prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" } }
    })

    return NextResponse.json({
      stats: {
        users: {
          total: totalUsers,
          newLast30Days: newUsers
        },
        orders: {
          total: totalOrders,
          revenue: totalRevenue._sum.total || 0
        }
      }
    })
  } catch (error) {
    console.error("Stats API Error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
