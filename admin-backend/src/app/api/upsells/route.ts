import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdminSession } from "@/lib/auth-guard"
import { parseRequestBody, handleApiError, apiError } from "@/lib/api-response"
import { upsellCreateSchema } from "@/lib/validations"
import { safeDecimal, fromCents, toCents } from "@/lib/finance"

/**
 * GET /api/upsells
 * استرجاع كافة عروض البيع الإضافي (Up Sells) مع تفاصيل المنتجات المستهدفة والمعروضة.
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
      where.name = { contains: search }
    }

    if (status === "active") {
      where.isActive = true
    } else if (status === "inactive") {
      where.isActive = false
    }

    const upsells = await db.upSell.findMany({
      where,
      orderBy: { id: "desc" },
    })

    // جلب معلومات المنتجات المرتبطة (Target Product & Offer Product)
    const productIds = Array.from(
      new Set(upsells.flatMap((u) => [u.targetProductId, u.offerProductId]))
    )

    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        price: true,
        imageUrl: true,
        stock: true,
      },
    })

    const productMap = new Map(products.map((p) => [p.id, p]))

    const formattedUpsells = upsells.map((u) => ({
      ...u,
      targetProduct: productMap.get(u.targetProductId) || null,
      offerProduct: productMap.get(u.offerProductId) || null,
    }))

    return NextResponse.json({
      success: true,
      count: formattedUpsells.length,
      upsells: formattedUpsells,
    })
  } catch (error) {
    return handleApiError(error, "fetching upsells")
  }
}

/**
 * POST /api/upsells
 * إنشاء عرض بيع إضافي جديد مع التحقق من صحة المنتجات وسلامة العرض.
 * محمي: للمدراء فقط.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const data = await parseRequestBody(request, upsellCreateSchema)

    // التحقق من وجود كلا المنتجين في قاعدة البيانات
    const [targetProduct, offerProduct] = await Promise.all([
      db.product.findUnique({ where: { id: data.targetProductId } }),
      db.product.findUnique({ where: { id: data.offerProductId } }),
    ])

    if (!targetProduct) {
      return apiError("المنتج المحفز (Target Product) غير موجود", 404)
    }

    if (!offerProduct) {
      return apiError("منتج العرض (Offer Product) غير موجود", 404)
    }

    const newUpsell = await db.upSell.create({
      data: {
        name: data.name,
        targetProductId: data.targetProductId,
        offerProductId: data.offerProductId,
        discount: fromCents(toCents(data.discount)),
        isActive: data.isActive ?? true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: "تم إنشاء عرض البيع الإضافي بنجاح",
        upsell: {
          ...newUpsell,
          targetProduct,
          offerProduct,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error, "creating upsell")
  }
}
