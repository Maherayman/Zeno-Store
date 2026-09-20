import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/auth";
import { prisma } from "@/src/lib/prisma";

async function allowed() {
  const s = await auth();
  return s?.user && ["ADMIN", "MANAGER"].includes(s.user.role);
}
export async function GET() {
  if (!await allowed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await prisma.storeSettings.findUnique({ where: { id: "store" } }));
}
export async function PATCH(req: NextRequest) {
  if (!await allowed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  if (typeof b.storeName !== "string" || !b.storeName.trim()) return NextResponse.json({ error: "Store name is required" }, { status: 400 });
  const paymentMethods = Array.isArray(b.paymentMethods) ? b.paymentMethods.filter((x: unknown) => typeof x === "string" && x.trim()) : [];
  const settings = await prisma.storeSettings.upsert({
    where: { id: "store" },
    update: { storeName: b.storeName.trim(), logoUrl: b.logoUrl?.trim() || null, contactPhone: b.contactPhone?.trim() || null, contactEmail: b.contactEmail?.trim() || null, whatsapp: b.whatsapp?.trim() || null, shippingPolicy: b.shippingPolicy?.trim() || null, paymentMethods },
    create: { id: "store", storeName: b.storeName.trim(), logoUrl: b.logoUrl?.trim() || null, contactPhone: b.contactPhone?.trim() || null, contactEmail: b.contactEmail?.trim() || null, whatsapp: b.whatsapp?.trim() || null, shippingPolicy: b.shippingPolicy?.trim() || null, paymentMethods, currency: "EGP" }
  });
  return NextResponse.json(settings);
}
