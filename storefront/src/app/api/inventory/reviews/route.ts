import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/inventory/reviews - جلب سجلات مراجعات الجرد مع دعم البحث
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = (searchParams.get("search") || searchParams.get("q") || "").trim()

    const where: any = {}
    if (search) {
      where.OR = [
        { reviewCode: { contains: search } },
        { productName: { contains: search } },
        { sku: { contains: search } },
        { status: { contains: search } },
      ]
    }

    const reviews = await db.inventoryReview.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            stock: true,
            imageUrl: true,
          },
        },
      },
    })

    const formatted = reviews.map((r) => ({
      id: r.reviewCode, // REV-001
      dbId: r.id,
      reviewId: r.reviewCode,
      product: r.productName,
      sku: r.sku,
      expected: r.expected,
      actual: r.actual,
      status: r.status.toLowerCase(),
      date: r.date.toISOString().split("T")[0],
      notes: r.notes,
      productId: r.productId,
    }))

    return NextResponse.json({
      success: true,
      count: formatted.length,
      reviews: formatted,
    })
  } catch (error: any) {
    console.error("Error fetching inventory reviews:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch inventory reviews" },
      { status: 500 }
    )
  }
}

// POST /api/inventory/reviews - إنشاء مراجعة جرد ومطابقة جديدة
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    let { reviewCode, productId, productName, sku, expected, actual, status, notes, date, reconcileStock } = body

    if (!productName && !sku && !productId) {
      return NextResponse.json(
        { success: false, error: "Product name or SKU is required" },
        { status: 400 }
      )
    }

    // إذا لم يحدد reviewCode، قم بتوليده تلقائياً (مثال: REV-005)
    if (!reviewCode) {
      const count = await db.inventoryReview.count()
      reviewCode = `REV-${String(count + 1).padStart(3, "0")}`
    }

    // محاولة العثور على المنتج لربطه تلقائياً إذا لم يكن معلوماً
    let foundProduct = null
    if (productId) {
      foundProduct = await db.product.findUnique({ where: { id: productId } })
    } else if (sku) {
      foundProduct = await db.product.findUnique({ where: { sku: sku.trim() } })
    } else if (productName) {
      foundProduct = await db.product.findFirst({ where: { name: { contains: productName.trim() } } })
    }

    const resolvedProductId = foundProduct ? foundProduct.id : null
    const resolvedProductName = productName?.trim() || foundProduct?.name || "Unknown Item"
    const resolvedSku = sku?.trim() || foundProduct?.sku || "SKU-GEN"

    const expectedNum = Number(expected) >= 0 ? Number(expected) : (foundProduct?.stock ?? 0)
    const actualNum = Number(actual) >= 0 ? Number(actual) : 0

    // احتساب الحالة تلقائياً: إذا تساوى المتوقع والفعلي تكون matched وإلا discrepancy
    const computedStatus = status || (expectedNum === actualNum ? "matched" : "discrepancy")

    const newReview = await db.inventoryReview.create({
      data: {
        reviewCode: reviewCode.trim().toUpperCase(),
        productId: resolvedProductId,
        productName: resolvedProductName,
        sku: resolvedSku,
        expected: expectedNum,
        actual: actualNum,
        status: computedStatus.toLowerCase(),
        notes: notes ? notes.trim() : null,
        date: date ? new Date(date) : new Date(),
      },
    })

    // خيار مطابقة وتحديث مخزون المنتج مباشرة إلى القيمة الفعلية (Reconcile Stock)
    if (reconcileStock && resolvedProductId) {
      await db.product.update({
        where: { id: resolvedProductId },
        data: {
          stock: actualNum,
          updatedAt: new Date(),
        },
      })
    }

    return NextResponse.json(
      {
        success: true,
        message: "Inventory review recorded successfully",
        review: {
          id: newReview.reviewCode,
          dbId: newReview.id,
          reviewId: newReview.reviewCode,
          product: newReview.productName,
          sku: newReview.sku,
          expected: newReview.expected,
          actual: newReview.actual,
          status: newReview.status,
          date: newReview.date.toISOString().split("T")[0],
          notes: newReview.notes,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error creating inventory review:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record inventory review" },
      { status: 500 }
    )
  }
}
