import { NextResponse } from "next/server";
import { auth } from "@/src/auth";
import { prisma } from "@/src/lib/prisma";

async function allowed() {
  const s = await auth();
  return s?.user && ["ADMIN", "MANAGER"].includes(s.user.role);
}
export async function GET() {
  if (!await allowed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const users = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    select: { id: true, name: true, email: true, phone: true, createdAt: true, _count: { select: { orders: true, reviews: true } } },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(users);
}
