import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/reviews - جلب جميع مراجعات المنتجات مع دعم البحث والفلترة والإحصائيات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = (searchParams.get("search") || searchParams.get("q") || "").trim()
    const ratingParam = searchParams.get("rating")?.trim()
    const statusParam = searchParams.get("status")?.trim()
    const productId = searchParams.get("productId")?.trim()

    const where: any = {}

    // فلترة بالتقييم (عدد النجوم)
    if (ratingParam && ratingParam !== "ALL") {
      const parsedRating = parseInt(ratingParam, 10)
      if (!isNaN(parsedRating)) {
        where.rating = parsedRating
      }
    }

    // فلترة بالحالة
    if (statusParam && statusParam !== "ALL") {
      where.status = statusParam
    }

    // فلترة حسب المنتج
    if (productId) {
      where.productId = productId
    }

    // بحث في اسم المنتج أو اسم العميل أو نص المراجعة
    if (search) {
      where.OR = [
        { customerName: { contains: search } },
        { comment: { contains: search } },
        { product: { name: { contains: search } } },
      ]
    }

    const [reviews, totalCount, allReviews] = await Promise.all([
      db.review.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              price: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              imageUrl: true,
            },
          },
        },
      }),
      db.review.count({ where }),
      db.review.findMany({
        select: {
          rating: true,
          status: true,
        },
      }),
    ])

    // حساب متوسط التقييمات وتوزيع النجوم
    const totalScore = allReviews.reduce((acc, r) => acc + (r.rating || 0), 0)
    const averageRating = allReviews.length > 0 ? Number((totalScore / allReviews.length).toFixed(1)) : 0

    const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    allReviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) {
        ratingCounts[r.rating] = (ratingCounts[r.rating] || 0) + 1
      }
    })

    return NextResponse.json({
      success: true,
      count: totalCount,
      metrics: {
        totalReviews: allReviews.length,
        averageRating,
        ratingCounts,
      },
      reviews,
    })
  } catch (error: any) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch reviews" },
      { status: 500 }
    )
  }
}

// POST /api/reviews - إضافة مراجعة جديدة لمنتج
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, customerName, rating, comment, status, createdAt, userId } = body

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      )
    }

    const parsedRating = parseInt(String(rating), 10)
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be an integer between 1 and 5" },
        { status: 400 }
      )
    }

    // التحقق من وجود المنتج
    const product = await db.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      )
    }

    const newReview = await db.review.create({
      data: {
        productId,
        customerName: (customerName || "Customer").trim(),
        rating: parsedRating,
        comment: (comment || "").trim(),
        status: status || "APPROVED",
        userId: userId || null,
        createdAt: createdAt ? new Date(createdAt) : new Date(),
      },
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

    return NextResponse.json(
      {
        success: true,
        message: "Review created successfully",
        review: newReview,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error creating review:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create review" },
      { status: 500 }
    )
  }
}
