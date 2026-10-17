import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdminSession } from "@/lib/auth-guard"
import { parseRequestBody, handleApiError, apiError } from "@/lib/api-response"
import { upsellUpdateSchema, getUpsellRuleViolation } from "@/lib/validations"
import { safeDecimal, fromCents, toCents } from "@/lib/finance"

interface Params {
  params: Promise<{ id: string }>
}

/**
 * GET /api/upsells/[id]
 * جلب تفاصيل عرض بيع إضافي محدد.
 * محمي: للمدراء فقط.
 */
export async function GET(_request: NextRequest, { params }: Params) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const { id } = await params
    const upsell = await db.upSell.findUnique({
      where: { id },
    })

    if (!upsell) {
      return apiError("لم يتم العثور على العرض المطلوب", 404)
    }

    const [targetProduct, offerProduct] = await Promise.all([
      db.product.findUnique({ where: { id: upsell.targetProductId } }),
      db.product.findUnique({ where: { id: upsell.offerProductId } }),
    ])

    return NextResponse.json({
      success: true,
      upsell: {
        ...upsell,
        targetProduct,
        offerProduct,
      },
    })
  } catch (error) {
    return handleApiError(error, "fetching upsell by id")
  }
}

/**
 * PUT /api/upsells/[id] & PATCH /api/upsells/[id]
 * تحديث بيانات العرض الترويجي.
 * محمي: للمدراء فقط.
 */
export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const { id } = await params
    const existing = await db.upSell.findUnique({
      where: { id },
    })

    if (!existing) {
      return apiError("لم يتم العثور على العرض المطلوب", 404)
    }

    const data = await parseRequestBody(request, upsellUpdateSchema)

    const targetProductId = data.targetProductId || existing.targetProductId
    const offerProductId = data.offerProductId || existing.offerProductId

    const violation = getUpsellRuleViolation({
      targetProductId,
      offerProductId,
      discount: data.discount !== undefined ? data.discount : Number(existing.discount),
    })
    if (violation) {
      return apiError(violation, 400)
    }

    // التحقق من صحة المنتجات إذا تم تعديلها
    if (data.targetProductId || data.offerProductId) {
      const [tExists, oExists] = await Promise.all([
        db.product.findUnique({ where: { id: targetProductId } }),
        db.product.findUnique({ where: { id: offerProductId } }),
      ])
      if (!tExists || !oExists) {
        return apiError("أحد المنتجات المحددة غير موجود في قاعدة البيانات", 404)
      }
    }

    const updated = await db.upSell.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.targetProductId && { targetProductId: data.targetProductId }),
        ...(data.offerProductId && { offerProductId: data.offerProductId }),
        ...(data.discount !== undefined && { discount: fromCents(toCents(data.discount)) }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    })

    return NextResponse.json({
      success: true,
      message: "تم تحديث عرض البيع الإضافي بنجاح",
      upsell: updated,
    })
  } catch (error) {
    return handleApiError(error, "updating upsell")
  }
}

export async function PATCH(request: NextRequest, context: Params) {
  return PUT(request, context)
}

/**
 * DELETE /api/upsells/[id]
 * حذف عرض بيع إضافي.
 * محمي: للمدراء فقط.
 */
export async function DELETE(_request: NextRequest, { params }: Params) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const { id } = await params
    const existing = await db.upSell.findUnique({
      where: { id },
    })

    if (!existing) {
      return apiError("لم يتم العثور على العرض المطلوب", 404)
    }

    await db.upSell.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "تم حذف عرض البيع الإضافي بنجاح",
      id,
    })
  } catch (error) {
    return handleApiError(error, "deleting upsell")
  }
}
