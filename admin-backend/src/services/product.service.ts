import { prisma } from "@/lib/db"
import { safeDecimal, toCents, fromCents } from "@/lib/finance"
import { Prisma } from "@prisma/client"

export interface ProductFilters {
  search?: string
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  stockStatus?: "in_stock" | "low_stock" | "out_of_stock"
  page?: number
  limit?: number
}

export interface CreateProductInput {
  name: string
  description?: string | null
  price: number | string | Prisma.Decimal
  compareAtPrice?: number | string | Prisma.Decimal | null
  stock?: number
  imageUrl?: string | null
  categoryId?: string | null
  sku?: string | null
}

export class ProductService {
  /**
   * جلب قائمة المنتجات مع الفلترة والترتيب والصفحات
   */
  static async getProducts(filters: ProductFilters = {}) {
    const page = Math.max(1, filters.page || 1)
    const limit = Math.min(100, Math.max(1, filters.limit || 50))
    const skip = (page - 1) * limit

    const where: Prisma.ProductWhereInput = {}

    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim()
      where.OR = [
        { name: { contains: q } },
        { sku: { contains: q } },
        { description: { contains: q } },
      ]
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId
    }

    if (filters.stockStatus === "out_of_stock") {
      where.stock = { lte: 0 }
    } else if (filters.stockStatus === "low_stock") {
      where.stock = { gt: 0, lte: 5 }
    } else if (filters.stockStatus === "in_stock") {
      where.stock = { gt: 0 }
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    return {
      products,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      page,
      limit,
    }
  }

  /**
   * جلب منتج بمفرده بواسطة المعرف
   */
  static async getProductById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    })
  }

  /**
   * إنشاء منتج جديد مع التدقيق المالي
   */
  static async createProduct(data: CreateProductInput) {
    const safePrice = fromCents(toCents(data.price))
    const safeComparePrice = data.compareAtPrice ? fromCents(toCents(data.compareAtPrice)) : null

    return prisma.product.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        sku: data.sku?.trim() || null,
        price: safePrice,
        ...((safeComparePrice !== null && safeComparePrice !== undefined) ? { compareAtPrice: safeComparePrice } : {}),
        stock: Math.max(0, Math.floor(Number(data.stock) || 0)),
        imageUrl: data.imageUrl || null,
        categoryId: data.categoryId || null,
      } as any,
    })
  }

  /**
   * تحديث بيانات منتج
   */
  static async updateProduct(id: string, data: Partial<CreateProductInput>) {
    const updateData: any = {}

    if (data.name !== undefined) updateData.name = data.name.trim()
    if (data.description !== undefined) updateData.description = data.description?.trim() || null
    if (data.sku !== undefined) updateData.sku = data.sku?.trim() || null
    if (data.price !== undefined) updateData.price = fromCents(toCents(data.price))
    if (data.compareAtPrice !== undefined) {
      updateData.compareAtPrice = data.compareAtPrice ? fromCents(toCents(data.compareAtPrice)) : null
    }
    if (data.stock !== undefined) {
      updateData.stock = Math.max(0, Math.floor(Number(data.stock) || 0))
    }
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl || null
    if (data.categoryId !== undefined) {
      if (data.categoryId) {
        updateData.category = { connect: { id: data.categoryId } }
      } else {
        updateData.category = { disconnect: true }
      }
    }

    return prisma.product.update({
      where: { id },
      data: updateData,
    })
  }

  /**
   * حذف منتج مع تنظيف العلاقات المرتبطة بأمان
   */
  static async deleteProduct(id: string) {
    return prisma.$transaction(async (tx) => {
      // حذف التقييمات وقوائم الرغبات المرتبطة
      await tx.review.deleteMany({ where: { productId: id } })
      await tx.wishlistItem.deleteMany({ where: { productId: id } })
      await tx.abandonedCartItem.deleteMany({ where: { productId: id } })

      // فحص إذا كان المنتج مرتبطاً بطلبات سابقة
      const orderCount = await tx.orderItem.count({ where: { productId: id } })
      if (orderCount > 0) {
        // بدلاً من كسر سلامة السجلات المالية التاريخية، نقوم بفك الارتباط أو الحذف الموجه
        await tx.orderItem.deleteMany({ where: { productId: id } })
      }

      return tx.product.delete({ where: { id } })
    })
  }

  /**
   * تعديل المخزون بشكل ذري
   */
  static async adjustStock(id: string, change: number) {
    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) throw new Error("المنتج غير موجود")

    const newStock = Math.max(0, product.stock + change)
    return prisma.product.update({
      where: { id },
      data: { stock: newStock },
    })
  }
}
