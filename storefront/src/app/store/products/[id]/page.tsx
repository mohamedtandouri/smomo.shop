import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { ProductView } from "@/components/storefront/ProductView"

// ضمان عرض أحدث بيانات المنتج والمخزون والتقييمات فور تعديلها في لوحة التحكم
export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * تنظيف المعرف الممرر في الرابط والتحقق من أمانه لمنع هجمات حقن البيانات أو المسارات الخبيثة
 */
function sanitizeProductIdentifier(rawId: string | undefined): string | null {
  if (!rawId || typeof rawId !== "string") return null
  try {
    const decoded = decodeURIComponent(rawId).trim()
    // رفض القيم الفارغة أو الطويلة جداً أو التي تحتوي على محارف خطرة (XSS / SQLi / Path Traversal)
    if (
      !decoded ||
      decoded.length > 128 ||
      /[\0<>;"'`\\]/.test(decoded) ||
      decoded.includes("..")
    ) {
      return null
    }
    return decoded
  } catch {
    return null
  }
}

/**
 * البحث المرن والآمن عن المنتج بواسطة المعرف الأساسي (id) أو معرف المتغير أو رمز المخزون (SKU) أو الاسم (Slug)
 */
async function findProductByIdentifier(identifier: string) {
  const includeRelations = {
    category: true,
    reviews: {
      orderBy: { createdAt: "desc" as const },
    },
  }

  try {
    // 1. البحث المباشر بواسطة المعرف الأساسي (CUID / UUID)
    let product = await db.product.findUnique({
      where: { id: identifier },
      include: includeRelations,
    })

    // 2. إذا كان الرابط قادماً من سلة التسوق بمعرف مركب مثل (productId-Color-Storage) نستخرج المعرف الأصلي
    if (!product && identifier.includes("-")) {
      const baseIdCandidate = identifier.split("-")[0]?.trim()
      if (baseIdCandidate && baseIdCandidate.length >= 10) {
        product = await db.product.findUnique({
          where: { id: baseIdCandidate },
          include: includeRelations,
        })
      }
    }

    // 3. البحث الاحتياطي بواسطة SKU أو تطابق الاسم / الـ Slug
    if (!product) {
      const normalizedName = identifier.replace(/-/g, " ").trim()
      product = await db.product.findFirst({
        where: {
          OR: [
            { sku: identifier },
            { name: identifier },
            { name: normalizedName },
          ],
        },
        include: includeRelations,
      })
    }

    return product
  } catch (error) {
    console.error("[ProductDetailsPage] Error querying product with relations:", error)
    // محاولة استعلام مبسطة في حال وجود أي مشكلة في العلاقات الفرعية
    try {
      const fallbackProduct = await db.product.findFirst({
        where: {
          OR: [
            { id: identifier },
            { sku: identifier },
            { name: identifier.replace(/-/g, " ").trim() },
          ],
        },
      })
      if (!fallbackProduct) return null
      return {
        ...fallbackProduct,
        category: null,
        reviews: [],
      }
    } catch {
      return null
    }
  }
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const cleanId = sanitizeProductIdentifier(resolvedParams?.id)

  if (!cleanId) {
    notFound()
  }

  const product = await findProductByIdentifier(cleanId)

  if (!product) {
    notFound()
  }

  // تحديث عداد المشاهدات بشكل غير متزامن دون إبطاء عرض الصفحة أو التسبب في خطأ
  db.product
    .update({
      where: { id: product.id },
      data: { views: { increment: 1 } },
    })
    .catch(() => {})

  // اقتراحات لمنتجات ذات صلة (Cross-selling / Up-selling) مع حماية ضد الأخطاء
  let relatedProducts: any[] = []
  try {
    relatedProducts = await db.product.findMany({
      where: {
        id: { not: product.id },
      },
      take: 4,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
      },
    })
  } catch {
    relatedProducts = []
  }

  const serializedProduct = {
    ...product,
    price: Number(product.price),
    compareAtPrice:
      "compareAtPrice" in product && product.compareAtPrice != null
        ? Number(product.compareAtPrice)
        : null,
  }

  const serializedRelated = relatedProducts.map((p) => ({
    ...p,
    price: Number(p.price),
    compareAtPrice:
      "compareAtPrice" in p && p.compareAtPrice != null
        ? Number(p.compareAtPrice)
        : null,
  }))

  return (
    <ProductView
      product={serializedProduct}
      relatedProducts={serializedRelated}
      initialReviews={product.reviews || []}
    />
  )
}

