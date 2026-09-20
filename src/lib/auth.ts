import { z } from "zod";
import { prisma } from "@/src/lib/prisma";

export const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

// Temporary server-side auth contract.
// Auth.js will wrap this contract in the next integration pass.
export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
}

export function canManageStore(role: "CUSTOMER" | "ADMIN" | "MANAGER") {
  return role === "ADMIN" || role === "MANAGER";
}
