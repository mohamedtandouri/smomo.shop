import { NextRequest, NextResponse } from "next/server"
import { CategoryService } from "@/services/category.service"
import { requireAdminSession } from "@/lib/auth-guard"
import { categoryUpdateSchema } from "@/lib/validations"

// GET /api/categories/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const category = await CategoryService.getCategoryById(id)

    if (!category) {
      return NextResponse.json(
        { success: false, error: "التصنيف غير موجود" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, category })
  } catch (error: any) {
    console.error("Error fetching category:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch category" },
      { status: 500 }
    )
  }
}

// PUT /api/categories/[id] - تحديث التصنيف (محمي: للمدراء فقط)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const { id } = await params
    const body = await request.json()

    const validation = categoryUpdateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0]?.message || "بيانات تحديث التصنيف غير صالحة",
          details: validation.error.format(),
        },
        { status: 400 }
      )
    }

    const category = await CategoryService.updateCategory(id, validation.data)

    return NextResponse.json({
      success: true,
      message: "تم تحديث التصنيف بنجاح",
      category,
    })
  } catch (error: any) {
    console.error("Error updating category:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update category" },
      { status: 500 }
    )
  }
}

// DELETE /api/categories/[id] - حذف التصنيف وفك ارتباط المنتجات ذرياً (محمي: للمدراء فقط)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const { id } = await params
    await CategoryService.deleteCategory(id)

    return NextResponse.json({
      success: true,
      message: "تم حذف التصنيف بنجاح",
      id,
    })
  } catch (error: any) {
    console.error("Error deleting category:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete category" },
      { status: 500 }
    )
  }
}
