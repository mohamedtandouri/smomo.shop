"use server"

import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { calculateOrderFinancials, fromCents, toCents, toDecimal } from "@/lib/finance"

export interface CartCheckoutItem {
  id: string
  quantity: number
  productId?: string
}

function getBaseProductId(item: CartCheckoutItem): string {
  if (item.productId) return item.productId
  if (item.id && item.id.includes("-")) {
    return item.id.split("-")[0]
  }
  return item.id
}

const CheckoutSchema = z.object({
  name: z.string().trim().min(2, "Customer name is required"),
  email: z.string().trim().email("Valid email address is required"),
  phone: z.string().trim().min(6, "Valid phone number is required"),
  address: z.string().trim().min(3, "Delivery address is required"),
  city: z.string().trim().min(2, "City is required"),
  postalCode: z.string().trim().optional(),
  note: z.string().trim().optional(),
})

export async function createOrder(
  formData: FormData,
  cartItems: CartCheckoutItem[]
) {
  try {
    if (!cartItems || cartItems.length === 0) {
      return { success: false, error: "Shopping cart is empty." }
    }

    const rawData = {
      name: (formData.get("name") as string) || "",
      email: (formData.get("email") as string) || "",
      phone: (formData.get("phone") as string) || "",
      address: (formData.get("address") as string) || "",
      city: (formData.get("city") as string) || "",
      postalCode: (formData.get("postalCode") as string) || "",
      note: (formData.get("note") as string) || "",
    }

    const validation = CheckoutSchema.safeParse(rawData)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || "Invalid checkout form data.",
      }
    }

    const { name, email, phone, address, city, postalCode, note } = validation.data

    const session = await getServerSession(authOptions)
    let orderUserId: string | null = null

    if (session?.user?.id) {
      orderUserId = session.user.id
    } else {
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      })
      if (existingUser) {
        orderUserId = existingUser.id
      }
    }

    const productIds = Array.from(new Set(cartItems.map(getBaseProductId)))
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    })

    const productMap = new Map(dbProducts.map((p) => [p.id, p]))

    const sanitizedItems: { productId: string; quantity: number; price: any; unitPriceCents: number }[] = []

    for (const item of cartItems) {
      const baseProductId = getBaseProductId(item)
      const dbProduct = productMap.get(baseProductId)
      if (!dbProduct) {
        return {
          success: false,
          error: `Product with ID ${item.id} was not found in catalog.`,
        }
      }

      const qty = Math.max(1, Math.floor(Number(item.quantity) || 1))

      if (dbProduct.stock < qty) {
        return {
          success: false,
          error: `Insufficient stock for product "${dbProduct.name}". Only ${dbProduct.stock} available.`,
        }
      }

      const unitPriceCents = toCents(dbProduct.price)
      sanitizedItems.push({
        productId: dbProduct.id,
        quantity: qty,
        price: dbProduct.price,
        unitPriceCents,
      })
    }

    let rawSubtotalCents = 0
    for (const item of sanitizedItems) {
      rawSubtotalCents += item.unitPriceCents * item.quantity
    }

    const shippingFeeCents = rawSubtotalCents >= 5000 ? 0 : 1000

    const financials = calculateOrderFinancials({
      items: sanitizedItems.map((i) => ({ price: i.price, quantity: i.quantity })),
      shippingFeeCents,
      discountCents: 0,
      taxRatePercent: 0,
    })

    const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`

    const destinationNote = [
      `Address: ${address}, ${city}`,
      postalCode ? `Postal Code: ${postalCode}` : null,
      phone ? `Phone: ${phone}` : null,
      note ? `Customer Note: ${note}` : null,
    ]
      .filter(Boolean)
      .join(" | ")

    const createdOrder = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName: name,
          customerEmail: email.toLowerCase(),
          userId: orderUserId,
          status: "Processing",
          subtotal: financials.subtotal,
          shippingFee: financials.shippingFee,
          discount: financials.discount,
          tax: financials.tax,
          total: financials.total,
          note: destinationNote,
          items: {
            create: sanitizedItems.map((item) => ({
              product: { connect: { id: item.productId } },
              quantity: item.quantity,
              price: fromCents(item.unitPriceCents),
            })),
          },
        },
      })

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
            `Stock reservation conflict for product ${item.productId}. Please retry.`
          )
        }
      }

      return newOrder
    })

    return {
      success: true,
      orderNumber: createdOrder.orderNumber,
      orderId: createdOrder.id,
      total: financials.total,
    }
  } catch (error: any) {
    console.error("Secure Checkout Error:", error)
    return {
      success: false,
      error: error?.message || "An unexpected error occurred during checkout.",
    }
  }
}
