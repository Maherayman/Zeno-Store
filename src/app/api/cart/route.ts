import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/auth";
import { prisma } from "@/src/lib/prisma";

async function userId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function GET() {
  const id = await userId();
  if (!id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cart = await prisma.cart.findUnique({
    where: { userId: id },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { sortOrder: "asc" } }
            }
          }
        }
      }
    }
  });

  return NextResponse.json(cart ?? { items: [] });
}

export async function PUT(req: NextRequest) {
  const id = await userId();
  if (!id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!Array.isArray(body.items)) {
    return NextResponse.json({ error: "Invalid cart" }, { status: 400 });
  }

  const cart = await prisma.cart.upsert({
    where: { userId: id },
    create: { userId: id },
    update: {}
  });

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  for (const item of body.items) {
    const product = await prisma.product.findFirst({
      where: { id: item.productId, isActive: true }
    });
    if (!product || product.stock < 1) continue;

    const quantity = Math.max(1, Math.min(Number(item.quantity) || 1, product.stock));
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId: product.id, quantity }
    });
  }

  const updatedCart = await prisma.cart.findUnique({
    where: { userId: id },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { sortOrder: "asc" } }
            }
          }
        }
      }
    }
  });

  return NextResponse.json(updatedCart ?? { items: [] });
}
