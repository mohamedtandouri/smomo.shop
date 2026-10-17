import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getStockStatus } from "@/app/api/inventory/route"
import { requireAdminSession } from "@/lib/auth-guard"
import { ProductService } from "@/services/product.service"
import { productCreateSchema } from "@/lib/validations"

// GET /api/products - جلب قائمة المنتجات مع دعم البحث والفلترة وحالة المخزون
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = (searchParams.get("search") || searchParams.get("q") || "").trim()
    const categoryId = searchParams.get("categoryId") || ""

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { description: { contains: search } },
      ]
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    const products = await db.product.findMany({
      where,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        imageUrl: true,
        stock: true,
        description: true,
        updatedAt: true,
        createdAt: true,
      },
    })

    const formattedProducts = products.map((p) => ({
      ...p,
      status: getStockStatus(p.stock),
      lastUpdated: (p.updatedAt || p.createdAt).toISOString().split("T")[0],
    }))

    return NextResponse.json({
      success: true,
      count: formattedProducts.length,
      products: formattedProducts,
    })
  } catch (error: any) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch products" },
      { status: 500 }
    )
  }
}

// POST /api/products - إضافة منتج جديد (محمي: للمدراء فقط)
export async function POST(request: NextRequest) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const validation = productCreateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0]?.message || "Invalid product payload",
          details: validation.error.format(),
        },
        { status: 400 }
      )
    }

    const newProduct = await ProductService.createProduct(validation.data)

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        product: {
          ...newProduct,
          status: getStockStatus(newProduct.stock),
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error creating product:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create product" },
      { status: 500 }
    )
  }
}
