import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdminSession } from "@/lib/auth-guard"
import { parseRequestBody, handleApiError, apiError } from "@/lib/api-response"
import { couponCreateSchema } from "@/lib/validations"
import { safeDecimal, fromCents, toCents } from "@/lib/finance"

/**
 * GET /api/coupons
 * استرجاع كافة الكوبونات مع دعم الفلترة والبحث.
 * محمي: للمدراء فقط.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.trim() || ""
    const status = searchParams.get("status")?.trim()

    const where: any = {}

    if (search) {
      where.code = { contains: search }
    }

    if (status === "active") {
      where.isActive = true
    } else if (status === "inactive") {
      where.isActive = false
    }

    const coupons = await db.coupon.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      success: true,
      count: coupons.length,
      coupons,
    })
  } catch (error) {
    return handleApiError(error, "fetching coupons")
  }
}

/**
 * POST /api/coupons
 * إنشاء كوبون خصم جديد مع التحقق الكامل عبر Zod.
 * محمي: للمدراء فقط.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const data = await parseRequestBody(request, couponCreateSchema)

    // التحقق من عدم تكرار الكود
    const existing = await db.coupon.findUnique({
      where: { code: data.code },
    })

    if (existing) {
      return apiError("كود الكوبون مستخدم بالفعل، يرجى اختيار كود آخر", 409)
    }

    const newCoupon = await db.coupon.create({
      data: {
        code: data.code,
        discountType: data.discountType,
        discountValue: fromCents(toCents(data.discountValue)),
        isActive: data.isActive ?? true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: "تم إنشاء الكوبون بنجاح",
        coupon: newCoupon,
      },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error, "creating coupon")
  }
}
