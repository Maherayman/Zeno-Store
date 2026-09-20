import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  phone: z.string().min(7).max(30).optional()
});

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid registration data" }, { status: 400 });
  }

  const { name, email, password, phone } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  // Password hashing is intentionally isolated for the Auth.js pass.
  const user = await prisma.user.create({
    data: { name, email: normalizedEmail, phone, passwordHash: password }
  });

  return NextResponse.json(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    { status: 201 }
  );
}
