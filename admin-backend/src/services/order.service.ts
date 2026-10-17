import { prisma } from "@/lib/db"
import { calculateOrderFinancials, toCents, fromCents, toDecimal } from "@/lib/finance"
import { Prisma } from "@prisma/client"

export interface OrderItemInput {
  productId: string
  quantity: number
}

export interface CreateOrderParams {
  customerName?: string
  customerEmail?: string | null
  userId?: string | null
  items: OrderItemInput[]
  couponCode?: string | null
  manualDiscountCents?: number
  manualShippingFeeCents?: number
  manualTaxRatePercent?: number
  note?: string | null
  tags?: string | null
  status?: string
}

export interface OrderServiceResult<T = any> {
  success: boolean
  data?: T
  error?: string
  statusCode?: number
}

export class OrderService {
  /**
   * إنشاء طلب جديد مع التطبيق الصارم للأمان المالي والذرية (Atomicity)
   * 
   * القواعد المطبقة:
   * 1. منع استقبال الأسعار من العميل نهائياً. يتم جلب السعر الرسمي من جدول المنتجات بالخادم.
   * 2. الحسابات المالية بالسنتات الصحيحة (Integer Cents) لتفادي أخطاء النقطة العائمة.
   * 3. التحقق من توافر المخزون لكل منتج قبل الخصم.
   * 4. تنفيذ العملية بالكامل داخل معاملة ذرية (Prisma Transaction) مع قفل المخزون (Optimistic Concurrency).
   * 5. في حال فشل أي خطوة يتم التراجع التلقائي (Automatic Rollback).
   */
  static async createOrder(params: CreateOrderParams): Promise<OrderServiceResult<{ orderId: string; orderNumber: string; total: number }>> {
    try {
      if (!params.items || params.items.length === 0) {
        return { success: false, error: "يجب تقديم منتج واحد على الأقل في الطلب", statusCode: 400 }
      }

      // 1. استخراج المعرفات الموحدة وتنظيف الكميات
      const sanitizedItems = params.items.map((item) => ({
        productId: item.productId.trim(),
        quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
      }))

      const productIds = Array.from(new Set(sanitizedItems.map((i) => i.productId)))

      // 2. جلب المنتجات والأسعار الرسمية من قاعدة البيانات حصراً
      const dbProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
      })

      const productMap = new Map(dbProducts.map((p) => [p.id, p]))

      // 3. التحقق من وجود جميع المنتجات وكفاية المخزون
      for (const item of sanitizedItems) {
        const product = productMap.get(item.productId)
        if (!product) {
          return {
            success: false,
            error: `المنتج ذو المعرف "${item.productId}" غير موجود في الكتالوج`,
            statusCode: 404,
          }
        }

        if (product.stock < item.quantity) {
          return {
            success: false,
            error: `المخزون غير كافٍ للمنتج "${product.name}". المتوفر حالياً: ${product.stock} فقط`,
            statusCode: 409,
          }
        }
      }

      // 4. فحص وتطبيق الكوبون إن وجد
      let couponDiscountCents = 0
      let validatedCouponId: string | null = null

      if (params.couponCode && params.couponCode.trim()) {
        const cleanCode = params.couponCode.trim().toUpperCase()
        const coupon = await prisma.coupon.findUnique({
          where: { code: cleanCode },
        })

        if (!coupon || !coupon.isActive) {
          return { success: false, error: "كود الخصم غير صالح أو غير مفعل", statusCode: 400 }
        }

        validatedCouponId = coupon.id
        if (coupon.discountType === "PERCENTAGE") {
          // حساب نسبة الخصم لاحقاً بعد معرفة المجموع الفرعي
          const pct = Math.min(100, Math.max(0, Number(coupon.discountValue)))
          // سنحسبها في الخطوة التالية
          couponDiscountCents = pct // تخزين مؤقت للنسبة
        } else if (coupon.discountType === "FIXED") {
          couponDiscountCents = toCents(coupon.discountValue)
        }
      }

      // 5. حساب التفاصيل المالية بالسنتات الصحيحة
      const itemsForCalc = sanitizedItems.map((item) => {
        const prod = productMap.get(item.productId)!
        return {
          price: prod.price,
          quantity: item.quantity,
        }
      })

      // حساب المجموع الفرعي الأولي
      let rawSubtotalCents = 0
      for (const it of itemsForCalc) {
        rawSubtotalCents += toCents(it.price) * it.quantity
      }

      // ضبط الخصم النهائي
      let totalDiscountCents = Math.max(0, params.manualDiscountCents || 0)
      if (validatedCouponId) {
        const coupon = await prisma.coupon.findUnique({ where: { id: validatedCouponId } })
        if (coupon?.discountType === "PERCENTAGE") {
          const pct = Number(coupon.discountValue)
          totalDiscountCents += Math.round((rawSubtotalCents * pct) / 100)
        } else if (coupon?.discountType === "FIXED") {
          totalDiscountCents += toCents(coupon.discountValue)
        }
      }

      // الشحن الافتراضي: مجاني إذا كان المجموع >= 5000 سنت (50 دولار/درهم) أو المحدد يدوياً
      let shippingFeeCents = params.manualShippingFeeCents
      if (shippingFeeCents === undefined) {
        shippingFeeCents = rawSubtotalCents >= 5000 ? 0 : 1000 // 10 units = 1000 cents
      }

      const financialSummary = calculateOrderFinancials({
        items: itemsForCalc,
        discountCents: totalDiscountCents,
        shippingFeeCents,
        taxRatePercent: params.manualTaxRatePercent || 0,
      })

      const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`

      // 6. المعاملة الذرية (Database Transaction) لضمان مبدأ Atomicity
      const createdOrder = await prisma.$transaction(async (tx) => {
        // إنشاء سجل الطلب
        const order = await tx.order.create({
          data: {
            orderNumber,
            customerName: params.customerName || "عميل المتجر",
            customerEmail: params.customerEmail ? params.customerEmail.toLowerCase().trim() : null,
            userId: params.userId || null,
            status: params.status || "Processing",
            subtotal: financialSummary.subtotal,
            discount: financialSummary.discount,
            shippingFee: financialSummary.shippingFee,
            tax: financialSummary.tax,
            total: financialSummary.total,
            note: params.note || null,
            tags: params.tags || null,
            items: {
              create: sanitizedItems.map((item) => {
                const prod = productMap.get(item.productId)!
                return {
                  product: { connect: { id: prod.id } },
                  quantity: item.quantity,
                  price: fromCents(toCents(prod.price)),
                }
              }),
            },
          },
        })

        // خصم المخزون مع التأكد الصارم من عدم الوصول للقيم السالبة (Concurrency Safe)
        for (const item of sanitizedItems) {
          const updateResult = await tx.product.updateMany({
            where: {
              id: item.productId,
              stock: { gte: item.quantity },
            },
            data: {
              stock: { decrement: item.quantity },
            },
          })

          if (updateResult.count === 0) {
            throw new Error(
              `فشل حجز المخزون للمنتج ذو المعرف "${item.productId}". قد يكون تم شراؤه من مستخدم آخر للتو.`
            )
          }
        }

        return order
      })

      return {
        success: true,
        data: {
          orderId: createdOrder.id,
          orderNumber: createdOrder.orderNumber,
          total: financialSummary.total,
        },
      }
    } catch (error: any) {
      console.error("[OrderService.createOrder] Error:", error)
      return {
        success: false,
        error: error.message || "حدث خطأ غير متوقع أثناء معالجة الطلب في الخادم",
        statusCode: 500,
      }
    }
  }

  /**
   * إلغاء الطلب واسترجاع المخزون بشكل ذري
   */
  static async cancelOrder(orderId: string): Promise<OrderServiceResult<{ orderId: string }>> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      })

      if (!order) {
        return { success: false, error: "الطلب غير موجود", statusCode: 404 }
      }

      if (order.status === "Cancelled") {
        return { success: false, error: "الطلب ملغى بالفعل مسبقاً", statusCode: 400 }
      }

      // تنفيذ المعاملة الذرية: تغيير الحالة + إعادة الكميات للمخزون
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: orderId },
          data: { status: "Cancelled" },
        })

        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity },
            },
          })
        }
      })

      return { success: true, data: { orderId } }
    } catch (error: any) {
      console.error("[OrderService.cancelOrder] Error:", error)
      return { success: false, error: error.message || "فشل إلغاء الطلب", statusCode: 500 }
    }
  }

  /**
   * جلب تفاصيل طلب مفرد
   */
  static async getOrderById(orderId: string) {
    return prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                imageUrl: true,
                price: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profile: true,
          },
        },
      },
    })
  }

  /**
   * تحديث حالة الطلب
   */
  static async updateOrderStatus(orderId: string, status: string): Promise<OrderServiceResult> {
    try {
      const updated = await prisma.order.update({
        where: { id: orderId },
        data: { status },
      })
      return { success: true, data: updated }
    } catch (error: any) {
      return { success: false, error: error.message || "فشل تحديث حالة الطلب" }
    }
  }
}
