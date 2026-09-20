import { PrismaClient } from "@prisma/client";
import { createHash } from "node:crypto";

const prisma = new PrismaClient();
const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD first.");

const passwordHash = createHash("sha256").update(password).digest("hex");

await prisma.user.upsert({
  where: { email },
  update: { role: "ADMIN", passwordHash },
  create: { name: "Store Admin", email, passwordHash, role: "ADMIN" }
});

console.log("Admin account is ready:", email);
await prisma.$disconnect();
