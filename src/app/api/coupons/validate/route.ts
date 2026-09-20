import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { z } from "zod";

const schema = z.object({ code: z.string().min(1), subtotal: z.number().nonnegative() });

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ valid: false, message: "Invalid request" }, { status: 400 });

  const { code, subtotal } = parsed.data;
  const coupon = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
  const now = new Date();

  if (!coupon || !coupon.isActive || (coupon.startsAt && coupon.startsAt > now) ||
      (coupon.expiresAt && coupon.expiresAt < now) ||
      (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) ||
      (coupon.minOrderAmount !== null && subtotal < Number(coupon.minOrderAmount))) {
    return NextResponse.json({ valid: false, message: "Coupon is not valid for this order." }, { status: 400 });
  }

  const value = Number(coupon.discountValue);
  const discount = coupon.discountType === "PERCENTAGE"
    ? Math.min(subtotal, subtotal * value / 100)
    : Math.min(subtotal, value);

  return NextResponse.json({ valid: true, code: coupon.code, discount });
}
