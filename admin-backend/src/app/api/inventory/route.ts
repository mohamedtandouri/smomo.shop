import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdminSession } from "@/lib/auth-guard"
import { inventoryAdjustSchema } from "@/lib/validations"
import { safeDecimal, fromCents, toCents } from "@/lib/finance"

// Helper to determine inventory status
export function getStockStatus(stock: number): "in_stock" | "low_stock" | "out_of_stock" {
  if (stock <= 0) return "out_of_stock"
  if (stock <= 20) return "low_stock"
  return "in_stock"
}

// GET /api/inventory - جلب إحصائيات المخزون وقائمة المنتجات مع البحث والفلترة (محمي)
export async function GET(request: NextRequest) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const search = (searchParams.get("search") || searchParams.get("q") || "").trim()
    const statusFilter = searchParams.get("status")?.trim() || ""

    // 1. حساب الإحصائيات الشاملة من قاعدة البيانات
    const allProducts = await db.product.findMany({
      select: {
        id: true,
        stock: true,
      },
    })

    const totalUnits = allProducts.reduce((acc, p) => acc + (p.stock || 0), 0)
    const lowStockCount = allProducts.filter((p) => p.stock > 0 && p.stock <= 20).length
    const outOfStockCount = allProducts.filter((p) => p.stock === 0).length

    // 2. بناء استعلام البحث
    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
      ]
    }

    const products = await db.product.findMany({
      where,
      orderBy: [
        { updatedAt: "desc" },
        { createdAt: "desc" },
      ],
    })

    // إضافة الحالة وحساب التاريخ المنسق
    let items = products.map((prod) => {
      const status = getStockStatus(prod.stock)
      const lastUpdatedDate = prod.updatedAt || prod.createdAt
      const formattedDate = lastUpdatedDate ? lastUpdatedDate.toISOString().split("T")[0] : "2023-10-24"

      return {
        id: prod.id,
        product: prod.name,
        name: prod.name,
        sku: prod.sku || `SKU-${prod.id.slice(0, 5).toUpperCase()}`,
        stock: prod.stock,
        price: prod.price,
        imageUrl: prod.imageUrl,
        status,
        lastUpdated: formattedDate,
        updatedAt: prod.updatedAt,
      }
    })

    if (statusFilter && statusFilter !== "ALL") {
      items = items.filter((item) => item.status === statusFilter)
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalUnits,
        totalUnitsFormatted: totalUnits.toLocaleString(),
        growthRate: "+2.5% from last month",
        lowStockItems: lowStockCount,
        lowStockSubtitle: "Needs attention soon",
        outOfStockItems: outOfStockCount,
        outOfStockSubtitle: "Revenue loss potential",
      },
      count: items.length,
      items,
    })
  } catch (error: any) {
    console.error("Error fetching inventory data:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch inventory data" },
      { status: 500 }
    )
  }
}

// POST /api/inventory - تعديل المخزون المباشر أو إضافة صنف جديد (محمي: للمدراء فقط)
export async function POST(request: NextRequest) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const validation = inventoryAdjustSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0]?.message || "Invalid inventory payload",
          details: validation.error.format(),
        },
        { status: 400 }
      )
    }

    const { productId, stock, sku, name, price } = validation.data

    if (productId) {
      const updateData: any = {
        updatedAt: new Date(),
      }
      if (stock !== undefined) updateData.stock = stock
      if (sku !== undefined) updateData.sku = sku
      if (name !== undefined) updateData.name = name
      if (price !== undefined) updateData.price = fromCents(toCents(price))

      const updated = await db.product.update({
        where: { id: productId },
        data: updateData,
      })

      return NextResponse.json({
        success: true,
        message: "Stock updated successfully",
        product: {
          ...updated,
          status: getStockStatus(updated.stock),
        },
      })
    }

    // إنشاء صنف جديد بالمخزون
    if (!name || sku === undefined) {
      return NextResponse.json(
        { success: false, error: "Product name and SKU are required" },
        { status: 400 }
      )
    }

    const created = await db.product.create({
      data: {
        name,
        sku,
        stock: stock || 0,
        price: price !== undefined ? fromCents(toCents(price)) : 0,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Product created in inventory successfully",
      product: {
        ...created,
        status: getStockStatus(created.stock),
      },
    }, { status: 201 })
  } catch (error: any) {
    console.error("Error updating inventory stock:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update stock" },
      { status: 500 }
    )
  }
}
