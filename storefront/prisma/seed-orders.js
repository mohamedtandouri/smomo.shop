const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log("Seeding sample orders matching the UI screenshot...")

  const sampleOrders = [
    {
      orderNumber: "ORD-1002",
      customerName: "Sarah Jenkins",
      customerEmail: "sarah.j@example.com",
      total: 129.99,
      status: "Processing",
      imageUrl: "/uploads/1033fcf8-15f9-4d72-b18b-8eb5bf115e52.webp",
      note: "Customer requested gift packaging",
      createdAt: new Date("2026-09-08T10:24:00Z"),
    },
    {
      orderNumber: "ORD-1001",
      customerName: "Michael Chen",
      customerEmail: "m.chen@example.com",
      total: 45.00,
      status: "Shipped",
      imageUrl: "/uploads/76f77d42-0019-42c3-b1b4-f90d04e15202.jpg",
      note: "Tracking code: TRK-982341",
      createdAt: new Date("2026-09-07T14:15:00Z"),
    },
    {
      orderNumber: "ORD-1000",
      customerName: "Emma Watson",
      customerEmail: "emma.w@example.com",
      total: 399.50,
      status: "Delivered",
      imageUrl: "/uploads/0bfca58b-364e-44a4-b52d-bbdd4536e532.webp",
      note: "Delivered to reception desk",
      createdAt: new Date("2023-10-24T11:00:00Z"),
    },
    {
      orderNumber: "ORD-0999",
      customerName: "James Smith",
      customerEmail: "james.s@example.com",
      total: 89.99,
      status: "Cancelled",
      imageUrl: "/uploads/9d37de92-c4b6-4164-8efd-c7bda3b3e1af.webp",
      note: "Customer requested cancellation before shipment",
      createdAt: new Date("2023-10-23T16:45:00Z"),
    },
    {
      orderNumber: "ORD-0998",
      customerName: "Olivia Brown",
      customerEmail: "olivia.b@example.com",
      total: 15.50,
      status: "Processing",
      imageUrl: "/uploads/76f77d42-0019-42c3-b1b4-f90d04e15202.jpg",
      note: "Standard delivery",
      createdAt: new Date("2023-10-23T09:30:00Z"),
    },
  ]

  for (const order of sampleOrders) {
    await prisma.order.upsert({
      where: { orderNumber: order.orderNumber },
      update: {
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        total: order.total,
        status: order.status,
        imageUrl: order.imageUrl,
        note: order.note,
        createdAt: order.createdAt,
      },
      create: {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        total: order.total,
        subtotal: order.total,
        status: order.status,
        imageUrl: order.imageUrl,
        note: order.note,
        createdAt: order.createdAt,
      },
    })
  }

  console.log("Seeding finished successfully! 5 orders seeded.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
