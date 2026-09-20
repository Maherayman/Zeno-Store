import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category")?.trim();
  const featured = searchParams.get("featured");

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { brand: { contains: q, mode: "insensitive" } }, { category: { contains: q, mode: "insensitive" } }] } : {}),
      ...(category ? { category } : {}),
      ...(featured === "true" ? { isFeatured: true } : {})
    },
    include: { images: { orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(products);
}
