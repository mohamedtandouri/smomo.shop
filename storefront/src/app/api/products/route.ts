import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getStockStatus } from "@/app/api/inventory/route"

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

// POST /api/products - إضافة منتج جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, sku, price, stock, description, imageUrl, categoryId } = body

    if (!name || price === undefined) {
      return NextResponse.json(
        { success: false, error: "Product name and price are required" },
        { status: 400 }
      )
    }

    const newProduct = await db.product.create({
      data: {
        name: name.trim(),
        sku: sku ? sku.trim() : null,
        price: Number(price),
        stock: Number(stock) || 0,
        description: description ? description.trim() : null,
        imageUrl: imageUrl || null,
        categoryId: categoryId || null,
      },
    })

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
