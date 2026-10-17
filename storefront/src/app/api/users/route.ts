import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

const prisma = new PrismaClient()

// Only ADMIN can get all users
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        profile: true,
        _count: {
          select: { orders: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Fetch users error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
