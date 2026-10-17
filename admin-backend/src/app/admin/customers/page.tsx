import { prisma } from "@/lib/db"
import { CustomersClient } from "./CustomersClient"

export default async function CustomersPage() {
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    include: {
      orders: {
        include: {
          items: true // needed to calculate total accurately if not stored, but Order has totalAmount?
        }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  // Format data for the client
  const formattedCustomers = users.map(user => {
    // Calculate total spent based on Order.total
    const totalSpent = user.orders.reduce((sum, order) => sum + (order.total || 0), 0)
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      imageUrl: user.imageUrl,
      ordersCount: user.orders.length,
      totalSpent: totalSpent
    }
  })

  return <CustomersClient initialCustomers={formattedCustomers} />
}
