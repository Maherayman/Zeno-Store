import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();
const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD first.");

const passwordHash = hashPassword(password);

await prisma.user.upsert({
  where: { email },
  update: { role: "ADMIN", passwordHash },
  create: { name: "Store Admin", email, passwordHash, role: "ADMIN" }
});

console.log("Admin account is ready:", email);
await prisma.$disconnect();
