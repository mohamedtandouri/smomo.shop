import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"
import {
  getUserPermissions,
  setUserPermissions,
  PermissionKey,
  UserRoleType,
} from "@/lib/store-storage"

// GET /api/users - جلب قائمة جميع المستخدمين مع الصلاحيات
export async function GET() {
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
        status: true,
        imageUrl: true,
        createdAt: true,
        profile: true,
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const enrichedUsers = users.map((u) => {
      const permRecord = getUserPermissions(u.id, u.role)
      return {
        ...u,
        role: permRecord.roleLabel || u.role,
        dbRole: u.role,
        permissions: permRecord.permissions,
      }
    })

    return NextResponse.json({ success: true, users: enrichedUsers })
  } catch (error) {
    console.error("Fetch users error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

// POST /api/users - إنشاء مستخدم جديد مع مصفوفة الصلاحيات
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      email,
      phone,
      role = "MANAGER",
      status = "ACTIVE",
      password,
      permissions = ["view_products"],
    } = body

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: "الاسم والبريد الإلكتروني مطلوبان" },
        { status: 400 }
      )
    }

    const cleanEmail = String(email).trim().toLowerCase()
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } })
    if (existing) {
      return NextResponse.json(
        { success: false, error: "البريد الإلكتروني مسجل بالفعل" },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password || "Smomo@12345", 10)
    const dbRole = role === "USER" ? "USER" : "ADMIN"

    const created = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: cleanEmail,
        phone: phone ? String(phone).trim() : null,
        password: hashedPassword,
        role: dbRole,
        status: status === "SUSPENDED" ? "SUSPENDED" : "ACTIVE",
      },
    })

    const permRecord = setUserPermissions(
      created.id,
      permissions as PermissionKey[],
      role as UserRoleType
    )

    return NextResponse.json({
      success: true,
      user: {
        id: created.id,
        name: created.name,
        email: created.email,
        phone: created.phone,
        role: permRecord.roleLabel,
        status: created.status,
        permissions: permRecord.permissions,
        createdAt: created.createdAt,
      },
    })
  } catch (error: any) {
    console.error("Create user API error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create user" },
      { status: 500 }
    )
  }
}
