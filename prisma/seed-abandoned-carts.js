const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Abandoned Carts...');

  const count = await prisma.abandonedCart.count();
  if (count > 0) {
    console.log(`Abandoned carts already seeded (${count} existing records).`);
    return;
  }

  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000);

  const sampleCarts = [
    {
      customerName: "David Smith",
      customerEmail: "david@example.com",
      itemsCount: 3,
      totalValue: 245.50,
      abandonedAt: twoHoursAgo,
      status: "ABANDONED",
    },
    {
      customerName: "Guest User",
      customerEmail: "guest84@mail.com",
      itemsCount: 1,
      totalValue: 89.99,
      abandonedAt: oneDayAgo,
      status: "ABANDONED",
    },
    {
      customerName: "Sarah Jenkins",
      customerEmail: "sarah.j@outlook.com",
      itemsCount: 2,
      totalValue: 149.00,
      abandonedAt: threeDaysAgo,
      status: "EMAIL_SENT",
      recoveryEmailSentAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
    },
    {
      customerName: "Alex Rivera",
      customerEmail: "alex.r@gmail.com",
      itemsCount: 4,
      totalValue: 310.20,
      abandonedAt: fiveHoursAgo,
      status: "RECOVERED",
    }
  ];

  for (const cart of sampleCarts) {
    await prisma.abandonedCart.create({
      data: cart,
    });
  }

  console.log('Successfully seeded abandoned carts!');
}

main()
  .catch((e) => {
    console.error('Error seeding abandoned carts:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
