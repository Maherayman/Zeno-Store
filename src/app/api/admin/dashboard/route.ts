import { NextResponse } from "next/server";
import { auth } from "@/src/auth";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || !["ADMIN", "MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [orders, products, customers, pendingReviews, lowStockProducts, revenue] = await Promise.all([
    prisma.order.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.review.count({ where: { status: "PENDING" } }),
    prisma.product.findMany({
      where: { isActive: true, stock: { lte: 5 } },
      select: { id: true, name: true, sku: true, stock: true, lowStockAt: true },
      orderBy: { stock: "asc" },
      take: 8
    }),
    prisma.order.aggregate({ where: { status: { not: "CANCELLED" } }, _sum: { total: true } })
  ]);

  return NextResponse.json({
    orders, products, customers, pendingReviews,
    revenue: Number(revenue._sum.total ?? 0),
    lowStockProducts
  });
}
