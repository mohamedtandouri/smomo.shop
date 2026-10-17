import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getStockStatus } from "@/app/api/inventory/route"
import { requireAdminSession } from "@/lib/auth-guard"
import { ProductService } from "@/services/product.service"
import { productUpdateSchema } from "@/lib/validations"

// GET /api/products/[id] - متاح للعامة والمتجر
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await ProductService.getProductById(id)

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

// PUT /api/products/[id] - تحديث المنتج (محمي: للمدراء فقط)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const { id } = await params
    const body = await request.json()

    const validation = productUpdateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0]?.message || "Invalid product update data",
          details: validation.error.format(),
        },
        { status: 400 }
      )
    }

    const updated = await ProductService.updateProduct(id, validation.data)

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
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

// PATCH /api/products/[id]
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PUT(request, context)
}

// DELETE /api/products/[id] - حذف المنتج ذرياً (محمي: للمدراء فقط)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const { id } = await params
    await ProductService.deleteProduct(id)

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
