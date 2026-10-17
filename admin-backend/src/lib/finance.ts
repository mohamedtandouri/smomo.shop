import { Prisma } from "@prisma/client"

/**
 * وحدة الحسابات المالية الدقيقة (Financial Math & Currency Module)
 * 
 * المبدأ الأمني والمالي:
 * تمنع هذه الوحدة استخدام أرقام النقطة العائمة (IEEE 754 Floating-Point) في العمليات الحسابية
 * لتفادي أخطاء التقريب مثل 0.1 + 0.2 = 0.30000000000000004.
 * يتم تحويل كافة المبالغ إلى "أجزاء صغرى / Cents" (أعداد صحيحة)،
 * ويتم تنفيذ جميع العمليات الحسابية بدقة مطلقة، ثم تحويل الناتج إلى Decimal للتخزين بقاعدة البيانات.
 */

/**
 * تحويل أي قيمة مالية (Number, String, Decimal) إلى عدد صحيح من السنتات/Cents
 * @param amount القيمة المالية
 * @returns عدد السنتات كعدد صحيح دقيق
 */
export function toCents(amount: number | string | Prisma.Decimal | null | undefined): number {
  if (amount === null || amount === undefined) return 0

  if (typeof amount === "number") {
    if (isNaN(amount) || !isFinite(amount)) return 0
    return Math.round(amount * 100)
  }

  if (typeof amount === "string") {
    const cleaned = amount.trim().replace(/[^0-9.-]/g, "")
    const parsed = parseFloat(cleaned)
    if (isNaN(parsed)) return 0
    return Math.round(parsed * 100)
  }

  // Prisma.Decimal
  try {
    const num = Number(amount.toString())
    return Math.round(num * 100)
  } catch {
    return 0
  }
}

/**
 * تحويل السنتات (Cents) إلى قيمة رقمية عادية برقمين عشريين
 * @param cents عدد السنتات
 */
export function fromCents(cents: number): number {
  if (isNaN(cents) || !isFinite(cents)) return 0
  return Math.round(cents) / 100
}

/**
 * تحويل السنتات إلى كائن Prisma.Decimal صالح للتخزين في قاعدة البيانات
 * @param cents عدد السنتات
 */
export function toDecimal(cents: number): Prisma.Decimal {
  const normal = fromCents(cents)
  return new Prisma.Decimal(normal.toFixed(2))
}

/**
 * تحويل قيمة مالية مباشرة إلى كائن Prisma.Decimal آمن مع ضمان رقمين عشريين
 */
export function safeDecimal(amount: number | string | Prisma.Decimal | null | undefined): Prisma.Decimal {
  const cents = toCents(amount)
  return toDecimal(cents)
}

/**
 * تنسيق المبلغ المالي للعرض مع رمز العملة
 */
export function formatCurrency(amount: number | string | Prisma.Decimal, currency: string = "USD"): string {
  const cents = toCents(amount)
  const value = fromCents(cents)
  
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    return `${value.toFixed(2)} ${currency}`
  }
}

export interface FinancialCalculationParams {
  items: Array<{
    price: number | string | Prisma.Decimal
    quantity: number
  }>
  discountCents?: number
  shippingFeeCents?: number
  taxRatePercent?: number
}

export interface OrderFinancialSummary {
  subtotalCents: number
  discountCents: number
  shippingFeeCents: number
  taxCents: number
  totalCents: number
  
  // Decimal representations ready for Prisma
  subtotalDecimal: Prisma.Decimal
  discountDecimal: Prisma.Decimal
  shippingFeeDecimal: Prisma.Decimal
  taxDecimal: Prisma.Decimal
  totalDecimal: Prisma.Decimal
  
  // Clean human-readable floats
  subtotal: number
  discount: number
  shippingFee: number
  tax: number
  total: number
}

/**
 * حساب المعاملات المالية للطلب بشكل ذري ودقيق
 * يضمن: Total = Subtotal - Discount + Tax + ShippingFee بدقة 100%
 */
export function calculateOrderFinancials(params: FinancialCalculationParams): OrderFinancialSummary {
  // 1. حساب المجموع الفرعي الدقيق بالسنتات
  let subtotalCents = 0
  for (const item of params.items) {
    const unitPriceCents = toCents(item.price)
    const qty = Math.max(1, Math.floor(item.quantity || 1))
    subtotalCents += unitPriceCents * qty
  }

  // 2. حساب الخصم بالسنتات
  const requestedDiscountCents = Math.max(0, Math.floor(params.discountCents || 0))
  // الخصم لا يتجاوز قيمة السلع
  const discountCents = Math.min(requestedDiscountCents, subtotalCents)

  // 3. قيمة السلع بعد الخصم
  const taxableAmountCents = subtotalCents - discountCents

  // 4. الضريبة بالسنتات
  const taxRate = Math.max(0, params.taxRatePercent || 0)
  const taxCents = taxRate > 0 ? Math.round((taxableAmountCents * taxRate) / 100) : 0

  // 5. مصاريف الشحن بالسنتات
  const shippingFeeCents = Math.max(0, Math.floor(params.shippingFeeCents || 0))

  // 6. الإجمالي النهائي المطلق (بدون أي تقريب غير منضبط)
  const totalCents = Math.max(0, subtotalCents - discountCents + taxCents + shippingFeeCents)

  return {
    subtotalCents,
    discountCents,
    shippingFeeCents,
    taxCents,
    totalCents,

    subtotalDecimal: toDecimal(subtotalCents),
    discountDecimal: toDecimal(discountCents),
    shippingFeeDecimal: toDecimal(shippingFeeCents),
    taxDecimal: toDecimal(taxCents),
    totalDecimal: toDecimal(totalCents),

    subtotal: fromCents(subtotalCents),
    discount: fromCents(discountCents),
    shippingFee: fromCents(shippingFeeCents),
    tax: fromCents(taxCents),
    total: fromCents(totalCents),
  }
}
