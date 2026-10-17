import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { z, ZodError } from "zod"

/**
 * نوع سياق المسارات الديناميكية ذات المعرّف الواحد `[id]`
 * (في Next.js 16 أصبح `params` وعداً Promise يجب انتظاره).
 */
export type IdRouteContext = { params: Promise<{ id: string }> }

/**
 * خطأ تطبيقي يحمل رمز حالة HTTP ليُترجم مباشرة إلى استجابة JSON موحّدة.
 * يُرمى من طبقة الخدمات (Services) ويُلتقط في `handleApiError`.
 */
export class ApiError extends Error {
  /**
   * @param status - رمز حالة HTTP (مثل 400، 404، 409)
   * @param message - رسالة خطأ واضحة للمستخدم
   * @param details - تفاصيل إضافية اختيارية (مثل أخطاء الحقول)
   */
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message)
    this.name = "ApiError"
  }
}

/**
 * يبني استجابة خطأ JSON موحّدة بنفس الشكل المستخدم في المشروع `{ success: false, error }`.
 *
 * @param message - رسالة الخطأ
 * @param status - رمز حالة HTTP (افتراضياً 400)
 * @param details - تفاصيل اختيارية تُضاف إلى الحقل `details`
 * @returns NextResponse بصيغة JSON
 */
export function apiError(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    { success: false, error: message, ...(details !== undefined && { details }) },
    { status }
  )
}

/**
 * يحوّل أخطاء Zod إلى قائمة مسطّحة `{ field, message }` سهلة العرض في الواجهة.
 *
 * @param error - كائن ZodError
 * @returns مصفوفة أخطاء الحقول
 */
export function formatZodIssues(error: ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.join(".") || "body",
    message: issue.message,
  }))
}

/**
 * يقرأ جسم الطلب كـ JSON ويتحقق منه عبر مخطط Zod.
 * يرمي `ApiError(400)` عند JSON غير صالح أو بيانات لا تطابق المخطط.
 *
 * @param request - طلب Next.js الوارد
 * @param schema - مخطط Zod للتحقق
 * @returns البيانات بعد التحقق والتطهير
 */
export async function parseRequestBody<TSchema extends z.ZodType>(
  request: NextRequest | Request,
  schema: TSchema
): Promise<z.infer<TSchema>> {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    throw new ApiError(400, "جسم الطلب ليس JSON صالحاً")
  }

  const result = schema.safeParse(raw)
  if (!result.success) {
    const issues = formatZodIssues(result.error)
    throw new ApiError(400, issues[0]?.message || "بيانات الإدخال غير صالحة", issues)
  }
  return result.data
}

/**
 * يترجم أي خطأ إلى استجابة HTTP مناسبة دون كشف تفاصيل داخلية:
 * - ApiError       → رمزه الخاص
 * - ZodError       → 400
 * - Prisma P2002   → 409 (قيمة فريدة مكررة)
 * - Prisma P2003   → 409 (قيد مفتاح أجنبي يمنع العملية)
 * - Prisma P2025   → 404 (السجل غير موجود)
 * - غير ذلك        → 500 مع رسالة عامة
 *
 * @param error - الخطأ الملتقط
 * @param context - وصف العملية لأغراض التسجيل (مثل "creating coupon")
 * @returns NextResponse بصيغة JSON
 */
export function handleApiError(error: unknown, context: string) {
  if (error instanceof ApiError) {
    return apiError(error.message, error.status, error.details)
  }

  if (error instanceof ZodError) {
    const issues = formatZodIssues(error)
    return apiError(issues[0]?.message || "بيانات الإدخال غير صالحة", 400, issues)
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002": {
        const target = (error.meta?.target as string[] | string | undefined) ?? ""
        return apiError(`القيمة مستخدمة مسبقاً: ${Array.isArray(target) ? target.join(", ") : target}`, 409)
      }
      case "P2003":
        return apiError("لا يمكن تنفيذ العملية لوجود سجلات مرتبطة بهذا العنصر", 409)
      case "P2025":
        return apiError("السجل المطلوب غير موجود", 404)
    }
  }

  console.error(`Error ${context}:`, error)
  return apiError("حدث خطأ داخلي غير متوقع في الخادم", 500)
}

/**
 * يحوّل قيمة Prisma.Decimal (أو رقم/نص/null) إلى رقم JavaScript لاستخدامه في الحسابات.
 * ضروري لأن جمع Decimal مباشرة بالرقم يؤدي إلى دمج نصي بدلاً من الجمع.
 *
 * @param value - القيمة العشرية
 * @returns رقم (0 عند القيم الفارغة)
 */
export function toNumber(value: Prisma.Decimal | number | string | null | undefined): number {
  if (value === null || value === undefined) return 0
  return typeof value === "number" ? value : Number(value.toString())
}
