import { PrismaClient } from "@prisma/client";

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
    update: { isActive: true, discountType: "PERCENTAGE", discountValue: 20 },
    create: {
      code: "NEW20",
      discountType: "PERCENTAGE",
      discountValue: 20,
      isActive: true
    }
  });
}

main().finally(() => prisma.$disconnect());
