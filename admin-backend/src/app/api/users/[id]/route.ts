import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdminSession } from "@/lib/auth-guard"

// GET /api/users/[id] - جلب بيانات مستخدم أو عميل محدد
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const { id } = await params

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        imageUrl: true,
        profile: true,
        orders: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            orders: true,
            reviews: true,
            abandonedCarts: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "المستخدم غير موجود" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, user })
  } catch (error: any) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch user" },
      { status: 500 }
    )
  }
}

// PUT /api/users/[id] - تحديث بيانات المستخدم (الاسم، الهاتف، الحالة، الدور)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const { id } = await params
    const body = await request.json()
    const { name, phone, role, status } = body

    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json(
        { success: false, error: "المستخدم غير موجود" },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (name && typeof name === "string") updateData.name = name.trim()
    if (phone !== undefined) updateData.phone = phone ? String(phone).trim() : null
    if (role && (role === "USER" || role === "ADMIN")) updateData.role = role
    if (status && (status === "ACTIVE" || status === "SUSPENDED")) updateData.status = status

    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: "تم تحديث بيانات المستخدم بنجاح",
      user: updatedUser,
    })
  } catch (error: any) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update user" },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id] - حذف المستخدم مع العلاقات التابعة ذرياً
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const { id } = await params

    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json(
        { success: false, error: "المستخدم غير موجود" },
        { status: 404 }
      )
    }

    // منع حذف حساب المدير الحالي بنفسه
    if (user.id === auth.user?.id || user.email === auth.user?.email) {
      return NextResponse.json(
        { success: false, error: "لا يمكن حذف حساب المسؤول الحالي المسجل دخوله" },
        { status: 400 }
      )
    }

    // تنفيذ الحذف ذرياً
    await db.$transaction(async (tx) => {
      await tx.order.updateMany({
        where: { userId: id },
        data: { userId: null },
      })
      await tx.review.deleteMany({ where: { userId: id } })
      await tx.wishlistItem.deleteMany({ where: { userId: id } })
      await tx.abandonedCart.deleteMany({ where: { userId: id } })
      await tx.profile.deleteMany({ where: { userId: id } })
      await tx.user.delete({ where: { id } })
    })

    return NextResponse.json({
      success: true,
      message: "تم حذف المستخدم بنجاح",
    })
  } catch (error: any) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete user" },
      { status: 500 }
    )
  }
}
