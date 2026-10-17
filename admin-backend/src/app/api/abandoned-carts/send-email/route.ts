import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// POST /api/abandoned-carts/send-email - محاكاة منطق إرسال بريد إلكتروني للعميل
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cartId, id, customerEmail, discountCode = "SAVE15", offerSubject, offerMessage } = body

    const targetId = cartId || id

    if (!targetId && !customerEmail) {
      return NextResponse.json(
        { success: false, error: "cartId or customerEmail is required" },
        { status: 400 }
      )
    }

    let cart = null
    if (targetId) {
      cart = await db.abandonedCart.findUnique({
        where: { id: targetId },
        include: {
          items: {
            include: { product: true },
          },
        },
      })
    } else if (customerEmail) {
      cart = await db.abandonedCart.findFirst({
        where: { customerEmail: customerEmail.trim().toLowerCase() },
        orderBy: { abandonedAt: "desc" },
      })
    }

    if (!cart) {
      return NextResponse.json(
        { success: false, error: "Abandoned cart record not found" },
        { status: 404 }
      )
    }

    // محاكاة الإرسال عبر خادم البريد
    await new Promise((resolve) => setTimeout(resolve, 500))

    const emailPayload = {
      recipient: cart.customerEmail,
      recipientName: cart.customerName,
      subject: offerSubject || `We saved your cart, ${cart.customerName}! Complete your order with code ${discountCode}`,
      discountCode,
      message: offerMessage || `Don't leave your favorite items behind. Use coupon code ${discountCode} at checkout for an exclusive discount!`,
      cartTotal: cart.totalValue,
      itemCount: cart.itemsCount,
      sentAt: new Date().toISOString(),
      status: "SENT",
    }

    // تحديث سجل العربة في قاعدة البيانات
    const updatedCart = await db.abandonedCart.update({
      where: { id: cart.id },
      data: {
        status: "EMAIL_SENT",
        recoveryEmailSentAt: new Date(),
        notes: cart.notes 
          ? `${cart.notes}\n[Email Sent: ${discountCode} at ${new Date().toLocaleDateString()}]`
          : `[Email Sent: ${discountCode} at ${new Date().toLocaleDateString()}]`,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Recovery email with discount code '${discountCode}' successfully sent to ${cart.customerEmail}`,
      email: emailPayload,
      cart: updatedCart,
    })
  } catch (error: any) {
    console.error("Error in send-email endpoint:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send email to customer" },
      { status: 500 }
    )
  }
}
