import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { productSchema } from "@/src/lib/validations";

export async function POST(request: NextRequest) {
  const parsed = productSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product data", details: parsed.error.flatten() }, { status: 400 });
  }
  const product = await prisma.product.create({ data: parsed.data });
  return NextResponse.json(product, { status: 201 });
}
