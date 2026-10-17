import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/abandoned-carts/[id] - جلب عربة مهجورة معينة
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cart = await db.abandonedCart.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!cart) {
      return NextResponse.json(
        { success: false, error: "Abandoned cart not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, cart })
  } catch (error: any) {
    console.error("Error fetching cart:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch cart" },
      { status: 500 }
    )
  }
}

// PATCH /api/abandoned-carts/[id] - تحديث بيانات العربة المهجورة أو حالتها
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { customerName, customerEmail, customerPhone, itemsCount, totalValue, status, abandonedAt, notes } = body

    const existingCart = await db.abandonedCart.findUnique({
      where: { id },
    })

    if (!existingCart) {
      return NextResponse.json(
        { success: false, error: "Abandoned cart not found" },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (customerName !== undefined) updateData.customerName = customerName.trim()
    if (customerEmail !== undefined) updateData.customerEmail = customerEmail.trim().toLowerCase()
    if (customerPhone !== undefined) updateData.customerPhone = customerPhone ? customerPhone.trim() : null
    if (itemsCount !== undefined) updateData.itemsCount = Number(itemsCount)
    if (totalValue !== undefined) updateData.totalValue = Number(totalValue)
    if (status !== undefined) updateData.status = status
    if (notes !== undefined) updateData.notes = notes ? notes.trim() : null
    if (abandonedAt !== undefined) updateData.abandonedAt = new Date(abandonedAt)

    const updatedCart = await db.abandonedCart.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      message: "Abandoned cart updated successfully",
      cart: updatedCart,
    })
  } catch (error: any) {
    console.error("Error updating cart:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update cart" },
      { status: 500 }
    )
  }
}

// PUT /api/abandoned-carts/[id] - للتوافقية الكاملة
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PATCH(request, context)
}

// DELETE /api/abandoned-carts/[id] - حذف سجل عربة مهجورة
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existingCart = await db.abandonedCart.findUnique({
      where: { id },
    })

    if (!existingCart) {
      return NextResponse.json(
        { success: false, error: "Abandoned cart not found" },
        { status: 404 }
      )
    }

    await db.abandonedCart.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "Abandoned cart deleted successfully",
      id,
    })
  } catch (error: any) {
    console.error("Error deleting cart:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete cart" },
      { status: 500 }
    )
  }
}
