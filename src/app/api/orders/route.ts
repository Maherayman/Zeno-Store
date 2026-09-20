import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/auth";
import { prisma } from "@/src/lib/prisma";
import { z } from "zod";

const orderSchema = z.object({
  items: z.array(z.object({ productId: z.string(), quantity: z.number().int().positive() })).min(1),
  shippingName: z.string().min(2),
  shippingPhone: z.string().min(7),
  addressLine1: z.string().min(5),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  governorate: z.string().optional(),
  notes: z.string().optional(),
  couponCode: z.string().trim().optional()
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "يجب تسجيل الدخول أولًا" }, { status: 401 });

  const parsed = orderSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "بيانات الطلب غير صحيحة", details: parsed.error.flatten() }, { status: 400 });

  const data = parsed.data;
  const productIds = [...new Set(data.items.map(i => i.productId))];

  try {
    const order = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({ where: { id: { in: productIds }, isActive: true } });
      if (products.length !== productIds.length) throw new Error("PRODUCT_NOT_FOUND");

      const byId = new Map(products.map(p => [p.id, p]));
      let subtotal = 0;
      const orderItems = [];

      for (const item of data.items) {
        const product = byId.get(item.productId)!;
        if (product.stock < item.quantity) throw new Error(`OUT_OF_STOCK:${product.name}`);
        subtotal += Number(product.price) * item.quantity;
        orderItems.push({ productId: product.id, productName: product.name, unitPrice: product.price, quantity: item.quantity });
      }

      let discount = 0;
      let couponId: string | undefined;
      if (data.couponCode) {
        const coupon = await tx.coupon.findUnique({ where: { code: data.couponCode.toUpperCase() } });
        const now = new Date();
        if (coupon?.isActive && (!coupon.startsAt || coupon.startsAt <= now) && (!coupon.expiresAt || coupon.expiresAt >= now) && (!coupon.maxUses || coupon.usedCount < coupon.maxUses) && (!coupon.minOrderAmount || subtotal >= Number(coupon.minOrderAmount))) {
          couponId = coupon.id;
          discount = coupon.discountType === "PERCENTAGE" ? subtotal * Number(coupon.discountValue) / 100 : Math.min(subtotal, Number(coupon.discountValue));
        }
      }

      const shippingFee = 0;
      const total = Math.max(0, subtotal - discount) + shippingFee;
      const orderNumber = `ZN-${Date.now().toString().slice(-8)}`;

      for (const item of data.items) {
        const result = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } }
        });
        if (result.count !== 1) throw new Error("STOCK_CHANGED");
      }

      const created = await tx.order.create({
        data: {
          orderNumber, userId: session.user.id, couponId, subtotal, discount, shippingFee, total,
          shippingName: data.shippingName, shippingPhone: data.shippingPhone,
          addressLine1: data.addressLine1, addressLine2: data.addressLine2,
          city: data.city, governorate: data.governorate, notes: data.notes,
          items: { create: orderItems }
        },
        include: { items: true }
      });

      if (couponId) await tx.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } });
      return created;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "PRODUCT_NOT_FOUND") return NextResponse.json({ error: "أحد المنتجات لم يعد متاحًا" }, { status: 409 });
    if (message.startsWith("OUT_OF_STOCK:")) return NextResponse.json({ error: `الكمية غير متاحة: ${message.split(":")[1]}` }, { status: 409 });
    if (message === "STOCK_CHANGED") return NextResponse.json({ error: "المخزون اتغير، راجع السلة وحاول مرة أخرى" }, { status: 409 });
    return NextResponse.json({ error: "تعذر إنشاء الطلب" }, { status: 500 });
  }
}
