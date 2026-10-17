import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// DELETE /api/inventory/reviews/[id] - حذف مراجعة جرد
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.inventoryReview.findFirst({
      where: {
        OR: [
          { id },
          { reviewCode: id },
        ],
      },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      )
    }

    await db.inventoryReview.delete({
      where: { id: existing.id },
    })

    return NextResponse.json({
      success: true,
      message: "Inventory review deleted successfully",
      id: existing.reviewCode,
    })
  } catch (error: any) {
    console.error("Error deleting review:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete review" },
      { status: 500 }
    )
  }
}
