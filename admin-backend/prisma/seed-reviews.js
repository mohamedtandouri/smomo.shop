const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Product Reviews...');

  // 1. التأكد من وجود المنتجات الأربعة المذكورة في الصورة
  const requiredProducts = [
    { name: "Wireless Headphones", price: 129.99, description: "Noise-cancelling wireless over-ear headphones.", stock: 45, imageUrl: "/uploads/1033fcf8-15f9-4d72-b18b-8eb5bf115e52.webp" },
    { name: "Bluetooth Speaker", price: 79.99, description: "Portable waterproof bluetooth speaker with deep bass.", stock: 30, imageUrl: "/uploads/76f77d42-0019-42c3-b1b4-f90d04e15202.jpg" },
    { name: "Smart Watch", price: 199.99, description: "Fitness tracking smart watch with heart rate monitor.", stock: 25, imageUrl: "/uploads/0bfca58b-364e-44a4-b52d-bbdd4536e532.webp" },
    { name: "Phone Case", price: 24.99, description: "Slim protective phone case with shock absorption.", stock: 100, imageUrl: "/uploads/9d37de92-c4b6-4164-8efd-c7bda3b3e1af.webp" },
  ];

  const productMap = {};

  for (const prod of requiredProducts) {
    let existing = await prisma.product.findFirst({
      where: { name: { equals: prod.name } },
    });

    if (!existing) {
      existing = await prisma.product.create({
        data: prod,
      });
      console.log(`Created product: ${existing.name}`);
    } else {
      console.log(`Product exists: ${existing.name}`);
    }

    productMap[prod.name] = existing.id;
  }

  // 2. التحقق من التقييمات الموجودة
  const count = await prisma.review.count();
  if (count > 0) {
    console.log(`Reviews already exist (${count} reviews found).`);
    return;
  }

  // 3. إضافة المراجعات الأربعة المطابقة للصورة تماماً
  const reviewsData = [
    {
      productName: "Wireless Headphones",
      customerName: "Alice Smith",
      rating: 5,
      comment: "Excellent sound quality and very comfortable!",
      createdAt: new Date("2023-10-24T10:30:00Z"),
      status: "APPROVED",
    },
    {
      productName: "Bluetooth Speaker",
      customerName: "Bob Jones",
      rating: 4,
      comment: "Good bass, but battery life could be better.",
      createdAt: new Date("2023-10-23T14:15:00Z"),
      status: "APPROVED",
    },
    {
      productName: "Smart Watch",
      customerName: "Charlie Brown",
      rating: 5,
      comment: "Tracks everything perfectly. Highly recommend.",
      createdAt: new Date("2023-10-22T09:45:00Z"),
      status: "APPROVED",
    },
    {
      productName: "Phone Case",
      customerName: "Diana Prince",
      rating: 3,
      comment: "Looks nice but scratches easily.",
      createdAt: new Date("2023-10-21T18:20:00Z"),
      status: "APPROVED",
    },
  ];

  for (const r of reviewsData) {
    const productId = productMap[r.productName];
    if (productId) {
      await prisma.review.create({
        data: {
          productId,
          customerName: r.customerName,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
          status: r.status,
        },
      });
      console.log(`Created review for ${r.productName} by ${r.customerName}`);
    }
  }

  console.log('Successfully seeded all product reviews from the screenshot!');
}

main()
  .catch((e) => {
    console.error('Error seeding reviews:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
