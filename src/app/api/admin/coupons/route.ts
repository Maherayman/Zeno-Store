import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/auth";
import { prisma } from "@/src/lib/prisma";
import { z } from "zod";

const schema = z.object({
  code: z.string().trim().min(2).max(40).transform(v => v.toUpperCase()),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.coerce.number().positive(),
  isActive: z.boolean().default(true),
  startsAt: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  minOrderAmount: z.coerce.number().nonnegative().optional().nullable(),
  maxUses: z.coerce.number().int().positive().optional().nullable()
});

async function allowed() {
  const s = await auth();
  return s?.user && ["ADMIN", "MANAGER"].includes(s.user.role);
}

export async function GET() {
  if (!await allowed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } }));
}

export async function POST(req: NextRequest) {
  if (!await allowed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid coupon data", details: parsed.error.flatten() }, { status: 400 });
  const b = parsed.data;
  if (b.discountType === "PERCENTAGE" && b.discountValue > 100) return NextResponse.json({ error: "Percentage cannot exceed 100." }, { status: 400 });
  try {
    const coupon = await prisma.coupon.create({
      data: {
        code: b.code, discountType: b.discountType, discountValue: b.discountValue,
        isActive: b.isActive, startsAt: b.startsAt ? new Date(b.startsAt) : null,
        expiresAt: b.expiresAt ? new Date(b.expiresAt) : null,
        minOrderAmount: b.minOrderAmount ?? null, maxUses: b.maxUses ?? null
      }
    });
    return NextResponse.json(coupon, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Coupon code already exists." }, { status: 409 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!await allowed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const id = typeof body.id === "string" ? body.id : "";
  const parsed = schema.partial().safeParse(body);
  if (!id || !parsed.success) return NextResponse.json({ error: "Invalid coupon data" }, { status: 400 });
  const b = parsed.data;
  try {
    const coupon = await prisma.coupon.update({ where: { id }, data: {
      ...(b.code !== undefined ? { code: b.code } : {}),
      ...(b.discountType !== undefined ? { discountType: b.discountType } : {}),
      ...(b.discountValue !== undefined ? { discountValue: b.discountValue } : {}),
      ...(b.isActive !== undefined ? { isActive: b.isActive } : {}),
      ...(b.startsAt !== undefined ? { startsAt: b.startsAt ? new Date(b.startsAt) : null } : {}),
      ...(b.expiresAt !== undefined ? { expiresAt: b.expiresAt ? new Date(b.expiresAt) : null } : {}),
      ...(b.minOrderAmount !== undefined ? { minOrderAmount: b.minOrderAmount } : {}),
      ...(b.maxUses !== undefined ? { maxUses: b.maxUses } : {})
    }});
    return NextResponse.json(coupon);
  } catch { return NextResponse.json({ error: "Could not update coupon." }, { status: 400 }); }
}

export async function DELETE(req: NextRequest) {
  if (!await allowed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Coupon id is required." }, { status: 400 });
  await prisma.coupon.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ success: true });
}
