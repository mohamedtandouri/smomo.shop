import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// Mock Email Recovery Service
async function mockSendEmail(to: string, customerName: string, totalValue: number | any, discountCode = "COMEBACK10") {
  // محاكاة تأخير الإرسال عبر SMTP أو Resend أو SendGrid
  await new Promise((resolve) => setTimeout(resolve, 600))
  
  return {
    to,
    customerName,
    subject: `Did you forget something, ${customerName}? Complete your purchase with 10% off!`,
    discountCode,
    totalValue,
    sentAt: new Date().toISOString(),
    status: "DELIVERED",
  }
}

// POST /api/abandoned-carts/send-recovery
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cartId, bulk, cartIds, discountCode = "COMEBACK10" } = body

    // 1. حالة الإرسال الجماعي (Bulk Recovery)
    if (bulk || (Array.isArray(cartIds) && cartIds.length > 0)) {
      const whereCondition = cartIds && cartIds.length > 0 
        ? { id: { in: cartIds } }
        : { status: "ABANDONED" }

      const cartsToRecover = await db.abandonedCart.findMany({
        where: whereCondition,
      })

      if (cartsToRecover.length === 0) {
        return NextResponse.json({
          success: true,
          count: 0,
          message: "No abandoned carts found eligible for recovery emails.",
        })
      }

      // محاكاة إرسال البريد لكل عميل
      const emailResults = await Promise.all(
        cartsToRecover.map((cart) =>
          mockSendEmail(cart.customerEmail, cart.customerName, cart.totalValue, discountCode)
        )
      )

      // تحديث حالة السجلات في قاعدة البيانات دفعة واحدة
      const targetIds = cartsToRecover.map((c) => c.id)
      await db.abandonedCart.updateMany({
        where: { id: { in: targetIds } },
        data: {
          status: "EMAIL_SENT",
          recoveryEmailSentAt: new Date(),
        },
      })

      return NextResponse.json({
        success: true,
        count: cartsToRecover.length,
        message: `Recovery emails successfully dispatched to ${cartsToRecover.length} customer(s).`,
        emails: emailResults,
      })
    }

    // 2. حالة الإرسال الفردي (Single Cart Recovery)
    if (!cartId) {
      return NextResponse.json(
        { success: false, error: "cartId or bulk flag is required" },
        { status: 400 }
      )
    }

    const cart = await db.abandonedCart.findUnique({
      where: { id: cartId },
    })

    if (!cart) {
      return NextResponse.json(
        { success: false, error: "Abandoned cart not found" },
        { status: 404 }
      )
    }

    // إرسال البريد للعميل
    const emailResult = await mockSendEmail(
      cart.customerEmail,
      cart.customerName,
      cart.totalValue,
      discountCode
    )

    // تحديث حالة العربة
    const updatedCart = await db.abandonedCart.update({
      where: { id: cartId },
      data: {
        status: "EMAIL_SENT",
        recoveryEmailSentAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: `Recovery email sent successfully to ${cart.customerEmail}`,
      email: emailResult,
      cart: updatedCart,
    })
  } catch (error: any) {
    console.error("Error sending recovery email:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send recovery email" },
      { status: 500 }
    )
  }
}
