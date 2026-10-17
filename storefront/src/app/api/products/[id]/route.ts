import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getStockStatus } from "@/app/api/inventory/route"

function sanitizeProductParam(rawId: string | undefined): string | null {
  if (!rawId || typeof rawId !== "string") return null
  try {
    const decoded = decodeURIComponent(rawId).trim()
    if (!decoded || decoded.length > 128 || /[\0<>;"'`\\]/.test(decoded) || decoded.includes("..")) {
      return null
    }
    return decoded
  } catch {
    return null
  }
}

// GET /api/products/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params
    const id = sanitizeProductParam(rawId)
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Invalid product identifier" },
        { status: 400 }
      )
    }

    let product = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: true,
      },
    })

    if (!product && id.includes("-")) {
      const baseId = id.split("-")[0]?.trim()
      if (baseId && baseId.length >= 10) {
        product = await db.product.findUnique({
          where: { id: baseId },
          include: {
            category: true,
            reviews: true,
          },
        })
      }
    }

    if (!product) {
      product = await db.product.findFirst({
        where: {
          OR: [
            { sku: id },
            { name: id },
            { name: id.replace(/-/g, " ").trim() },
          ],
        },
        include: {
          category: true,
          reviews: true,
        },
      })
    }

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        status: getStockStatus(product.stock),
      },
    })
  } catch (error: any) {
    console.error("Error fetching product:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch product" },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] - تحديث مستويات المخزون والبيانات
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { stock, sku, name, price, description, imageUrl, categoryId } = body

    const existing = await db.product.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      )
    }

    const updateData: any = {
      updatedAt: new Date(),
    }

    if (stock !== undefined && stock !== null) updateData.stock = Number(stock)
    if (sku !== undefined) updateData.sku = sku ? sku.trim() : null
    if (name !== undefined) updateData.name = name.trim()
    if (price !== undefined) updateData.price = Number(price)
    if (description !== undefined) updateData.description = description ? description.trim() : null
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl
    if (categoryId !== undefined) updateData.categoryId = categoryId

    const updated = await db.product.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      message: "Product stock updated successfully",
      product: {
        ...updated,
        status: getStockStatus(updated.stock),
      },
    })
  } catch (error: any) {
    console.error("Error updating product:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update product" },
      { status: 500 }
    )
  }
}

// PATCH /api/products/[id] - تكرار للـ PUT للتوافق
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PUT(request, context)
}

// DELETE /api/products/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.product.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      )
    }

    await db.product.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
      id,
    })
  } catch (error: any) {
    console.error("Error deleting product:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete product" },
      { status: 500 }
    )
  }
}
