import { NextRequest, NextResponse } from "next/server"
import { CategoryService } from "@/services/category.service"
import { requireAdminSession } from "@/lib/auth-guard"
import { categoryCreateSchema } from "@/lib/validations"

// GET /api/categories - جلب جميع التصنيفات (متاح للمتجر واللوحة)
export async function GET() {
  try {
    const categories = await CategoryService.getCategories()

    return NextResponse.json({
      success: true,
      count: categories.length,
      categories,
    })
  } catch (error: any) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch categories" },
      { status: 500 }
    )
  }
}

// POST /api/categories - إضافة تصنيف جديد (محمي: للمدراء فقط)
export async function POST(request: NextRequest) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const validation = categoryCreateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0]?.message || "بيانات التصنيف غير صالحة",
          details: validation.error.format(),
        },
        { status: 400 }
      )
    }

    const category = await CategoryService.createCategory(validation.data)

    return NextResponse.json({
      success: true,
      message: "تم إنشاء التصنيف بنجاح",
      category,
    }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating category:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create category" },
      { status: 500 }
    )
  }
}
