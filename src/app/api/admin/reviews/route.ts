import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/auth";
import { prisma } from "@/src/lib/prisma";

async function allowed() { const s = await auth(); return s?.user && ["ADMIN", "MANAGER"].includes(s.user.role); }
export async function GET() {
  if (!await allowed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const reviews = await prisma.review.findMany({
    include: { user: { select: { name: true, email: true } }, product: { select: { name: true } } },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(reviews);
}
export async function PATCH(req: NextRequest) {
  if (!await allowed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  if (!body.id || !["PENDING","APPROVED","HIDDEN"].includes(body.status)) return NextResponse.json({ error: "Invalid review data" }, { status: 400 });
  const review = await prisma.review.update({ where: { id: body.id }, data: { status: body.status } });
  return NextResponse.json(review);
}
