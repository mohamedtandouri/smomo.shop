import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/wishlist - جلب عناصر قائمة الأمنيات لمستخدم معين أو التحقق من وجود منتج
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")?.trim()
    const productId = searchParams.get("productId")?.trim()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId parameter is required" },
        { status: 400 }
      )
    }

    // إذا تم تمرير productId، نتحقق فقط مما إذا كان المنتج موجوداً في قائمة أمنيات المستخدم
    if (productId) {
      const item = await db.wishlistItem.findUnique({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      })

      return NextResponse.json({
        success: true,
        inWishlist: Boolean(item),
        item,
      })
    }

    // جلب جميع عناصر قائمة الأمنيات للمستخدم مع بيانات المنتجات
    const items = await db.wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true,
            stock: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      count: items.length,
      wishlist: items,
    })
  } catch (error: any) {
    console.error("Error fetching wishlist:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch wishlist" },
      { status: 500 }
    )
  }
}

// POST /api/wishlist - إضافة منتج إلى قائمة الأمنيات (Toggle or Add)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, productId } = body

    if (!userId || !productId) {
      return NextResponse.json(
        { success: false, error: "userId and productId are required" },
        { status: 400 }
      )
    }

    // التحقق من وجود المنتج والمستخدم
    const [userExists, productExists] = await Promise.all([
      db.user.findUnique({ where: { id: userId } }),
      db.product.findUnique({ where: { id: productId } }),
    ])

    if (!userExists) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    if (!productExists) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      )
    }

    // استخدام upsert لتجنب تكرار الإدخال بأمان
    const wishlistItem = await db.wishlistItem.upsert({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      create: {
        userId,
        productId,
      },
      update: {},
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
    })

    return NextResponse.json(
      {
        success: true,
        message: "Product added to wishlist successfully",
        item: wishlistItem,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error adding to wishlist:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to add to wishlist" },
      { status: 500 }
    )
  }
}

// DELETE /api/wishlist - حذف منتج من قائمة الأمنيات
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")?.trim()
    const productId = searchParams.get("productId")?.trim()

    if (!userId || !productId) {
      return NextResponse.json(
        { success: false, error: "userId and productId are required" },
        { status: 400 }
      )
    }

    const existing = await db.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Wishlist item not found" },
        { status: 404 }
      )
    }

    await db.wishlistItem.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: "Product removed from wishlist successfully",
    })
  } catch (error: any) {
    console.error("Error removing from wishlist:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to remove from wishlist" },
      { status: 500 }
    )
  }
}
