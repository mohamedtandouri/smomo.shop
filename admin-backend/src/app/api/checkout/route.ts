import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { OrderService } from "@/services/order.service"
import { z } from "zod"

const ApiCheckoutSchema = z.object({
  customerName: z.string().trim().min(2, "اسم العميل مطلوب").max(120),
  customerEmail: z.string().trim().email("البريد الإلكتروني غير صحيح"),
  customerPhone: z.string().trim().optional(),
  address: z.string().trim().min(3, "عنوان التوصيل مطلوب"),
  city: z.string().trim().min(2, "المدينة مطلوبة"),
  zipCode: z.string().trim().optional(),
  note: z.string().trim().optional(),
  couponCode: z.string().trim().optional(),
  paymentMethod: z.string().trim().default("COD"),
  items: z.array(
    z.object({
      productId: z.string().trim().min(1, "معرف المنتج مطلوب"),
      quantity: z.coerce.number().int().min(1, "الكمية يجب أن تكون 1 على الأقل"),
    })
  ).min(1, "سلة المشتريات فارغة"),
})

// POST /api/checkout - إتمام عملية الشراء الآمنة من المتجر
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json()
    const validation = ApiCheckoutSchema.safeParse(rawBody)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0]?.message || "بيانات إتمام الشراء غير صالحة",
          details: validation.error.format(),
        },
        { status: 400 }
      )
    }

    const {
      customerName,
      customerEmail,
      customerPhone,
      address,
      city,
      zipCode,
      note,
      couponCode,
      paymentMethod,
      items,
    } = validation.data

    // البحث عن مستخدم مسجل مسبقاً بنفس البريد الإلكتروني
    const existingUser = await db.user.findUnique({
      where: { email: customerEmail.toLowerCase() },
    })

    const fullNote = [
      `العنوان: ${address}, ${city} ${zipCode || ""}`,
      customerPhone ? `الهاتف: ${customerPhone}` : null,
      `وسيلة الدفع: ${paymentMethod}`,
      note ? `ملاحظات: ${note}` : null,
    ]
      .filter(Boolean)
      .join(" | ")

    // 2. تفويض المعالجة إلى OrderService (حسابات السنتات، استعلام الأسعار الخادمي، المعاملة الذرية)
    const result = await OrderService.createOrder({
      customerName,
      customerEmail,
      userId: existingUser ? existingUser.id : null,
      items,
      couponCode,
      note: fullNote,
      tags: `STORE_CHECKOUT,${paymentMethod}`,
      status: "Processing",
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.statusCode || 400 }
      )
    }

    // 3. تحديث أي سلة متروكة تخص هذا العميل
    try {
      await db.abandonedCart.updateMany({
        where: {
          customerEmail: customerEmail.toLowerCase(),
          status: { in: ["ABANDONED", "EMAIL_SENT", "CONTACTED"] },
        },
        data: {
          status: "RECOVERED",
          notes: `تم استرجاع السلة بنجاح عبر الطلب: ${result.data!.orderNumber}`,
        },
      })
    } catch (e) {
      console.warn("Could not mark abandoned cart recovered:", e)
    }

    return NextResponse.json(
      {
        success: true,
        message: "تم إنشاء الطلب بنجاح",
        orderNumber: result.data!.orderNumber,
        orderId: result.data!.orderId,
        total: result.data!.total,
        currency: "USD",
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Secure Checkout Error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "حدث خطأ أثناء معالجة الطلب" },
      { status: 500 }
    )
  }
}
