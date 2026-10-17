import { z } from "zod"

/**
 * طبقة التحقق الموحّدة (Validation Layer) لكل مدخلات واجهات API الإدارية.
 *
 * قواعد عامة:
 * - مخططات الإنشاء (Create) تفرض الحقول الإلزامية.
 * - مخططات التحديث (Update) جزئية: الحقل الغائب `undefined` لا يُلمس، والقيمة الفارغة تتحول إلى `null`.
 * - في Zod v4 لا يمكن استدعاء `.partial()` على مخطط يحتوي `refine`، لذلك نعرّف مخططاً أساسياً ثم نشتق منه.
 */

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

/** معرّف سجل (cuid) غير فارغ */
export const idSchema = z.string().trim().min(1, "المعرّف مطلوب").max(64, "المعرّف غير صالح")

/** مبلغ مالي غير سالب بحد أعلى منطقي */
export const moneySchema = z.coerce
  .number({ error: "يجب أن تكون القيمة رقماً" })
  .min(0, "لا يمكن أن تكون القيمة سالبة")
  .max(1_000_000_000, "القيمة كبيرة جداً")

/** عدد صحيح غير سالب (مخزون، كميات) */
export const nonNegativeIntSchema = z.coerce
  .number({ error: "يجب أن تكون القيمة رقماً صحيحاً" })
  .int("يجب أن تكون القيمة رقماً صحيحاً")
  .min(0, "لا يمكن أن تكون القيمة سالبة")
  .max(10_000_000, "القيمة كبيرة جداً")

/**
 * نص اختياري قابل للإفراغ: `undefined` يبقى كما هو (لا تحديث)، والنص الفارغ أو `null` يصبح `null`.
 *
 * @param max - الحد الأقصى لعدد الأحرف
 */
export const nullableText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `يجب ألا يتجاوز النص ${max} حرفاً`)
    .nullish()
    .transform((value) => (value === undefined ? undefined : value || null))

/** بريد إلكتروني مُطهّر بأحرف صغيرة */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("صيغة البريد الإلكتروني غير صحيحة")
  .max(100, "البريد الإلكتروني طويل جداً")

/** بريد إلكتروني اختياري قابل للإفراغ */
export const nullableEmailSchema = z
  .union([emailSchema, z.literal(""), z.null()])
  .optional()
  .transform((value) => (value === undefined ? undefined : value || null))

/** تاريخ اختياري قابل للإفراغ يقبل ISO string أو timestamp */
export const nullableDateSchema = z
  .union([z.coerce.date({ error: "صيغة التاريخ غير صحيحة" }), z.literal(""), z.null()])
  .optional()
  .transform((value) => (value === undefined ? undefined : value || null))

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

const productBaseSchema = z.object({
  name: z.string().trim().min(1, "اسم المنتج مطلوب").max(200, "اسم المنتج طويل جداً"),
  sku: nullableText(64),
  description: nullableText(50_000),
  price: moneySchema,
  compareAtPrice: moneySchema.nullish(),
  stock: nonNegativeIntSchema.default(0),
  imageUrl: nullableText(2048),
  categoryId: nullableText(64),
})

const compareAtPriceRule = {
  check: (d: { price?: number; compareAtPrice?: number | null }) =>
    d.compareAtPrice == null || d.price === undefined || d.compareAtPrice > d.price,
  message: "السعر قبل الخصم يجب أن يكون أكبر من السعر الحالي",
}

/** مخطط إنشاء منتج */
export const productCreateSchema = productBaseSchema.refine(compareAtPriceRule.check, {
  message: compareAtPriceRule.message,
  path: ["compareAtPrice"],
})

/** مخطط تحديث منتج (جزئي) */
export const productUpdateSchema = productBaseSchema
  .partial()
  .refine(compareAtPriceRule.check, { message: compareAtPriceRule.message, path: ["compareAtPrice"] })

/** مخطط التعديل السريع للمخزون من شاشة المخزون */
export const inventoryAdjustSchema = z.object({
  productId: idSchema.optional(),
  stock: nonNegativeIntSchema.optional(),
  sku: nullableText(64),
  name: z.string().trim().min(1).max(200).optional(),
  price: moneySchema.optional(),
})

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

const categoryBaseSchema = z.object({
  name: z.string().trim().min(1, "اسم التصنيف مطلوب").max(100, "اسم التصنيف طويل جداً"),
  description: nullableText(1000),
  imageUrl: nullableText(2048),
})

/** مخطط إنشاء تصنيف */
export const categoryCreateSchema = categoryBaseSchema
/** مخطط تحديث تصنيف (جزئي) */
export const categoryUpdateSchema = categoryBaseSchema.partial()

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

/** حالات الطلب المعتمدة حالياً في اللوحة والمتجر */
export const ORDER_STATUSES = ["Processing", "Shipped", "Delivered", "Cancelled", "PENDING"] as const
export const orderStatusSchema = z.enum(ORDER_STATUSES, {
  error: `حالة الطلب غير صالحة. القيم المسموحة: ${ORDER_STATUSES.join(", ")}`,
})

/** بند طلب: يُحسب سعره دائماً من قاعدة البيانات وليس من العميل */
export const orderItemInputSchema = z.object({
  productId: idSchema,
  quantity: z.coerce.number().int("الكمية يجب أن تكون عدداً صحيحاً").min(1, "الكمية يجب أن تكون 1 على الأقل").max(10_000),
})

const orderBaseSchema = z.object({
  customerName: z.string().trim().min(1, "اسم العميل مطلوب").max(120, "اسم العميل طويل جداً"),
  customerEmail: nullableEmailSchema,
  userId: nullableText(64),
  status: orderStatusSchema.default("Processing"),
  imageUrl: nullableText(2048),
  note: nullableText(5000),
  tags: nullableText(500),
  discount: moneySchema.default(0),
  shippingFee: moneySchema.default(0),
  tax: moneySchema.default(0),
  /** إجمالي يدوي — يُستخدم فقط للطلبات القديمة/اليدوية التي لا تحتوي بنوداً */
  total: moneySchema.optional(),
  items: z.array(orderItemInputSchema).max(100, "عدد البنود كبير جداً").optional(),
})

/** مخطط إنشاء طلب: يجب تمرير بنود أو إجمالي يدوي */
export const orderCreateSchema = orderBaseSchema.refine(
  (d) => (d.items && d.items.length > 0) || d.total !== undefined,
  { message: "يجب إضافة منتج واحد على الأقل أو تحديد إجمالي الطلب", path: ["items"] }
)

/** مخطط تحديث طلب (جزئي). تعديل البنود يتم عبر إعادة إنشاء الطلب للحفاظ على سلامة المخزون */
export const orderUpdateSchema = orderBaseSchema
  .omit({ items: true, discount: true, shippingFee: true, tax: true, status: true })
  .partial()
  .extend({ status: orderStatusSchema.optional() })

// ---------------------------------------------------------------------------
// Coupons
// ---------------------------------------------------------------------------

export const COUPON_DISCOUNT_TYPES = ["PERCENTAGE", "FIXED", "FREE_SHIPPING"] as const

const couponBaseSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9_-]{3,32}$/, "الكود يجب أن يتكون من 3 إلى 32 حرفاً (أحرف لاتينية، أرقام، - أو _)"),
  discountType: z.enum(COUPON_DISCOUNT_TYPES, { error: "نوع الخصم غير صالح" }),
  discountValue: moneySchema.default(0),
  isActive: z.boolean().default(true),
  minPurchase: moneySchema.nullish(),
  usageLimit: z.coerce.number().int().min(1, "حد الاستخدام يجب أن يكون 1 على الأقل").nullish(),
  startsAt: nullableDateSchema,
  endsAt: nullableDateSchema,
})

type CouponRuleInput = {
  discountType?: (typeof COUPON_DISCOUNT_TYPES)[number] | string
  discountValue?: number
  startsAt?: Date | null
  endsAt?: Date | null
}

/**
 * قواعد العمل الخاصة بالكوبون (تُطبق عند الإنشاء وبعد دمج التحديث مع السجل الحالي).
 *
 * @param data - بيانات الكوبون (كاملة أو بعد الدمج)
 * @returns رسالة الخطأ الأولى أو null إذا كانت البيانات سليمة
 */
export function getCouponRuleViolation(data: CouponRuleInput): string | null {
  const value = data.discountValue ?? 0
  if (data.discountType === "PERCENTAGE" && (value <= 0 || value > 100)) {
    return "نسبة الخصم يجب أن تكون بين 1 و 100"
  }
  if (data.discountType === "FIXED" && value <= 0) {
    return "قيمة الخصم الثابت يجب أن تكون أكبر من صفر"
  }
  if (data.startsAt && data.endsAt && data.endsAt <= data.startsAt) {
    return "تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء"
  }
  return null
}

/** مخطط إنشاء كوبون */
export const couponCreateSchema = couponBaseSchema.superRefine((data, ctx) => {
  const violation = getCouponRuleViolation(data)
  if (violation) ctx.addIssue({ code: "custom", message: violation, path: ["discountValue"] })
})

/** مخطط تحديث كوبون (جزئي) — القواعد المركبة تُتحقق بعد الدمج داخل المسار */
export const couponUpdateSchema = couponBaseSchema.partial()

// ---------------------------------------------------------------------------
// Up Sells
// ---------------------------------------------------------------------------

export const UPSELL_DISCOUNT_TYPES = ["PERCENTAGE", "FIXED"] as const

const upsellBaseSchema = z.object({
  name: z.string().trim().min(1, "اسم العرض مطلوب").max(120, "اسم العرض طويل جداً"),
  description: nullableText(1000),
  targetProductId: idSchema,
  offerProductId: idSchema,
  discountType: z.enum(UPSELL_DISCOUNT_TYPES, { error: "نوع الخصم غير صالح" }).default("PERCENTAGE"),
  discount: moneySchema.default(0),
  isActive: z.boolean().default(true),
})

type UpsellRuleInput = {
  targetProductId?: string
  offerProductId?: string
  discountType?: string
  discount?: number
}

/**
 * قواعد العمل الخاصة بعروض البيع الإضافي.
 *
 * @param data - بيانات العرض (كاملة أو بعد الدمج)
 * @returns رسالة الخطأ الأولى أو null
 */
export function getUpsellRuleViolation(data: UpsellRuleInput): string | null {
  if (data.targetProductId && data.targetProductId === data.offerProductId) {
    return "لا يمكن أن يكون المنتج المُحفّز هو نفسه منتج العرض"
  }
  if (data.discountType === "PERCENTAGE" && (data.discount ?? 0) > 100) {
    return "نسبة الخصم يجب ألا تتجاوز 100"
  }
  return null
}

/** مخطط إنشاء عرض بيع إضافي */
export const upsellCreateSchema = upsellBaseSchema.superRefine((data, ctx) => {
  const violation = getUpsellRuleViolation(data)
  if (violation) ctx.addIssue({ code: "custom", message: violation, path: ["offerProductId"] })
})

/** مخطط تحديث عرض بيع إضافي (جزئي) */
export const upsellUpdateSchema = upsellBaseSchema.partial()

// ---------------------------------------------------------------------------
// Customers (User role = USER) + Profile
// ---------------------------------------------------------------------------

export const USER_STATUSES = ["ACTIVE", "SUSPENDED"] as const

const profileSchema = z.object({
  address: nullableText(300),
  city: nullableText(100),
  zipCode: nullableText(20),
  country: nullableText(100),
})

const customerBaseSchema = z.object({
  name: z.string().trim().min(2, "الاسم يجب أن لا يقل عن حرفين").max(50, "الاسم طويل جداً"),
  email: emailSchema,
  phone: nullableText(30),
  status: z.enum(USER_STATUSES, { error: "حالة الحساب غير صالحة" }).default("ACTIVE"),
  password: z.string().min(8, "كلمة المرور يجب أن لا تقل عن 8 أحرف").max(100),
  profile: profileSchema.optional(),
})

/** مخطط إنشاء عميل */
export const customerCreateSchema = customerBaseSchema
/** مخطط تحديث عميل (جزئي، كلمة المرور اختيارية لإعادة التعيين من المدير) */
export const customerUpdateSchema = customerBaseSchema.partial()

export type CustomerCreateInput = z.infer<typeof customerCreateSchema>
export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>

// ---------------------------------------------------------------------------
// Product reviews
// ---------------------------------------------------------------------------

export const REVIEW_STATUSES = ["APPROVED", "PENDING", "REJECTED"] as const

const reviewBaseSchema = z.object({
  productId: idSchema,
  userId: nullableText(64),
  customerName: z.string().trim().min(1).max(100).default("Customer"),
  rating: z.coerce.number().int().min(1, "التقييم يجب أن يكون بين 1 و 5").max(5, "التقييم يجب أن يكون بين 1 و 5"),
  comment: nullableText(5000),
  status: z.enum(REVIEW_STATUSES, { error: "حالة المراجعة غير صالحة" }).default("APPROVED"),
  createdAt: z.coerce.date({ error: "صيغة التاريخ غير صحيحة" }).optional(),
})

/** مخطط إنشاء مراجعة منتج */
export const reviewCreateSchema = reviewBaseSchema
/** مخطط تحديث مراجعة منتج (جزئي) */
export const reviewUpdateSchema = reviewBaseSchema.partial()

// ---------------------------------------------------------------------------
// Abandoned carts
// ---------------------------------------------------------------------------

export const ABANDONED_CART_STATUSES = ["ABANDONED", "CONTACTED", "WAITING_REPLY", "RECOVERED", "EMAIL_SENT"] as const

const abandonedCartBaseSchema = z.object({
  customerName: z.string().trim().min(1, "اسم العميل مطلوب").max(120),
  customerEmail: emailSchema,
  customerPhone: nullableText(30),
  itemsCount: z.coerce.number().int().min(1, "عدد المنتجات يجب أن يكون 1 على الأقل").max(10_000).default(1),
  totalValue: moneySchema.default(0),
  abandonedAt: z.coerce.date({ error: "صيغة التاريخ غير صحيحة" }).optional(),
  status: z.enum(ABANDONED_CART_STATUSES, { error: "حالة السلة غير صالحة" }).default("ABANDONED"),
  notes: nullableText(2000),
})

/** مخطط إنشاء سلة مهجورة */
export const abandonedCartCreateSchema = abandonedCartBaseSchema
/** مخطط تحديث سلة مهجورة (جزئي) */
export const abandonedCartUpdateSchema = abandonedCartBaseSchema.partial()

// ---------------------------------------------------------------------------
// Inventory reviews (stock audits)
// ---------------------------------------------------------------------------

export const INVENTORY_REVIEW_STATUSES = ["matched", "discrepancy"] as const

const inventoryReviewBaseSchema = z.object({
  reviewCode: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{3,20}$/, "رمز المراجعة غير صالح").optional(),
  productId: nullableText(64),
  productName: nullableText(200),
  sku: nullableText(64),
  expected: nonNegativeIntSchema.optional(),
  actual: nonNegativeIntSchema.optional(),
  status: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.enum(INVENTORY_REVIEW_STATUSES, { error: "حالة الجرد غير صالحة" }))
    .optional(),
  notes: nullableText(2000),
  date: z.coerce.date({ error: "صيغة التاريخ غير صحيحة" }).optional(),
  /** عند التفعيل يُضبط مخزون المنتج على الكمية الفعلية المعدودة */
  reconcileStock: z.boolean().optional(),
})

/** مخطط إنشاء مراجعة جرد */
export const inventoryReviewCreateSchema = inventoryReviewBaseSchema.refine(
  (d) => Boolean(d.productId || d.productName || d.sku),
  { message: "اسم المنتج أو رمز SKU مطلوب", path: ["productName"] }
)

/** مخطط تحديث مراجعة جرد (جزئي، رمز المراجعة ثابت) */
export const inventoryReviewUpdateSchema = inventoryReviewBaseSchema.omit({ reviewCode: true }).partial()

// ---------------------------------------------------------------------------
// Wishlist
// ---------------------------------------------------------------------------

/** مخطط إضافة منتج لقائمة الأمنيات (المستخدم يُستخرج من الجلسة) */
export const wishlistAddSchema = z.object({
  productId: idSchema,
  /** مسموح للمدير فقط؛ يتم تجاهله للمستخدم العادي */
  userId: idSchema.optional(),
})

// ---------------------------------------------------------------------------
// Security: blocked IPs
// ---------------------------------------------------------------------------

/** مخطط حظر عنوان IP يدوياً */
export const blockedIpCreateSchema = z
  .object({
    ipAddress: z
      .string()
      .trim()
      .min(3, "عنوان IP غير صالح")
      .max(45, "عنوان IP غير صالح")
      .regex(/^[0-9a-fA-F:.]+$/, "عنوان IP غير صالح"),
    reason: z.string().trim().min(1, "سبب الحظر مطلوب").max(200),
    isPermanent: z.boolean().default(false),
    blockedUntil: nullableDateSchema,
  })
  .refine((d) => d.isPermanent || !d.blockedUntil || d.blockedUntil > new Date(), {
    message: "تاريخ انتهاء الحظر يجب أن يكون في المستقبل",
    path: ["blockedUntil"],
  })
