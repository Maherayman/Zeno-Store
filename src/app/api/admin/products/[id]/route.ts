import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/auth";
import { prisma } from "@/src/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  sku: z.string().min(2).optional(),
  description: z.string().nullable().optional(),
  brand: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  price: z.coerce.number().nonnegative().optional(),
  compareAtPrice: z.coerce.number().nonnegative().nullable().optional(),
  stock: z.coerce.number().int().nonnegative().optional(),
  lowStockAt: z.coerce.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  images: z.array(z.object({ url: z.string().url(), alt: z.string().optional(), sortOrder: z.number().int().optional() })).optional()
});

async function allowed() {
  const session = await auth();
  return session?.user && ["ADMIN", "MANAGER"].includes(session.user.role) ? session : null;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await allowed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid product data", details: parsed.error.flatten() }, { status: 400 });
  const { id } = await params;
  const { images, ...data } = parsed.data;

  try {
    const product = await prisma.$transaction(async tx => {
      const updated = await tx.product.update({
        where: { id },
        data: {
          ...data,
          ...(data.price !== undefined ? { price: data.price } : {}),
          ...(data.compareAtPrice !== undefined ? { compareAtPrice: data.compareAtPrice } : {})
        }
      });
      if (images) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (images.length) await tx.productImage.createMany({ data: images.map((image, i) => ({ productId: id, url: image.url, alt: image.alt, sortOrder: image.sortOrder ?? i })) });
      }
      return tx.product.findUnique({ where: { id: updated.id }, include: { images: { orderBy: { sortOrder: "asc" } } } });
    });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Product not found or duplicate slug/SKU" }, { status: 404 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await allowed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    await prisma.product.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
}
