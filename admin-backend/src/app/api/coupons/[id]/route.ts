import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdminSession } from "@/lib/auth-guard"
import { parseRequestBody, handleApiError, apiError } from "@/lib/api-response"
import { couponUpdateSchema, getCouponRuleViolation } from "@/lib/validations"
import { safeDecimal, fromCents, toCents } from "@/lib/finance"

interface Params {
  params: Promise<{ id: string }>
}

/**
 * GET /api/coupons/[id]
 * جلب تفاصيل كوبون محدد.
 * محمي: للمدراء فقط.
 */
export async function GET(_request: NextRequest, { params }: Params) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const { id } = await params
    const coupon = await db.coupon.findUnique({
      where: { id },
    })

    if (!coupon) {
      return apiError("لم يتم العثور على الكوبون المطلوب", 404)
    }

    return NextResponse.json({
      success: true,
      coupon,
    })
  } catch (error) {
    return handleApiError(error, "fetching coupon by id")
  }
}

/**
 * PUT /api/coupons/[id] & PATCH /api/coupons/[id]
 * تحديث بيانات الكوبون (الرمز، النسبة، الحالة، إلخ).
 * محمي: للمدراء فقط.
 */
export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const { id } = await params
    const existing = await db.coupon.findUnique({
      where: { id },
    })

    if (!existing) {
      return apiError("لم يتم العثور على الكوبون المطلوب", 404)
    }

    const data = await parseRequestBody(request, couponUpdateSchema)

    // إذا تغير الكود، تحقق من عدم تكراره مع كوبون آخر
    if (data.code && data.code !== existing.code) {
      const duplicate = await db.coupon.findUnique({
        where: { code: data.code },
      })
      if (duplicate && duplicate.id !== id) {
        return apiError("كود الكوبون الجديد مستخدم مسبقاً", 409)
      }
    }

    // التحقق من قواعد العمل بعد الدمج
    const mergedRuleCheck = {
      discountType: data.discountType || existing.discountType,
      discountValue: data.discountValue !== undefined ? data.discountValue : Number(existing.discountValue),
    }
    const violation = getCouponRuleViolation(mergedRuleCheck)
    if (violation) {
      return apiError(violation, 400)
    }

    const updated = await db.coupon.update({
      where: { id },
      data: {
        ...(data.code && { code: data.code }),
        ...(data.discountType && { discountType: data.discountType }),
        ...(data.discountValue !== undefined && { discountValue: fromCents(toCents(data.discountValue)) }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    })

    return NextResponse.json({
      success: true,
      message: "تم تحديث الكوبون بنجاح",
      coupon: updated,
    })
  } catch (error) {
    return handleApiError(error, "updating coupon")
  }
}

export async function PATCH(request: NextRequest, context: Params) {
  return PUT(request, context)
}

/**
 * DELETE /api/coupons/[id]
 * حذف كوبون من قاعدة البيانات.
 * محمي: للمدراء فقط.
 */
export async function DELETE(_request: NextRequest, { params }: Params) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const { id } = await params
    const existing = await db.coupon.findUnique({
      where: { id },
    })

    if (!existing) {
      return apiError("لم يتم العثور على الكوبون المطلوب", 404)
    }

    await db.coupon.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "تم حذف الكوبون بنجاح",
      id,
    })
  } catch (error) {
    return handleApiError(error, "deleting coupon")
  }
}
