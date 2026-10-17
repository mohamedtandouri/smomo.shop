const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Starting Inventory & Review Seeding...");

  // 1. تحديث أو إضافة المنتجات الأربعة الأساسية من الصورة الأولى
  const primaryProducts = [
    {
      name: "Wireless Headphones",
      sku: "WH-01",
      stock: 148,
      price: 129.99,
      description: "Premium noise-cancelling wireless headphones with 40-hour battery life.",
      imageUrl: "/uploads/1033fcf8-15f9-4d72-b18b-8eb5bf115e52.webp",
      updatedAt: new Date("2023-10-24T12:00:00Z"),
    },
    {
      name: "Bluetooth Speaker",
      sku: "BS-05",
      stock: 12,
      price: 79.99,
      description: "Rugged waterproof outdoor bluetooth speaker with 360 sound.",
      imageUrl: "/uploads/76f77d42-0019-42c3-b1b4-f90d04e15202.jpg",
      updatedAt: new Date("2023-10-23T14:30:00Z"),
    },
    {
      name: "Smart Watch",
      sku: "SW-02",
      stock: 0,
      price: 199.99,
      description: "Advanced fitness tracker and AMOLED smart watch.",
      imageUrl: "/uploads/0bfca58b-364e-44a4-b52d-bbdd4536e532.webp",
      updatedAt: new Date("2023-10-22T09:15:00Z"),
    },
    {
      name: "Phone Case",
      sku: "PC-11",
      stock: 300,
      price: 24.99,
      description: "Shockproof slim silicone phone case with anti-fingerprint coating.",
      imageUrl: "/uploads/9d37de92-c4b6-4164-8efd-c7bda3b3e1af.webp",
      updatedAt: new Date("2023-10-21T18:00:00Z"),
    },
  ];

  const productMap = {};

  for (const p of primaryProducts) {
    let prod = await prisma.product.findFirst({
      where: {
        OR: [
          { sku: p.sku },
          { name: p.name },
        ],
      },
    });

    if (prod) {
      prod = await prisma.product.update({
        where: { id: prod.id },
        data: {
          name: p.name,
          sku: p.sku,
          stock: p.stock,
          price: p.price,
          description: p.description,
          imageUrl: p.imageUrl,
          updatedAt: p.updatedAt,
        },
      });
      console.log(`Updated product: ${prod.name} (SKU: ${prod.sku}, Stock: ${prod.stock})`);
    } else {
      prod = await prisma.product.create({
        data: p,
      });
      console.log(`Created product: ${prod.name} (SKU: ${prod.sku}, Stock: ${prod.stock})`);
    }

    productMap[p.sku] = prod;
  }

  // 2. إضافة منتجات إضافية للمخزون للوصول إلى الإجمالي (Total Units: 12,450، Low Stock: 24، Out of Stock: 3)
  const additionalWarehouseCatalog = [
    // 2 إضافيين Out of Stock (المجموع يصبح 3 كما في الصورة)
    { name: "USB-C Fast Charger 65W", sku: "CH-09", stock: 0, price: 34.99, updatedAt: new Date("2023-10-20T10:00:00Z") },
    { name: "Ergonomic Gaming Mouse", sku: "GM-04", stock: 0, price: 49.99, updatedAt: new Date("2023-10-19T11:00:00Z") },
    
    // 23 إضافيين Low Stock (المجموع يصبح 24 كما في الصورة: 1 + 23 = 24)
    ...Array.from({ length: 23 }).map((_, i) => ({
      name: `Warehouse Component Part #${i + 101}`,
      sku: `WCP-${i + 101}`,
      stock: (i % 15) + 1, // بين 1 و 15
      price: 19.99 + i * 2,
      updatedAt: new Date(Date.now() - (i + 1) * 86400000),
    })),
  ];

  // حساب الوحدات المتبقية للوصول بالضبط إلى 12,450
  const currentTotal = primaryProducts.reduce((sum, x) => sum + x.stock, 0) + 
    additionalWarehouseCatalog.reduce((sum, x) => sum + x.stock, 0);
  const remainingTo12450 = 12450 - currentTotal;

  const bulkInventoryProducts = [
    ...additionalWarehouseCatalog,
    {
      name: "Bulk Master Warehouse Pack",
      sku: "BMW-99",
      stock: remainingTo12450 > 0 ? remainingTo12450 : 500,
      price: 15.00,
      updatedAt: new Date("2023-10-18T08:00:00Z"),
    },
  ];

  for (const item of bulkInventoryProducts) {
    const existing = await prisma.product.findUnique({
      where: { sku: item.sku },
    });
    if (!existing) {
      await prisma.product.create({
        data: item,
      });
    }
  }

  // 3. إضافة مراجعات المخزون (Inventory Reviews) الأربعة من الصورة الثانية
  const inventoryReviewsData = [
    {
      reviewCode: "REV-001",
      productSku: "WH-01",
      productName: "Wireless Headphones",
      expected: 150,
      actual: 148,
      status: "discrepancy",
      date: new Date("2023-10-24T00:00:00Z"),
      notes: "Physical count was 2 units short of expected inventory.",
    },
    {
      reviewCode: "REV-002",
      productSku: "BS-05",
      productName: "Bluetooth Speaker",
      expected: 45,
      actual: 45,
      status: "matched",
      date: new Date("2023-10-23T00:00:00Z"),
      notes: "Stock reconciled and 100% matched warehouse log.",
    },
    {
      reviewCode: "REV-003",
      productSku: "SW-02",
      productName: "Smart Watch",
      expected: 80,
      actual: 75,
      status: "discrepancy",
      date: new Date("2023-10-22T00:00:00Z"),
      notes: "5 units missing during monthly audit.",
    },
    {
      reviewCode: "REV-004",
      productSku: "PC-11",
      productName: "Phone Case",
      expected: 300,
      actual: 300,
      status: "matched",
      date: new Date("2023-10-21T00:00:00Z"),
      notes: "All 300 units verified in shelf bin A-14.",
    },
  ];

  for (const rev of inventoryReviewsData) {
    const prod = productMap[rev.productSku];
    const existingReview = await prisma.inventoryReview.findUnique({
      where: { reviewCode: rev.reviewCode },
    });

    if (!existingReview) {
      await prisma.inventoryReview.create({
        data: {
          reviewCode: rev.reviewCode,
          productId: prod ? prod.id : null,
          productName: rev.productName,
          sku: rev.productSku,
          expected: rev.expected,
          actual: rev.actual,
          status: rev.status,
          date: rev.date,
          notes: rev.notes,
        },
      });
      console.log(`Created review: ${rev.reviewCode} (${rev.productName} -> ${rev.status})`);
    } else {
      await prisma.inventoryReview.update({
        where: { reviewCode: rev.reviewCode },
        data: {
          productId: prod ? prod.id : null,
          productName: rev.productName,
          sku: rev.productSku,
          expected: rev.expected,
          actual: rev.actual,
          status: rev.status,
          date: rev.date,
          notes: rev.notes,
        },
      });
      console.log(`Updated review: ${rev.reviewCode}`);
    }
  }

  // 4. فحص الإحصائيات الناتجة
  const allProds = await prisma.product.findMany();
  const totalUnits = allProds.reduce((sum, p) => sum + (p.stock || 0), 0);
  const lowStockCount = allProds.filter((p) => p.stock > 0 && p.stock <= 20).length;
  const outOfStockCount = allProds.filter((p) => p.stock === 0).length;

  console.log("\n Inventory Seeding Completed Successfully!");
  console.log(`- Total Units: ${totalUnits.toLocaleString()}`);
  console.log(`- Low Stock Items: ${lowStockCount}`);
  console.log(`- Out of Stock Items: ${outOfStockCount}`);
  console.log(`- Inventory Reviews: ${await prisma.inventoryReview.count()}`);
}

main()
  .catch((e) => {
    console.error("Error seeding inventory:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
