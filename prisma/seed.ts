import { PrismaClient, DiscountType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.storeSettings.upsert({
    where: { id: "store" },
    update: {},
    create: {
      id: "store",
      storeName: "Zeno Store",
      currency: "EGP",
      paymentMethods: ["Cash on Delivery"]
    }
  });

  await prisma.coupon.upsert({
    where: { code: "NEW20" },
    update: { isActive: true, discountValue: 20 },
    create: {
      code: "NEW20",
      discountType: DiscountType.PERCENTAGE,
      discountValue: 20,
      isActive: true
    }
  });

  const products = [
    {
      name: "Zeno Classic Black",
      slug: "zeno-classic-black",
      sku: "ZENO-001",
      brand: "Zeno",
      category: "Classic",
      description: "ساعة كلاسيكية أنيقة للاستخدام اليومي والمناسبات.",
      price: 2499,
      compareAtPrice: 2999,
      stock: 12,
      isFeatured: true
    },
    {
      name: "Zeno Chrono Steel",
      slug: "zeno-chrono-steel",
      sku: "ZENO-002",
      brand: "Zeno",
      category: "Chronograph",
      description: "تصميم رياضي عصري بسوار معدني.",
      price: 3199,
      compareAtPrice: 3699,
      stock: 8,
      isFeatured: true
    },
    {
      name: "Zeno Minimal Silver",
      slug: "zeno-minimal-silver",
      sku: "ZENO-003",
      brand: "Zeno",
      category: "Minimal",
      description: "تصميم بسيط ونظيف مناسب للإطلالات اليومية.",
      price: 1999,
      stock: 15,
      isFeatured: false
    }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: product,
      create: product
    });
  }

  console.log("Zeno Store seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
