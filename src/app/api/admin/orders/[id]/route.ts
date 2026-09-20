import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/auth";
import { prisma } from "@/src/lib/prisma";
import { z } from "zod";

const schema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"])
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const { id } = await params;
  const existing = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!existing) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  if (existing.status === "CANCELLED" && parsed.data.status !== "CANCELLED") {
    return NextResponse.json({ error: "Cancelled orders cannot be reopened automatically" }, { status: 409 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (parsed.data.status === "CANCELLED" && existing.status !== "CANCELLED") {
      for (const item of existing.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } }
          });
        }
      }
      if (existing.couponId) {
        await tx.coupon.update({
          where: { id: existing.couponId },
          data: { usedCount: { decrement: 1 } }
        });
      }
    }

    return tx.order.update({
      where: { id },
      data: { status: parsed.data.status }
    });
  });

  return NextResponse.json(updated);
}
