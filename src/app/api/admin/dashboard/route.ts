import { NextResponse } from "next/server";
import { auth } from "@/src/auth";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || !["ADMIN", "MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [orders, products, customers, pendingReviews, lowStockProducts, revenue, recentOrders, soldItems] = await Promise.all([
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
    prisma.order.aggregate({ where: { status: { not: "CANCELLED" } }, _sum: { total: true } }),
    prisma.order.findMany({
      where: { status: { not: "CANCELLED" } },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, orderNumber: true, total: true, status: true, createdAt: true, user: { select: { name: true, email: true } } }
    }),
    prisma.orderItem.findMany({
      where: { order: { status: { not: "CANCELLED" } }, productId: { not: null } },
      select: { productId: true, quantity: true, product: { select: { name: true, sku: true } } },
      take: 5000
    })
  ]);

  const grouped = new Map<string, { productId: string; name: string; sku: string; quantity: number }>();
  for (const item of soldItems) {
    if (!item.productId || !item.product) continue;
    const current = grouped.get(item.productId);
    if (current) current.quantity += item.quantity;
    else grouped.set(item.productId, { productId: item.productId, name: item.product.name, sku: item.product.sku, quantity: item.quantity });
  }

  const topProducts = [...grouped.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5);

  return NextResponse.json({
    orders, products, customers, pendingReviews,
    revenue: Number(revenue._sum.total ?? 0),
    lowStockProducts,
    recentOrders,
    topProducts
  });
}
