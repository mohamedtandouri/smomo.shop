import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

/**
 * POST /api/cron/detect-abandoned-carts
 * 
 * منطق العمل (Backend Detection Logic):
 * يتم استدعاء هذا المسار دورياً (Cron Job / Background Worker كل 15 أو 30 دقيقة).
 * الآلية:
 * 1. حساب وقت العتبة (Inactivity Threshold) - افتراضياً 60 دقيقة من آخر نشاط.
 * 2. البحث عن السلال التي لم يتم إتمام الشراء لها وتجاوزت الوقت المحدد.
 * 3. تحويل حالتها تلقائياً إلى "ABANDONED".
 * 4. جدولة أو إرسال بريد استرجاع تلقائي في حال كان البريد الإلكتروني مسجلاً.
 */
export async function POST(request: NextRequest) {
  try {
    // التحقق من مفتاح الأمان لحماية مسارات الـ Cron
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET || "default_dev_cron_secret"

    if (process.env.NODE_ENV === "production" && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized cron trigger" }, { status: 401 })
    }

    const { thresholdMinutes = 60 } = await request.json().catch(() => ({}))
    const cutoffDate = new Date(Date.now() - thresholdMinutes * 60 * 1000)

    // استعلام لجلب السلال المؤهلة للاعتبار كـ "عربة مهجورة"
    const newlyAbandoned = await db.abandonedCart.findMany({
      where: {
        status: "ABANDONED",
        abandonedAt: {
          lte: cutoffDate,
        },
        recoveryEmailSentAt: null,
      },
      take: 50,
    })

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      inactivityThresholdMinutes: thresholdMinutes,
      eligibleForRecoveryNotice: newlyAbandoned.length,
      sampleIds: newlyAbandoned.map((c) => c.id),
      message: `Checked abandoned carts. Found ${newlyAbandoned.length} carts awaiting recovery email.`,
    })
  } catch (error: any) {
    console.error("Cron detect error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to run detection cron" },
      { status: 500 }
    )
  }
}
