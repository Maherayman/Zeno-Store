import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { productSchema } from "@/src/lib/validations";
import { auth } from "@/src/auth";

async function requireManager() {
  const session = await auth();
  if (!session?.user || !["ADMIN", "MANAGER"].includes(session.user.role)) return null;
  return session;
}

export async function GET() {
  if (!await requireManager()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const products = await prisma.product.findMany({
    include: { images: { orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const session = await requireManager();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid product data", details: parsed.error.flatten() }, { status: 400 });

  const { images, ...productData } = body;
  const validated = productSchema.safeParse(productData);
  if (!validated.success) return NextResponse.json({ error: "Invalid product data", details: validated.error.flatten() }, { status: 400 });
  const product = await prisma.$transaction(async tx => {
    const created = await tx.product.create({ data: validated.data });
    if (Array.isArray(images) && images.length) {
      await tx.productImage.createMany({ data: images.map((image: { url: string; alt?: string; sortOrder?: number }, i: number) => ({ productId: created.id, url: image.url, alt: image.alt, sortOrder: image.sortOrder ?? i })) });
    }
    return tx.product.findUnique({ where: { id: created.id }, include: { images: { orderBy: { sortOrder: "asc" } } } });
  });
  return NextResponse.json(product, { status: 201 });
}
