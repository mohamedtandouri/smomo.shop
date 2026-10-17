import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdminSession } from "@/lib/auth-guard"

// GET /api/reviews/[id] - جلب مراجعة محددة
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const review = await db.review.findUnique({
      where: { id },
      include: {
        product: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
          },
        },
      },
    })

    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, review })
  } catch (error: any) {
    console.error("Error fetching review:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch review" },
      { status: 500 }
    )
  }
}

// PATCH /api/reviews/[id] - تحديث مراجعة (محمي: للمدراء فقط)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const { id } = await params
    const body = await request.json()
    const { customerName, rating, comment, status, createdAt, productId } = body

    const existingReview = await db.review.findUnique({
      where: { id },
    })

    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (customerName !== undefined) updateData.customerName = customerName.trim()
    if (rating !== undefined) {
      const parsedRating = parseInt(String(rating), 10)
      if (parsedRating >= 1 && parsedRating <= 5) {
        updateData.rating = parsedRating
      }
    }
    if (comment !== undefined) updateData.comment = comment.trim()
    if (status !== undefined) updateData.status = status
    if (createdAt !== undefined) updateData.createdAt = new Date(createdAt)
    if (productId !== undefined) updateData.productId = productId

    const updatedReview = await db.review.update({
      where: { id },
      data: updateData,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: "Review updated successfully",
      review: updatedReview,
    })
  } catch (error: any) {
    console.error("Error updating review:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update review" },
      { status: 500 }
    )
  }
}

// PUT /api/reviews/[id] - للتوافق الكامل
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PATCH(request, context)
}

// DELETE /api/reviews/[id] - حذف مراجعة (محمي: للمدراء فقط)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const { id } = await params

    const existingReview = await db.review.findUnique({
      where: { id },
    })

    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      )
    }

    await db.review.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
      id,
    })
  } catch (error: any) {
    console.error("Error deleting review:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete review" },
      { status: 500 }
    )
  }
}
